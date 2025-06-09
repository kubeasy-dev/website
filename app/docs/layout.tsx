import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { DynamicIcon } from "lucide-react/dynamic";
import { IconName } from "lucide-react/dynamic";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      githubUrl='https://github.com/kubeasy-dev/website'
      sidebar={{
        tabs: {
          transform(option, node) {
            const meta = source.getNodeMeta(node);
            if (!meta || !meta.data.icon) return option;

            const color = `var(--${meta.file.dirname}-color, var(--color-fd-foreground))`;

            return {
              ...option,
              icon: (
                <div
                  className='rounded-lg p-1.5 shadow-lg ring-2 m-px border [&_svg]:size-6.5 md:[&_svg]:size-5 border-muted-foreground'
                  style={
                    {
                      borderColor: `color-mix(in oklab, ${color} 50%, transparent)`,
                      "--tw-ring-color": `color-mix(in oklab, ${color} 20%, transparent)`,
                    } as object
                  }
                >
                  <DynamicIcon name={meta.data.icon as IconName} />
                </div>
              ),
            };
          },
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
