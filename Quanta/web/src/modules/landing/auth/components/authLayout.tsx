import { useNavigate } from "react-router";

// The frame shared by the login and register pages: a QUANTA header that goes
// back to the landing page, a two-column body, and a footer.
//  - left column (`intro`): why the person is here (what they get)
//  - right column (`children`): the form
export function AuthLayout({
  intro,
  children,
}: {
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="flex h-12 shrink-0 items-center border-b px-6">
        <button
          onClick={() => navigate("/")}
          className="font-display font-800 text-lg tracking-widest text-foreground cursor-pointer"
        >
          QUANTA
        </button>
      </div>

      <div className="mx-auto grid min-h-0 max-w-5xl flex-1 grid-cols-1 items-center gap-8 overflow-y-auto px-6 py-4 md:grid-cols-2">
        <div>{intro}</div>
        <div className="flex w-full flex-col gap-3.5 rounded-lg border bg-card p-5 shadow-sm">
          {children}
        </div>
      </div>

      <footer className="shrink-0 border-t py-3">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 sm:flex-row">
          <div className="font-display font-800 text-sm tracking-widest text-foreground">
            QUANTA
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Quanta. Quantity takeoff software.
          </p>
          {/* TODO :: [content] Privacy, Terms and Contact pages don't exist yet; these links go nowhere */}
          <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
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
  );
}