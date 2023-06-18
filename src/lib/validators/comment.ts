import { z } from "zod";

export const CommentValidator = z.object({
  postId: z.string(),
  text: z
    .string()
    .min(1, {
      message: "Comment must be at least 1 character long",
    })
    .max(500, {
      message: "Comment must be less than 500 characters long",
    }),
  replyToId: z.string().optional(),
});

export type CommentRequest = z.infer<typeof CommentValidator>;
