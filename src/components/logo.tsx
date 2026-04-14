
'use client';

import Link from 'next/link';
import { ProAssignmentIcon } from './pro-assignment-icon';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <ProAssignmentIcon className="h-8 w-8" />
      <span className="font-headline text-sm font-bold">ProAssignment</span>
    </Link>
  );
}
