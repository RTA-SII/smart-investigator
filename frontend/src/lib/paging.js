import { useEffect, useMemo, useState } from "react"

/** How many rows any table shows at once. */
export const PAGE_SIZE = 15

/**
 * One page of rows plus the controls to move between them.
 *
 * Resets to page one whenever the row set changes — otherwise filtering a
 * long list down to two rows leaves you stranded on an empty page nine.
 */
export function usePaged(rows, size = PAGE_SIZE) {
  const [pageIndex, setPageIndex] = useState(0)

  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const safeIndex = Math.min(pageIndex, pageCount - 1)

  useEffect(() => setPageIndex(0), [rows])

  const page = useMemo(
    () => rows.slice(safeIndex * size, safeIndex * size + size),
    [rows, safeIndex, size],
  )

  return {
    page,
    pageIndex: safeIndex,
    pageCount,
    total: rows.length,
    from: rows.length ? safeIndex * size + 1 : 0,
    to: Math.min((safeIndex + 1) * size, rows.length),
    canPrev: safeIndex > 0,
    canNext: safeIndex < pageCount - 1,
    prev: () => setPageIndex((i) => Math.max(0, i - 1)),
    next: () => setPageIndex((i) => Math.min(pageCount - 1, i + 1)),
    goTo: (i) => setPageIndex(Math.max(0, Math.min(pageCount - 1, i))),
  }
}
