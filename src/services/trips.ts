import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { trips, type Trip } from '@/db/schema';

// Trip business logic, shared by the web (Server Actions / Server Components)
// and the REST API. Every function takes an explicit studentId and enforces
// ownership itself — the `where studentId` clause IS the security boundary, so
// it must live here, not in the caller (architecture §4).

export async function listTrips(studentId: number): Promise<Trip[]> {
  return db
    .select()
    .from(trips)
    .where(eq(trips.studentId, studentId))
    .orderBy(desc(trips.tripDate), desc(trips.id));
}
