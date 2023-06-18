import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = () => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await auth();

      if (!user) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async () => {
      // Do something after upload
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

