import { z } from "zod";

export const UsernameValidator = z.object({
  name: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters long",
    })
    .max(32, {
      message: "Username must be at most 32 characters long",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Username must only contain alphanumeric characters and underscores",
    }),
});

export type UsernameRequest = z.infer<typeof UsernameValidator>;
