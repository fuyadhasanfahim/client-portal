import { apiSlice } from '@/redux/api/apiSlice';
import { IQuote } from '@/types/quote.interface';

export const quotesApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            newQuote: builder.mutation({
                query: ({
                    quoteStage,
                    userID,
                    services,
                    quoteID,
                    details,
                }: {
                    quoteStage: string;
                    userID: string;
                    services?: IQuote['services'];
                    quoteID?: string;
                    details?: IQuote['details'];
                }) => ({
                    url: `quotes/new-quote/${quoteStage}`,
                    method: 'POST',
                    body: {
                        userID,
                        services,
                        quoteID,
                        details,
                    },
                }),
                invalidatesTags: ['Quotes'],
            }),
            getQuotes: builder.query({
                query: (params) => ({
                    url: 'quotes/get-quotes',
                    params: {
                        ...params,
                        page: params.page || 1,
                        limit: params.limit || 10,
                    },
                }),
                providesTags: ['Quotes'],
                transformResponse: (response) => {
                    if (!response.success) {
                        throw new Error('Failed to fetch quotes');
                    }
                    return {
                        quotes: response.data.quotes,
                        pagination: response.data.pagination,
                    };
                },
            }),
            getQuoteByID: builder.query({
                query: (quoteID) => ({
                    url: `quotes/get-quote/${quoteID}`,
                    method: 'GET',
                }),
                providesTags: ['Quotes'],
            }),
            updateQuote: builder.mutation({
                query: ({ quoteID, data }) => ({
                    url: `quotes/update-quote/${quoteID}`,
                    method: 'PUT',
                    body: data,
                }),
                invalidatesTags: ['Quotes'],
            }),
            deliverQuote: builder.mutation({
                query: ({ quoteID, deliveryLink }) => ({
                    url: 'quotes/deliver-quote',
                    method: 'PUT',
                    body: { quoteID, deliveryLink },
                }),
                invalidatesTags: ['Quotes'],
            }),
            reviewQuote: builder.mutation({
                query: ({ quoteID, instructions }) => ({
                    url: `quotes/review-quote`,
                    method: 'PUT',
                    body: { quoteID, instructions },
                }),
                invalidatesTags: ['Quotes'],
            }),
            completeQuote: builder.mutation({
                query: (quoteID) => ({
                    url: `quotes/complete-quote`,
                    method: 'PUT',
                    body: quoteID,
                }),
                invalidatesTags: ['Quotes'],
            }),
            getQuotesByStatus: builder.query({
                query: ({ userID, role, status }) => ({
                    url: `quotes/get-quotes-by-status/${status}`,
                    method: 'GET',
                    params: {
                        userID,
                        role,
                    },
                }),
                providesTags: ['Quotes'],
            }),
            getQuotesByUserID: builder.query({
                query: ({ userID, search, page, limit, filter, sort }) => ({
                    url: 'orders/get-quotes-by-user',
                    method: 'GET',
                    params: {
                        userID,
                        search,
                        page,
                        limit,
                        filter,
                        sort,
                    },
                }),
                providesTags: ['Orders'],
            }),
        };
    },
});

export const {
    useNewQuoteMutation,
    useGetQuotesQuery,
    useGetQuoteByIDQuery,
    useUpdateQuoteMutation,
    useGetQuotesByStatusQuery,
    useCompleteQuoteMutation,
    useDeliverQuoteMutation,
    useReviewQuoteMutation,
    useGetQuotesByUserIDQuery,
} = quotesApi;
