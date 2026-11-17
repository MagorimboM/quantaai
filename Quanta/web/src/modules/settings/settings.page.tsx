import { CompanyProfile } from "@/modules/settings/components/companyProfile ";
import { CompanyTeamMembers } from "@/modules/settings/components/companyTeamMembersList";
import { CompanyStandardsComplianceDocs } from "@/modules/settings/components/companyStandardsCompliantsDocs";
import { getActiveScope } from "@/common/storage/activeScope";

/**
 * Settings for the active company: who the company is, who is on its team, and
 * the standards and compliance documents it holds.
 *
 * Each section loads and saves on its own, so a change is saved the moment the
 * user confirms it in that section, and a problem in one section never blocks
 * the others.
 *
 * Settings belong to a company, so a personal workspace (no company) shows a
 * message instead. TODO :: [backend] personal settings, then drop it.
 */
export function SettingsPage() {
  const { companyId } = getActiveScope();

  if (!companyId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white p-4">
        <p className="text-sm text-[#78716C]">
          Select a company workspace to see its settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#FAFAF9] text-[#1C1917]">
      <div className="flex w-full flex-col gap-8 px-6 py-8">
        <header className="flex w-full flex-col gap-1.5">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-[#78716C]">
            Manage your company workspace configuration
          </p>
        </header>

        <main className="flex w-full flex-col gap-6">
          <CompanyProfile companyId={companyId} />
          <CompanyTeamMembers companyId={companyId} />
          <CompanyStandardsComplianceDocs companyId={companyId} />
        </main>
      </div>
    </div>
  );
}