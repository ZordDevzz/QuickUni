"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface FormattedDateProps {
  date: string | Date | number;
  className?: string;
}

/**
 * A component that safely renders formatted dates on the client side
 * to avoid hydration mismatches between server and client timezones/locales.
 */
export function FormattedDate({ date, className }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or the raw date string that won't change
    // During hydration, the server and client will both render this.
    // After mount, the client will re-render with the formatted date.
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formatDate(date)}</span>;
}
