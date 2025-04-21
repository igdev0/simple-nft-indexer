import {useErrorStore} from '../../store/error';

export default function ErrorMessage() {
  const {errors, removeError} = useErrorStore();
  return (
      <div className={`fixed z-10 top-0 left-0 right-0 max-w-[500px] mx-auto w-full gap-2 flex flex-col`}>
        {
          errors.map(({id, message}, index) => (
              <div
                  key={id}
                  className={`w-full relative bg-white shadow-md transition-all left-0 mx-auto h-fit`}>
                <p className="text-red-500 p-2">{message}</p>
                <button className="absolute right-2 -top-1 text-4xl cursor-pointer"
                        onClick={() => removeError(id)}>&times;</button>
              </div>
          ))
        }
      </div>
  );
}