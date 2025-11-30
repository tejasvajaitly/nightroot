"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import { HabitTracker } from "@/components/habit-tracker";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background border-b flex flex-row justify-between items-center px-4 py-3">
        <div className="text-sm font-medium">Nightroot</div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserButton />
        </div>
      </header>
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <Authenticated>
          <HabitTracker />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-3 items-center">
      <SignInButton mode="modal">
        <Button variant="ghost">Sign in</Button>
      </SignInButton>
    </div>
  );
}

