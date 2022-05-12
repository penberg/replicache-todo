export default async function (req: Request): Promise<Response> {
    const pullRequest = await req.json();
    // pull: {"profileID":"p47cca61b4f4c4c21a1ad6cbb2072f601","clientID":"54d806cc-9088-47e3-a030-89110c1b70b9","cookie":null,"lastMutationID":0,"pullVersion":0,"schemaVersion":""}
    console.log("profileID: " + pullRequest.profileID);
    return new Response("");
}
