import { HelpCircle, type LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import dynamic from "next/dynamic";

export type LucideIconName = keyof typeof dynamicIconImports;

export type LucideIconProps = LucideProps & {
  name: LucideIconName | string;
};

export function LucideIcon({ name, ...props }: LucideIconProps) {
  // Normalize the icon name (handle case sensitivity)
  const iconName = name.toLowerCase() as LucideIconName;

  // Check if the icon exists in the dynamic imports
  if (!dynamicIconImports[iconName]) {
    console.warn(`Icon "${name}" not found in lucide-react, using HelpCircle`);
    return <HelpCircle {...props} />;
  }

  // Dynamically import the icon
  const Icon = dynamic(dynamicIconImports[iconName]);

  return <Icon {...props} />;
}
