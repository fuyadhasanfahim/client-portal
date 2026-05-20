import { apiSlice } from '@/redux/api/apiSlice';

export type ConversationListItem = {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userImage?: string;
    lastMessageAt: string;
    lastMessageText?: string;
    lastMessageAuthorID?: string;
    createdAt?: string;
    updatedAt?: string;
};

export const conversationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (userID) => ({
                url: 'conversations/get-conversations',
                params: { userID },
            }),
            providesTags: ['Conversations'],
        }),
        getConversation: builder.query({
            query: (ConversationID) => ({
                url: `conversations/get-conversation/${ConversationID}`,
            }),
            providesTags: ['Conversations'],
        }),
        joinConversation: builder.mutation({
            query: ({ conversationID, userID }) => ({
                url: `conversations/join`,
                method: 'POST',
                body: { conversationID, userID },
            }),
            invalidatesTags: ['Conversations'],
        }),
        leaveConversation: builder.mutation({
            query: ({ conversationID, userID }) => ({
                url: `conversations/leave`,
                method: 'POST',
                body: { conversationID, userID },
            }),
            invalidatesTags: ['Conversations'],
        }),
        markAsRead: builder.mutation({
            query: (body) => ({
                url: `conversations/mark-as-read`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Conversations'],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetConversationQuery,
    useJoinConversationMutation,
    useLeaveConversationMutation,
    useMarkAsReadMutation,
} = conversationApi;
