'use client';
import { useCreditPurchase } from '@/hooks/useCreditPurchase';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useState } from 'react';

export default function TransactionTesting() {
  const { primaryWallet } = useDynamicContext();
  const { processCreditPurchase, isProcessingTx } = useCreditPurchase({ primaryWallet });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setError(null);
    setFinalTime(null);
    const startTime = Date.now();

    // Start the timer
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const result = await processCreditPurchase(1);
      if (result?.error) {
        setError(result.error);
      } else {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        setFinalTime(totalTime);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    } finally {
      clearInterval(timer);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 space-y-8">
      <h1 className="text-4xl font-bold">Test Transaction Page</h1>
      
      <button
        onClick={handlePurchase}
        disabled={isProcessingTx}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors
          ${isProcessingTx 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
      >
        {isProcessingTx ? 'Processing...' : 'Buy 1 Credit'}
      </button>

      {isProcessingTx && (
        <div className="text-xl">
          Processing time: {elapsedTime}s
        </div>
      )}

      {finalTime !== null && (
        <div className="text-xl text-green-600">
          Transaction completed in {finalTime}s
        </div>
      )}

      {error && (
        <div className="text-xl text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  );
}
