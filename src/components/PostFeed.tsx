"use client";

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef } from "react";
import Post from "./Post";
import { Icons } from "./Icons";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
  const lastPostRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => pages.length + 1,
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <div className="flex flex-col col-span-2 space-y-6">
      <ul className="flex flex-col space-y-6">
        {posts.map((post, index) => {
          const votesAmount = post.votes.reduce((acc, vote) => {
            if (vote.type === "UP") return acc + 1;
            if (vote.type === "DOWN") return acc - 1;
            return acc;
          }, 0);

          const currentVote = post.votes.find(
            (vote) => vote.userId === session?.user.id
          );

          if (index === posts.length - 1) {
            return (
              <li key={post.id} ref={ref}>
                <Post
                  currentVote={currentVote}
                  votesAmount={votesAmount}
                  commentAmount={post.comments.length}
                  subredditName={post.subreddit.name}
                  post={post}
                />
              </li>
            );
          } else {
            return (
              <Post
                commentAmount={post.comments.length}
                subredditName={post.subreddit.name}
                currentVote={currentVote}
                votesAmount={votesAmount}
                post={post}
                key={post.id}
              />
            );
          }
        })}
      </ul>
      {isFetchingNextPage ? (
        <Icons.loader2 className="animate-spin h-6 w-6 mx-auto" />
      ) : null}
    </div>
  );
};

export default PostFeed;
