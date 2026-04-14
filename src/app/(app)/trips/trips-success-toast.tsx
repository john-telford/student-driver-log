'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function TripsSuccessToast() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('success') === '1') {
      toast.success('Trip logged successfully.');
    }
  }, [params]);

  return null;
}
