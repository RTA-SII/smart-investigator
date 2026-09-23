import { createHashRouter } from "react-router-dom"
import { App } from "@/app/App"
import { RolePicker } from "@/pages/RolePicker"
import { Dashboard } from "@/pages/Dashboard"
import { Complaints } from "@/pages/Complaints"
import { ManualComplaints } from "@/pages/ManualComplaints"
import { NewManualComplaint } from "@/pages/NewManualComplaint"
import { ComplaintDetail } from "@/pages/ComplaintDetail"
import { MyQueue } from "@/pages/MyQueue"

export const router = createHashRouter([
  { path: "/", element: <RolePicker /> },
  {
    element: <App />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/complaints", element: <Complaints /> },
      { path: "/complaints/:id", element: <ComplaintDetail /> },
      { path: "/manual-complaints", element: <ManualComplaints /> },
      { path: "/manual-complaints/new", element: <NewManualComplaint /> },
      { path: "/my-queue", element: <MyQueue /> },
    ],
  },
])
