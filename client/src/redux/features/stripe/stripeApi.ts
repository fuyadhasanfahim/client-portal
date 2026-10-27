import { apiSlice } from '@/redux/api/apiSlice';

export const stripeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        newOrderCheckout: builder.mutation({
            query: ({ orderID, pendingOrderID, paymentOption, paymentMethod }) => ({
                url: 'stripe/new-order-checkout',
                method: 'POST',
                body: { orderID, pendingOrderID, paymentOption, paymentMethod },
            }),
        }),
    }),
});

export const { useNewOrderCheckoutMutation } = stripeApi;
