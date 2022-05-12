import { Space } from "../models/Space";
import { Client } from "../models/Client";
import { mutators } from "../../../frontend/mutators";
import { ReplicacheTransaction } from "../common/replicache-transaction";

export default async function (req: Request): Promise<Response> {
    console.log("PUSH");
    const url = new URL(req.url);
    const spaceID = url.searchParams.get("spaceID");
    const push = await req.json();
    const clientID = push.clientID;
    const space = await Space.findOne({ spaceID: spaceID });
    const prevVersion = space?.version ?? 0;
    const nextVersion = prevVersion + 1;
    const client = await Client.findOne({ clientID: clientID });
    let lastMutationID = client?.lastmutationid ?? 0;
    const tx = new ReplicacheTransaction(
        spaceID,
        push.clientID,
        nextVersion
    );
    for (const mutation of push.mutations) {
        const expectedMutationID = lastMutationID + 1;

        if (mutation.id < expectedMutationID) {
            console.log(
                `Mutation ${mutation.id} has already been processed - skipping`
            );
            continue;
        }
        if (mutation.id > expectedMutationID) {
            console.warn(`Mutation ${mutation.id} is from the future - aborting`);
            break;
        }

        console.log("Processing mutation:", JSON.stringify(mutation, null, ""));

        const t1 = Date.now();
        const mutator = (mutators as any)[mutation.name];
        if (!mutator) {
            console.error(`Unknown mutator: ${mutation.name} - skipping`);
        }

        try {
            await mutator(tx, mutation.args);
        } catch (e) {
            console.error(
                `Error executing mutator: ${JSON.stringify(mutator)}: ${e}`
            );
        }

        lastMutationID = expectedMutationID;
        console.log("Processed mutation in", Date.now() - t1);
    }

    if (client) {
        client.lastmutationid = lastMutationID;
        space.lastmodified = Date.now();
        await client.save();
    } else {
        await Client.create({ clientID: clientID, lastmutationid: lastMutationID, lastmodified: Date.now() });
    }
    if (space) {
        space.version = nextVersion;
        space.lastmodified = Date.now();
        space.save();
    } else {
        await Space.create({ spaceID: spaceID, version: nextVersion, lastmodified: Date.now() });
    }
    await tx.flush();
    console.log("PUSH DONE");
    return new Response("");
}
