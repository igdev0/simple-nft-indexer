import {alchemy, useNFTStore} from '../../store/nft';
import {useWalletStore} from '../../store/wallet';
import {useEffect} from 'react';
import {truncateAddress} from '../../../utils/functions';
import {Nft} from 'alchemy-sdk';
import {ethers} from 'ethers';
import {useErrorStore} from '../../store/error';

function NFTGrid({tokens, initial}: {tokens: Nft[], initial: boolean}) {
  if(!initial && !tokens.length) {
    return (
        <h1>The specified address does not have any NFTs</h1>
    )
  }
  return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        {
          tokens.map((token, index) => (
              <div key={index} className="border-1 border-blue-100 shadow-2xl p-2">
                <img src={token.image.thumbnailUrl ?? token.raw.metadata.image ?? "no-image"} alt={token.name} className="w-full"/>
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
  )
}

export default function Nfts() {
  const [account] = useWalletStore().accounts;

  const authenticated = useWalletStore().authenticated;
  const {pushError} = useErrorStore();
  const store = useNFTStore();

  const searchOwned = async (formData: FormData) => {
    let address = formData.get("address") as string | null;
    if (!address) {
      pushError("Address is required");
      return;
    }

    if (!ethers.isAddress(address)) {
        const addr = await alchemy.core.resolveName(address);
        if(!addr) {
          return pushError("Wasn't able to resolve ENS");
        }
    }

    if (!address) {
      return pushError("Address is not valid");
    }

    store.getOwnedNFTs(address).catch(err => pushError(err.message));
  };

  useEffect(() => {
    if (authenticated) {
      store.getOwnedNFTs(account).catch(v => pushError(v.message));
    } else {
      store.clear();
    }

  }, [authenticated]);

  if (!authenticated) {
    return (
        <>
        <div className="flex justify-center items-center mt-40 flex-col">
          <h1 className="font-extrabold text-5xl text-center">Sign in to see<br/> Your owned NFTs</h1>
          <p className="text-2xl text-center">Or <br/>Type in the owner address</p>
          <form action={searchOwned} className="max-w-[400px] w-full my-4 flex gap-2">
            <input className="border-1 border-blue-100 w-full block p-2 outline-none" type="text" placeholder="e.g: 0x00000000000" name="address"/>
            <button className="btn btn--outline">Get</button>
          </form>
          {store.loading ? <h1> Loading ...</h1> : <NFTGrid tokens={store.tokens} initial={!store.account}/>}
        </div>
        </>
    );
  }


  return (
      <>
        <h1 className="text-4xl font-extrabold mb-4">Your owned tokens</h1>
        {store.loading ? <h1>Loading ...</h1> : <NFTGrid tokens={store.tokens} initial={!store.account}/>}
      </>
  );
}