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
  const lastResponse = round.responses.at(-1);
  const botSignal =
    round.humanRole === "KEEPER"
      ? round.choice === "KEEP"
        ? "Kept Case B."
        : round.choice === "TAKE"
          ? "Took Case A."
          : "No signal."
      : lastResponse
        ? humanizeAnswer(lastResponse.answer)
        : "No signal.";
  const yourRead =
    round.humanRole === "CHOOSER"
      ? round.choice === "KEEP"
        ? "Keep"
        : round.choice === "TAKE"
          ? "Take"
          : "No choice."
      : "Responses locked.";
  const outcome =
    round.winner === "HUMAN"
      ? "You win this round."
      : round.winner === "BOT"
        ? "Bot wins this round."
        : "No outcome.";

  return [
    { label: "BOT signal", body: botSignal },
    { label: "Your read", body: yourRead },
    { label: "Outcome", body: outcome },
  ] as const;
}

function humanizeAnswer(answer: string) {
  return answer
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
