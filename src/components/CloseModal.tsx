"use client";

import { useRouter } from "next/navigation";
import { Icons } from "../components/Icons";
import { Button } from "./ui/Button";

const CloseModal = () => {
  const router = useRouter();
  return (
    <Button
      aria-label="Close modal"
      variant="subtle"
      className="h-6 w-6 p-0 rounded-md"
      onClick={() => router.back()}
    >
      <Icons.x className="h-6 w-6 text-zinc-700 hover:text-zinc-900" />
    </Button>
  );
};

export default CloseModal;
