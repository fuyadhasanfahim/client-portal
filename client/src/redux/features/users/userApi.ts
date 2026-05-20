import { apiSlice } from '@/redux/api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query({
            query: (token) => ({
                url: 'users/me',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        }),
        getUserInfo: builder.query({
            query: (userID) => ({
                url: `users/get-info/${userID}`,
                method: 'GET',
            }),
        }),
        getUsers: builder.query({
            query: (role) => ({
                url: 'users/get-users',
                method: 'GET',
                params: { role },
            }),
            providesTags: ['Users'],
        }),
        updateUser: builder.mutation({
            query: ({ userID, data }) => ({
                url: `users/update-info/${userID}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),
        updatePassword: builder.mutation({
            query: ({ userID, newPassword, currentPassword }) => ({
                url: `users/update-password/${userID}`,
                method: 'PUT',
                body: { currentPassword, newPassword },
            }),
            invalidatesTags: ['Users'],
        }),
        updateAvatar: builder.mutation({
            query: ({ userID, formData }) => ({
                url: `users/upload-avatar/${userID}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Users'],
        }),
        getClients: builder.query({
            query: ({ search, page, limit, sortBy, sortOrder, userID }) => ({
                url: 'users/get-clients',
                method: 'GET',
                params: {
                    search,
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                    userID,
                },
            }),
            providesTags: ['Users'],
        }),
        getTeamMembers: builder.query({
            query: ({ search, page, limit, sortBy, sortOrder, userID }) => ({
                url: 'users/get-team-members',
                method: 'GET',
                params: {
                    search,
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                    userID,
                },
            }),
            providesTags: ['Users'],
        }),
        updateTeamMemberById: builder.query({
            query: ({ id, data }) => ({
                url: `users/update-team-member-info/${id}`,
                method: 'GET',
                body: data,
            }),
            providesTags: ['Users'],
        }),
    }),
});

export const {
    useGetMeQuery,
    useGetUserInfoQuery,
    useGetUsersQuery,
    useUpdateUserMutation,
    useUpdatePasswordMutation,
    useUpdateAvatarMutation,
    useGetClientsQuery,
    useGetTeamMembersQuery,
    useUpdateTeamMemberByIdQuery,
} = userApi;
