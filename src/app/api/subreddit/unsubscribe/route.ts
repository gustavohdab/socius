import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    // fist check if the user is logged in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // get the subreddit id from the request body
    const body = await req.json();

    // validate the subreddit id
    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    // check if the subscription already exists
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new Response("You are not subscribed to this subreddit", {
        status: 400,
      });
    }

    // check if user is the owner of the subreddit
    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });

    if (subreddit) {
      return new Response("You can't unsubscribe from your own subreddit", {
        status: 400,
      });
    }

    // then cancel the subscription
    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    });

    return new Response(subredditId, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not unsubscribe from subreddit", {
      status: 500,
    });
  }
}
