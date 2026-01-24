"use client";

import { useEffect, useState } from "react";
import { type BundledTheme, codeToHtml } from "shiki";
import { cn } from "@/lib/utils";
import type { NotionBlock } from "@/types/blog";
import { CopyButton } from "./copy-button";

// Map Notion language names to Shiki language identifiers
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  go: "go",
  rust: "rust",
  java: "java",
  c: "c",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  csharp: "csharp",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  shell: "bash",
  bash: "bash",
  zsh: "bash",
  powershell: "powershell",
  sql: "sql",
  graphql: "graphql",
  html: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  json: "json",
  yaml: "yaml",
  toml: "toml",
  xml: "xml",
  markdown: "markdown",
  dockerfile: "dockerfile",
  docker: "dockerfile",
  nginx: "nginx",
  apache: "apache",
  makefile: "makefile",
  cmake: "cmake",
  terraform: "terraform",
  hcl: "hcl",
  lua: "lua",
  r: "r",
  perl: "perl",
  elixir: "elixir",
  erlang: "erlang",
  clojure: "clojure",
  haskell: "haskell",
  ocaml: "ocaml",
  fsharp: "fsharp",
  dart: "dart",
  groovy: "groovy",
  vue: "vue",
  jsx: "jsx",
  tsx: "tsx",
  svelte: "svelte",
  astro: "astro",
  plain: "text",
  plaintext: "text",
  text: "text",
};

interface CodeBlockProps {
  block: NotionBlock;
}

export function CodeBlock({ block }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  const codeData = block.code;
  const code = codeData?.rich_text.map((t) => t.plain_text).join("") ?? "";
  const language = codeData?.language ?? "text";
  const lang = languageMap[language.toLowerCase()] || "text";
  const caption = codeData?.caption;

  useEffect(() => {
    if (!code) return;

    codeToHtml(code, {
      lang,
      themes: {
        light: "github-light" as BundledTheme,
        dark: "github-dark" as BundledTheme,
      },
    }).then(setHtml);
  }, [code, lang]);

  if (!codeData) return null;

  return (
    <div className="my-8 group">
      <div className="relative overflow-hidden neo-border-thick neo-shadow bg-background">
        {/* Language badge and copy button */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground bg-secondary">
          <span className="text-xs font-black uppercase tracking-wider">
            {language}
          </span>
          <CopyButton code={code} />
        </div>

        {/* Code content */}
        <div
          className={cn(
            "overflow-x-auto p-4 text-sm",
            "[&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0",
            "[&_code]:font-mono",
          )}
        >
          {html ? (
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="font-mono">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>

      {/* Caption */}
      {caption && caption.length > 0 && (
        <p className="mt-3 text-sm font-medium text-muted-foreground text-center">
          {caption.map((t) => t.plain_text).join("")}
        </p>
      )}
    </div>
  );
}
