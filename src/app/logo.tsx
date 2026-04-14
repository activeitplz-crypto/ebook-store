
import Link from 'next/link';
import { JanzyIcon } from './janzy-icon';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <JanzyIcon className="h-8 w-8" />
      <span className="font-headline text-2xl font-bold">Janzy</span>
    </Link>
  );
}
