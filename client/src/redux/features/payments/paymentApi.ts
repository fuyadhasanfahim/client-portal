import { apiSlice } from '@/redux/api/apiSlice';

export const paymentsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        newPayment: builder.mutation({
            query: ({
                userID,
                orderID,
                paymentOption,
                paymentIntentID,
                customerID,
                status,
                currency,
                amount,
            }) => ({
                url: 'payments/new-payment',
                method: 'POST',
                body: {
                    userID,
                    orderID,
                    paymentOption,
                    paymentIntentID,
                    customerID,
                    status,
                    amount,
                    currency,
                },
            }),
        }),
        getPaymentsByStatus: builder.query({
            query: ({ status, month, paymentOption, userID, role }) => ({
                url: `payments/get-payments-amount/${status}`,
                method: 'GET',
                params: { status, month, paymentOption, userID, role },
            }),
        }),
        getPaymentByOrderID: builder.query({
            query: (orderID) => ({
                url: `payments/get-payment/${orderID}`,
                method: 'GET',
            }),
        }),
        getPaymentsByUserID: builder.query({
            query: (orderID) => ({
                url: `payments/get-payments/${orderID}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useNewPaymentMutation,
    useGetPaymentsByStatusQuery,
    useGetPaymentByOrderIDQuery,
    useGetPaymentsByUserIDQuery,
} = paymentsApi;
