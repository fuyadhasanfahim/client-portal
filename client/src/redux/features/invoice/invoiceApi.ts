import { apiSlice } from '@/redux/api/apiSlice';

export const invoiceApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            sendInvoice: builder.mutation({
                query: (orderID) => ({
                    url: `invoice/send-invoice`,
                    method: 'POST',
                    body: orderID,
                }),
            }),
        };
    },
});

export const { useSendInvoiceMutation } = invoiceApi;
