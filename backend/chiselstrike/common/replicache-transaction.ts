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

export class ReplicacheTransaction implements WriteTransaction {
    private _spaceID: string;
    private _clientID: string;
    private _version: number;
  
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
        throw new Error("not implemented");
    }
    async put(key: string, value: JSONValue): Promise<void> {
        throw new Error("not implemented");
    }
    async del(key: string): Promise<boolean> {
        throw new Error("not implemented");
    }
    async get(key: string): Promise<JSONValue | undefined> {
        throw new Error("not implemented");
    }
    async has(key: string): Promise<boolean> {
        throw new Error("not implemented");
    }
    async isEmpty(): Promise<boolean> {
        throw new Error("not implemented");
    }
    scan(options: ScanOptions = {} as ScanNoIndexOptions): ScanResult<string, JSONValue> {
        throw new Error("not implemented");
    }
}