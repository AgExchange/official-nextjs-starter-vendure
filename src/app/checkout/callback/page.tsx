const reference = searchParams.get('reference');
const { data } = await mutate(AddPaymentToOrderMutation, {
    input: { method: 'paystack', metadata: { reference } }
}, { useAuthToken: true });

if (data?.addPaymentToOrder?.__typename === 'Order') {
    redirect(`/order-confirmation/${data.addPaymentToOrder.code}`);
}
// Display paymentErrorMessage to user
