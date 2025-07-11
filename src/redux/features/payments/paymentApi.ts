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
                },
            }),
        }),
        getPaymentsByStatus: builder.query({
            query: ({ status, paymentOption, userID, role }) => ({
                url: `payments/get-payments-amount/${status}`,
                method: 'GET',
                params: { userID, role, paymentOption },
            }),
        }),
        getPaymentByOrderID: builder.query({
            query: (orderID) => ({
                url: `payments/get-payment/${orderID}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useNewPaymentMutation,
    useGetPaymentsByStatusQuery,
    useGetPaymentByOrderIDQuery,
} = paymentsApi;
