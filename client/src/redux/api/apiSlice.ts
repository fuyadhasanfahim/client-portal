import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL! + '/api',
        credentials: 'include',
    }),
    tagTypes: [
        'Users',
        'Orders',
        'Quotes',
        'Revisions',
        'Payments',
        'Notifications'
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    endpoints: (_builder) => ({}),
});
