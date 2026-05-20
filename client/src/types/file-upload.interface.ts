export type RefType = 'order' | 'quote';
export type UploadedBy = 'user' | 'admin';

export interface IFileItem {
    key: string;
    filename?: string;
    size?: number;
    etag?: string;
    contentType?: string;
}

export interface IFileUpload extends Document {
    refType: RefType;
    refId: string;
    userID: string;
    uploadedBy: UploadedBy;
    revision?: number;
    batchId: string;
    s3Prefix: string;
    files: IFileItem[];
    createdAt: Date;
    updatedAt: Date;
    deletable?: boolean;
    completedAt?: Date;
}
