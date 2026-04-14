'use client';

import { useState, useEffect, useRef } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [open]);

  return (
    // This div fills the remaining header width so ml-auto works on the hamburger
    <div ref={menuRef} className="flex-1 flex items-center">

      {/* Desktop nav — shown sm and up */}
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

      {/* Mobile hamburger — ml-auto pushes it to the right */}
      <button
        type="button"
        className="sm:hidden ml-auto text-white p-2 -mr-2 touch-manipulation"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown — rendered outside the flex row via absolute */}
      {open && (
        <div className="sm:hidden absolute top-full left-0 right-0 z-50 bg-primary border-b-4 border-accent shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Link href="/trips" className="text-white text-sm font-bold uppercase tracking-widest">
              Trips
            </Link>
            {canLogTrip && (
              <Link
                href="/trips/new"
                className="self-start rounded bg-accent px-4 py-2 text-sm font-black text-accent-foreground uppercase tracking-widest"
              >
                + Log Trip
              </Link>
            )}
            {userType === 'parent' && selectedStudent && (
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-xs uppercase tracking-widest">Student</span>
                <StudentSelector students={students} selectedId={selectedStudent.id} />
              </div>
            )}
            {userType === 'student' && (
              <span className="text-white/70 text-xs uppercase tracking-wide">{userName}</span>
            )}
            <form action={logoutAction}>
              <button type="submit" className="text-xs font-bold text-accent uppercase tracking-widest">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
