import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './index.css'
import {EIP6963AnnounceProviderEvent} from '../utils/types';

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface CustomEventMap {
  "eip6963:announceProvider": CustomEvent<EIP6963AnnounceProviderEvent>;
}

declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
        type: K,
        listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
  }
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
