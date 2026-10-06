import { useState } from "react";
import { useSignUp } from "@clerk/react";
import { useNavigate } from "react-router";
import { AuthLayout } from "@/modules/landing/auth/components/authLayout";
import { AuthField } from "@/modules/landing/auth/components/authField";
import { LoadingModal } from "@/common/components/loadingModal";
import { readableError } from "@/modules/landing/auth/authErrors";
import type {
  RegisterRequest,
  VerifyEmailCodeRequest,
} from "@/modules/landing/auth/contracts/landing.request.contracts"
import { clearActiveScope } from "@/common/storage/activeScope";

// TODO :: [clerk] confirm first and last name reach Clerk with signUp.password()
// (open a new user in the Clerk dashboard and check). The local users row is
// filled from Clerk by the webhook, so empty names there would trace back to here.

// What a new user is promised. Each one maps to a real feature of the app.
const BENEFITS = [
  {
    title: "Get it out the door sooner",
    body: "One measurement, every ingredient calculated at once, instead of the same multiplication repeated per material.",
  },
  {
    title: "Stop hunting through specs",
    body: "Upload a document, ask the AI assistant your question, get the answer with the source. No more losing an hour searching through for one clause.",
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

// Left column: what the person gets by signing up.
function RegisterIntro() {
  return (
    <>
      <p className="mb-2 font-mono text-xs text-muted-foreground">
        YOU'RE ABOUT TO SAVE YOURSELF SOME TIME
      </p>
      <h1
        className="mb-3 font-display font-800 leading-tight text-foreground"
        style={{ fontSize: "clamp(24px, 2.5vw, 32px)", letterSpacing: "-0.01em" }}
      >
        Good call.
        <br />
        Here's what you're getting.
      </h1>
      <p className="mb-6 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Less time on quants means more time to yourself. That's the whole point
        of Quanta, and it starts the moment you create your first recipe.
      </p>

      <div className="flex flex-col gap-4">
        {BENEFITS.map((benefit, index) => (
          <div key={benefit.title} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-medium text-primary">
              {index + 1}
            </div>
            <div>
              <p className="font-display font-700 text-xs text-foreground sm:text-sm">
                {benefit.title}
              </p>
              <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
                {benefit.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const submitButtonClass =
  "mt-1 w-full rounded-md bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

/**
 * Sign-up, in two steps because Clerk verifies every email address:
 *   1. details: name, email, password. Clerk creates a pending sign-up and
 *      emails a 6-digit code.
 *   2. code: the person types the code. Clerk then creates the account and
 *      starts a session, and they go to the workspace switcher, where a new
 *      user with no workspaces is asked to create their first one.
 *
 * Our own users table is not written from this page. Clerk's webhook creates
 * the matching row (see the backend AuthService).
 * TODO :: [backend] That row can arrive a moment after the first request from
 * the switcher. If the backend can't find the user yet, create it on that first
 * request instead of failing with "not found".
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useSignUp();
  const [form, setForm] = useState<RegisterRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState<VerifyEmailCodeRequest>({
    code: "",
  });
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegisterRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Step 1: create the pending sign-up and email the code
  async function handleRegister() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Values are trimmed here, not while typing, so names with spaces
      // ("Mary Ann", "van der Merwe") can be entered.
      const { error } = await signUp.password({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      if (error) {
        setErrorMessage(
          readableError(error, "Registration failed. Please check your details and try again."),
        );
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrorMessage(
          readableError(sendError, "We couldn't send the verification code. Please try again."),
        );
        return;
      }

      setAwaitingCode(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 2: check the code, then start the session
  async function handleVerifyCode() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: verification.code.trim(),
      });
      if (error) {
        setErrorMessage(
          readableError(error, "That code didn't work. Check it and try again."),
        );
        return;
      }

      if (signUp.status !== "complete") {
        setErrorMessage("That code didn't work. Check it and try again.");
        return;
      }

      // A new account never starts inside someone else's workspace
      clearActiveScope();

      await signUp.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            navigate(url);
          }
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AuthLayout intro={<RegisterIntro />}>
        {!awaitingCode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-0.5 border-b pb-2">
              <h2 className="font-display text-base font-semibold text-foreground">
                Create an account
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Get started with Quanta
              </p>
            </div>

            {errorMessage ? (
              <p className="font-mono text-xs text-destructive">{errorMessage}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <AuthField
                label="First name"
                title="register-first-name"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(value) => updateField("firstName", value)}
              />
              <AuthField
                label="Last name"
                title="register-last-name"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(value) => updateField("lastName", value)}
              />
            </div>
            <AuthField
              label="Email"
              title="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />
            <AuthField
              label="Password"
              title="register-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(value) => updateField("password", value)}
            />

            <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center font-mono text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-foreground underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyCode();
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-0.5 border-b pb-2">
              <h2 className="font-display text-base font-semibold text-foreground">
                Check your email
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Enter the code we just sent to {form.email.trim()}
              </p>
            </div>

            {errorMessage ? (
              <p className="font-mono text-xs text-destructive">{errorMessage}</p>
            ) : null}

            <AuthField
              label="Verification code"
              title="register-verification-code"
              autoComplete="one-time-code"
              value={verification.code}
              onChange={(value) => setVerification({ code: value })}
            />

            <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
              {isSubmitting ? "Verifying..." : "Verify and finish"}
            </button>
          </form>
        )}
      </AuthLayout>

      <LoadingModal
        show={isSubmitting}
        message={awaitingCode ? "Verifying your code..." : "Creating your account..."}
      />
    </>
  );
}