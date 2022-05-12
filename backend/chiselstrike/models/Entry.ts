import { ChiselEntity } from "@chiselstrike/api";

export class Entry extends ChiselEntity {
    entryID: string;
    spaceid: string;
    key: string;
    value: string;
    deleted: boolean;
    version: number;
    lastmodified: number;
}
