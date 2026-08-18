import type { SafeRoundDto } from "./types";

export const VAULT_BLUFF_ROUND_COUNT = 4;

export function isVaultBluffFaceoffEnabled(
  value: string | undefined,
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
        : round.choice === "TAKE"
          ? "BOT took Case A."
          : "BOT decision unavailable."
      : round.responses.length > 0
        ? "BOT responses locked."
        : "BOT signal recorded.";
  const yourRead =
    round.humanRole === "CHOOSER"
      ? round.choice === "KEEP"
        ? "You kept Case A."
        : round.choice === "TAKE"
          ? "You took Case B."
          : "Your choice is unavailable."
      : "Your structured responses were locked.";
  const outcome =
    round.winner === "HUMAN"
      ? "You earned the round point."
      : round.winner === "BOT"
        ? "BOT earned the round point."
        : "Round outcome unavailable.";

  return [
    { label: "BOT signal", body: botSignal },
    { label: "Your read", body: yourRead },
    { label: "Outcome", body: outcome },
  ] as const;
}
