import { useId } from "react";

// A labelled text box for the auth forms. The label is tied to the input so
// clicking it focuses the box, and `autoComplete` lets browsers and password
// managers fill the right value ("email", "new-password", "one-time-code"...).
// The value is passed through exactly as typed; trimming happens on submit.
export function AuthField({
  label,
  title,
  type = "text",
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  title: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block font-mono text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        title={title}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary sm:text-sm"
      />
    </div>
  );
}