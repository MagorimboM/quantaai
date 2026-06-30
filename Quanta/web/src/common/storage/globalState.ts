import { create } from "zustand";

type GlobalError = {
  code: number | string;
  message: string;
  type: string;
} | null;

export const globalErrorState = create((set) => ({
  globalErrorMessage: null,
  setGlobalError: (errorMessage: GlobalError) =>
    set(() => ({
      globalErrorMessage: errorMessage,
    })),

  clearGlobalError: () =>
    set(() => ({
      globalErrorMessage: null,
    })),
}));


