import { apiSlice } from '@/redux/api/apiSlice';

export const ordersApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            newOrder: builder.mutation({
                query: ({
                    orderStage,
                    userID,
                    services,
                    orderID,
                    details,
                    total,
                    payment,
                    paymentStatus,
                }) => ({
                    url: `orders/new-order/${orderStage}`,
                    method: 'POST',
                    body: {
                        userID,
                        services,
                        orderID,
                        details,
                        total,
                        payment,
                        paymentStatus,
                    },
                }),
                invalidatesTags: ['Orders'],
            }),
            getOrders: builder.query({
                query: (params) => ({
                    url: 'orders/get-orders',
                    params: {
                        ...params,
                        page: params.page || 1,
                        limit: params.limit || 10,
                    },
                }),
                providesTags: ['Orders'],
                transformResponse: (response) => {
                    if (!response.success) {
                        throw new Error('Failed to fetch orders');
                    }
                    return {
                        orders: response.data.orders,
                        pagination: response.data.pagination,
                    };
                },
            }),
            getDraftOrders: builder.query({
                query: (params) => ({
                    url: 'orders/get-draft-orders',
                    params: {
                        ...params,
                        page: params.page || 1,
                        limit: params.limit || 10,
                    },
                }),
                providesTags: ['Orders'],
                transformResponse: (response) => {
                    if (!response.success) {
                        throw new Error('Failed to fetch orders');
                    }
                    return {
                        orders: response.data.orders,
                        pagination: response.data.pagination,
                    };
                },
            }),
            getOrderByID: builder.query({
                query: (orderID) => ({
                    url: `orders/get-orders/${orderID}`,
                    method: 'GET',
                }),
                providesTags: ['Orders'],
            }),
            updateOrder: builder.mutation({
                query: ({ orderID, data }) => ({
                    url: `orders/update-order/${orderID}`,
                    method: 'PUT',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
            deliverOrder: builder.mutation({
                query: ({ orderID, deliveryLink }) => ({
                    url: 'orders/deliver-order',
                    method: 'PUT',
                    body: { orderID, deliveryLink },
                }),
                invalidatesTags: ['Orders'],
            }),
            reviewOrder: builder.mutation({
                query: ({ orderID, instructions }) => ({
                    url: `orders/review-order`,
                    method: 'PUT',
                    body: { orderID, instructions },
                }),
                invalidatesTags: ['Orders'],
            }),
            getRevisions: builder.query({
                query: (orderID) => ({
                    url: `orders/get-revisions/${orderID}`,
                    method: 'GET',
                }),
                providesTags: ['Orders'],
            }),
            completeOrder: builder.mutation({
                query: ({ orderID, deliveryLink }) => ({
                    url: `orders/complete-order`,
                    method: 'PUT',
                    body: { orderID, deliveryLink },
                }),
                invalidatesTags: ['Orders'],
            }),
            getOrdersByStatus: builder.query({
                query: ({ userID, role, status }) => ({
                    url: `orders/get-orders-by-status/${status}`,
                    method: 'GET',
                    params: {
                        userID,
                        role,
                    },
                }),
                providesTags: ['Orders'],
            }),
            getOrdersByUserID: builder.query({
                query: ({ userID, search, page, limit, filter, sort }) => ({
                    url: 'orders/get-orders-by-user',
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
            sendRevisionMessage: builder.mutation({
                query: (payload: {
                    orderID: string;
                    message: string;
                    senderID: string;
                    senderName: string;
                    senderRole: 'user' | 'admin';
                    senderProfileImage?: string;
                }) => ({
                    url: `orders/revision-message`,
                    method: 'PUT',
                    body: payload,
                }),
                invalidatesTags: ['Orders'],
            }),
            getAllOrdersByUserID: builder.query({
                query: (userID) => ({
                    url: 'orders/get-orders-by-user-id',
                    method: 'GET',
                    params: { userID },
                }),
                providesTags: ['Orders'],
            }),
        };
    },
});

export const {
    useNewOrderMutation,
    useGetOrdersQuery,
    useGetDraftOrdersQuery,
    useGetOrderByIDQuery,
    useUpdateOrderMutation,
    useDeliverOrderMutation,
    useReviewOrderMutation,
    useGetRevisionsQuery,
    useCompleteOrderMutation,
    useGetOrdersByStatusQuery,
    useGetOrdersByUserIDQuery,
    useSendRevisionMessageMutation,
    useGetAllOrdersByUserIDQuery,
} = ordersApi;
