import {Alchemy, Network, Nft, OwnedNftsResponse} from 'alchemy-sdk';
import {useEffect, useState} from 'react';
import "./app.css";
import {useWalletStore} from './store/wallet';
import ConnectWallet from './components/connect-wallet';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [err, setErr] = useState<string | null>();
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

  // Initialize wallet once is announced.
  useEffect(() => {
    walletStore.init().catch(err => {
      setErr(err.message);
    })
    return () => {
      walletStore.cleanup();
    }
  }, []);

  return (
      <div className="app container mx-auto">
        <ConnectWallet/>
      </div>
  );
}

export default App;
