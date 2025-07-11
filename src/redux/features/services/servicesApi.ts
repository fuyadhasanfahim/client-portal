import { apiSlice } from '@/redux/api/apiSlice';

export const servicesApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getServices: build.query({
                query: () => ({
                    url: 'services/get-services',
                    method: 'GET',
                }),
                providesTags: ['Services'],
            }),

            addService: build.mutation({
                query: (data) => ({
                    url: 'services/add-service',
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Services'],
            }),

            getSingleService: build.query({
                query: (id) => ({
                    url: 'services/get-service',
                    params: { id },
                }),
                providesTags: ['Services'],
            }),
            getServicesForUser: build.query({
                query: (userID) => ({
                    url: 'services/get-services-for-user',
                    params: { userID },
                }),
                providesTags: ['Services'],
            }),
            deleteService: build.mutation({
                query: (id) => ({
                    url: 'services/delete-service',
                    method: 'DELETE',
                    body: { id },
                }),
                invalidatesTags: ['Services'],
            }),
            updateService: build.mutation({
                query: ({ id, ...rest }) => ({
                    url: 'services/update-service',
                    method: 'PUT',
                    body: { id, data: rest },
                }),
                invalidatesTags: ['Services'],
            }),
            updateServiceStatus: build.mutation({
                query: ({ id, status }) => ({
                    url: 'services/update-status',
                    method: 'PUT',
                    body: { id, status },
                }),
                invalidatesTags: ['Services'],
            }),
        };
    },
});

export const {
    useGetServicesQuery,

    // kasdjfbgashkd
    useAddServiceMutation,
    useGetSingleServiceQuery,
    useGetServicesForUserQuery,
    useDeleteServiceMutation,
    useUpdateServiceMutation,
    useUpdateServiceStatusMutation,
} = servicesApi;
