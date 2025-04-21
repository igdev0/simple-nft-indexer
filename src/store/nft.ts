import {create} from 'zustand/react';
import {Alchemy, Network, Nft} from 'alchemy-sdk';
import axios from 'axios';

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
// web
export const useNFTStore = create<NftStore>((setState, getState, store) => ({
  loading: false,
  ownedTokens: [],
  async getOwnedNFTs(account) {
    setState({loading: true});
    const ownedNftsResponse = await alchemy.nft.getNftsForOwner(account);
    const tokenDataPromises = ownedNftsResponse.ownedNfts.map((nft) => (
        alchemy.nft.getNftMetadata(
            nft.contract.address,
            nft.tokenId,
        )
    ));

    const nftData = await Promise.all(tokenDataPromises);
    let results:Nft[] = [];

    for (let nft of nftData) {
      if(nft.raw.error) {
        const {data} = await axios.get(`https://alchemy.mypinata.cloud/ipfs/${nft.tokenUri?.split("/").at(-1)}`)
        nft.name = data.name;
        nft.image.thumbnailUrl = `https://alchemy.mypinata.cloud/ipfs/${data.image.split('/').at(-1)}`
        results.push(nft);
        continue;
      }
      results.push(nft);
    }
    console.log(results)

    setState({ownedTokens: results, loading: false});
  },
  clear() {
    setState({ownedTokens: [], loading: false});
  }
}));