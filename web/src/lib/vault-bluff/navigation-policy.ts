export const GAME_ROUTE = "/play/vault-bluff";

export function needsGameExitConfirmation(args: {
  currentPath: string;
  destination: string;
}): boolean {
  return (
    args.currentPath === GAME_ROUTE &&
    args.destination !== GAME_ROUTE
  );
}
