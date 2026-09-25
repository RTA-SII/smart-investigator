import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  ClipboardList,
  Download,
  IdCard,
  LayoutList,
  MessageSquare,
} from "lucide-react"
import { Tabs } from "@/components/ui/Tabs"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { SlaClock } from "@/components/complaints/SlaClock"
import { AiCrossValidation } from "@/components/complaints/AiCrossValidation"
import { DecisionBar } from "@/components/complaints/DecisionBar"
import { DetailsPanel } from "@/components/complaints/panels/DetailsPanel"
import { PartiesPanel } from "@/components/complaints/panels/PartiesPanel"
import { EvidencePanel } from "@/components/complaints/panels/EvidencePanel"
import { AuditPanel } from "@/components/complaints/panels/AuditPanel"
import { CommentsPanel } from "@/components/complaints/panels/CommentsPanel"
import { CaseExceptions } from "@/components/complaints/CaseExceptions"
import { Button } from "@/components/ui/Button"
import { downloadComplaintReport } from "@/lib/complaintReportDoc"
import { useT } from "@/i18n"
import { AssignmentPanel } from "@/components/complaints/AssignmentPanel"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { PRIORITY_TONE, STAGE_TONE } from "@/data/catalog"
import { useSession } from "@/app/session"

// SMC keeps cross-validation inline on the details page, not behind a tab.
// The investigation form is not here either: it is a record to be filed
// rather than a workspace, so it downloads from the header instead.
const TABS = (comments) => [
  { value: "details", label: "Details", icon: <LayoutList /> },
  { value: "parties", label: "Complainant & Driver", icon: <IdCard /> },
  { value: "comments", label: "Comments", icon: <MessageSquare />, count: comments },
  { value: "audit", label: "Audit Log", icon: <ClipboardList /> },
]

/** The investigation workspace — everything an officer needs in one screen. */
export function ComplaintDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const role = roleById(session.roleId)
  const t = useT()
  const [tab, setTab] = useState("details")

  const complaint = useComplaints().find((c) => c.id === id)

  if (!complaint) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Complaint {id} not found.
        </p>
        <Link to="/complaints" className="mt-3 inline-block text-sm font-bold text-[var(--primary)]">
          Back to all complaints
        </Link>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-[var(--accent)]"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="flex min-w-0 flex-wrap items-baseline gap-2 text-2xl font-bold">
          <span className="font-mono">{complaint.id}</span>
          <span className="text-[var(--muted-foreground)]">·</span>
          <span className="min-w-0 truncate">{complaint.type}</span>
        </h1>
        <span className="flex flex-wrap items-center gap-2">
          <Badge dot tone={PRIORITY_TONE[complaint.priority]}>
            {complaint.priority}
          </Badge>
          <Badge tone={STAGE_TONE[complaint.stage]}>{complaint.stage}</Badge>
          <Badge tone="primary">{complaint.company}</Badge>
          <SlaClock complaint={complaint} size="lg" />
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="ms-auto shrink-0"
          onClick={() => downloadComplaintReport(complaint)}
        >
          <Download />
          {t("Complaint Report")}
        </Button>
      </div>

      {/* Anything blocking a normal finding is said before the tabs, not
          buried inside one. */}
      <CaseExceptions complaint={complaint} role={role} />

      <Tabs
        tabs={TABS(complaint.comments?.length ?? 0).map((tab) => ({
          ...tab,
          label: t(tab.label),
        }))}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          {tab === "details" && (
            <>
              <DetailsPanel complaint={complaint} />
              <EvidencePanel complaint={complaint} />
              <AiCrossValidation complaint={complaint} />
            </>
          )}
          {tab === "parties" && <PartiesPanel complaint={complaint} />}
          {tab === "comments" && <CommentsPanel complaint={complaint} role={role} />}
          {tab === "audit" && <AuditPanel complaint={complaint} />}
        </div>

        {/* SMC stacks the rail verdict → assignment → Take Action, and the
            actions stay put as the tabs change beside them. */}
        {/* SMC's rail is assignment then Take Action — the verdict lives
            inline on the details page, so there is no summary card here. */}
        <aside className="grid content-start gap-4">
          <AssignmentPanel complaint={complaint} />
          <DecisionBar complaint={complaint} role={role} />
        </aside>
      </div>
    </>
  )
}
