import {create} from 'zustand/react';
import {ethers} from 'ethers';

export interface UIError {
  id: string,
  message: string,
  timeout: number
}

export interface ErrorStore {
  errors: UIError[],
  pushError: (msg: string, timeout?: number) => void;
  removeError: (id: string) => void
}

export const useErrorStore = create<ErrorStore>((setState, getState, store) => ({
   errors: [],
  pushError: (msg, timeout = 2000) => {
     const id = ethers.uuidV4(ethers.randomBytes(100));
    setState({
      errors: [...getState().errors, {
        message: msg,
        timeout,
        id
      }]
    })
    const timer = setTimeout(() => {
      setState({
        errors: getState().errors.filter(item => item.id !== id)
      })
      clearTimeout(timer);
    }, timeout)
  },
  removeError(id) {
    setState({
      errors: getState().errors.filter(item => item.id !== id)
    })
  }
}));