# Story 6.1: Account Settings and State Change

Status: ready-for-dev

## Story

As a registered user,
I want to update my state, driver education status, permit issue date, and name from a settings page,
so that my requirements and report format stay accurate as my situation changes.

## Acceptance Criteria

1. A "Settings" link is present in the app nav pointing to `/settings`
2. Settings page shows current values for: driver name, state dropdown (pre-selected), driver-ed checkbox (conditional), permit issue date
3. Driver name, driver-ed, and permit issue date save via "Save changes" button — state is NOT part of this save
4. `permit_issue_date` validated as not in the future
5. A shadcn `<AlertDialog>` renders immediately when the user changes the state dropdown, showing: new state requirements, explicit statement that existing trips are NOT deleted, Confirm and Cancel buttons
6. On Confirm: `users.state_code` updated, `users.driver_ed_completed` reset to `false`, user redirected to `/dashboard`
7. On Cancel: state dropdown reverts to original value, no changes saved
8. Delete account button (existing) preserved and still functional
9. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Install shadcn alert-dialog: `npx shadcn@latest add alert-dialog`
- [ ] Modify `src/app/(app)/settings/page.tsx` — fetch user state fields and pass to form (AC: 2)
- [ ] Create `src/app/(app)/settings/settings-form.tsx` — Client Component with full settings UI (AC: 2-7)
  - [ ] Driver name field
  - [ ] State dropdown (shadcn Select, pre-selected to current state)
  - [ ] Driver-ed checkbox (conditional on state)
  - [ ] Permit issue date input
  - [ ] "Save changes" button for name/driver-ed/permit date
  - [ ] AlertDialog triggered on state change (not on Save)
  - [ ] Cancel reverts dropdown
- [ ] Update `src/app/(app)/settings/actions.ts` — add `updateProfileAction` and `changeStateAction` (AC: 3-4, 6)
- [ ] Add "Settings" link to nav in `src/app/(app)/app-nav.tsx` (AC: 1)

## Dev Notes

### Prerequisites

Story 1.4 (users schema with state columns), Story 2.1 (select component installed). Story 2.2 has registered users with `stateCode` set.

### Current Settings State

[src/app/(app)/settings/page.tsx](src/app/(app)/settings/page.tsx) currently only renders `<DeleteAccountForm>`. The page needs a full settings form above the danger zone.

[src/app/(app)/settings/actions.ts](src/app/(app)/settings/actions.ts) currently only has `deleteAccountAction`.

### settings/page.tsx Changes

```typescript
// settings/page.tsx
import { STATE_CONFIGS, STATE_CODES } from '@/data/state-configs';

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.userType !== 'parent') redirect('/dashboard');

  const [user] = await db
    .select({ name: users.name, stateCode: users.stateCode, driverEdCompleted: users.driverEdCompleted, permitIssueDate: users.permitIssueDate })
    .from(users)
    .where(eq(users.id, Number(session.user.id)));

  // Build state summaries for the dropdown (same pattern as Story 2.2)
  const stateSummaries = STATE_CODES.map(code => {
    const cfg = STATE_CONFIGS[code];
    return { code, name: cfg.state_name, totalHours: cfg.total_hours_required, nightHours: cfg.nighttime_hours_required, inclementHours: cfg.inclement_hours_required, driverEdApplicable: cfg.hours_waived_with_driver_ed || cfg.driver_ed_hours_count_toward_total, validationMode: cfg.validation_mode, tier: cfg.tier };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-black uppercase tracking-widest text-primary">Settings</h1>
      <SettingsForm user={user} stateSummaries={stateSummaries} />
      {/* Danger zone section (existing DeleteAccountForm) */}
    </div>
  );
}
```

### SettingsForm AlertDialog Pattern

The AlertDialog must fire on state dropdown change **before** any save:

```tsx
// In settings-form.tsx (Client Component)
'use client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

const [pendingState, setPendingState] = useState<string | null>(null);
const [currentState, setCurrentState] = useState(user.stateCode);

// When Select onChange fires:
function handleStateChange(newCode: string) {
  if (newCode !== currentState) {
    setPendingState(newCode);  // triggers AlertDialog
  }
}

// AlertDialog open when pendingState is set:
<AlertDialog open={!!pendingState}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Change state to {pendingStateName}?</AlertDialogTitle>
      <AlertDialogDescription>
        Changing your state to {pendingStateName} will update your hour requirements and report format.
        {pendingStateName} requires: {pendingHours} total hours, {pendingNightHours} night hours.
        Your {tripCount} existing trip entries will NOT be deleted or modified.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setPendingState(null)}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmStateChange}>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

On Cancel: `setPendingState(null)` — dropdown reverts to `currentState` (controlled value).  
On Confirm: call `changeStateAction(pendingState)`, then `router.push('/dashboard')`.

### Server Actions to Add

```typescript
// In settings/actions.ts:

export type UpdateProfileState = { error?: string; success?: boolean } | undefined;

export async function updateProfileAction(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id || session.user.userType !== 'parent') return { error: 'Not authorized.' };

  const name = (formData.get('name') as string)?.trim();
  const driverEdCompleted = formData.get('driverEdCompleted') === 'true';
  const permitIssueDate = (formData.get('permitIssueDate') as string) || null;

  if (permitIssueDate && permitIssueDate > new Date().toISOString().split('T')[0]) {
    return { error: 'Permit issue date cannot be in the future.' };
  }

  await db.update(users)
    .set({ name, driverEdCompleted, permitIssueDate })
    .where(eq(users.id, Number(session.user.id)));
  return { success: true };
}

export async function changeStateAction(newStateCode: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.userType !== 'parent') return;
  if (!STATE_CODES.includes(newStateCode)) return;

  await db.update(users)
    .set({ stateCode: newStateCode, driverEdCompleted: false })
    .where(eq(users.id, Number(session.user.id)));
  // Client calls router.push('/dashboard') after this resolves
}
```

### Navigation Link

Add Settings to `src/app/(app)/app-nav.tsx`. Read the current file before editing. Add a `<Link href="/settings">Settings</Link>` in the appropriate nav position.

### Trip Count for Dialog

The dialog copy says "Your [N] existing trip entries will NOT be deleted." To get N, pass the trip count as a prop from `settings/page.tsx` (resolved server-side):

```typescript
const [{ count }] = await db.select({ count: count() }).from(trips).where(eq(trips.studentId, ...));
```

For a parent, this is the count for the selected student. Pass as `tripCount` prop.

### References

- Settings page: [src/app/(app)/settings/page.tsx](src/app/(app)/settings/page.tsx)
- Settings actions: [src/app/(app)/settings/actions.ts](src/app/(app)/settings/actions.ts)
- App nav: [src/app/(app)/app-nav.tsx](src/app/(app)/app-nav.tsx)
- shadcn alert-dialog: install via `npx shadcn@latest add alert-dialog`
- Architecture Pattern 2 (StateConfig prop threading, server-side resolution only)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
