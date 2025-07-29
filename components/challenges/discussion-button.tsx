"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle } from "lucide-react";

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
    <Button variant='outline' size='default' asChild className='gap-2'>
      <a href={discussion.url} target='_blank' rel='noopener noreferrer' className='flex items-center'>
        <MessageCircle className='h-4 w-4' />
        💬 Join the Discussion
        <ExternalLink className='h-3 w-3' />
      </a>
    </Button>
  );
}
