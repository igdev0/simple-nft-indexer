import {useNFTStore} from '../../store/nft';
import {useWalletStore} from '../../store/wallet';
import {useEffect, useState} from 'react';
import ErrorMessage from '../error-message';

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
        <div className="md:grid-cols-3">
          {
            store.ownedTokens.map(token => (
                <div key={token.tokenId}>
                  <img src={token.image.thumbnailUrl} alt={token.collection?.name} width={300} height={200}/>
                  <h2 className="text-xl">Collection name: {token.collection?.name}</h2>
                </div>
            ))
          }
        </div>
      </>
  );
}