import { useState } from "react";
import { registerUser } from "@/modules/landing/auth/register/api/register.api";
import { RegisteringModal } from "@/modules/landing/auth/register/components/RegisteringModal";
import { RegisterSuccessModal } from "@/modules/landing/auth/register/components/RegisterSuccessModal";
import { useNavigate } from "react-router";

const BENEFITS = [
  {
    title: "Get it out the door sooner",
    body: "One measurement, every ingredient calculated at once, instead of the same multiplication repeated per material.",
  },
  {
    title: "Stop hunting through specs",
    body: "Upload a document, ask Ai assistant your question, get the answer with the source. No more losing an hour searching through for one clause.",
  },
  {
    title: "Build it once, use it everywhere",
    body: "Your recipes belong to you, not your employer. Create them once, reuse them on any job, for any company or none at all.",
  },
  {
    title: "The right recipe for the right ground",
    body: "Keep site-specific variants ready to go, so you're never over-ordering or coming up short on materials.",
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [showRegisteringModal, setShowRegisteringModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleRegister() {
    setRegistrationFailed(false);
    setShowRegisteringModal(true);

    const response = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    setShowRegisteringModal(false);

    if (response.success === false) {
      setRegistrationFailed(true);
      return;
    }

    setShowSuccessModal(true);
  }

  return (
    <>
      <div
        className="h-screen w-full flex flex-col overflow-hidden"
        style={{ background: "#FFF8F0" }}
      >
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

        {/* Main Section */}
        <div className="flex-1 min-h-0 mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-6 py-4 md:grid-cols-2 overflow-y-auto">
          {/* Benefits */}
          <div>
            <p className="mb-2 font-mono text-xs" style={{ color: "#B89B6E" }}>
              YOU'RE ABOUT TO SAVE YOURSELF SOME TIME
            </p>
            <h1
              className="mb-3 font-display font-800 leading-tight"
              style={{
                fontSize: "clamp(24px, 2.5vw, 32px)",
                color: "#2B1B0E",
                letterSpacing: "-0.01em",
              }}
            >
              Good call.
              <br />
              Here's what you're getting.
            </h1>
            <p
              className="mb-6 text-xs sm:text-sm leading-relaxed"
              style={{ color: "#9C7B4F" }}
            >
              Less time on quants means more time to yourself. That's the
              whole point of Quanta, and it starts the moment you create your
              first recipe.
            </p>

            <div className="flex flex-col gap-4">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium"
                    style={{ background: "#FFE9D2", color: "#FF6B35" }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p
                      className="font-display font-700 text-xs sm:text-sm"
                      style={{ color: "#2B1B0E" }}
                    >
                      {b.title}
                    </p>
                    <p
                      className="mt-0.5 text-xs leading-normal"
                      style={{ color: "#9C7B4F" }}
                    >
                      {b.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div
            className="flex w-full flex-col gap-3 rounded-lg p-5 shadow-sm"
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
                Create an account
              </h2>
              <p className="font-mono text-xs" style={{ color: "#9C7B4F" }}>
                Get started with Quanta
              </p>
            </div>

            {registrationFailed ? (
              <p className="font-mono text-xs" style={{ color: "#FF6B35" }}>
                Registration failed. Please check your details and try again.
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="mb-1 block font-mono text-xs font-medium"
                    style={{ color: "#9C7B4F" }}
                  >
                    First name
                  </label>
                  <input
                    title="register-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value.trim())}
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
                    Last name
                  </label>
                  <input
                    title="register-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.trim())}
                    className="w-full rounded-md px-3 py-1.5 text-xs sm:text-sm font-mono outline-none"
                    style={{
                      background: "#FFF8F0",
                      border: "1px solid #F3DEC0",
                      color: "#2B1B0E",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1 block font-mono text-xs font-medium"
                  style={{ color: "#9C7B4F" }}
                >
                  Email
                </label>
                <input
                  title="register-email"
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
                  title="register-password"
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
              onClick={handleRegister}
              className="w-full rounded-md px-4 py-2 text-xs sm:text-sm font-medium font-mono transition-all active:scale-95 cursor-pointer mt-1"
              style={{ background: "#FF6B35", color: "#FFFFFF" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E85A28")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FF6B35")
              }
            >
              Create account
            </button>

            <p
              className="text-center font-mono text-xs"
              style={{ color: "#9C7B4F" }}
            >
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium underline cursor-pointer"
                style={{ color: "#2B1B0E" }}
              >
                Log in
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
      <RegisteringModal show={showRegisteringModal} />
      <RegisterSuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}
