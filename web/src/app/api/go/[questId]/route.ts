import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOfferClick, getQuest } from "@/lib/affiliates";
import { isMarketingHomepageUrl } from "@/lib/postback";

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
  const started = await createOfferClick({
    userId: session?.user?.id,
    questId: quest.id,
    category: quest.category,
  });

  if (!started) {
    return NextResponse.redirect(new URL("/earn?error=no_link", _req.url));
  }

  // Never send users (or smoke) at a partner marketing homepage.
  // Yield flips cpx-survey only after Ethio pastes offers./wall.cpx-research.com + app_id.
  if (isMarketingHomepageUrl(started.link.url)) {
    return NextResponse.redirect(new URL("/earn?error=no_link", _req.url));
  }

  const target = new URL(started.link.url);
  // Pass click id as common subid params partners can echo in postbacks.
  // AdGate {s1} is the user (docs.prodegeads.com); fall back to click id for anon.
  const s1 = session?.user?.id ?? started.click.id;
  target.searchParams.set("subid", started.click.id);
  target.searchParams.set("click_id", started.click.id);
  target.searchParams.set("s1", s1);
  if (session?.user?.id) target.searchParams.set("user_id", session.user.id);

  return NextResponse.redirect(target.toString());
}
