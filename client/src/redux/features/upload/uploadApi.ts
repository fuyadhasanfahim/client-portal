import { apiSlice } from '@/redux/api/apiSlice';

export const uploadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        presignUpload: builder.mutation({
            query: ({
                fileName,
                contentType,
                size,
                conversationID,
                senderID,
            }) => ({
                url: `uploads/presign`,
                method: 'POST',
                body: { fileName, contentType, size, conversationID, senderID },
            }),
        }),
        downloadFile: builder.query({
            query: (key) => ({
                url: `uploads/download?key=${encodeURIComponent(key)}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    usePresignUploadMutation,
    useDownloadFileQuery,
    useLazyDownloadFileQuery,
} = uploadApi;
