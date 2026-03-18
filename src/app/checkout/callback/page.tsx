'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { placeOrder, transitionToAddingItems } from '../actions';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [cancelled, setCancelled] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        // Paystack: reference param present → verify and settle
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        if (reference) {
            placeOrder('paystack', { reference });
            return;
        }

        // PayFast cancelled: show cancellation screen
        if (searchParams.get('cancelled') === '1') {
            setCancelled(true);
            return;
        }

        // PayFast success: ITN settled the order server-side, redirect to confirmation
        const orderCode = searchParams.get('orderCode');
        if (orderCode) {
            router.replace(`/order-confirmation/${orderCode}`);
        }
    }, [searchParams, router]);

    if (cancelled) {
        return (
            <div className="max-w-md mx-auto mt-16 p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Cancelled</h1>
                <p className="text-gray-500 mb-8">Your payment was cancelled. Your cart has been saved.</p>
                <div className="flex flex-col gap-3">
                    <button
                        disabled={transitioning}
                        onClick={() => {
                            setTransitioning(true);
                            transitionToAddingItems().then(() => router.replace('/checkout'));
                        }}
                        className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {transitioning ? 'Loading...' : 'Return to Checkout'}
                    </button>
                    <button
                        disabled={transitioning}
                        onClick={() => {
                            setTransitioning(true);
                            transitionToAddingItems().then(() => router.replace('/'));
                        }}
                        className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-gray-600">Verifying payment...</p>
        </div>
    );
}
