import { queries } from "@/lib/queries";
import { createStaticClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Image metadata
export const alt = "Challenge";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: challenge } = await queries.challenge.get(supabase, { slug });

  if (!challenge) return notFound();

  // Font loading, process.cwd() is Next.js project directory
  const interSemiBold = await readFile(join(process.cwd(), "app/assets/Inter-SemiBold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <img src='https://kubeasy.dev/logo.png' width='100' style={{ marginBottom: 20 }} alt='Kubeasy logo' />
        <h1 style={{ fontSize: 40, fontWeight: 600, marginBottom: 10 }}>{challenge.title}</h1>
        <p style={{ fontSize: 20, color: "#666", marginBottom: 20 }}>{challenge.description}</p>
        <span style={{ fontSize: 20, color: "#337ab7" }}>Play this challenge on kubeasy.dev</span>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interSemiBold,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
