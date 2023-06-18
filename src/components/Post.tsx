import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { FC, useRef } from "react";
import EditorOutput from "./EditorOutput";
import { Icons } from "./Icons";
import PostVoteClient from "./post-vote/PostVoteClient";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  subredditName?: string;
  post: Post & {
    author: User;
    votes: Vote[];
  };
  commentAmount: number;
  votesAmount: number;
  currentVote?: PartialVote;
}

const Post: FC<PostProps> = ({
  subredditName,
  post,
  commentAmount,
  votesAmount: votesAmount,
  currentVote,
}) => {
  const pRef = useRef<HTMLDivElement>(null);
  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient
          initialVotesAmount={votesAmount}
          postId={post.id}
          initialVote={currentVote?.type}
          key={post.id}
        />

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subredditName ? (
              <>
                <a
                  href={`/r/${subredditName}`}
                  className="underline text-zinc-900 text-sm underline-offset-2"
                >
                  r/{subredditName}
                </a>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>

          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h2 className="text-xl font-semibold text-zinc-900">
              {post.title}
            </h2>
          </a>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={post.content} key={post.id} />
            {pRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a
          className="w-fit flex items-center gap-2"
          href={`/r/${subredditName}/post/${post.id}`}
        >
          <Icons.messageSquare className="h-4 w-4" /> {commentAmount} Comments
        </a>
      </div>
    </div>
  );
};

export default Post;
