import { responseFromJson } from "@chiselstrike/api";
import { Entry } from "../models/Entry";
import { Space } from "../models/Space";
import { Client } from "../models/Client";

export default async function (req: Request): Promise<Response> {
    const url = new URL(req.url);
    const spaceID = url.searchParams.get("spaceID");
    const pull = await req.json();
    let requestCookie = pull.cookie ?? 0;
    const entries = await Entry.cursor().filter((entry) =>
        entry.spaceid == spaceID && entry.version > requestCookie
    ).toArray();
    const lastMutationID = (await Client.findOne({ clientID: pull.clientID }))
        ?.lastmutationid;
    const responseCookie = (await Space.findOne({ spaceID }))?.version;
    const resp = {
        lastMutationID: lastMutationID ?? 0,
        cookie: responseCookie ?? 0,
        patch: [],
    };
    for (const entry of entries) {
        if (entry.deleted) {
            resp.patch.push({
                op: "del",
                key: entry.key,
            });
        } else {
            resp.patch.push({
                op: "put",
                key: entry.key,
                value: JSON.parse(entry.value),
            });
        }
    }
    return responseFromJson(resp);
}
