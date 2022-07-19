import { Client } from "../models/Client";
import { Entry } from "../models/Entry";
import { Space } from "../models/Space";
import { responseFromJson } from "@chiselstrike/api";

export default async function (req: Request): Promise<Response> {
    const url = new URL(req.url);
    const spaceID = url.searchParams.get("spaceID");
    const pull = await req.json();
    const requestCookie = pull.cookie ?? 0;
    const clientID = pull.clientID;
    const patch = await Entry.cursor().filter(entry => {
        return entry.spaceid == spaceID && entry.version > requestCookie;
    }).map(entry => {
        if (entry.deleted) {
            return {
                op: "del",
                key: entry.key,
            };
        } else {
            const value = JSON.parse(entry.value);
            return {
                op: "put",
                key: entry.key,
                value,
            };
        }
    }).toArray();
    const lastMutationID = (await Client.findOne({ clientID }))?.lastmutationid;
    const responseCookie = (await Space.findOne({ spaceID }))?.version;
    return {
        lastMutationID: lastMutationID ?? 0,
        cookie: responseCookie ?? 0,
        patch,
    };
}
