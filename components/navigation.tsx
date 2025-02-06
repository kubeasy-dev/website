'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Challenges', href: '/challenges' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Documentation', href: '/docs' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}