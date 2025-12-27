'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completePaystackPayment } from '../actions';

export default function PaymentCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const reference = searchParams.get('reference') || searchParams.get('trxref');

        if (!reference) {
            setError('No payment reference found');
            return;
        }

        async function verifyPayment(attempt: number) {
            const result = await completePaystackPayment(reference!);

            if (result.success) {
                router.push(`/order-confirmation/${result.orderCode}`);
                return;
            }

            if (attempt < 5) {
                setRetryCount(attempt + 1);
                setTimeout(() => verifyPayment(attempt + 1), 2500);
            } else {
                setError(result.error || 'Payment verification failed');
            }
        }

        verifyPayment(0);
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-16 p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xl">✕</span>
                </div>
                <h1 className="text-xl font-semibold mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/checkout')}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                    Return to Checkout
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-gray-600">
                Verifying payment...{retryCount > 0 && ` (attempt ${retryCount + 1})`}
            </p>
        </div>
    );
}
