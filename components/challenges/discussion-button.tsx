"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DiscussionButtonProps {
  challengeTitle: string;
}

interface DiscussionResponse {
  url: string;
  title: string;
}

async function fetchDiscussionUrl(challengeTitle: string): Promise<DiscussionResponse> {
  const response = await fetch(`/api/discussion-url?challenge=${encodeURIComponent(challengeTitle)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch discussion");
  }

  return response.json();
}

export function DiscussionButton({ challengeTitle }: DiscussionButtonProps) {
  const {
    data: discussion,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["discussion", challengeTitle],
    queryFn: () => fetchDiscussionUrl(challengeTitle),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  });

  // Don't render the button if discussion is not found or if there's an error
  if (error || !discussion) {
    return null;
  }

  // Don't render the button while loading
  if (isLoading) {
    return null;
  }

  return (
    <Button variant='ghost' size='sm' asChild className='text-muted-foreground hover:text-primary'>
      <Link href={discussion.url} target='_blank' rel='noopener noreferrer'>
        💬 Join the Discussion
      </Link>
    </Button>
  );
}
