import {useCallback, useEffect, useImperativeHandle, useState} from 'react';

export default function ErrorMessage({message, ref}: {message: string | null, ref?: any}) {
  const [visible, set] = useState(false);

  const setVisible = useCallback(() => {
    set(true);
    setTimeout(() => {
      set(false)
    }, 1000 )
  }, [set])

  useImperativeHandle(ref, () => {
    return {
      setVisible
    }
  })

  useEffect(() => {
    if(message) {
      setVisible();
    }
  }, [message])
  return (
      <div className={`fixed z-10 top-0 max-w-[500px] bg-white shadow-md w-full right-0 transition-all left-0 mx-auto h-fit ${visible ? 'pointer-events-auto opacity-100' : "pointer-events-none opacity-0"}`}>
        <p className="text-red-500 p-2">{message}</p>
        <button className="absolute right-2 -top-1 text-4xl cursor-pointer" onClick={() => set(false)}>&times;</button>
      </div>
  );
}