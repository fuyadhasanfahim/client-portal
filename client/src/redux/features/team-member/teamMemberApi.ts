import { apiSlice } from '@/redux/api/apiSlice';

export const teamMemberApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            sendInvite: build.mutation({
                query: ({
                    email,
                    inviteUrl,
                    ownerUserID,
                    permissions,
                    services,
                }) => ({
                    url: 'team-member/send-invite',
                    method: 'POST',
                    body: {
                        email,
                        inviteUrl,
                        ownerUserID,
                        permissions,
                        services,
                    },
                }),
            }),
        };
    },
});

export const { useSendInviteMutation } = teamMemberApi;
