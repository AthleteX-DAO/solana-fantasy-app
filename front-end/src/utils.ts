export async function isUserAlreadyJoined(
  selfPubKeyStr: string,
  leagueIndex: number
): Promise<boolean> {
  const root = await window.getCachedRootInfo();
  const userStates = root.leagues[leagueIndex].userStates.filter((u) => u.isInitialized);
  for (const user of userStates) {
    if (selfPubKeyStr === user.pubKey.toBase58()) {
      return true;
    }
  }
  return false;
}
