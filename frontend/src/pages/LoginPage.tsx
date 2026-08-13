import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLogin } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    loginMutation.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onSuccess: (data) => {
          localStorage.setItem(
            "access_token",
            data.access_token
          );

          localStorage.setItem(
            "doctor",
            JSON.stringify({
              doctor_id: data.doctor_id,
              full_name: data.full_name,
              email: data.email,
            })
          );

          navigate("/dashboard", { replace: true });
        },
      }
    );
  };

  const errorMessage = loginMutation.isError
    ? "Invalid email or password. Please try again."
    : "";

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h1>MedTrack-TX</h1>
              <span>Dermatology Clinical System</span>
            </div>
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>
              Sign in to access your clinical dashboard.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">
                <Mail size={17} />

                <input
                  id="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole size={17} />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="login-error">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <span>
              Authorized clinical personnel only
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}