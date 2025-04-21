import {create} from 'zustand/react';
import {Alchemy, Network, Nft, OwnedNft} from 'alchemy-sdk';
import axios from 'axios';

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

export const alchemy = new Alchemy(config);

interface NftStore {
  loading: boolean,
  account: string | null,
  tokens: Nft[],
  getOwnedNFTs: (owner: string) => Promise<void>,
  clear: () => void;
}

// web
export const useNFTStore = create<NftStore>((setState, getState, store) => ({
  loading: false,
  tokens: [],
  account: null,
  async getOwnedNFTs(account) {
    setState({loading: true, account});
    let tokenDataPromises:Promise<Nft>[];

    try {
      const ownedNftsResponse = await alchemy.nft.getNftsForOwner(account);
       tokenDataPromises = ownedNftsResponse.ownedNfts.map((nft) => (
          alchemy.nft.getNftMetadata(
              nft.contract.address,
              nft.tokenId,
          )
      ));

    } catch (err) {
      return setState({loading: false});
    }

    const nftData = await Promise.all(tokenDataPromises);
    let results: Nft[] = [];

    for (let nft of nftData) {
      if (nft.raw.error) {
        try {
          let ipfsHash = nft.tokenUri?.split("/").at(-1);
          const {data} = await axios.get(`https://alchemy.mypinata.cloud/ipfs/${ipfsHash}`);
          ipfsHash = data.image.split('/').at(-1);
          nft.name = data.name;
          nft.raw.metadata.image = `https://alchemy.mypinata.cloud/ipfs/${ipfsHash}`;
          results.push(nft);
          continue;
        } catch (err) {
          console.error(`${(err as Error).message}`)
        }
      }
      results.push(nft);
    }

    setState({tokens: results, loading: false});
  },
  clear() {
    setState({tokens: [], loading: false});
  }
}));