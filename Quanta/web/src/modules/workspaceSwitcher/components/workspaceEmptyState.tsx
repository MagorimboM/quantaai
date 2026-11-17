import { PlusIcon } from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";

export function WorkspaceEmptyState({
  userName,
  onCreateWorkspace,
}: {
  userName: string;
  onCreateWorkspace: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto mb-8 h-14 w-14">
          <div className="absolute inset-0 rounded-xl border border-[#DEDAD4] bg-white" />
          <div className="absolute inset-[7px] rounded-lg border border-[#F0EDE8] bg-[#FAFAF9]" />
          <div className="absolute inset-[14px] rounded-md bg-[#FFF4EE]" />
        </div>
        <h2 className="mb-2.5 text-xl font-semibold leading-[26px] tracking-[-0.025em] text-[#1C1917]">
          Welcome, {userName}.
        </h2>
        <p className="mb-6 text-sm leading-[21px] text-[#78716C]">
          Your account is set up. Create your first workspace to begin.
        </p>
        <button
          onClick={onCreateWorkspace}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#FF6B35] bg-[#FF6B35] px-5 text-sm font-medium text-white transition-colors duration-150 hover:border-[#E85A26] hover:bg-[#E85A26] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFF4EE]"
        >
          <PlusIcon />
          Create your first workspace
        </button>
        <p className="mt-4 text-xs text-[#A8A29E]">
          Personal and company workspaces are both supported.
        </p>
      </div>
    </div>
  );
}