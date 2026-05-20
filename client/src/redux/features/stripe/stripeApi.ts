import { apiSlice } from '@/redux/api/apiSlice';

export const stripeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        newOrderCheckout: builder.mutation({
            query: ({ orderID, paymentOption, paymentMethod }) => ({
                url: 'stripe/new-order-checkout',
                method: 'POST',
                body: { orderID, paymentOption, paymentMethod },
            }),
        }),
    }),
});

export const { useNewOrderCheckoutMutation } = stripeApi;
