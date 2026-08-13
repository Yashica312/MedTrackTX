import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);

  const [doctorName, setDoctorName] = useState("Dr. Doctor");
  const [email, setEmail] = useState("doctor@medtracktx.com");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] =
    useState("Dermatology");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  function handleProfileSave(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 2500);
  }

  function handlePasswordChange(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }

    alert("Password updated successfully.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");

    window.location.href = "/login";
  }

  return (
    <section className="settings-page">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="page-heading">
        <span className="eyebrow">
          MEDTRACK-TX
        </span>

        <h1>Settings</h1>

        <p>
          Manage your doctor profile, account preferences,
          notifications and application settings.
        </p>
      </div>


      {/* ================================================== */}
      {/* PROFILE */}
      {/* ================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>
            <span className="settings-section-label">
              PROFILE
            </span>

            <h2>Doctor Profile</h2>

            <p>
              Update the information associated with
              your MedTrack-TX account.
            </p>
          </div>

        </div>


        <form
          onSubmit={handleProfileSave}
          className="settings-form"
        >

          <div className="settings-avatar-row">

            <div className="settings-avatar">
              {doctorName
                .replace("Dr. ", "")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h3>{doctorName}</h3>

              <p>
                {specialization}
              </p>
            </div>

          </div>


          <div className="settings-grid">

            <div className="settings-field">

              <label>
                Doctor Name
              </label>

              <input
                type="text"
                value={doctorName}
                onChange={(e) =>
                  setDoctorName(e.target.value)
                }
                placeholder="Enter doctor name"
              />

            </div>


            <div className="settings-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="doctor@example.com"
              />

            </div>


            <div className="settings-field">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter phone number"
              />

            </div>


            <div className="settings-field">

              <label>
                Specialization
              </label>

              <select
                value={specialization}
                onChange={(e) =>
                  setSpecialization(e.target.value)
                }
              >

                <option>
                  Dermatology
                </option>

                <option>
                  General Medicine
                </option>

                <option>
                  Oncology
                </option>

                <option>
                  Internal Medicine
                </option>

                <option>
                  Other
                </option>

              </select>

            </div>

          </div>


          <div className="settings-actions">

            <button
              type="submit"
              className="settings-primary-button"
            >
              {profileSaved
                ? "✓ Profile Saved"
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>


      {/* ================================================== */}
      {/* NOTIFICATIONS */}
      {/* ================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="settings-section-label">
              NOTIFICATIONS
            </span>

            <h2>Notification Preferences</h2>

            <p>
              Choose which updates you want to receive.
            </p>

          </div>

        </div>


        <div className="settings-option-list">

          <div className="settings-option">

            <div className="settings-option-content">

              <h3>Clinical Notifications</h3>

              <p>
                Receive alerts for new patient
                analyses and important clinical updates.
              </p>

            </div>


            <button
              type="button"
              className={`settings-toggle ${
                notifications
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setNotifications(!notifications)
              }
              aria-label="Toggle clinical notifications"
            >

              <span />

            </button>

          </div>


          <div className="settings-option">

            <div className="settings-option-content">

              <h3>Email Notifications</h3>

              <p>
                Receive report and account updates
                through your registered email.
              </p>

            </div>


            <button
              type="button"
              className={`settings-toggle ${
                emailNotifications
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setEmailNotifications(
                  !emailNotifications
                )
              }
              aria-label="Toggle email notifications"
            >

              <span />

            </button>

          </div>

        </div>

      </div>


      {/* ================================================== */}
      {/* SECURITY */}
      {/* ================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="settings-section-label">
              SECURITY
            </span>

            <h2>Change Password</h2>

            <p>
              Keep your clinical account secure with
              a strong password.
            </p>

          </div>

        </div>


        <form
          onSubmit={handlePasswordChange}
          className="settings-form"
        >

          <div className="settings-field">

            <label>
              Current Password
            </label>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              placeholder="Enter current password"
            />

          </div>


          <div className="settings-grid">

            <div className="settings-field">

              <label>
                New Password
              </label>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
              />

            </div>


            <div className="settings-field">

              <label>
                Confirm Password
              </label>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
              />

            </div>

          </div>


          <label className="settings-checkbox">

            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) =>
                setShowPassword(
                  e.target.checked
                )
              }
            />

            <span>
              Show password
            </span>

          </label>


          <div className="settings-actions">

            <button
              type="submit"
              className="settings-secondary-button"
            >
              Update Password
            </button>

          </div>

        </form>

      </div>


      {/* ================================================== */}
      {/* APPEARANCE */}
      {/* ================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="settings-section-label">
              PREFERENCES
            </span>

            <h2>Appearance</h2>

            <p>
              Customize how MedTrack-TX appears on
              your device.
            </p>

          </div>

        </div>


        <div className="settings-option">

          <div className="settings-option-content">

            <h3>Dark Mode</h3>

            <p>
              Use a darker interface for low-light
              environments.
            </p>

          </div>


          <button
            type="button"
            className={`settings-toggle ${
              darkMode
                ? "active"
                : ""
            }`}
            onClick={() =>
              setDarkMode(!darkMode)
            }
            aria-label="Toggle dark mode"
          >

            <span />

          </button>

        </div>

        {darkMode && (

          <div className="settings-info-box">

            <strong>
              Dark mode preference selected
            </strong>

            <p>
              Full application-wide theme integration
              can be connected to the application theme
              provider.
            </p>

          </div>

        )}

      </div>


      {/* ================================================== */}
      {/* ABOUT */}
      {/* ================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="settings-section-label">
              SYSTEM
            </span>

            <h2>About MedTrack-TX</h2>

            <p>
              AI-assisted skin lesion evolution
              tracking platform.
            </p>

          </div>

        </div>


        <div className="about-grid">

          <div className="about-item">

            <span>
              Application
            </span>

            <strong>
              MedTrack-TX
            </strong>

          </div>


          <div className="about-item">

            <span>
              Version
            </span>

            <strong>
              1.0.0
            </strong>

          </div>


          <div className="about-item">

            <span>
              AI Classification
            </span>

            <strong>
              ViT
            </strong>

          </div>


          <div className="about-item">

            <span>
              Segmentation
            </span>

            <strong>
              U-Net
            </strong>

          </div>


          <div className="about-item">

            <span>
              Explainability
            </span>

            <strong>
              Grad-CAM
            </strong>

          </div>


          <div className="about-item">

            <span>
              Clinical Framework
            </span>

            <strong>
              ABCDE
            </strong>

          </div>

        </div>


        <div className="settings-disclaimer">

          <strong>
            Clinical Disclaimer
          </strong>

          <p>
            MedTrack-TX provides AI-assisted analysis
            intended to support clinical review. The
            system does not replace professional medical
            examination, diagnosis or clinical judgment.
          </p>

        </div>

      </div>


      {/* ================================================== */}
      {/* LOGOUT */}
      {/* ================================================== */}

      <div className="settings-danger-card">

        <div>

          <span className="settings-section-label danger">
            ACCOUNT
          </span>

          <h2>Sign out</h2>

          <p>
            Sign out of your MedTrack-TX doctor account
            on this device.
          </p>

        </div>


        <button
          type="button"
          className="settings-logout-button"
          onClick={handleLogout}
        >
          Sign Out
        </button>

      </div>

    </section>
  );
}