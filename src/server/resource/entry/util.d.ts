import * as express from 'express';
import { EntryRaw } from './types';
export declare const prettifyEntry: (raw: EntryRaw) => {
    meta: {
        user: string;
        collection: string;
        entry: string;
        version: number;
        deletedAt: any;
    };
    name: any;
    value: any;
};
export declare const getEntryRangeKey: (uuid?: string, createVersion?: boolean) => string;
export declare const validateEntryInput: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
