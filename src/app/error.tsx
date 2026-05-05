'use client';

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-10 text-white">
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-lg mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-lg hover:-translate-y-1 active:scale-95 transition-all shadow-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}