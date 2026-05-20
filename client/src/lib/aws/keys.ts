import { format as fmt } from 'date-fns';
import type { RefType } from '@/types/file-upload.interface';

export type DateKeyFormat = 'dd-MM-yyyy' | 'yyyy/MM/dd' | 'PPP' | string;

export interface CommonKeyOptions {
    userID: string;
    refType: RefType;
    refId: string;
    when?: Date;
    dateFormat?: DateKeyFormat;
}

export interface ClientPrefixOptions extends CommonKeyOptions {
    batchId: string;
}

export interface AdminPrefixOptions extends CommonKeyOptions {
    revision: number;
}

const DEFAULT_DATE_FORMAT: DateKeyFormat = 'dd-MM-yyyy';

function sanitizeSegment(input: string): string {
    let s = input.trim().replace(/^\/+|\/+$/g, '');

    s = s.replace(/\s+/g, '-').replace(/[^\w.\-@/+=]/g, '');

    s = s.replace(/\.\.+/g, '.');
    return s;
}

function joinKey(...parts: Array<string | undefined | null>): string {
    return parts
        .filter(Boolean)
        .map((p) => sanitizeSegment(String(p)))
        .filter((p) => p.length > 0)
        .join('/')
        .replace(/\/{2,}/g, '/');
}

export function formatDateForKey(
    d: Date = new Date(),
    format: DateKeyFormat = DEFAULT_DATE_FORMAT
): string {
    const out = fmt(d, format);
    return out.replace(/,/g, '');
}

export function clientPrefix(opts: ClientPrefixOptions): string {
    const {
        userID,
        refType,
        refId,
        batchId,
        when = new Date(),
        dateFormat = DEFAULT_DATE_FORMAT,
    } = opts;

    const dateSeg = formatDateForKey(when, dateFormat);

    return joinKey(
        'clients',
        userID,
        dateSeg,
        `${refType}-${refId}`,
        'source',
        batchId
    );
}

export function adminPrefix(opts: AdminPrefixOptions): string {
    const {
        userID,
        refType,
        refId,
        revision,
        when = new Date(),
        dateFormat = DEFAULT_DATE_FORMAT,
    } = opts;

    const dateSeg = formatDateForKey(when, dateFormat);

    return joinKey(
        'admin',
        userID,
        dateSeg,
        `${refType}-${refId}`,
        'deliveries',
        `rev-${revision}`
    );
}

export function keyUnder(prefix: string, filename: string): string {
    return joinKey(prefix, filename);
}

export function dateParts(d = new Date()) {
    const yyyy = `${d.getFullYear()}`;
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return { yyyy, mm, dd };
}
