"use client";
import { Check, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { AnchorProvider, ScrollProvider, TOCItem } from "fumadocs-core/toc";
import { useRef } from "react";
import type { TOCItemType } from "fumadocs-core/server";

export function Control({ url }: { url: string }): React.ReactElement {
  const [isChecked, onCopy] = useCopyButton(() => {
    void navigator.clipboard.writeText(`${window.location.origin}${url}`);
  });

  return (
    <button type='button' className={cn(buttonVariants({ className: "gap-2", variant: "secondary" }))} onClick={onCopy}>
      {isChecked ? <Check className='size-4' /> : <Share className='size-4' />}
      {isChecked ? "Copied URL" : "Share Post"}
    </button>
  );
}

export function CustomTOC({ items }: { items: TOCItemType[] }) {
  const viewRef = useRef<HTMLDivElement>(null);

  return (
    <AnchorProvider toc={items}>
      <div ref={viewRef} className='overflow-auto'>
        <ScrollProvider containerRef={viewRef}>
          <div className='space-y-2'>
            {items.map((item) => (
              <div key={item.url} className='flex flex-col'>
                <TOCItem key={item.url} href={item.url} className='text-sm'>
                  {item.title}
                </TOCItem>
              </div>
            ))}
          </div>
        </ScrollProvider>
      </div>
    </AnchorProvider>
  );
}
