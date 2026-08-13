import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users,
  ScanLine,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: Users,
  },
  {
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
  },
  {
    label: "Visits",
    path: "/visits",
    icon: CalendarDays,
  },
  {
    label: "Lesion Analysis",
    path: "/analysis",
    icon: ScanLine,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Activity size={22} strokeWidth={2.2} />
        </div>

        <div className="brand-text">
          <div className="brand-name">MedTrack-TX</div>
          <div className="brand-subtitle">Dermatology</div>
        </div>
      </div>

      <div className="sidebar-section-title">CLINICAL MODULES</div>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon className="sidebar-icon" size={18} />

              <span>{item.label}</span>

              <ChevronRight
                className="sidebar-chevron"
                size={15}
              />
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />
          <div>
            <div className="status-title">System Online</div>
            <div className="status-text">Clinical services active</div>
          </div>
        </div>
      </div>
    </aside>
  );
}