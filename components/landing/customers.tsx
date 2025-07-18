"use client";

import { Marquee } from "@devnomic/marquee";
import "@devnomic/marquee/dist/index.css";
import { Icon } from "../ui/icon";
import { icons } from "lucide-react";
interface sponsorsProps {
  icon: string;
  name: string;
}

const customers: sponsorsProps[] = [
  {
    icon: "Crown",
    name: "Acmebrand",
  },
  {
    icon: "Vegan",
    name: "Acmelogo",
  },
  {
    icon: "Ghost",
    name: "Acmesponsor",
  },
  {
    icon: "Puzzle",
    name: "Acmeipsum",
  },
  {
    icon: "Squirrel",
    name: "Acme",
  },
  {
    icon: "Cookie",
    name: "Accmee",
  },
  {
    icon: "Drama",
    name: "Acmetech",
  },
];

export const CustomersSection = () => {
  return (
    <section id='sponsors' className='max-w-[90%] mx-auto pb-24 sm:pb-32'>
      <h2 className='text-lg text-primary mb-2 tracking-wider'>Our Customers</h2>

      <div className='mx-auto mt-4'>
        <Marquee className='gap-[3rem]' fade innerClassName='gap-[3rem]' pauseOnHover>
          {customers.map(({ icon, name }) => (
            <div key={name} className='flex items-center text-xl md:text-2xl font-medium'>
              <Icon name={icon as keyof typeof icons} size={32} color='white' className='mr-2' />
              {name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
