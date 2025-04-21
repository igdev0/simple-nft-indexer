import {useNFTStore} from '../../store/nft';
import {useWalletStore} from '../../store/wallet';
import {useEffect, useState} from 'react';
import ErrorMessage from '../error-message';
import {truncateAddress} from '../../../utils/functions';

export default function Nfts() {
  const [account] = useWalletStore().accounts;
  const authenticated = useWalletStore().authenticated;
  const [err, setErr] = useState<null | string>(null);
  const store = useNFTStore();

  useEffect(() => {
    if (authenticated) {
      store.getOwnedNFTs(account).catch(v => setErr(v.message));
    } else {
      store.clear();
    }
  }, [authenticated]);

  if (!authenticated) {
    return null;
  }

  if (store.loading) {
    return (
        <h1>Loading ...</h1>
    );
  }


  return (
      <>
        <ErrorMessage message={err}/>
        <h1 className="text-4xl font-extrabold mb-4">Your owned tokens</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {
            store.ownedTokens.map(token => (
                <div key={token.tokenId} className="border-1 border-blue-100 shadow-2xl p-2">
                  <img src={token.image.thumbnailUrl} alt={token.name} className="w-full"/>
                  <div className="pt-2">
                  <p><strong>{token.collection?.name}</strong> / {token.name}</p>
                    <p><strong>Token type</strong>: {token.contract.tokenType}</p>
                    <p><strong>Symbol</strong>: {token.contract.symbol}</p>
                    <p><strong>Contract address</strong>: {truncateAddress(token.contract.address)}</p>
                  </div>
                </div>
            ))
          }
        </div>
      </>
  );
}