import { apiSlice } from '@/redux/api/apiSlice';

export const supportApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            startSupport: build.query({
                query: (args) => ({
                    url: 'supports/start',
                    method: 'POST',
                    params: { limit: args?.limit ?? 50 },
                }),
                providesTags: ['Services'],
            }),
        };
    },
});

export const { useLazyStartSupportQuery } = supportApi;
