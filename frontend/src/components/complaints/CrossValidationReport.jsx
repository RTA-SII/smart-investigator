import { CircleCheck, CircleX } from "lucide-react"
import { buildReport } from "@/data/investigationReport"

/**
 * SMC's investigation report, rendered as the document it is.
 *
 * Deliberately plain: numbered headings, hairline rules and body prose, with
 * no cards, tints or chips inside it. The portal's report reads like
 * something an investigator would print and attach to a case file, and that
 * is the whole reason it carries authority — decorating it would make it
 * look like another dashboard widget.
 */
export function CrossValidationReport({ complaint }) {
  const r = buildReport(complaint)

  return (
    // The report is generated English prose, and SMC issues it in English
    // too. `dir="auto"` keeps it reading left-to-right inside the Arabic
    // shell instead of being mirrored into nonsense.
    <article
      dir="auto"
      className="mt-5 rounded-xl border-[1px] border-[var(--border)] bg-[var(--background)]"
    >
      <h3 className="border-b border-[var(--border)] px-5 py-3.5 text-[15px] font-bold">
        {r.title}
      </h3>

      <Section n="1." title="Summary">
        <p className="leading-relaxed">{r.narrative}</p>

        <p className="mt-3 leading-relaxed">The verification outcome is:</p>
        <ul className="mt-2 space-y-1.5">
          {r.decision.map((d) => (
            <li key={d.label} className="flex gap-2 leading-relaxed">
              <span aria-hidden className="text-[var(--muted-foreground)]">
                •
              </span>
              <span>
                <b className="font-semibold">{d.label}:</b>{" "}
                <span className="text-[var(--muted-foreground)]">{d.value}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-3 leading-relaxed">{r.coreReason}</p>
      </Section>

      <Section
        n="2."
        title="Evidence Checked"
        aside={`${r.passed} of ${r.total} checks passed`}
      >
        {r.sources.map((group) => (
          <div key={group.number} className="mt-4 first:mt-0">
            <h5 className="text-[13px] font-semibold">
              {group.number} {group.title}
              <span className="font-normal text-[var(--muted-foreground)]">
                {" · "}
                {group.source}
              </span>
            </h5>
            <ul className="mt-2 space-y-2">
              {group.items.map((item) => (
                <li key={item.label} className="flex gap-2.5">
                  {item.pass ? (
                    <CircleCheck
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: "var(--tone-low)" }}
                    />
                  ) : (
                    <CircleX
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: "var(--tone-critical)" }}
                    />
                  )}
                  <span className="min-w-0">
                    <b className="font-semibold">{item.label}</b>
                    <span className="block text-[var(--muted-foreground)]">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section n="3." title="Assessment">
        <p className="leading-relaxed">{r.assessment}</p>
      </Section>

      <Section n="4." title="Recommendation" last>
        <p className="leading-relaxed">{r.recommendation}</p>
      </Section>
    </article>
  )
}

function Section({ n, title, aside, last = false, children }) {
  return (
    <section className={last ? "px-5 py-4" : "border-b border-[var(--border)] px-5 py-4"}>
      <h4 className="mb-2.5 flex items-baseline justify-between gap-3 text-[14px] font-bold">
        <span>
          {n} {title}
        </span>
        {aside && (
          <span className="shrink-0 text-[11px] font-normal text-[var(--muted-foreground)]">
            {aside}
          </span>
        )}
      </h4>
      <div className="text-[13px]">{children}</div>
    </section>
  )
}
