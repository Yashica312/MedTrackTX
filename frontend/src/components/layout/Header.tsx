import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {

  let doctorName = "Doctor";

  try {
    const storedDoctor =
      localStorage.getItem("doctor");

    if (storedDoctor) {
      const doctor = JSON.parse(
        storedDoctor
      );

      if (doctor.full_name) {
        doctorName = doctor.full_name;
      }
    }
  } catch {
    doctorName = "Doctor";
  }


  return (
    <header className="app-header">

      <div className="header-left">

        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>


        <div>

          <div className="header-title">
            Department of Dermatology
          </div>

          <div className="header-subtitle">
            Teledermoscopy Programme ·
            Clinical Information System
          </div>

        </div>

      </div>


      <div className="header-right">

        <div className="header-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
          />

        </div>


        <button
          type="button"
          className="header-icon-button"
          aria-label="Notifications"
        >

          <Bell size={18} />

          <span className="notification-dot" />

        </button>


        <div className="header-divider" />


        <button
          type="button"
          className="profile-button"
        >

          <div className="profile-avatar">
            <UserRound size={17} />
          </div>


          <div className="profile-info">

            <div className="profile-name">
              {doctorName}
            </div>

            <div className="profile-role">
              Dermatologist
            </div>

          </div>


          <ChevronDown size={15} />

        </button>

      </div>

    </header>
  );
}