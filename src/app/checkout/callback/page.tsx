'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { placeOrder, transitionToAddingItems } from '../actions';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [cancelled, setCancelled] = useState(false);
    const [failed, setFailed] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        // Paystack: reference param present → verify and settle
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        if (reference) {
            placeOrder('paystack', { reference });
            return;
        }

        // PayFast cancelled
        if (searchParams.get('cancelled') === '1') {
            setCancelled(true);
            return;
        }

        // PayFast payment not confirmed — backend verified and flagged as failed
        if (searchParams.get('paymentFailed') === '1') {
            setFailed(true);
            return;
        }

        // PayFast success — backend already verified the order is settled
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

    if (failed) {
        return (
            <div className="max-w-md mx-auto mt-16 p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Confirmed</h1>
                <p className="text-gray-500 mb-2">
                    Your payment could not be verified. This can happen if the payment is still processing.
                </p>
                <p className="text-gray-500 mb-8">
                    If your payment was deducted, please contact us and we will resolve it. Otherwise, you can try again.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        disabled={transitioning}
                        onClick={() => {
                            setTransitioning(true);
                            transitionToAddingItems().then(() => router.replace('/checkout'));
                        }}
                        className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {transitioning ? 'Loading...' : 'Try Again'}
                    </button>
                    <button
                        onClick={() => router.replace('/')}
                        className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Back to Shop
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
