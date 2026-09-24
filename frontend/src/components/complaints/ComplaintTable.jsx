import { useNavigate } from "react-router-dom"
import { Table, TD, TH, THead, TR } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { SlaClock } from "@/components/complaints/SlaClock"
import { PRIORITY_TONE, STAGE_TONE } from "@/data/catalog"
import { shortStamp } from "@/lib/format"
import { useT } from "@/i18n"
import { usePaged } from "@/lib/paging"
import { Pagination } from "@/components/ui/Pagination"
import { AssignPicker } from "@/components/complaints/AssignPicker"
import { modeIcon } from "@/components/complaints/modeIcons"

/** `assignable` adds SMC's Assigned To column — the supervisor's to use. */
export function ComplaintTable({ rows, emptyLabel, assignable = false }) {
  const navigate = useNavigate()
  const t = useT()
  const paged = usePaged(rows)

  if (!rows.length) {
    return (
      <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        {emptyLabel ?? t("No complaints match these filters")}
      </p>
    )
  }

  return (
    <>
      <Table>
      <THead>
        <TH>{t("Complaint ID")}</TH>
        <TH>{t("Type")}</TH>
        <TH>{t("Mode")}</TH>
        <TH>{t("Driver")}</TH>
        <TH>{t("Company")}</TH>
        <TH>{t("Priority")}</TH>
        <TH>{t("Stage")}</TH>
        <TH>{t("AI Verdict")}</TH>
        <TH>{t("SLA")}</TH>
        <TH>{t("Received")}</TH>
        {assignable && <TH>{t("Assigned To")}</TH>}
      </THead>
      <tbody>
        {paged.page.map((c) => {
          const Icon = modeIcon(c.mode)
          return (
            <TR
              key={c.id}
              className="group"
              onClick={() => navigate(`/complaints/${c.id}`)}
            >
              <TD>
                {/* The whole row navigates, so the id underlines on row hover
                    rather than only when the pointer is over the id itself —
                    it is the row's destination, and saying so early is the
                    point of underlining it at all. */}
                <span className="ltr-value font-mono text-[13px] font-bold text-[var(--primary)] underline-offset-2 group-hover:underline">
                  {c.id}
                </span>
              </TD>
              <TD>
                <span className="block max-w-[210px] truncate">{t(c.type)}</span>
                <span className="block text-[11px] text-[var(--muted-foreground)]">
                  {t(c.channel)}
                </span>
              </TD>
              <TD>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <Icon className="size-3.5 shrink-0 text-[var(--muted-foreground)]" />
                  {t(c.mode)}
                </span>
              </TD>
              <TD>
                <span className="block max-w-[150px] truncate">{c.driver.name}</span>
                <span className="ltr-value block font-mono text-[11px] text-[var(--muted-foreground)]">
                  {c.sideNumber}
                </span>
              </TD>
              <TD className="whitespace-nowrap">{c.company}</TD>
              <TD>
                <Badge dot tone={PRIORITY_TONE[c.priority]}>
                  {t(c.priority)}
                </Badge>
              </TD>
              <TD>
                <Badge tone={STAGE_TONE[c.stage]}>{t(c.stage)}</Badge>
              </TD>
              <TD>
                <span className="whitespace-nowrap">
                  <span className="text-[13px] font-semibold">{t(c.ai.verdict)}</span>
                  <span className="ms-1.5 text-[11px] text-[var(--muted-foreground)]">
                    {c.ai.confidence}%
                  </span>
                </span>
              </TD>
              <TD>
                <SlaClock complaint={c} />
              </TD>
              <TD className="ltr-value pe-4 text-end whitespace-nowrap text-[var(--muted-foreground)]">
                {shortStamp(c.receivedAt)}
              </TD>
              {assignable && (
                <TD className="pe-3">
                  <AssignPicker complaint={c} />
                </TD>
              )}
            </TR>
          )
        })}
      </tbody>
      </Table>
      <Pagination paged={paged} />
    </>
  )
}
