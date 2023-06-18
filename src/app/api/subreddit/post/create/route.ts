import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    // get the user session
    const session = await getAuthSession();

    // fist check if the user is logged in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // get the subreddit id from the request body
    const body = await req.json();

    // validate the subreddit id
    const { subredditId, title, content } = PostValidator.parse(body);

    // check if the subscription already exists
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new Response("Not subscribed to this subreddit", {
        status: 400,
      });
    }

    // then create the subscription
    await db.post.create({
      data: {
        authorId: session.user.id,
        subredditId,
        title,
        content,
      },
    });

    return new Response("Post created", { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", { status: 422 });
    }

    return new Response("Could not create post", { status: 500 });
  }
}
