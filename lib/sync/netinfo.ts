import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export type { NetInfoState };

/** Quick connectivity probe. `true` only when we're really online. */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
}

/** Subscribe to connectivity changes. Returns an unsubscribe function. */
export function subscribeToConnectivity(callback: (online: boolean) => void): () => void {
  return NetInfo.addEventListener((state: NetInfoState) => {
    callback(state.isConnected === true && state.isInternetReachable !== false);
  });
}
