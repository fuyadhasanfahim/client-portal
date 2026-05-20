/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
    UploadCloud,
    Link as LinkIcon,
    CheckCircle2,
    ExternalLink,
    Link,
    Loader2,
} from 'lucide-react';

type RefType = 'order' | 'quote';
type AsWho = 'user' | 'admin';

type InitObject =
    | {
          key: string;
          mode: 'single';
          putUrl: string;
          contentType?: string;
      }
    | {
          key: string;
          mode: 'mpu';
          uploadId: string;
          recommendedPartSize: number;
          contentType?: string;
      };

type InitResponse = {
    batchId: string;
    revision?: number;
    basePrefix: string;
    objects: InitObject[];
};

type SignPartResponse = { url: string };

type CompleteObject = {
    key: string;
    uploadId: string;
    parts: { PartNumber: number; ETag: string }[];
    size: number;
    filename: string;
    contentType?: string;
};

type SingleRecordedObject = {
    key: string;
    size: number;
    filename: string;
    contentType?: string;
};

export interface FileUploadFieldProps {
    label?: string;
    description?: string;
    refType: RefType;
    refId: string;
    userID: string;
    as: AsWho;
    revision?: number;
    accept?: string[]; // omit => any file type
    multiple?: boolean;
    maxFileSizeMB?: number; // omit => 150 GB
    required?: boolean;
    defaultLink?: string;
    onCompleted?: (link: string) => void;
    lockAfterSuccess?: boolean; // hide controls after a link exists
}

type Mode = 'upload' | 'link';

export default function FileUploadField(props: FileUploadFieldProps) {
    const {
        label = 'Files',
        description = 'Upload files or provide a link',
        refType,
        refId,
        userID,
        as,
        revision: revisionProp,
        accept,
        multiple = true,
        maxFileSizeMB,
        required,
        defaultLink,
        onCompleted,
    } = props;

    const DEFAULT_MAX_MB = 150 * 1024; // 150 GB

    const [mode, setMode] = useState<Mode>(defaultLink ? 'link' : 'upload');
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentLink, setCurrentLink] = useState<string | undefined>(
        defaultLink
    );
    const [linkInput, setLinkInput] = useState<string>('');

    // keep state in sync if parent changes defaultLink later
    useEffect(() => {
        if (defaultLink && defaultLink !== currentLink) {
            setCurrentLink(defaultLink);
        }
    }, [defaultLink]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalBytesRef = useRef<number>(0);
    const uploadedBytesRef = useRef<number>(0);
    const abortersRef = useRef<Set<AbortController>>(new Set());

    const acceptMap = useMemo(() => {
        if (accept && accept.length) {
            const map: Record<string, string[]> = {};
            for (const a of accept) map[a] = [];
            return map;
        }
        return undefined; // accept anything
    }, [accept]);

    const isLocked = !!currentLink;
    const linkKind = as === 'admin' ? 'Delivery link' : 'Download link';

    const bytesToSize = (n: number) => {
        if (n < 1024) return `${n} B`;
        const kb = n / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        if (mb < 1024) return `${mb.toFixed(1)} MB`;
        const gb = mb / 1024;
        if (gb < 1024) return `${gb.toFixed(1)} GB`;
        return `${(gb / 1024).toFixed(2)} TB`;
    };

    const computeParts = (file: File, partSize: number) => {
        const parts: { start: number; end: number; PartNumber: number }[] = [];
        let partNumber = 1;
        for (let start = 0; start < file.size; start += partSize) {
            const end = Math.min(start + partSize, file.size);
            parts.push({ start, end, PartNumber: partNumber++ });
        }
        return parts;
    };

    const dynamicPartSize = (fileSize: number, suggested?: number) => {
        const MIN = 8 * 1024 * 1024; // 8 MB
        const NICE = 32 * 1024 * 1024; // 32 MB
        const targetParts = 5000;
        const byTarget = Math.ceil(fileSize / targetParts);
        return Math.max(MIN, suggested ?? 0, byTarget, NICE);
    };

    const updateProgress = (deltaBytes: number, total: number) => {
        uploadedBytesRef.current += deltaBytes;
        const pct = Math.floor((uploadedBytesRef.current / total) * 100);
        setProgress(Math.min(100, Math.max(0, pct)));
    };

    useEffect(() => {
        const controllers = abortersRef.current;
        return () => {
            controllers.forEach((ac) => ac.abort());
            controllers.clear();
        };
    }, []);

    const putWithRetry = async (
        url: string,
        body: Blob | File,
        attempts = 3
    ) => {
        let last: any;
        for (let i = 0; i < attempts; i++) {
            const ac = new AbortController();
            abortersRef.current.add(ac);
            try {
                const res = await fetch(url, {
                    method: 'PUT',
                    body,
                    signal: ac.signal,
                });
                if (!res.ok) throw new Error(`PUT ${res.status}`);
                return res;
            } catch (e) {
                last = e;
                if (i < attempts - 1)
                    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
            } finally {
                abortersRef.current.delete(ac);
            }
        }
        throw last;
    };

    const buildFallbackLink = (
        _as: AsWho,
        _refType: RefType,
        _refId: string,
        batchId: string,
        revision?: number
    ) =>
        _as === 'user'
            ? `/api/storage/download?refType=${_refType}&refId=${_refId}&uploadedBy=user&batchId=${batchId}`
            : `/api/storage/download?refType=${_refType}&refId=${_refId}&uploadedBy=admin&revision=${revision}`;

    // 1) Memoize persistFallbackLink so its identity is stable
    const persistFallbackLink = useCallback(
        async (url: string) => {
            try {
                await fetch('/api/storage/set-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refType, refId, as, url }),
                });
            } catch {
                // best-effort
            }
        },
        [refType, refId, as] // only things it actually closes over
    );

    const startUpload = useCallback(
        async (selected: File[]) => {
            if (!selected.length) return;

            const maxMB = maxFileSizeMB ?? DEFAULT_MAX_MB;
            const tooBig = selected.find((f) => f.size > maxMB * 1024 * 1024);
            if (tooBig) {
                toast.error(
                    `"${tooBig.name}" exceeds ${bytesToSize(
                        maxMB * 1024 * 1024
                    )} limit`
                );
                return;
            }

            try {
                setBusy(true);
                setProgress(0);
                uploadedBytesRef.current = 0;
                totalBytesRef.current = selected.reduce(
                    (a, f) => a + f.size,
                    0
                );

                let revision =
                    as === 'admin' ? revisionProp ?? undefined : undefined;

                // 1) INIT
                const initRes = await fetch('/api/storage/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        refType,
                        refId,
                        as,
                        files: selected.map((f) => ({
                            filename: f.name,
                            size: f.size,
                            contentType: f.type || 'application/octet-stream',
                        })),
                        ...(revision !== undefined ? { revision } : {}),
                    }),
                });
                if (!initRes.ok) throw new Error('Failed to initialize upload');
                const initData: InitResponse = await initRes.json();
                if (as === 'admin') {
                    revision = initData.revision ?? revision ?? 1;
                }

                const uploadSingleFile = async (
                    file: File,
                    obj: InitObject
                ) => {
                    if (obj.mode === 'single') {
                        const res = await putWithRetry(obj.putUrl, file);
                        if (!res.ok) throw new Error(`PUT ${res.status}`);
                        updateProgress(file.size, totalBytesRef.current);
                        return {
                            kind: 'single' as const,
                            key: obj.key,
                            size: file.size,
                            filename: file.name,
                            contentType:
                                file.type ||
                                obj.contentType ||
                                'application/octet-stream',
                        };
                    }

                    // MPU
                    const partSize = dynamicPartSize(
                        file.size,
                        (obj as any).recommendedPartSize
                    );
                    const parts = computeParts(file, partSize);
                    const uploadedParts: {
                        PartNumber: number;
                        ETag: string;
                    }[] = [];
                    const concurrency = Math.min(
                        8,
                        (navigator as any)?.hardwareConcurrency ?? 8
                    );

                    const signUrl = async (partNumber: number) => {
                        const u = new URL(
                            '/api/storage/sign-part',
                            window.location.origin
                        );
                        u.searchParams.set('key', obj.key);
                        u.searchParams.set('uploadId', obj.uploadId);
                        u.searchParams.set('partNumber', String(partNumber));
                        const signRes = await fetch(u.toString(), {
                            method: 'GET',
                        });
                        if (!signRes.ok)
                            throw new Error('Failed to sign part URL');
                        const { url }: SignPartResponse = await signRes.json();
                        return url;
                    };

                    const uploadOne = async (p: {
                        start: number;
                        end: number;
                        PartNumber: number;
                    }) => {
                        const url = await signUrl(p.PartNumber);
                        const chunk = file.slice(p.start, p.end);
                        const putRes = await putWithRetry(url, chunk);
                        const etag = (
                            putRes.headers.get('ETag') ||
                            putRes.headers.get('Etag') ||
                            ''
                        ).replace(/"/g, '');
                        if (!etag) throw new Error('Missing ETag from S3');
                        uploadedParts.push({
                            PartNumber: p.PartNumber,
                            ETag: etag,
                        });
                        updateProgress(chunk.size, totalBytesRef.current);
                    };

                    // Promise pool
                    let idx = 0;
                    const inFlight = new Set<Promise<void>>();
                    const startOne = () => {
                        if (idx >= parts.length) return;
                        const next = uploadOne(parts[idx++])
                            .catch((e) => {
                                throw e;
                            })
                            .finally(() => inFlight.delete(next));
                        inFlight.add(next);
                    };
                    while (inFlight.size < concurrency && idx < parts.length)
                        startOne();
                    while (inFlight.size) {
                        await Promise.race(inFlight);
                        while (
                            inFlight.size < concurrency &&
                            idx < parts.length
                        )
                            startOne();
                    }

                    uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);
                    return {
                        kind: 'mpu' as const,
                        key: obj.key,
                        uploadId: obj.uploadId,
                        parts: uploadedParts,
                        size: file.size,
                        filename: file.name,
                        contentType:
                            file.type ||
                            obj.contentType ||
                            'application/octet-stream',
                    };
                };

                // 2) Upload with sensible file-level concurrency
                const smallCount = initData.objects.filter(
                    (o) => o.mode === 'single'
                ).length;
                const manySmall = smallCount > initData.objects.length * 0.6;
                const FILE_CONCURRENCY = manySmall
                    ? Math.min(6, selected.length)
                    : Math.min(2, selected.length);

                const completeObjects: CompleteObject[] = [];
                const singleRecorded: SingleRecordedObject[] = [];

                const tasks = selected.map((file, i) => async () => {
                    const obj = initData.objects[i] as InitObject;
                    try {
                        const result = await uploadSingleFile(file, obj);
                        if (result.kind === 'mpu') {
                            completeObjects.push({
                                key: result.key,
                                uploadId: (result as any).uploadId,
                                parts: (result as any).parts,
                                size: result.size,
                                filename: result.filename,
                                contentType: result.contentType,
                            });
                        } else {
                            singleRecorded.push({
                                key: result.key,
                                size: result.size,
                                filename: result.filename,
                                contentType: result.contentType,
                            });
                        }
                    } catch (err) {
                        if (obj.mode === 'mpu') {
                            try {
                                await fetch('/api/storage/abort', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        key: obj.key,
                                        uploadId: (obj as any).uploadId,
                                    }),
                                });
                            } catch {}
                        }
                        throw err;
                    }
                });

                let cursor = 0;
                const runners: Promise<void>[] = [];
                const runNext = async () => {
                    if (cursor >= tasks.length) return;
                    const t = tasks[cursor++]!;
                    await t();
                    return runNext();
                };
                for (let i = 0; i < FILE_CONCURRENCY; i++)
                    runners.push(runNext());
                await Promise.all(runners);

                // 3) COMPLETE / RECORD with fallbacks
                let linkFromComplete: string | undefined;

                if (completeObjects.length) {
                    const completeRes = await fetch('/api/storage/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            refType,
                            refId,
                            as,
                            userID,
                            batchId: initData.batchId,
                            revision,
                            s3Prefix: initData.basePrefix,
                            objects: completeObjects,
                        }),
                    });

                    if (completeRes.ok) {
                        const data = await completeRes.json();
                        linkFromComplete = data.link as string | undefined;
                    } else {
                        try {
                            const errTxt = await completeRes.text();
                            console.warn(
                                'complete failed:',
                                completeRes.status,
                                errTxt
                            );
                        } catch {}
                        const fallbackLink = buildFallbackLink(
                            as,
                            refType,
                            refId,
                            initData.batchId,
                            revision
                        );
                        await persistFallbackLink(fallbackLink);
                        linkFromComplete = fallbackLink;
                        toast(
                            'Upload completed. Saved a fallback link because the item could not be updated.',
                            { icon: '⚠️' }
                        );
                    }
                }

                if (singleRecorded.length) {
                    const res = await fetch('/api/storage/record-singles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            refType,
                            refId,
                            as,
                            userID,
                            batchId: initData.batchId,
                            s3Prefix: initData.basePrefix,
                            files: singleRecorded,
                            revision,
                        }),
                    });

                    if (res.ok) {
                        if (!linkFromComplete) {
                            const data = await res.json();
                            linkFromComplete = data.link;
                        }
                    } else if (res.status === 404) {
                        const fallbackLink = buildFallbackLink(
                            as,
                            refType,
                            refId,
                            initData.batchId,
                            revision
                        );
                        await persistFallbackLink(fallbackLink);
                        if (!linkFromComplete) linkFromComplete = fallbackLink;
                    } else {
                        console.warn(
                            'record-singles failed:',
                            res.status,
                            res.statusText
                        );
                        if (!linkFromComplete) {
                            const fallbackLink = buildFallbackLink(
                                as,
                                refType,
                                refId,
                                initData.batchId,
                                revision
                            );
                            await persistFallbackLink(fallbackLink);
                            linkFromComplete = fallbackLink;
                        }
                    }
                }

                if (linkFromComplete) {
                    setCurrentLink(linkFromComplete);
                    setMode('link');
                    toast.success('Files uploaded and link set!');
                    onCompleted?.(linkFromComplete);
                } else {
                    const fallbackLink = buildFallbackLink(
                        as,
                        refType,
                        refId,
                        initData.batchId,
                        revision
                    );
                    await persistFallbackLink(fallbackLink);
                    setCurrentLink(fallbackLink);
                    setMode('link');
                    toast.success('Files uploaded and link set (fallback).');
                    onCompleted?.(fallbackLink);
                }

                setProgress(100);
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message || 'Upload failed');
            } finally {
                setBusy(false);
            }
        },
        [
            as,
            maxFileSizeMB,
            onCompleted,
            refId,
            refType,
            revisionProp,
            userID,
            DEFAULT_MAX_MB,
            persistFallbackLink,
        ]
    );

    const onDrop = useCallback(
        (accepted: File[]) => {
            if (!accepted.length) return;
            void startUpload(accepted);
        },
        [startUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept: acceptMap,
        disabled: busy || isLocked,
    });

    const handleSaveLink = async () => {
        const url = linkInput.trim();
        if (!url) {
            toast.error('Please paste a link.');
            return;
        }
        try {
            new URL(url);
        } catch {
            toast.error('Invalid URL');
            return;
        }
        try {
            setBusy(true);
            const res = await fetch('/api/storage/set-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refType, refId, as, url }),
            });
            if (!res.ok) throw new Error('Failed to save link');
            setCurrentLink(url);
            setMode('link');
            onCompleted?.(url);
        } catch (e: any) {
            toast.error(e?.message || 'Failed to save link');
        } finally {
            setBusy(false);
        }
    };

    // Saved link panel (shared)
    const SavedLinkPanel = currentLink ? (
        <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="text-xs break-all flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium text-nowrap">{linkKind}:</span>
                    <a
                        className="underline"
                        href={currentLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {currentLink}
                    </a>
                </div>
                <Button asChild variant="secondary" size="sm" title="Open link">
                    <a href={currentLink} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </div>
        </div>
    ) : null;

    /* ============== LOCKED VIEW (no upload controls) ============== */
    if (isLocked) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        {label}
                        {required && (
                            <span className="text-red-500 ml-0.5">*</span>
                        )}
                    </Label>
                </div>
                {SavedLinkPanel}
                <p className="text-[11px] text-muted-foreground">
                    Uploading is disabled because the {linkKind.toLowerCase()}{' '}
                    is saved.
                </p>
            </div>
        );
    }

    /* ============== NORMAL VIEW (controls visible) ============== */
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <div className="flex items-center gap-2 text-xs">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setMode('upload')}
                        disabled={busy}
                    >
                        <UploadCloud className="mr-1 h-4 w-4" />
                        Upload
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setMode('link')}
                        disabled={busy}
                    >
                        <Link className="mr-1 h-4 w-4" />
                        Use link
                    </Button>
                </div>
            </div>

            {/* Show saved link even when not locked */}
            {SavedLinkPanel}

            <p className="text-xs text-muted-foreground">
                {description}{' '}
                {accept && accept.length
                    ? `(Accepted: ${accept.join(', ')})`
                    : '(Accepted: any file type)'}
            </p>

            {mode === 'upload' ? (
                <div className="space-y-3">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer focus:outline-none ${
                            busy
                                ? 'opacity-60 cursor-not-allowed'
                                : isDragActive
                                ? 'border-primary'
                                : 'border-muted-foreground/25'
                        }`}
                        title={busy ? 'Uploading in progress' : undefined}
                    >
                        {/* IMPORTANT: native input for react-dropzone */}
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <UploadCloud className="w-6 h-6" />
                            <div className="text-sm">
                                {busy
                                    ? 'Uploading…'
                                    : isDragActive
                                    ? 'Drop files here…'
                                    : 'Drag & drop files here, or click to select'}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                Max per file:{' '}
                                {bytesToSize(
                                    (maxFileSizeMB ?? DEFAULT_MAX_MB) *
                                        1024 *
                                        1024
                                )}
                            </div>
                        </div>
                    </div>

                    {busy && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Uploading… {progress}% (
                                {bytesToSize(uploadedBytesRef.current)} /{' '}
                                {bytesToSize(totalBytesRef.current)})
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="https://drive.google.com/… or S3/CloudFront URL"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            disabled={busy}
                        />
                        <Button
                            type="button"
                            onClick={handleSaveLink}
                            disabled={busy}
                        >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Save link
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
