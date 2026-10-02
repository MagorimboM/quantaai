import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { LoggingInModal } from "@/modules/landing/auth/login/components/LoggingInModal";
import { LoginSuccessModal } from "@/modules/landing/auth/login/components/LoginSuccessModal";
import { useNavigate } from "react-router";

// NOTE :: [clerk] Replaces the old placeholder loginUser() call with Clerk's Core 3
// custom-flow API. signIn.finalize() is what actually activates the session -- its
// `navigate` callback is intentionally left empty here since we want to show the
// success modal first; the real page navigation happens from the modal's Continue
// button instead, once the session is already active.
// TODO :: [auth] Route guard: logged-out users can't reach app routes, logged-in users skip the landing page
// TODO :: [auth] Backend: re-validate workspace access on every request, never trust localStorage or the URL alone
// TODO :: [clerk] confirm the actual post-login landing route -- using /dashboard for now
//         since WorkspaceSwitcherPage isn't currently registered as a route in App.tsx

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const [showLoggingInModal, setShowLoggingInModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleLogin() {
    setLoginFailed(false);
    setShowLoggingInModal(true);

    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    setShowLoggingInModal(false);

    if (error) {
      console.error("Clerk sign-in error:", JSON.stringify(error, null, 2));
      setLoginFailed(true);
      return;
    }

    if (signIn.status !== "complete") {
      // e.g. needs_second_factor -- not handled yet, treat as failed for now
      setLoginFailed(true);
      return;
    }

    await signIn.finalize({
      navigate: async () => {
        // no-op: real navigation happens from the success modal's Continue button
      },
    });

    setShowSuccessModal(true);
  }

  return (
    <>
      <div className="h-screen w-full flex flex-col overflow-hidden" style={{ background: "#FFF8F0" }}>
        {/* Header */}
        <div
          className="flex h-12 shrink-0 items-center px-6"
          style={{ borderBottom: "1px solid #F3DEC0" }}
        >
          <button
            onClick={() => navigate("/")}
            className="font-display font-800 text-lg tracking-widest cursor-pointer"
            style={{ color: "#2B1B0E" }}
          >
            QUANTA
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-6 py-4 md:grid-cols-2 overflow-y-auto">
          {/* Welcome text */}
          <div>
            <p className="mb-2 font-mono text-xs" style={{ color: "#B89B6E" }}>
              WELCOME BACK
            </p>
            <h1
              className="mb-3 font-display font-800 leading-tight"
              style={{
                fontSize: "clamp(24px, 2.5vw, 32px)",
                color: "#2B1B0E",
                letterSpacing: "-0.01em",
              }}
            >
              100m² of wall.
              <br />
              Same sand, cement,
              <br />
              rods, every time.
            </h1>
            <p
              className="mb-6 text-xs sm:text-sm leading-relaxed"
              style={{ color: "#9C7B4F" }}
            >
              You already know how much sand, cement, 6mm rods and Alcor
              flashing that wall needs. You worked it out once. Quanta remembers
              it, so you're not recalculating the same numbers by hand on every
              job.
            </p>

            <div
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5"
              style={{ background: "#FFE9D2", border: "1px solid #F3DEC0" }}
            >
              <span
                className="font-mono text-base"
                style={{ color: "#FF6B35" }}
              >
                ⏱
              </span>
              <p className="font-mono text-xs" style={{ color: "#6B4F2E" }}>
                Finish the estimate sooner, submit it sooner, and keep what's
                left of the hour for yourself.
              </p>
            </div>
          </div>

          {/* Form */}
          <div
            className="flex w-full flex-col gap-3.5 rounded-lg p-5 shadow-sm"
            style={{ background: "#FFFFFF", border: "1px solid #F3DEC0" }}
          >
            <div
              className="flex flex-col gap-0.5 pb-2"
              style={{ borderBottom: "1px solid #F3DEC0" }}
            >
              <h2
                className="font-display text-base font-semibold"
                style={{ color: "#2B1B0E" }}
              >
                Log in
              </h2>
              <p className="font-mono text-xs" style={{ color: "#9C7B4F" }}>
                Welcome back to Quanta
              </p>
            </div>

            {loginFailed ? (
              <p className="font-mono text-xs" style={{ color: "#FF6B35" }}>
                Log in failed. Check your email and password and try again.
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              <div>
                <label
                  className="mb-1 block font-mono text-xs font-medium"
                  style={{ color: "#9C7B4F" }}
                >
                  Email
                </label>
                <input
                  title="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full rounded-md px-3 py-1.5 text-xs sm:text-sm font-mono outline-none"
                  style={{
                    background: "#FFF8F0",
                    border: "1px solid #F3DEC0",
                    color: "#2B1B0E",
                  }}
                />
              </div>

              <div>
                <label
                  className="mb-1 block font-mono text-xs font-medium"
                  style={{ color: "#9C7B4F" }}
                >
                  Password
                </label>
                <input
                  title="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md px-3 py-1.5 text-xs sm:text-sm font-mono outline-none"
                  style={{
                    background: "#FFF8F0",
                    border: "1px solid #F3DEC0",
                    color: "#2B1B0E",
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={fetchStatus === "fetching"}
              className="w-full rounded-md px-4 py-2 text-xs sm:text-sm font-medium font-mono transition-all active:scale-95 cursor-pointer mt-1 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "#FF6B35", color: "#FFFFFF" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E85A28")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FF6B35")
              }
            >
              {fetchStatus === "fetching" ? "Logging in..." : "Log in"}
            </button>

            <p
              className="text-center font-mono text-xs"
              style={{ color: "#9C7B4F" }}
            >
              New to Quanta?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-medium underline cursor-pointer"
                style={{ color: "#2B1B0E" }}
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="py-3 shrink-0"
          style={{ background: "#FFF8F0", borderTop: "1px solid #FFFFFF" }}
        >
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div
              className="font-display font-800 text-sm tracking-widest"
              style={{ color: "#2B1B0E" }}
            >
              QUANTA
            </div>
            <p className="font-mono text-xs" style={{ color: "#B89B6E" }}>
              © {new Date().getFullYear()} Quanta. Quantity takeoff software.
            </p>
            <div
              className="flex items-center gap-6 font-mono text-xs"
              style={{ color: "#B89B6E" }}
            >
              <a href="#" className="hover:opacity-70 transition-opacity">
                Privacy
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                Terms
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
      <LoggingInModal show={showLoggingInModal} />
      <LoginSuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }}
      />
    </>
  );
}