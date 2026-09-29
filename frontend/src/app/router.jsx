import { createHashRouter } from "react-router-dom"
import { App } from "@/app/App"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { Complaints } from "@/pages/Complaints"
import { ManualComplaints } from "@/pages/ManualComplaints"
import { NewManualComplaint } from "@/pages/NewManualComplaint"
import { ComplaintDetail } from "@/pages/ComplaintDetail"
import { MyQueue } from "@/pages/MyQueue"

export const router = createHashRouter([
  // Sign-in is the only way in. Everything below sits under `App`, which
  // sends a visitor without a session back here — so there is no second
  // entry point, and no role picker to walk straight past the password.
  { path: "/", element: <Login /> },
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
