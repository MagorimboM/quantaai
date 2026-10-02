import { PlusIcon } from "@/modules/workspaceSwitcher/components/workspaceSwitcherIcons";

export function WorkspaceEmptyState({
  userName,
  onCreateWorkspace,
}: {
  userName: string;
  onCreateWorkspace: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
      <div className="max-w-xs w-full text-center">
        <div className="relative w-12 h-12 mx-auto mb-10">
          <div className="absolute inset-0 border-2 border-[#F3DEC0] rounded-md" />
          <div className="absolute inset-[5px] border border-[#E8C99A] rounded-[3px]" />
          <div className="absolute inset-[9px] bg-[#F3DEC0] rounded-sm" />
        </div>
        <h2 className="text-xl font-semibold text-[#2B1B0E] mb-2">Welcome, {userName}.</h2>
        <p className="text-sm text-[#9C7B4F] mb-10 leading-relaxed">
          Your account is set up. Create your first workspace to begin.
        </p>
        <button
          onClick={onCreateWorkspace}
          className="w-full bg-[#FF6B35] hover:bg-[#E85A26] active:bg-[#D44E1F] text-white text-sm font-semibold py-3 px-6 rounded-md transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusIcon />
          Create your first workspace
        </button>
        <p className="text-[11px] text-[#B89B6E] mt-4">
          Personal and company workspaces are both supported.
        </p>
      </div>
    </div>
  );
}