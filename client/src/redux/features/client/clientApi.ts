import { apiSlice } from '@/redux/api/apiSlice';

export const clientApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            sendInviteToClient: build.mutation({
                query: ({ email, inviteUrl }) => ({
                    url: 'client/send-invite',
                    method: 'POST',
                    body: {
                        email,
                        inviteUrl,
                    },
                }),
            }),
            additionalService: build.mutation({
                query: ({ clientEmail, serviceName, servicePrice }) => ({
                    url: 'client/request-additional-service',
                    method: 'POST',
                    body: {
                        clientEmail,
                        serviceName,
                        servicePrice,
                    },
                }),
                invalidatesTags: ['AdditionalService'],
            }),
            checkForAdditionalService: build.query({
                query: (clientEmail) => ({
                    url: `client/additional-services/${clientEmail}`,
                    method: 'GET',
                }),
                providesTags: ['AdditionalService'],
            }),
            updateAdditionalService: build.mutation({
                query: ({ clientEmail, status }) => ({
                    url: `client/update-additional-services`,
                    method: 'PUT',
                    body: {
                        clientEmail,
                        status,
                    },
                }),
                invalidatesTags: ['AdditionalService'],
            }),
        };
    },
});

export const {
    useSendInviteToClientMutation,
    useAdditionalServiceMutation,
    useCheckForAdditionalServiceQuery,
    useUpdateAdditionalServiceMutation,
} = clientApi;
