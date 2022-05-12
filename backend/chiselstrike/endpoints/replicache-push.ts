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
    const space = await Space.findOne({id: spaceID });
    const prevVersion = space?.version ?? 0;
    const nextVersion = prevVersion + 1;
    const client = await Client.findOne({id: clientID});
    const lastMutationID = client?.lastmutationid ?? 0;
    console.log("Previous version: " + prevVersion);
    console.log("Next version: " + nextVersion);
    console.log("Last mutation ID: " + lastMutationID);
    const tx = new ReplicacheTransaction(
        spaceID,
        push.clientID,
        nextVersion
      );
      for (const mutation of push.mutations) {
        console.log(mutation.name);
        console.log(mutation.args);
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
    }
    console.log("PUSH DONE");
    return new Response("");
}
