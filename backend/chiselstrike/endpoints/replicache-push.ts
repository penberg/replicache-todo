export default async function (req: Request): Promise<Response> {
    const url = new URL(req.url);
    const spaceID = url.searchParams.get("spaceID");
    const push = await req.json();
    for (const mutation of push.mutations) {
        console.log(mutation.name);
        console.log(mutation.args);
    }
    return new Response("");
}
