import {create} from 'zustand/react';
import {EIP1193Provider, EIP6963AnnounceProviderEvent, EIP6963ProviderInfo} from '../../utils/types';

export interface WalletStore {
  currentProvider: ProviderWithMetadata | null,
  providers: Map<string, ProviderWithMetadata>,
  setCurrentProvider: (id: string) => void;
  onAnnounceProvider: (provider: EIP6963AnnounceProviderEvent) => void
}

export interface ProviderWithMetadata  {
  provider: EIP1193Provider,
  metadata: EIP6963ProviderInfo
}

export const useWalletStore = create<WalletStore>((setState, getState, store) => ({
  currentProvider: null,
  providers: new Map(),
  setCurrentProvider(id) {
      setState(prevState => {
        prevState.currentProvider = getState().providers.get(id) ?? null
        return prevState
      });
  },
  onAnnounceProvider(provider) {
    setState((prevState) => {
      prevState.providers.set(provider.detail.info.uuid, {provider: provider.detail.provider, metadata: provider.detail.info});
      return prevState;
    });
  },
}));