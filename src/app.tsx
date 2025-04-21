import {useEffect} from 'react';
import "./app.css";
import {useWalletStore} from './store/wallet';
import ConnectWallet from './components/connect-wallet';
import Nfts from './components/nfts';
import ErrorMessage from './components/error-message';
import {useErrorStore} from './store/error';

function App() {
  const {pushError, errors} = useErrorStore();
  const walletStore = useWalletStore();
  // Initialize wallet once is announced.
  useEffect(() => {
    walletStore.init().catch(err => {
      pushError(err.message);
    })
    return () => {
      walletStore.cleanup();
    }
  }, []);

  return (
      <div className="app container mx-auto">
        <ErrorMessage/>
        <div className="w-full flex justify-end py-2">
          <ConnectWallet/>
        </div>
        <Nfts/>
      </div>
  );
}

export default App;
