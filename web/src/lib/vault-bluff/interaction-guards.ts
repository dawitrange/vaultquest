export function canSubmitRevealContinue(args: {
  revealReady: boolean;
  pending: boolean;
  pointerArmed: boolean;
  clickDetail: number;
}): boolean {
  if (!args.revealReady || args.pending) return false;
  if (args.clickDetail === 0) return true;
  return args.pointerArmed;
}
