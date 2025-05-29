import * as React from "react";
import { CheckCircle2, Copy, Search, Terminal } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CopyActionCellProps {
  message: string;
  objectRef: string;
}

export const CopyActionCell: React.FC<CopyActionCellProps> = ({ message, objectRef }) => {
  const [copiedMsg, setCopiedMsg] = React.useState(false);
  const [copiedKubectl, setCopiedKubectl] = React.useState(false);
  const [copiedLogs, setCopiedLogs] = React.useState(false);

  const handleCopyMsg = async () => {
    await navigator.clipboard.writeText(message);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 1200);
  };
  const handleCopyKubectl = async () => {
    await navigator.clipboard.writeText(`kubectl describe ${objectRef}`);
    setCopiedKubectl(true);
    setTimeout(() => setCopiedKubectl(false), 1200);
  };

  return (
    <div className='flex gap-1'>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type='button' aria-label='Copy message' className='p-1 hover:text-primary transition-colors' onClick={handleCopyMsg}>
            {copiedMsg ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <Copy className='h-4 w-4' />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{copiedMsg ? "Copied!" : "Copy message"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type='button' aria-label='Copy kubectl describe' className='p-1 hover:text-primary transition-colors' onClick={handleCopyKubectl}>
            {copiedKubectl ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <Search className='h-4 w-4' />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{copiedKubectl ? "Copied!" : "Copy kubectl describe"}</TooltipContent>
      </Tooltip>
      {/* Bouton logs pod */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            aria-label='Copy kubectl logs'
            className='p-1 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            disabled={!objectRef.startsWith("pod/")}
            onClick={async () => {
              if (!objectRef.startsWith("pod/")) return;
              await navigator.clipboard.writeText(`kubectl logs ${objectRef.replace("pod/", "")}`);
              setCopiedLogs(true);
              setTimeout(() => setCopiedLogs(false), 1200);
            }}
          >
            {copiedLogs ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <Terminal className='h-4 w-4' />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{objectRef.startsWith("pod/") ? (copiedLogs ? "Copied!" : "Copy kubectl logs") : "Only for pods"}</TooltipContent>
      </Tooltip>
    </div>
  );
};
