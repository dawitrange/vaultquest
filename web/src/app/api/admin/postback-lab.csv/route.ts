import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { listPostbackLabEvidence, postbackLabCsv } from "@/lib/postback-lab";

export const dynamic = "force-dynamic";

/** Read-only S2S Lab evidence. Contains IDs and user email, so admin auth is required. */
export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rows = await listPostbackLabEvidence(prisma);
  return new Response(postbackLabCsv(rows), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": 'attachment; filename="postback-lab.csv"',
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
