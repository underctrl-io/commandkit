import { FaSpinner } from 'react-icons/fa';

export default function Loader() {
  return (
    <div className="h-screen grid place-items-center">
      <FaSpinner className="size-8 animate-spin" />
    </div>
  );
}
