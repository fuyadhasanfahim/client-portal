import { apiSlice } from '@/redux/api/apiSlice';

export const messagesApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            setMessage: build.mutation({
                query: (data) => ({
                    url: 'messages/set-message',
                    method: 'POST',
                    body: data,
                }),
            }),
            getMessages: build.query({
                query: ({ conversationID, userID }) => ({
                    url: 'messages/get-messages',
                    method: 'GET',
                    params: {
                        conversation_id: conversationID,
                        user_id: userID,
                    },
                }),
            }),
            getConversation: build.query({
                query: (userID) => ({
                    url: 'messages/get-conversation',
                    method: 'GET',
                    params: {
                        user_id: userID,
                    },
                }),
            }),
            getAllConversations: build.query({
                query: () => ({
                    url: 'messages/get-all-conversations',
                    method: 'GET',
                }),
            }),
        };
    },
});

export const {
    useSetMessageMutation,
    useGetMessagesQuery,
    useGetConversationQuery,
    useGetAllConversationsQuery,
} = messagesApi;
