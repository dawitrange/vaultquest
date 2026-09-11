import { LedgerKind, LedgerStatus, type PrismaClient } from "@prisma/client";

type LabDb = Pick<PrismaClient, "ledgerEntry" | "offerClick">;

export type PostbackLabLedger = {
  id: string;
  userId: string;
  user: { email: string };
  vp: number;
  status: LedgerStatus;
  availableAt: Date | null;
  questId: string | null;
  clickId: string | null;
  note: string | null;
  createdAt: Date;
};

export type PostbackLabClick = {
  id: string;
  userId: string | null;
  credited: boolean;
  questId: string | null;
  affiliateLink: {
    partner: string;
    slug: string;
  };
};

export type PostbackLabRow = {
  ledgerId: string;
  ledgerUserId: string;
  userEmail: string;
  clickId: string | null;
  clickUserId: string | null;
  partner: string | null;
  partnerSlug: string | null;
  transactionId: string | null;
  questId: string | null;
  vp: number;
  ledgerStatus: LedgerStatus;
  availability: "PENDING" | "POSTED" | "AVAILABLE_HOLD_ELAPSED" | "AVAILABLE_NO_HOLD_DATE" | "VOID";
  availableAt: Date | null;
  clickCredited: boolean | null;
  binding: "BOUND_CREDITED" | "BOUND_OPEN" | "UNBOUND" | "CLICK_NOT_FOUND" | "USER_MISMATCH";
  createdAt: Date;
};

function transactionIdFromNote(note: string | null): string | null {
  return note?.match(/(?:^|\s)tx=([^\s]+)/)?.[1] ?? null;
}

function availability(
  status: LedgerStatus,
  availableAt: Date | null,
  now: Date,
): PostbackLabRow["availability"] {
  if (status === LedgerStatus.VOID) return "VOID";
  if (status === LedgerStatus.POSTED) return "POSTED";
  if (!availableAt) return "AVAILABLE_NO_HOLD_DATE";
  return availableAt.getTime() > now.getTime() ? "PENDING" : "AVAILABLE_HOLD_ELAPSED";
}

export function buildPostbackLabRows(args: {
  ledgers: PostbackLabLedger[];
  clicks: PostbackLabClick[];
  now?: Date;
}): PostbackLabRow[] {
  const now = args.now ?? new Date();
  const clicksById = new Map(args.clicks.map((click) => [click.id, click]));

  return args.ledgers.map((ledger) => {
    const click = ledger.clickId ? clicksById.get(ledger.clickId) : undefined;
    let binding: PostbackLabRow["binding"];
    if (!ledger.clickId) binding = "UNBOUND";
    else if (!click) binding = "CLICK_NOT_FOUND";
    else if (click.userId !== ledger.userId) binding = "USER_MISMATCH";
    else binding = click.credited ? "BOUND_CREDITED" : "BOUND_OPEN";

    return {
      ledgerId: ledger.id,
      ledgerUserId: ledger.userId,
      userEmail: ledger.user.email,
      clickId: ledger.clickId,
      clickUserId: click?.userId ?? null,
      partner: click?.affiliateLink.partner ?? null,
      partnerSlug: click?.affiliateLink.slug ?? null,
      transactionId: transactionIdFromNote(ledger.note),
      questId: ledger.questId,
      vp: ledger.vp,
      ledgerStatus: ledger.status,
      availability: availability(ledger.status, ledger.availableAt, now),
      availableAt: ledger.availableAt,
      clickCredited: click?.credited ?? null,
      binding,
      createdAt: ledger.createdAt,
    };
  });
}

export async function listPostbackLabEvidence(
  db: LabDb,
  take = 50,
  now = new Date(),
): Promise<PostbackLabRow[]> {
  const limit = Math.min(Math.max(Math.trunc(take), 1), 200);
  const ledgers = await db.ledgerEntry.findMany({
    where: {
      kind: LedgerKind.EARN,
      note: { startsWith: "S2S postback" },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      user: { select: { email: true } },
      vp: true,
      status: true,
      availableAt: true,
      questId: true,
      clickId: true,
      note: true,
      createdAt: true,
    },
  });

  const clickIds = [...new Set(ledgers.flatMap((ledger) => (ledger.clickId ? [ledger.clickId] : [])))];
  const clicks =
    clickIds.length === 0
      ? []
      : await db.offerClick.findMany({
          where: { id: { in: clickIds } },
          select: {
            id: true,
            userId: true,
            credited: true,
            questId: true,
            affiliateLink: {
              select: {
                partner: true,
                slug: true,
              },
            },
          },
        });

  return buildPostbackLabRows({ ledgers, clicks, now });
}

function csvCell(value: string | number | boolean | null): string {
  const raw = value == null ? "" : String(value);
  return `"${raw.replaceAll('"', '""')}"`;
}

export function postbackLabCsv(rows: PostbackLabRow[]): string {
  const header = [
    "created_at",
    "partner",
    "partner_slug",
    "transaction_id",
    "offer_click_id",
    "click_user_id",
    "click_credited",
    "binding",
    "ledger_entry_id",
    "ledger_user_id",
    "user_email",
    "quest_id",
    "vp",
    "ledger_status",
    "availability",
    "available_at",
  ];
  const lines = rows.map((row) =>
    [
      row.createdAt.toISOString(),
      row.partner,
      row.partnerSlug,
      row.transactionId,
      row.clickId,
      row.clickUserId,
      row.clickCredited,
      row.binding,
      row.ledgerId,
      row.ledgerUserId,
      row.userEmail,
      row.questId,
      row.vp,
      row.ledgerStatus,
      row.availability,
      row.availableAt?.toISOString() ?? null,
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\n") + "\n";
}
