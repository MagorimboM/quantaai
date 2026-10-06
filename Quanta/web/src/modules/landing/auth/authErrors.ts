// Clerk says exactly what went wrong ("That email address is taken", "Password
// has been found in a data breach"). On sign-up the person needs to read that
// to fix it. The login page does NOT use this on purpose: it always shows one
// generic message, so the form never reveals which emails have accounts.
//
// Clerk's error object carries a list of errors; the first one is shown. If
// the error has a different shape than expected, the fallback text is used.
export function readableError(error: unknown, fallback: string): string {
  const clerkError = error as {
    errors?: { longMessage?: string; message?: string }[];
    message?: string;
  } | null;

  return (
    clerkError?.errors?.[0]?.longMessage ??
    clerkError?.errors?.[0]?.message ??
    clerkError?.message ??
    fallback
  );
}