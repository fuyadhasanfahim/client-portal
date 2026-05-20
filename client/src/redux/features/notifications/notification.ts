import { apiSlice } from '@/redux/api/apiSlice';

export const notificationApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            getNotifications: builder.query({
                query: ({ userID, page, limit }) => ({
                    url: `notifications/get-notifications`,
                    method: 'GET',
                    params: { userID, page, limit },
                }),
                providesTags: ['Notifications'],
            }),
            updateNotification: builder.mutation({
                query: (notificationID) => ({
                    url: `notifications/update-notification/${notificationID}`,
                    method: 'PUT',
                }),
                invalidatesTags: ['Notifications'],
            }),
            markAllNotificationsAsRead: builder.mutation({
                query: (userID) => ({
                    url: `notifications/mark-all-as-read-notification`,
                    method: 'PUT',
                    body: { userID },
                }),
                invalidatesTags: ['Notifications'],
            }),
        };
    },
});

export const {
    useGetNotificationsQuery,
    useUpdateNotificationMutation,
    useMarkAllNotificationsAsReadMutation,
} = notificationApi;
