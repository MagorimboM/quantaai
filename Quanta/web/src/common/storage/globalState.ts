import { create } from "zustand";

type GlobalError = {
  code: number | string;
  message: string;
  type: string;
} | null;

type GlobalErrorState = {
  globalErrorMessage: GlobalError;
  setGlobalError: (errorMessage: GlobalError) => void;
  clearGlobalError: () => void;
};

export const globalErrorState = create<GlobalErrorState>()((set) => ({
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