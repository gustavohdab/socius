"use client";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import { PostVoteRequest } from "@/lib/validators/votes";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FC, useEffect, useState } from "react";
import { Icons } from "../Icons";
import { Button } from "../ui/Button";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVotesAmount,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVoteAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVoteAmount((prev) => prev - 1);
      if (voteType === "DOWN") setVoteAmount((prev) => prev + 1);

      // reset current vote
      setCurrentVote(prevVote);
      // status 401
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          loginToast();
        }
      }
      // status 404
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          return toast({
            title: "Post not found",
            description: "This post has been deleted or does not exist",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong",
        description: "Your vote could not be processed, please try again",
        variant: "destructive",
      });
    },
    onMutate: (type: VoteType) => {
      const voteMapping = {
        UP: 1,
        DOWN: -1,
      };

      let adjustment: number;
      if (currentVote === type) {
        adjustment = -1; // User is voting the same way again, so remove their vote
      } else if (currentVote) {
        adjustment = 2; // User is voting in the opposite direction, so swing vote
      } else {
        adjustment = 1; // User is voting for the first time, so add their vote
      }
      setCurrentVote(currentVote === type ? undefined : type);
      setVoteAmount((prev: number) => prev + adjustment * voteMapping[type]);
    },
  });
  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="up-vote"
      >
        <Icons.arrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        variant="ghost"
        aria-label="down-vote"
      >
        <Icons.arrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
