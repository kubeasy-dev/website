"use";

import { useState } from "react";
import { Button } from "./ui/button";
import { ClipboardCopyIcon } from "lucide-react";

export default function TokenDisplay({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='flex flex-col gap-2 pt-2'>
      <div className='rounded font-mono text-sm text-muted-foreground break-all whitespace-normal border-2 p-2 border-secondary'>{token}</div>

      <Button onClick={handleCopy} variant='secondary' className='w-full'>
        <ClipboardCopyIcon />
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
