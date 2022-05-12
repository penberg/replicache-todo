import { ChiselEntity } from "@chiselstrike/api";

export class Entry extends ChiselEntity {
    spaceid: string;
    key: string;
    value: string;
    deleted: boolean;
    version: number;
    lastmodified: number;
}
