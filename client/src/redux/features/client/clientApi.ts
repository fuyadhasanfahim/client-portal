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
        };
    },
});

export const {
    useSendInviteToClientMutation,
} = clientApi;
