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
            getService: build.query({
                query: (serviceID) => ({
                    url: `services/get-service/${serviceID}`,
                    method: 'GET',
                }),
                providesTags: ['Services'],
            }),
            newService: build.mutation({
                query: (body) => ({
                    url: 'services/new-service',
                    method: 'POST',
                    body,
                }),
                invalidatesTags: ['Services'],
            }),
            deleteService: build.mutation({
                query: (serviceID) => ({
                    url: `services/delete-service/${serviceID}`,
                    method: 'DELETE',
                    params: { serviceID },
                }),
                invalidatesTags: ['Services'],
            }),
            editService: build.mutation({
                query: ({ serviceID, data }) => ({
                    url: `services/edit-service/${serviceID}`,
                    method: 'PUT',
                    body: data,
                }),
                invalidatesTags: ['Services'],
            }),
        };
    },
});

export const {
    useGetServicesQuery,
    useGetServiceQuery,
    useNewServiceMutation,
    useDeleteServiceMutation,
    useEditServiceMutation,
} = servicesApi;
