import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type LocalErrorInput = {
  code: number | string;
  message: string;
  type: string;
};

export function LocalError({
  localError,
  setLocalError,
}: {
  localError: LocalErrorInput;
  setLocalError: () => void;
}) {
  if (!localError) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {localError.type} — {localError.code}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{localError.message}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={()=>setLocalError}
          className=" cursor-pointer shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          OK
        </Button>
      </AlertDescription>
    </Alert>
  );
}