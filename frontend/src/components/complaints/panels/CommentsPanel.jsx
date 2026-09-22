import { useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { addComment } from "@/app/complaintStore"
import { initials, longStamp } from "@/lib/format"

/**
 * The case conversation (POC scope §8).
 *
 * Distinct from the audit log next door: that is the system's evidential
 * record, this is what the officer and the supervisor said to each other
 * while the complaint was open. A supervisor reading an escalation needs the
 * reasoning, not just the state changes.
 */
export function CommentsPanel({ complaint, role }) {
  const [body, setBody] = useState("")
  const thread = complaint.comments ?? []

  const author = {
    name: role.staff.name,
    id: role.staff.code,
    role: role.title,
  }

  const post = (e) => {
    e.preventDefault()
    if (!body.trim()) return
    addComment(complaint.id, { body, author })
    setBody("")
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <CardTitle>Comments</CardTitle>
        <span className="text-[11px] text-[var(--muted-foreground)]">
          {thread.length ? `${thread.length} on this case` : "Nothing yet"}
        </span>
      </div>

      {thread.length ? (
        <ul className="mb-5 space-y-4">
          {thread.map((c) => (
            <Comment key={c.id} comment={c} mine={c.author.id === author.id} />
          ))}
        </ul>
      ) : (
        <div className="mb-5 grid place-items-center gap-2 py-8 text-center">
          <MessageSquare className="size-5 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            No comments on this complaint yet — start the thread below.
          </p>
        </div>
      )}

      <form onSubmit={post} className="border-t border-[var(--border)] pt-4">
        <label
          htmlFor="comment-body"
          className="mb-2 block text-[11px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase"
        >
          Add a comment as {author.name}
        </label>
        <textarea
          id="comment-body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you find, and what should the next reader know?"
          className="filter-control w-full resize-y rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" variant="primary" size="md" disabled={!body.trim()}>
            <Send />
            Post comment
          </Button>
        </div>
      </form>
    </Card>
  )
}

function Comment({ comment, mine }) {
  const { author } = comment
  return (
    <li className="flex gap-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
          mine
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--accent)] text-[var(--primary)]"
        }`}
      >
        {initials(author.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-bold">{author.name}</span>
          <span className="text-[11px] text-[var(--muted-foreground)]">{author.role}</span>
          <span className="ltr-value ms-auto text-[11px] text-[var(--muted-foreground)]">
            {longStamp(comment.at)}
          </span>
        </p>
        <p className="mt-1 text-sm whitespace-pre-line">{comment.body}</p>
      </div>
    </li>
  )
}
