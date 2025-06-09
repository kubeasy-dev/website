import { type LinkItemType } from "fumadocs-ui/layouts/docs";
import { Album, Home, PenSquare } from "lucide-react";
import Image from "next/image";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import logo from "@/app/assets/logo.png";

export const linkItems: LinkItemType[] = [
  {
    text: "Homepage",
    url: "/",
    icon: <Home />,
  },
  {
    text: "Challenges",
    url: "/challenges",
    icon: <Album />,
  },
  {
    text: "Blog",
    url: "/blog",
    icon: <PenSquare />,
    active: "nested-url",
  },
];

export const logoImage = (
  <>
    <Image alt='Kubeasy' src={logo} className='w-8 [.uwu_&]:block' aria-label='Kubeasy' />
  </>
);

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        {logoImage}
        <span className='font-medium [.uwu_&]:hidden [header_&]:text-[15px]'>Kubeasy</span>
      </>
    ),
    transparentMode: "top",
  },
  links: linkItems,
};
