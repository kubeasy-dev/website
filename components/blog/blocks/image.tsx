import Image from "next/image";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "./text";

interface ImageBlockProps {
  block: NotionBlock;
}

export function ImageBlock({ block }: ImageBlockProps) {
  if (!block.image) return null;

  const { type, file, external, caption } = block.image;
  const url = type === "file" ? file?.url : external?.url;

  if (!url) return null;

  const altText = caption?.map((t) => t.plain_text).join("") || "Blog image";

  return (
    <figure className="my-10">
      <div className="relative aspect-video overflow-hidden neo-border-thick neo-shadow">
        <Image
          src={url}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, 896px"
          className="object-cover"
        />
      </div>
      {caption && caption.length > 0 && (
        <figcaption className="mt-4 text-center text-sm font-medium text-muted-foreground">
          <RichText richText={caption} />
        </figcaption>
      )}
    </figure>
  );
}
