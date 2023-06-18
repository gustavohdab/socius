import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();

    const { name } = UsernameValidator.parse(body);

    if (name === session.user.username)
      return new Response("No changes", { status: 400 });

    // check if username is already taken by someone else
    const username = await db.user.findUnique({
      where: {
        username: name,
      },
    });

    if (username)
      return new Response("Username already taken", { status: 409 });

    // update username
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("Username updated", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not update username", { status: 500 });
  }
}
