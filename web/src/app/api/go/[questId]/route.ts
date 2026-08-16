import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOfferClick, getQuest } from "@/lib/affiliates";
import { PH_EVENTS, captureServerEvent } from "@/lib/posthog-server";
import { buildGoRedirect, goFailurePath, isMarketingHomepageUrl } from "@/lib/postback";

/** Creates a tracked click and redirects to the rotated partner URL. */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ questId: string }> },
) {
  const { questId } = await ctx.params;
  const quest = getQuest(questId);
  if (!quest) {
    return NextResponse.redirect(new URL("/earn", _req.url));
  }

  const session = await auth();
  // Every QUESTS hop needs a VaultQuest user, including q-freecash and q-gamehag.
  // Unsigned traffic must not create OfferClick or open a partner URL.
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(goFailurePath("sign_in"), _req.url));
  }

  const started = await createOfferClick({
    userId: session.user.id,
    questId: quest.id,
    category: quest.category,
    pinSlug: quest.pinSlug,
  });

  if (!started) {
    return NextResponse.redirect(new URL(goFailurePath("no_link"), _req.url));
  }

  // Never send users (or smoke) at a partner marketing homepage.
  // After Yield confirms the cpx-survey flip, smoke path is CPX / q-surveys only.
  if (isMarketingHomepageUrl(started.link.url)) {
    return NextResponse.redirect(new URL(goFailurePath("no_link"), _req.url));
  }

  const dest = buildGoRedirect({
    destinationUrl: started.link.url,
    clickId: started.click.id,
    userId: session.user.id,
    link: started.link,
  });
  if (!dest.ok) {
    return NextResponse.redirect(new URL(goFailurePath(dest.reason), _req.url));
  }

  await captureServerEvent(session.user.id, PH_EVENTS.go_hop, {
    quest_id: quest.id,
    partner: started.link.partner,
    slug: started.link.slug,
  });

  return NextResponse.redirect(dest.location);
}
