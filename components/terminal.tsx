import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Terminal({ content, thingToCopy = "Text", className }: Readonly<{ content: string; thingToCopy?: string; className?: string }>) {
  const { toast } = useToast();
  const handleCopyJson = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: `${thingToCopy} copied to clipboard.`,
        });
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard: ", err);
        toast({
          title: "Error",
          description: "Could not copy to clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className='relative text-left'>
      <pre className={cn(className, "overflow-x-auto rounded-md border border-secondary bg-muted p-4 pr-12 break-all")}>
        <code className='text-sm font-mono text-secondary-foreground'>{content}</code>
      </pre>
      <Button variant='ghost' size='icon' className='absolute right-2 top-2' onClick={() => handleCopyJson(content)}>
        <Copy className='h-4 w-4' />
        <span className='sr-only'>Copy</span>
      </Button>
    </div>
  );
}
