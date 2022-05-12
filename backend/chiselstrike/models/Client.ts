import { ChiselEntity } from "@chiselstrike/api";

export class Client extends ChiselEntity {
    clientID: string;
    lastmutationid: number;
    lastmodified: number;
}
