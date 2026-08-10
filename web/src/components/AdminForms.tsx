"use client";

import { useActionState } from "react";
import {
  createAffiliateAction,
  fulfillRedemptionAction,
  markContactReadAction,
  updateAffiliateAction,
  type AdminState,
} from "@/lib/actions/admin";

const initial: AdminState = {};

export function AffiliateEditForm({
  link,
}: {
  link: {
    id: string;
    partner: string;
    url: string;
    status: string;
    priority: number;
    capDaily: number | null;
    slug: string;
    category: string;
  };
}) {
  const [state, action, pending] = useActionState(updateAffiliateAction, initial);

  return (
    <form action={action} className="grid gap-2 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4 text-sm">
      <input type="hidden" name="id" value={link.id} />
      <div className="flex flex-wrap justify-between gap-2">
        <p className="font-semibold">
          {link.partner}{" "}
          <span className="font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
            {link.slug} · {link.category}
          </span>
        </p>
        {state.message ? <span className="text-xs text-[var(--vq-success)]">{state.message}</span> : null}
        {state.error ? <span className="text-xs text-[var(--vq-danger)]">{state.error}</span> : null}
      </div>
      <label className="grid gap-1">
        <span className="text-xs text-[var(--vq-ink-faint)]">URL</span>
        <input name="url" defaultValue={link.url} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
      </label>
      <label className="grid gap-1">
        <span className="text-xs text-[var(--vq-ink-faint)]">Partner</span>
        <input name="partner" defaultValue={link.partner} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="grid gap-1">
          <span className="text-xs text-[var(--vq-ink-faint)]">Status</span>
          <select name="status" defaultValue={link.status} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5">
            <option value="healthy">healthy</option>
            <option value="capped">capped</option>
            <option value="disabled">disabled</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--vq-ink-faint)]">Priority</span>
          <input name="priority" type="number" defaultValue={link.priority} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--vq-ink-faint)]">Daily cap</span>
          <input
            name="capDaily"
            type="number"
            defaultValue={link.capDaily ?? ""}
            placeholder="none"
            className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5"
          />
        </label>
      </div>
      <button type="submit" disabled={pending} className="mt-1 rounded-md bg-[var(--vq-teal)] px-3 py-2 text-xs font-semibold text-[var(--vq-bg-deep)] disabled:opacity-60">
        {pending ? "Saving…" : "Save link"}
      </button>
    </form>
  );
}

export function CreateAffiliateForm() {
  const [state, action, pending] = useActionState(createAffiliateAction, initial);
  return (
    <form action={action} className="mt-4 grid gap-2 rounded-[10px] border border-dashed border-[var(--vq-border)] p-4 text-sm">
      <p className="font-semibold">Add affiliate link</p>
      <input name="slug" placeholder="slug" required className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
      <input name="partner" placeholder="Partner name" required className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
      <input name="url" placeholder="https://..." required className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
      <select name="category" className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5">
        <option value="offerwall_primary">offerwall_primary</option>
        <option value="offerwall_backup">offerwall_backup</option>
        <option value="survey_wall">survey_wall</option>
        <option value="cpa_signup">cpa_signup</option>
        <option value="cpe_play">cpe_play</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input name="priority" type="number" defaultValue={1} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
        <input name="capDaily" type="number" placeholder="daily cap" className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5" />
      </div>
      {state.error ? <p className="text-xs text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="text-xs text-[var(--vq-success)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-md border border-[var(--vq-border)] px-3 py-2 text-xs">
        {pending ? "Creating…" : "Create"}
      </button>
    </form>
  );
}

export function FulfillmentForm({
  redemption,
}: {
  redemption: {
    id: string;
    label: string;
    status: string;
    costVp: number;
    fulfillNote: string | null;
    deliveryCode: string | null;
    user: { email: string };
  };
}) {
  const [state, action, pending] = useActionState(fulfillRedemptionAction, initial);
  return (
    <form action={action} className="grid gap-2 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4 text-sm">
      <input type="hidden" name="id" value={redemption.id} />
      <p className="font-semibold">
        {redemption.label}{" "}
        <span className="text-xs text-[var(--vq-ink-faint)]">
          {redemption.costVp} VP · {redemption.user.email}
        </span>
      </p>
      <select name="status" defaultValue={redemption.status} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5">
        <option value="REQUESTED">REQUESTED</option>
        <option value="FULFILLING">FULFILLING</option>
        <option value="FULFILLED">FULFILLED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <input
        name="deliveryCode"
        defaultValue={redemption.deliveryCode ?? ""}
        placeholder="Steam code / delivery note"
        className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5"
      />
      <textarea
        name="fulfillNote"
        defaultValue={redemption.fulfillNote ?? ""}
        placeholder="Internal note"
        rows={2}
        className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2 py-1.5"
      />
      {state.error ? <p className="text-xs text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="text-xs text-[var(--vq-success)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-md bg-[var(--vq-teal)] px-3 py-2 text-xs font-semibold text-[var(--vq-bg-deep)]">
        {pending ? "Saving…" : "Update fulfillment"}
      </button>
    </form>
  );
}

export function ContactReadForm({ id }: { id: string }) {
  const [, action, pending] = useActionState(markContactReadAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs text-[var(--vq-teal)] hover:underline">
        Mark read
      </button>
    </form>
  );
}
