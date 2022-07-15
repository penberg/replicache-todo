import { Client } from "../models/Client";
import { Entry } from "../models/Entry";
import { Space } from "../models/Space";
import { responseFromJson } from "@chiselstrike/api";

export default async function (req: Request): Promise<Response> {
    const url = new URL(req.url);
    const spaceID = url.searchParams.get("spaceID");
    const pull = await req.json();
    let requestCookie = pull.cookie ?? 0;
    const clientID = pull.clientID;
    const lastMutationID = (await Client.findOne({ clientID }))?.lastmutationid;
    const responseCookie = (await Space.findOne({ spaceID }))?.version;
    const resp = {
        lastMutationID: lastMutationID ?? 0,
        cookie: responseCookie ?? 0,
        patch: [],
    };
    const entries = await Entry.findMany((entry) =>
        entry.spaceid == spaceID && entry.version > requestCookie
    );
    for (const entry of entries) {
        if (entry.deleted) {
            resp.patch.push({
                op: "del",
                key: entry.key,
            });
        } else {
            const value = JSON.parse(entry.value);
            resp.patch.push({
                op: "put",
                key: entry.key,
                value,
            });
        }
    }
    return responseFromJson(resp);
}
