/* eslint-disable @typescript-eslint/no-explicit-any */
import { s3ForBucket, bucket } from '@/lib/aws/s3';
import {
    ListObjectsV2Command,
    PutObjectTaggingCommand,
} from '@aws-sdk/client-s3';
import FileUpload from '@/models/file-upload.model';

export async function tagClientUploadsForOrderCompletion(
    refType: 'order' | 'quote',
    refId: string
) {
    const batches = await FileUpload.find({
        refType,
        refId,
        uploadedBy: 'user',
    });
    const s3 = await s3ForBucket();

    for (const b of batches) {
        let ContinuationToken: string | undefined = undefined;
        do {
            const page: any = await s3.send(
                new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: b.s3Prefix,
                    ContinuationToken,
                })
            );
            for (const obj of page.Contents ?? []) {
                await s3.send(
                    new PutObjectTaggingCommand({
                        Bucket: bucket,
                        Key: obj.Key!,
                        Tagging: {
                            TagSet: [
                                { Key: 'orderStatus', Value: 'completed' },
                                {
                                    Key: 'completedAt',
                                    Value: new Date()
                                        .toISOString()
                                        .slice(0, 10),
                                },
                            ],
                        },
                    })
                );
            }
            ContinuationToken = page.IsTruncated
                ? page.NextContinuationToken
                : undefined;
        } while (ContinuationToken);
    }
}
