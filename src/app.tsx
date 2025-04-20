import {Alchemy, Network, Nft, OwnedNftsResponse} from 'alchemy-sdk';
import {useEffect, useState} from 'react';
import "./app.css";
import {useWalletStore} from './store/wallet';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState<OwnedNftsResponse | []>([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState<Nft[]>([]);
  const walletStore = useWalletStore()
  async function getNFTsForOwner() {
    const config = {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    const data = await alchemy.nft.getNftsForOwner(userAddress);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.ownedNfts.length; i++) {
      const tokenData = alchemy.nft.getNftMetadata(
          data.ownedNfts[i].contract.address,
          data.ownedNfts[i].tokenId
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  }

  const handleClick = () => {
    console.log("Clicked");
  };

  // Initialize wallet once is announced.
  useEffect(() => {
    window.addEventListener("eip6963:announceProvider", walletStore.onAnnounceProvider as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => {
      window.removeEventListener("eip6963:announceProvider", walletStore.onAnnounceProvider as EventListener);
    }
  }, [])

  return (
      <div className="app">
        <button className="btn btn--primary" onClick={handleClick}>Sign in with wallet</button>
      </div>
  );
}

export default App;
