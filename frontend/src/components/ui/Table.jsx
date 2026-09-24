import { cn } from "@/lib/cn"

/**
 * Measured off the portal's alert table: headers 10px/600 uppercase with
 * 0.5px tracking on muted grey, a 1px rule under the head, rows ~57px
 * tall separated by a 5%-black hairline.
 */
export function Table({ className, children }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead className="bg-[rgb(242_242_242/0.3)] dark:bg-[rgb(255_255_255/0.03)]">
      <tr className="border-b-[1px] border-[rgb(0_0_0/0.1)] dark:border-[var(--border)]">
        {children}
      </tr>
    </thead>
  )
}

export function TH({ className, children }) {
  return (
    <th
      className={cn(
        "px-2 py-2.5 ps-4 text-start text-[10px] font-semibold tracking-[0.5px] uppercase",
        "text-[var(--muted-foreground)] whitespace-nowrap",
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TR({ className, onClick, children }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b-[1px] border-[rgb(0_0_0/0.05)] dark:border-[rgb(255_255_255/0.06)]",
        "transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-[rgb(23_28_143/0.04)] dark:hover:bg-[rgb(139_141_199/0.08)]",
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function TD({ className, children }) {
  return <td className={cn("px-2 py-4 ps-4 align-middle", className)}>{children}</td>
}
