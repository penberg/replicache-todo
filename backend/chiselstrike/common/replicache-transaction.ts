import {
    isScanIndexOptions,
    JSONValue,
    makeScanResult,
    ScanNoIndexOptions,
    ScanOptions,
    ScanResult,
    WriteTransaction,
    mergeAsyncIterables,
    filterAsyncIterable,
} from "replicache";

import { Entry } from "../models/Entry";

type CacheMap = Map<string, { value: JSONValue | undefined; dirty: boolean }>;

export class ReplicacheTransaction implements WriteTransaction {
    private _spaceID: string;
    private _clientID: string;
    private _version: number;
    private _cache: CacheMap = new Map();

    constructor(
        spaceID: string,
        clientID: string,
        version: number
    ) {
        this._spaceID = spaceID;
        this._clientID = clientID;
        this._version = version;
    }
    get clientID(): string {
        return this._clientID;
    }
    async put(key: string, value: JSONValue): Promise<void> {
        this._cache.set(key, { value, dirty: true });
    }
    async del(key: string): Promise<boolean> {
        const had = await this.has(key);
        this._cache.set(key, { value: undefined, dirty: true });
        return had;
    }
    async get(key: string): Promise<JSONValue | undefined> {
        const cached = this._cache.get(key);
        if (cached) {
            return cached.value;
        }
        const entry = await Entry.findOne({ spaceid: this._spaceID, key });
        const value = entry?.value;
        this._cache.set(key, { value, dirty: false });
        return value;
    }
    async has(key: string): Promise<boolean> {
        const val = await this.get(key);
        return val !== undefined;
    }
    async isEmpty(): Promise<boolean> {
        throw new Error("not implemented");
    }
    scan(options: ScanOptions = {} as ScanNoIndexOptions): ScanResult<string, JSONValue> {
        throw new Error("not implemented");
    }
    async flush(): Promise<void> {
        throw new Error("not implemented");
    }
}