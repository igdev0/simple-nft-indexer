import {useEffect, useState} from 'react';
import "./app.css";
import {useWalletStore} from './store/wallet';
import ConnectWallet from './components/connect-wallet';
import Nfts from './components/nfts';
import ErrorMessage from './components/error-message';

function App() {
  const [err, setErr] = useState<string | null>(null);
  const walletStore = useWalletStore();
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
        <ErrorMessage message={err}/>
        <ConnectWallet/>
        <Nfts/>
      </div>
  );
}

export default App;
