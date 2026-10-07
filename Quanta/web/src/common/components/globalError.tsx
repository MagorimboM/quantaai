import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { globalErrorState } from "@/common/storage/globalState";

// Wraps the signed-in app and shows a blocking message when a request to the
// backend fails. The failure is recorded in global state by the API client
// (apiClient); this component only displays it and lets the person dismiss it.
// It adds no element of its own around the page, so the page keeps its own
// layout and its own <main>.
export function GlobalErrorComp({ children }: { children: ReactNode }) {
  const clearGlobalError = globalErrorState((state) => state.clearGlobalError);
  const globalErrorMessage = globalErrorState(
    (state) => state.globalErrorMessage,
  );

  return (
    <>
      {children}

      {globalErrorMessage != null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Alert
            variant="destructive"
            className="mx-4 w-full max-w-md bg-background"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {globalErrorMessage.type} — {globalErrorMessage.code}
            </AlertTitle>
            <AlertDescription className="mt-1 flex items-center justify-between gap-4">
              <span>{globalErrorMessage.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearGlobalError()}
                className="shrink-0 cursor-pointer border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                OK
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
    </>
  );
}