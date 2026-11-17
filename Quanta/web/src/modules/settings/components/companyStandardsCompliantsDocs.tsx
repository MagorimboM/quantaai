import { useEffect, useState } from "react";
import { MdOutlineShield } from "react-icons/md";
import { getStandardsDocuments } from "@/modules/settings/api/api";
import type { StandardDocument } from "@/modules/settings/contracts/settings.response.contracts";

// TODO :: [feature] Nothing in the app uploads company-level documents yet (the
// projects page only uploads project documents), so this list stays empty until
// an upload exists. Once it does, add here: upload, open a document in a viewer,
// and delete. Deleting needs a backend route that doesn't require a project.

/**
 * The company's standards and compliance documents (company policies,
 * standards, certifications). The AI assistant reads them when answering
 * questions, in every project of the company. Read-only for now.
 */
export function CompanyStandardsComplianceDocs({
  companyId,
}: {
  companyId: string;
}) {
  const [documents, setDocuments] = useState<StandardDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDocuments() {
      try {
        setDocuments(await getStandardsDocuments({ companyId }));
      } catch {
        // apiClient already reports the failure; the list stays empty
      } finally {
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, [companyId]);

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl border border-[#F0EDE8] bg-white p-6">
      <div className="flex flex-row items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#FFF4EE] text-[#FF6B35]">
          <MdOutlineShield size={18} />
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-[#1C1917]">
          Standards and Compliance
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#78716C]">Loading documents…</p>
      ) : documents.length > 0 ? (
        <ul className="flex flex-col divide-y divide-[#F0EDE8]">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex flex-row items-center justify-between gap-3 py-3"
            >
              <p className="text-sm font-medium text-[#1C1917]">{document.name}</p>
              <p className="text-xs text-[#A8A29E]">
                Added {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[#F0EDE8] bg-[#FAFAF9] px-4 py-6 text-center text-sm text-[#78716C]">
          No standards or compliance documents yet.
        </p>
      )}
    </div>
  );
}