import { isOpenFor } from "@/lib/cht"

/**
 * Whose desk a complaint sits on.
 *
 * An officer's desk is what carries their name. A supervisor's is what has
 * been referred up to them — they are never the assignee, because the officer
 * who escalated it keeps the investigation, and the escalation filter reads
 * that same field to say who escalated it.
 *
 * Without this a supervisor's My Complaints was permanently empty: it asked
 * for complaints assigned to `SMC-0204`, and nothing ever is. An escalation
 * appeared on All Complaints — the list of everything — and nowhere that said
 * it was theirs to rule on.
 */
export const isMine = (c, role) =>
  role.id === "supervisor"
    ? c.escalatedTo?.id === role.staff.code
    : c.assignee?.id === role.staff.code

/**
 * Still theirs to act on — the nav badge, the queue's Open scope and the
 * filter bar's open count all read this one predicate.
 *
 * For an officer that is anything not off their desk. For a supervisor it is
 * narrower: a referral is theirs only while it sits at Escalated. Once they
 * rule on it, or hand it back to an officer, it stays in their list as
 * history but stops counting as work.
 */
export const isMineOpen = (c, role) =>
  role.id === "supervisor"
    ? isMine(c, role) && c.stage === "Escalated"
    : isOpenFor(c, role.staff.code)
