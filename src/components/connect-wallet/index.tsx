import {useWalletStore} from '../../store/wallet';
import {useState} from 'react';
import {truncateAddress} from '../../../utils/functions';

export default function ConnectWallet() {
  const [providersVisible, setProvidersVisible] = useState(false);
  const walletStore = useWalletStore();
  const togglePopup = () => {
    setProvidersVisible(v => !v);
  };

  const onAuth = (name: string) => {
    return async () => {
      await walletStore.authenticate(name);
      setProvidersVisible(false);
    };
  };

  return (
      <>
        {walletStore.authenticated ? <button className="btn btn--primary flex gap-2" onClick={walletStore.logout}><img src={walletStore.currentProvider?.metadata.icon??""} alt="wallet icon" width={20} height={20}/> Disconnect {truncateAddress(walletStore.accounts[0])} </button> :
            <button className="btn btn--primary" onClick={togglePopup}>Connect Wallet</button>}
        <div
            className={`fixed w-full h-full bg-white/85 z-10 top-0 left-0 flex justify-center items-center flex-col transition-all ${providersVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className="max-w-[600] mx-auto relative p-2">
            <button className="text-4xl absolute -top-4 -right-4 cursor-pointer" onClick={togglePopup}>&times;</button>
            <h1 className="text-3xl mb-2">Choose wallet provider</h1>
            <div className="flex justify-center items-center flex-col gap-2">
              {
                [...walletStore.providers].map(([key, item]) => {
                  return (
                      <button key={key} className="btn btn--outline flex gap-2 w-full" onClick={onAuth(item.metadata.name)}>
                        <img src={item.metadata.icon} alt={item.metadata.name} width={30} height={30}/>
                        {item.metadata.name}
                      </button>
                  );
                })
              }
            </div>
          </div>
        </div>
      </>
  );
}