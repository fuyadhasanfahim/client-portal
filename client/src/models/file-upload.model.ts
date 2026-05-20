import { IFileItem, IFileUpload } from '@/types/file-upload.interface';
import { Schema, model, models } from 'mongoose';

const FileItemSchema = new Schema<IFileItem>(
    {
        key: { type: String, required: true },
        filename: String,
        size: Number,
        etag: String,
        contentType: String,
    },
    { _id: false }
);

const FileUploadSchema = new Schema<IFileUpload>(
    {
        refType: {
            type: String,
            enum: ['order', 'quote'],
            required: true,
            index: true,
        },
        refId: { type: String, required: true, index: true },
        userID: { type: String, required: true, index: true },
        uploadedBy: {
            type: String,
            enum: ['user', 'admin'],
            required: true,
            index: true,
        },
        revision: { type: Number, index: true },
        batchId: { type: String, required: true, index: true },
        s3Prefix: { type: String, required: true },
        files: { type: [FileItemSchema], default: [] },
        deletable: { type: Boolean, default: false },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

FileUploadSchema.index({ refType: 1, refId: 1, uploadedBy: 1, revision: 1 });
FileUploadSchema.index({ refType: 1, refId: 1, uploadedBy: 1, createdAt: -1 });

const FileUploadModel =
    models.FileUpload || model<IFileUpload>('FileUpload', FileUploadSchema);
export default FileUploadModel;
