import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {globalErrorState} from "@/common/storage/globalState"; 

export function GlobalError({ children }: { children: React.ReactNode }) {
  const clearGlobalError = globalErrorState((state:any)=>(state.clearGlobalError)); 
  const globalErrorMessage = globalErrorState((state:any)=>(state.globalErrorMessage)); 

  return (
    <>
      <main>{children}</main>

      {globalErrorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <Alert variant="destructive" className="w-full max-w-md mx-4 bg-background">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {globalErrorMessage.type} — {globalErrorMessage.code}
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4 mt-1">
              <span>{globalErrorMessage.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearGlobalError(null)}
                className=" cursor-pointer shrink-0 border-destructive text-destructive hover:text-white hover:bg-destructive"
              >
                OK
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}

