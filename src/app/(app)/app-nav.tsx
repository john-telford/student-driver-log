'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from './dashboard/actions';
import StudentSelector from './student-selector';

type Student = { id: number; name: string };

export default function AppNav({
  userType,
  userName,
  students,
  selectedStudent,
  canLogTrip,
}: {
  userType: string;
  userName: string;
  students: Student[];
  selectedStudent: Student | null;
  canLogTrip: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Desktop nav — hidden on mobile */}
      <div className="hidden sm:flex items-center gap-4 flex-1">
        <Link
          href="/trips"
          className="text-white/80 text-xs font-bold uppercase tracking-widest hover:text-white"
        >
          Trips
        </Link>
        {canLogTrip && (
          <Link
            href="/trips/new"
            className="rounded bg-accent px-3 py-1 text-xs font-black text-accent-foreground uppercase tracking-widest hover:opacity-90"
          >
            + Log Trip
          </Link>
        )}
        <div className="flex-1" />
        {userType === 'parent' && selectedStudent && (
          <StudentSelector students={students} selectedId={selectedStudent.id} />
        )}
        {userType === 'student' && (
          <span className="text-white/70 text-xs uppercase tracking-wide">{userName}</span>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-[10px] font-bold text-accent uppercase tracking-widest hover:opacity-80"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Mobile hamburger button */}
      <button
        className="sm:hidden ml-auto text-white p-1"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="18" y2="18" />
            <line x1="18" y1="4" x2="4" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            <rect x="2" y="4"  width="18" height="2.5" rx="1.25" />
            <rect x="2" y="10" width="18" height="2.5" rx="1.25" />
            <rect x="2" y="16" width="18" height="2.5" rx="1.25" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden absolute top-full left-0 right-0 z-50 bg-primary border-b-4 border-accent">
          <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/trips"
              className="text-white/80 text-sm font-bold uppercase tracking-widest hover:text-white"
            >
              Trips
            </Link>
            {canLogTrip && (
              <Link
                href="/trips/new"
                className="self-start rounded bg-accent px-4 py-2 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90"
              >
                + Log Trip
              </Link>
            )}
            {userType === 'parent' && selectedStudent && (
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-xs uppercase tracking-widest">Student</span>
                <StudentSelector students={students} selectedId={selectedStudent.id} />
              </div>
            )}
            {userType === 'student' && (
              <span className="text-white/70 text-xs uppercase tracking-wide">{userName}</span>
            )}
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-bold text-accent uppercase tracking-widest hover:opacity-80"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
