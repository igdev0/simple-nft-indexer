import {create} from 'zustand/react';
import {Alchemy, Network, Nft} from 'alchemy-sdk';

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);
interface NftStore {
  loading: boolean,
  ownedTokens: Nft[],
  getOwnedNFTs: (owner: string) => Promise<void>,
  clear: () => void;
}

export const useNFTStore = create<NftStore>((setState, getState, store) => ({
  loading: false,
  ownedTokens: [],
  async getOwnedNFTs(account) {
    setState({loading: true});
    const ownedNftsResponse = await alchemy.nft.getNftsForOwner(account);
    const tokenDataPromises = ownedNftsResponse.ownedNfts.map((nft) => (
        alchemy.nft.getNftMetadata(
            nft.contract.address,
            nft.tokenId
        )
    ));

    setState({ownedTokens: await Promise.all(tokenDataPromises), loading: false});
  },
  clear() {
    setState({ownedTokens: [], loading: false});
  }
}));