'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { placeOrder, transitionToAddingItems } from '../actions';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Paystack: reference param present → verify and settle
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        if (reference) {
            placeOrder('paystack', { reference });
            return;
        }

        // PayFast cancelled: transition order back to AddingItems, then return to checkout
        const cancelled = searchParams.get('cancelled');
        if (cancelled === '1') {
            transitionToAddingItems().finally(() => router.replace('/checkout'));
            return;
        }

        // PayFast success: ITN settled the order server-side, redirect to confirmation
        const orderCode = searchParams.get('orderCode');
        if (orderCode) {
            router.replace(`/order-confirmation/${orderCode}`);
        }
    }, [searchParams, router]);

    return (
        <div className="max-w-md mx-auto mt-16 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-gray-600">Verifying payment...</p>
        </div>
    );
}
