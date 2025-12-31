'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { placeOrder } from '../actions';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        if (reference) {
            placeOrder('paystack', { reference });
        }
    }, [searchParams]);

    return (
        <div className="max-w-md mx-auto mt-16 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-gray-600">Verifying payment...</p>
        </div>
    );
}
