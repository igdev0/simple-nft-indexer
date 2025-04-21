import {create} from 'zustand/react';
import {EIP1193Provider, EIP6963AnnounceProviderEvent, EIP6963ProviderInfo} from '../../utils/types';

export interface WalletStore {
  accounts: string[],
  initialized: boolean;
  authenticated: boolean;
  init: () => Promise<void>;
  onAccountsChange: (accounts: string[]) => void;
  currentProvider: ProviderWithMetadata | null,
  providers: Map<string, ProviderWithMetadata>,
  setCurrentProvider: (id: string) => void;
  onAnnounceProvider: (provider: EIP6963AnnounceProviderEvent) => void;
  authenticate: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  addEventListeners: () => void;
  cleanup: () => void;
  checkPermissions: () => Promise<void>;
  initCurrentProvider: () => void;
  getCurrentProvider: () => EIP1193Provider | null;
}

export interface ProviderWithMetadata {
  provider: EIP1193Provider,
  metadata: EIP6963ProviderInfo

}

export interface PermissionResponse {
  id: string;
  parentCapability: string;
  invoker: string;
  caveats: PermissionResponseCaveats[];
  date: number;
}

export interface PermissionResponseCaveats {
  type: string;
  value: string[];
}

export const STORAGE_KEY = "wallet_provider";

export const useWalletStore = create<WalletStore>((setState, getState, store) => ({
  accounts: [],
  initialized: false,
  authenticated: false,
  currentProvider: null,
  providers: new Map(),
  addEventListeners() {
    const state = getState();
    window.addEventListener("eip6963:announceProvider", state.onAnnounceProvider as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    state.getCurrentProvider()?.on("accountsChanged", state.onAccountsChange);
  },
  cleanup() {
    const state = getState();
    window.removeEventListener("eip6963:announceProvider", state.onAnnounceProvider as EventListener);
  },
  async checkPermissions() {
    const name = window.localStorage.getItem(STORAGE_KEY);
    if (name) {
      const permissions = await getState().providers.get(name)?.provider.request({
        method: "wallet_getPermissions",
        params: []
      });
      if (permissions) {
        for (let permission of (permissions as PermissionResponse[])) {
          if (permission.parentCapability === "eth_accounts") {
            setState({
              accounts: permission.caveats.filter(item => item.type === "restrictReturnedAccounts").flatMap(item => item.value),
              authenticated: true,
            });
            break;
          }
        }
      }
    }
  },
  async init() {
    const state = getState();
    state.addEventListeners();
    await state.checkPermissions();
    state.initCurrentProvider()

    setState({
      initialized: true
    })
  },
  async logout() {
    await getState().currentProvider?.provider.request({
      method: "wallet_revokePermissions",
      params: [{eth_accounts: {}}],
    });

    setState({
      accounts: [],
      authenticated: false,
    });
  },
  onAccountsChange(accounts) {
    setState({
      accounts: accounts,
      authenticated: accounts.length > 0
    })
  },
  setCurrentProvider(name) {
    setState(prevState => {
      prevState.currentProvider = getState().providers.get(name) ?? null;
      return prevState;
    });
  },

  initCurrentProvider() {
    const name = window.localStorage.getItem(STORAGE_KEY);
    if(name) {
      getState().setCurrentProvider(name);
    }
  },

  getCurrentProvider() {
    if(getState().currentProvider) {
      return getState().currentProvider?.provider as EIP1193Provider;
    }
    const name = localStorage.getItem(STORAGE_KEY);
    if(name) {
      return this.providers.get(name)?.provider as EIP1193Provider;
    }

    return null;
  },

  async authenticate(name) {
    window.localStorage.setItem(STORAGE_KEY, name);
    const providerWithMeta = getState().providers.get(name);
    if (!providerWithMeta) {
      throw new Error(`Failed to authenticate with provider: ${name}`);
    }
    const accounts = await providerWithMeta.provider.request({
      method: "eth_requestAccounts",
      params: []
    });

    setState({
      currentProvider: providerWithMeta,
      accounts: accounts as string[],
      authenticated: true
    })
  },
  onAnnounceProvider(provider) {
    setState((prevState) => {
      prevState.providers.set(provider.detail.info.name, {provider: provider.detail.provider, metadata: provider.detail.info});
      return prevState;
    });
  },
}));