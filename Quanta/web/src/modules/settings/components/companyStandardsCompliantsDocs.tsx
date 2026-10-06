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
    <div className="flex w-full flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="flex flex-row items-center gap-3">
        <MdOutlineShield size={26} />
        <h1 className="text-2xl font-bold">Standards and Compliance</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : documents.length > 0 ? (
        <ul className="flex flex-col divide-y">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex flex-row items-center justify-between gap-3 py-2"
            >
              <p className="text-sm text-foreground">{document.name}</p>
              <p className="text-xs text-muted-foreground">
                Added {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No standards or compliance documents yet.
        </p>
      )}
    </div>
  );
}