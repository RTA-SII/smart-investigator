import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Bus, Car, CirclePlus, Crown, Download, FileClock, School } from "lucide-react"
import { PageHeader } from "@/components/shell/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TD, TH, THead, TR } from "@/components/ui/Table"
import { FilterBar } from "@/components/complaints/FilterBar"
import { ModeTiles } from "@/components/complaints/ModeTiles"
import { SlaClock } from "@/components/complaints/SlaClock"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { useSession } from "@/app/session"
import { isManual, PRIORITY_TONE, STAGE_TONE } from "@/data/catalog"
import { applyFilters, EMPTY_FILTERS } from "@/lib/filters"
import { initials, shortStamp } from "@/lib/format"
import { useT } from "@/i18n"
import { usePaged } from "@/lib/paging"
import { Pagination } from "@/components/ui/Pagination"

const MODE_ICON = { Taxi: Car, "Public Bus": Bus, "School Bus": School, Limousine: Crown }

/**
 * Complaints logged inside SMC rather than received from CRM.
 *
 * An officer sees only the ones they logged themselves — this is their own
 * intake record, not the centre's. A supervisor sees every manual complaint,
 * which is what makes the page a monitoring view for them.
 */
export function ManualComplaints() {
  const navigate = useNavigate()
  const t = useT()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const complaints = useComplaints()
  const role = roleById(useSession().roleId)
  const mineOnly = role.id !== "supervisor"

  const manual = useMemo(
    () =>
      complaints.filter(
        (c) => isManual(c) && (!mineOnly || c.loggedBy?.id === role.staff.code),
      ),
    [complaints, mineOnly, role.staff.code],
  )
  const rows = useMemo(() => applyFilters(manual, filters), [manual, filters])
  const paged = usePaged(rows)


  return (
    <>
      <PageHeader
        title={t("Manual Complaints")}
        subtitle={
          mineOnly
            ? t("Complaints you logged at the centre instead of receiving from CRM")
            : t("Complaints logged in SMC instead of received from CRM")
        }
        actions={
          <>
            <Button size="md">
              <FileClock />
              {t("Your drafts")}
              <Badge tone="neutral">0</Badge>
            </Button>
            <Button size="md">
              <Download />
              {t("Export")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/manual-complaints/new")}
            >
              <CirclePlus />
              {t("New Manual Complaint")}
            </Button>
          </>
        }
      />

      <ModeTiles
        rows={manual}
        value={filters.mode}
        onChange={(mode) => setFilters({ ...filters, mode })}
      />
      <FilterBar filters={filters} onChange={setFilters} count={rows.length} />

      <Card className="overflow-hidden">
        {rows.length ? (
          <>
            <Table>
            <THead>
              <TH>Complaint ID</TH>
              <TH>Type</TH>
              <TH>Mode</TH>
              <TH>Driver</TH>
              <TH>Priority</TH>
              <TH>Stage</TH>
              <TH>Received</TH>
              <TH>Assigned To</TH>
              <TH className="pe-4 text-end">Action</TH>
            </THead>
            <tbody>
              {paged.page.map((c) => {
                const Icon = MODE_ICON[c.mode] ?? Car
                return (
                  <TR key={c.id}>
                    <TD>
                      <span className="font-mono text-[13px] font-bold text-[var(--primary)]">
                        {c.id}
                      </span>
                    </TD>
                    <TD>
                      <span className="block max-w-[200px] truncate">{c.type}</span>
                      <span className="block text-[11px] text-[var(--muted-foreground)]">
                        {c.channel}
                      </span>
                    </TD>
                    <TD>
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <Icon className="size-3.5 shrink-0 text-[var(--muted-foreground)]" />
                        {c.mode}
                      </span>
                    </TD>
                    <TD>
                      <span className="block max-w-[140px] truncate">{c.driver.name}</span>
                      <span className="block font-mono text-[11px] text-[var(--muted-foreground)]">
                        {c.sideNumber}
                      </span>
                    </TD>
                    <TD>
                      <Badge dot tone={PRIORITY_TONE[c.priority]}>
                        {c.priority}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone={STAGE_TONE[c.stage]}>{c.stage}</Badge>
                    </TD>
                    <TD className="ltr-value whitespace-nowrap text-[var(--muted-foreground)]">
                      {shortStamp(c.receivedAt)}
                    </TD>
                    <TD>
                      {c.assignee ? (
                        <span className="flex items-center gap-2">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--tone-info)] text-[10px] leading-none font-bold text-white">
                            {initials(c.assignee.name)}
                          </span>
                          <span className="max-w-[110px] truncate">
                            {c.assignee.name}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">Unassigned</span>
                      )}
                    </TD>
                    <TD className="pe-4 text-end">
                      <span className="inline-flex items-center gap-2">
                        <SlaClock complaint={c} />
                        <Button
                          size="sm"
                          onClick={() => navigate(`/complaints/${c.id}`)}
                        >
                          Review
                          <ArrowRight />
                        </Button>
                      </span>
                    </TD>
                  </TR>
                )
              })}
            </tbody>
            </Table>
            <Pagination paged={paged} />
          </>
        ) : (
          <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">
            {t("No manual complaints match these filters")}
          </p>
        )}
      </Card>
    </>
  )
}
