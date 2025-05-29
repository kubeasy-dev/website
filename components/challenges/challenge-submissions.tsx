"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle } from "lucide-react";
import { UserSubmission, SubmissionPayload } from "@/lib/types";
import useSupabase from "@/hooks/use-supabase";
import { useSubscription, useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { RelativeDateDisplay } from "@/components/relative-date-display";
import { useParams } from "next/navigation";
import { Terminal } from "../terminal";
import { SubmissionPayloadViewer } from "./submission-payload-viewer";

export function ChallengeSubmissions({ userProgressId }: Readonly<{ userProgressId: string }>) {
  const [activeTab, setActiveTab] = useState<string>("static");
  const { slug } = useParams<{ slug: string }>();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);

  const supabase = useSupabase();

  // Subscription to real-time submission changes
  useSubscription(
    supabase,
    `submissions_${userProgressId}`,
    {
      event: "*",
      table: "user_submissions",
      schema: "public",
      filter: `user_progress=eq.${userProgressId}`,
    },
    ["id"],
    {
      callback: (payload) => {
        if (payload.eventType === "INSERT") {
          const newSubmission = payload.new as UserSubmission;
          setSubmissions((currentSubmissions) => {
            // Avoid adding duplicates and maintain sort order (newest first)
            if (!currentSubmissions.some((sub) => sub.id === newSubmission.id)) {
              const updatedSubmissions = [newSubmission, ...currentSubmissions];
              return updatedSubmissions;
            }
            return currentSubmissions;
          });
        }
        if (payload.eventType === "DELETE") {
          const deletedSubmissionId = payload.old.id;
          setSubmissions((currentSubmissions) => currentSubmissions.filter((sub) => sub.id !== deletedSubmissionId));
        }
        if (payload.eventType === "UPDATE") {
          const updatedSubmission = payload.new as UserSubmission;
          setSubmissions((currentSubmissions) => currentSubmissions.map((sub) => (sub.id === updatedSubmission.id ? updatedSubmission : sub)));
        }
      },
    }
  );

  const { data: initialSubmissions } = useQuery(queries.userSubmission.list(supabase, { challengeId: userProgressId.split("+")[1] }));

  useEffect(() => {
    if (initialSubmissions) {
      setSubmissions(initialSubmissions);
    }
  }, [initialSubmissions]);

  return (
    <AnimatePresence initial={false}>
      {submissions.length > 0 ? (
        <Accordion type='single' collapsible className='w-full'>
          {submissions.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.28, ease: [0.87, 0, 0.13, 1] }}
              style={{ willChange: "opacity, transform" }}
            >
              <AccordionItem value={sub.id.toString()} className='border-b'>
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex w-full justify-between items-center'>
                    <div className='flex items-center space-x-1'>
                      <span className='text-sm font-medium'>{`#${submissions.length - index}`} -</span>
                      <RelativeDateDisplay stringDate={sub.time} />
                    </div>
                    <div className='flex items-center justify-center space-x-1 mr-4 gap-2'>
                      <div className='flex flex-col items-center justify-center'>
                        {sub.static_validation ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <XCircle className='h-4 w-4 text-red-500' />}
                        <span className='text-xs text-muted-foreground mt-1'>Static Validation</span>
                      </div>
                      <div className='flex flex-col items-center justify-center'>
                        {sub.dynamic_validation ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <XCircle className='h-4 w-4 text-red-500' />}
                        <span className='text-xs text-muted-foreground mt-1'>Runtime Validation</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className='flex w-full justify-end'>
                    <SubmissionPayloadViewer payload={sub.payload as unknown as SubmissionPayload} activeTab={activeTab} onTabChange={setActiveTab} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      ) : (
        <div className='text-left'>
          <h3 className='text-md font-bold'>No submissions yet.</h3>
          <p>You can submit your solution by running the command below:</p>
          <Terminal content={`kubeasy challenge submit ${slug}`} thingToCopy='Command' />
        </div>
      )}
    </AnimatePresence>
  );
}
