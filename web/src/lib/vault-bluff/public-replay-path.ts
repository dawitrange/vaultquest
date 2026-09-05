export function vaultBluffReplayPath(sessionId: string): string {
  return `/play/vault-bluff/r/${encodeURIComponent(sessionId)}`;
}
