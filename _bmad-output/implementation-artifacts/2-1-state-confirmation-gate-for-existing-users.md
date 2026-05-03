# Story 2.1: State Confirmation Gate for Existing Users

Status: ready-for-dev

## Story

As an existing user logging in after the v2.0 deployment,
I want to be prompted once to confirm my state before I can use the app,
so that my requirements, progress, and report format are accurate for my jurisdiction.

## Acceptance Criteria

1. `(app)/layout.tsx` fetches `user.state_confirmed` and passes it to `<StateConfirmationGate stateConfirmed={bool}>`
2. When `state_confirmed = false`, `<StateConfirmationGate>` renders a non-dismissable shadcn `<Dialog>` blocking all page content — no close button, no backdrop dismiss
3. The dialog contains: heading, state dropdown (pre-selected to current state), driver-ed checkbox (conditional), Tier 2 disclaimer (conditional), and a Confirm button
4. On Confirm, a Server Action sets `users.state_code`, `users.state_confirmed = true`, `users.driver_ed_completed` per checkbox, then `router.refresh()`
5. When `state_confirmed = true`, gate renders `{children}` directly with no modal
6. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Install shadcn select component: `npx shadcn@latest add select` (needed for state dropdown)
- [ ] Create `src/app/(app)/state-confirmation-gate.tsx` — Client Component with Dialog (AC: 2, 3, 4)
  - [ ] `'use client'` directive
  - [ ] Accept `stateConfirmed: boolean` and `currentStateCode: string` props
  - [ ] Render shadcn `<Dialog open={!stateConfirmed}>` — no `onOpenChange`, no close button
  - [ ] State dropdown using shadcn Select, pre-filled with `currentStateCode`
  - [ ] Conditional driver-ed checkbox for applicable states
  - [ ] Conditional Tier 2 disclaimer
  - [ ] Confirm button calls Server Action
- [ ] Create Server Action in `src/app/(app)/state-confirmation-gate.tsx` or co-locate in a new `actions.ts` (AC: 4)
  - [ ] `'use server'`
  - [ ] Update `users.state_code`, `users.state_confirmed = true`, `users.driver_ed_completed`
  - [ ] Revalidate path or return signal to trigger `router.refresh()`
- [ ] Modify `src/app/(app)/layout.tsx` — fetch `user.state_confirmed` and `user.state_code`, wrap children with gate (AC: 1, 5)
- [ ] Update `middleware.ts` matcher to exclude `/states` and `/states/[code]` (Story 7.1 also modifies this — coordinate at PR time to avoid conflicts)
- [ ] Verify build and tests pass (AC: 6)

## Dev Notes

### Prerequisite

Story 1.4 must be merged — `users.state_confirmed`, `users.state_code`, and `users.driver_ed_completed` columns must exist in the DB.

### Current layout.tsx State

[src/app/(app)/layout.tsx](src/app/(app)/layout.tsx) currently:
- Calls `auth()` and redirects if no session
- Fetches student list for parents via DB query
- Resolves `selected_student_id` cookie
- Renders header/footer with `{children}`

### Required layout.tsx Changes

After the auth check, fetch the logged-in user's state fields:

```typescript
// In AppLayout, after getting session:
const [userRecord] = await db
  .select({ stateCode: users.stateCode, stateConfirmed: users.stateConfirmed })
  .from(users)
  .where(eq(users.id, Number(id)));

// Then wrap children:
return (
  <div className="min-h-screen flex flex-col">
    {/* header */}
    <StateConfirmationGate
      stateConfirmed={userRecord?.stateConfirmed ?? true}
      currentStateCode={userRecord?.stateCode ?? 'IL'}
    >
      <main ...>{children}</main>
    </StateConfirmationGate>
    {/* footer */}
  </div>
);
```

Layout.tsx **owns this file for v2.0** — subsequent stories (settings link, state indicator) append to nav/footer only; they do not touch the StateConfirmationGate wiring.

### StateConfirmationGate Architecture Contract

From architecture Decision 3 and Pattern 7 — enforce exactly:

- **Client Component** (`'use client'`)
- Props: `{ stateConfirmed: boolean; currentStateCode: string; children: React.ReactNode }`
- When `stateConfirmed = true`: render `{children}` directly, no modal
- When `stateConfirmed = false`: render `<Dialog open={true}>` blocking children
  - `<DialogContent>` must have no close button (`<DialogClose>` removed or set `hideCloseButton`)
  - shadcn Dialog does NOT have a built-in hideCloseButton prop — use `[&>button]:hidden` or render a custom DialogContent variant without the X button
  - Alternatively, override `onInteractOutside` and `onEscapeKeyDown` to prevent close: `onInteractOutside={(e) => e.preventDefault()}`
- On confirm: call Server Action, then `router.refresh()` (from `useRouter`) to re-render the layout with updated `stateConfirmed = true`
- **Do NOT** use `useEffect` redirect — it causes a flash on cold load
- **Do NOT** render the modal from a Server Component — it needs client-side state

### Driver-Ed Checkbox Condition

Show checkbox only for states where `hours_waived_with_driver_ed || driver_ed_hours_count_toward_total` from state config. States: AL, AZ, MN, NE, NV, OR, SD, WV. Since `STATE_CONFIGS` is server-only, pass the applicable state codes as a prop or derive in the Client Component from a serialized lookup.

**Pattern:** Server Component (layout.tsx) computes `const showDriverEd = checkDriverEdApplicable(stateCode)` (a pure function that takes a state code and returns boolean, usable server-side), passes as boolean prop. Do not pass `STATE_CONFIGS` directly to the Client Component.

```typescript
// In layout.tsx (server-side):
import { STATE_CONFIGS } from '@/data/state-configs';
const cfg = STATE_CONFIGS[userRecord.stateCode];
const driverEdApplicable = cfg 
  ? cfg.hours_waived_with_driver_ed || cfg.driver_ed_hours_count_toward_total
  : false;
// Pass as prop to StateConfirmationGate
```

### Tier 2 Disclaimer Text

For states with `tier === 2`, show inline in the dialog: "Requirements shown are based on publicly available information (IIHS). Verify with your state's licensing agency."

Similarly resolve `tier` server-side from `STATE_CONFIGS` and pass as a prop.

### None-Mode States (AR, MS, NJ)

For `validation_mode === 'none'` states: show "Your state does not require logged practice hours, but tracking your practice is still supported."

Resolve `validation_mode` server-side and pass `isNoneMode: boolean` prop.

### Server Action Pattern

Follow the existing project pattern — co-locate action in the same file or in a new `actions.ts` in `(app)/`:

```typescript
'use server';
export async function confirmStateAction(stateCode: string, driverEdCompleted: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;
  // Validate stateCode against STATE_CODES
  if (!STATE_CODES.includes(stateCode)) return;
  await db.update(users)
    .set({ stateCode, stateConfirmed: true, driverEdCompleted })
    .where(eq(users.id, Number(session.user.id)));
}
```

After the action returns, call `router.refresh()` in the Client Component.

### Middleware Update (Coordinate with Story 7.1)

Add `/states` and `/states/[code]` to the middleware matcher exclusions. The current matcher in [middleware.ts](middleware.ts) is at the project root (not in `src/`). Story 7.1 also modifies this file — whoever merges second must rebase.

### References

- Layout file to modify: [src/app/(app)/layout.tsx](src/app/(app)/layout.tsx)
- Middleware: [middleware.ts](middleware.ts) (project root, not src/)
- Architecture Decision 3, Pattern 7: [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md)
- shadcn dialog (already installed): [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
