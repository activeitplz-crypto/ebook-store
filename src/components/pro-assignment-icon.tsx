
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function ProAssignmentIcon({ className }: { className?: string }) {
  const iconUrl = "https://i.postimg.cc/4NycZngc/In-Shot-20250828-122821151.png";

  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
       <Image 
         src={iconUrl} 
         alt="ProAssignment Icon"
         width={40}
         height={40}
         className="object-cover"
         data-ai-hint="app icon"
        />
    </div>
  );
}
