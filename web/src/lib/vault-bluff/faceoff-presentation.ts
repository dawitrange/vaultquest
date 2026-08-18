import type { SafeRoundDto } from "./types";

export const VAULT_BLUFF_ROUND_COUNT = 4;

export function isVaultBluffFaceoffEnabled(
  value = process.env.VAULT_BLUFF_FACEOFF_UI,
) {
  return value === "true";
}

export function roundProgressLabel(roundNumber: number) {
  return `Round ${roundNumber} of ${VAULT_BLUFF_ROUND_COUNT}`;
}

export function revealSequence(round: SafeRoundDto) {
  const botSignal =
    round.humanRole === "KEEPER"
      ? round.choice === "KEEP"
        ? "BOT kept Case B."
        : "BOT took Case A."
      : round.responses.length > 0
        ? "BOT responses locked."
        : "BOT signal recorded.";
  const yourRead =
    round.humanRole === "CHOOSER"
      ? round.choice === "KEEP"
        ? "You kept Case A."
        : "You took Case B."
      : "Your structured responses were locked.";
  const outcome =
    round.winner === "HUMAN"
      ? "You earned the round point."
      : "BOT earned the round point.";

  return [
    { label: "BOT signal", body: botSignal },
    { label: "Your read", body: yourRead },
    { label: "Outcome", body: outcome },
  ] as const;
}
