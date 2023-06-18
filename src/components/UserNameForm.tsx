"use client";

import { toast } from "@/hooks/use-toast";
import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "./ui/Card";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { useRouter } from "next/navigation";

interface UserNameFormProps {
  user: Pick<User, "username" | "id">;
}

const UserNameForm: FC<UserNameFormProps> = ({ user }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    mode: "onChange",
    defaultValues: {
      name: user?.username || "",
    },
  });

  const updateUsername = useMutation(
    async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = {
        name,
      };

      const { data } = await axios.patch("/api/username", payload);

      return data;
    },
    {
      onError: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 409) {
            return toast({
              title: "Username already exists",
              description: "Please choose another username",
              variant: "destructive",
            });
          }

          // no changes 400
          if (err.response?.status === 400) {
            return toast({
              title: "No changes",
              description: "Please choose a different username",
              variant: "destructive",
            });
          }

          if (err.response?.status === 422) {
            return toast({
              title: "Invalid username",
              description: "Please choose a name between 3 and 32 characters",
              variant: "destructive",
            });
          }
        }
        toast({
          title: "Something went wrong",
          description: "Please try again later",
          variant: "destructive",
        });
      },
      onSuccess: () => {
        toast({
          title: "Username updated",
          description: "Your username has been updated",
        });
        router.refresh();
      },
    }
  );

  const onSubmit = handleSubmit((data) => {
    updateUsername.mutate(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          Your username
          <CardDescription>
            Pick a username that you like. You can change it later.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div
              className="absolute top-0 left-0 w-8 h-10 grid place-items-center
            "
            >
              <span className="text-sm text-muted-foreground">u/</span>
            </div>

            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            disabled={
              !formState.isValid ||
              updateUsername.isLoading ||
              formState.isSubmitting
            }
          >
            <span>Change name</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;
