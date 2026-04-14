
'use client';

import { useState, useEffect } from 'react';
import { Eye, Flame } from 'lucide-react';

export function DynamicScarcityIndicators() {
  const [viewers, setViewers] = useState<number | null>(null);
  const [sold, setSold] = useState<number | null>(null);

  useEffect(() => {
    // Generate these only on client to avoid hydration mismatch
    setViewers(Math.floor(Math.random() * (48 - 5 + 1)) + 5);
    setSold(Math.floor(Math.random() * (50 - 10 + 1)) + 10);

    const viewerInterval = setInterval(() => {
      setViewers(Math.floor(Math.random() * (48 - 5 + 1)) + 5);
    }, 300000); // 5 mins

    const soldInterval = setInterval(() => {
      setSold(Math.floor(Math.random() * (50 - 10 + 1)) + 10);
    }, 3600000); // 1 hour

    return () => {
      clearInterval(viewerInterval);
      clearInterval(soldInterval);
    };
  }, []);

  if (viewers === null || sold === null) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>{viewers} people are viewing this product</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
        <Flame className="h-4 w-4" />
        <span>{sold} sold in last 19 hours</span>
      </div>
    </div>
  );
}
