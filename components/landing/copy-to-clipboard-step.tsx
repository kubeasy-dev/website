"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CopyToClipboardStepProps {
  value: string;
  className?: string;
}

export function CopyToClipboardStep({ value, className }: CopyToClipboardStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Optionally handle error
    }
  };

  return (
    <Button type='button' variant='ghost' size='sm' aria-label='Copy to clipboard' className={`ml-2 px-2 py-1 h-7 w-7 ${className ?? ""}`} onClick={handleCopy}>
      {copied ? <Check className='h-4 w-4 text-primary' /> : <Copy className='h-4 w-4 text-primary' />}
    </Button>
  );
}
