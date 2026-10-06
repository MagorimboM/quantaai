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
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Select a company workspace to see its settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background text-foreground">
      <header className="flex w-full flex-col gap-4 px-4 py-3">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your company workspace configuration
          </p>
        </div>
      </header>

      <main className="flex w-full flex-col gap-6 p-4">
        <CompanyProfile companyId={companyId} />
        <CompanyTeamMembers companyId={companyId} />
        <CompanyStandardsComplianceDocs companyId={companyId} />
      </main>
    </div>
  );
}