import { useEffect, useState } from "react";
import { AiOutlineTeam } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";
import {
  getCompanyTeamMembers,
  addTeamMember,
  deleteTeamMember,
} from "@/modules/settings/api/api";
import type { TeamMember } from "@/modules/settings/contracts/settings.response.contracts";
import { ConfirmDeletionModal } from "@/modules/settings/components/confirmDeletion"
import { apiErrorMessage } from "@/common/utils/apiErrorMessage";

const EMPTY_MEMBER = {
  name: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  position: "",
};

type NewMember = typeof EMPTY_MEMBER;

const inputClass =
  "w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * The people on the company's team: a contact list (name, email, phone,
 * position) for the company. Team members are not Quanta users and can't sign
 * in. People are added with the form and removed after a confirmation, and both
 * take effect straight away.
 * TODO :: [feature] editing an existing member. For now a wrong detail means
 * deleting the member and adding them again.
 */
export function CompanyTeamMembers({ companyId }: { companyId: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newMember, setNewMember] = useState<NewMember>(EMPTY_MEMBER);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // the member the user is about to delete (null = no dialog open)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        setMembers(await getCompanyTeamMembers({ companyId }));
      } catch {
        // apiClient already reports the failure; the list stays empty
      } finally {
        setIsLoading(false);
      }
    }

    loadMembers();
  }, [companyId]);

  function updateField(field: keyof NewMember, value: string) {
    setNewMember((prev) => ({ ...prev, [field]: value }));
  }

  function closeForm() {
    setShowForm(false);
    setNewMember(EMPTY_MEMBER);
    setErrorMessage(null);
  }

  async function addMember() {
    if (!newMember.name.trim() || !newMember.lastName.trim()) {
      setErrorMessage("Enter the person's first and last name.");
      return;
    }
    if (!newMember.email.trim()) {
      setErrorMessage("Enter the person's email address.");
      return;
    }

    setErrorMessage(null);
    setIsAdding(true);
    try {
      const created = await addTeamMember({
        companyId,
        name: newMember.name.trim(),
        lastName: newMember.lastName.trim(),
        email: newMember.email.trim(),
        phoneNumber: newMember.phoneNumber.trim(),
        position: newMember.position.trim(),
      });
      setMembers((prev) => [...prev, created]);
      closeForm();
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Couldn't add the team member. Please try again."),
      );
    } finally {
      setIsAdding(false);
    }
  }

  // Run by the confirm dialog. Throwing keeps the dialog open with the reason.
  async function deleteMember(member: TeamMember) {
    try {
      await deleteTeamMember({ companyId, memberId: member.id });
    } catch (error) {
      throw new Error(
        apiErrorMessage(error, "Couldn't remove the team member. Please try again."),
      );
    }
    setMembers((prev) => prev.filter((item) => item.id !== member.id));
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="flex flex-row items-center gap-3">
        <AiOutlineTeam size={24} />
        <h1 className="text-2xl font-bold">Team Members</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading team…</p>
      ) : members.length > 0 ? (
        <ul className="flex flex-col divide-y">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-row items-center justify-between gap-3 py-2"
            >
              <div className="flex flex-col">
                <p className="text-sm font-medium text-foreground">
                  {member.name} {member.lastName}
                  {member.position ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {member.position}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.email}
                  {member.phoneNumber ? ` · ${member.phoneNumber}` : ""}
                </p>
              </div>
              <button
                onClick={() => setMemberToDelete(member)}
                aria-label={`Remove ${member.name} ${member.lastName}`}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive cursor-pointer"
              >
                <FiTrash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No team members yet.</p>
      )}

      {showForm ? (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="First name"
              value={newMember.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Last name"
              value={newMember.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Email"
              value={newMember.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={newMember.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Position (optional)"
              value={newMember.position}
              onChange={(e) => updateField("position", e.target.value)}
              className={`${inputClass} sm:col-span-2`}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <div className="flex flex-row justify-end gap-3">
            <button
              onClick={closeForm}
              disabled={isAdding}
              className="rounded-lg border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={addMember}
              disabled={isAdding}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isAdding ? "Adding..." : "Add Team Member"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border bg-secondary p-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70 cursor-pointer"
        >
          + Add New Team Member
        </button>
      )}

      {memberToDelete ? (
        <ConfirmDeletionModal
          header="Remove team member"
          message={`Remove ${memberToDelete.name} ${memberToDelete.lastName} from the team? This cannot be undone.`}
          workingMessage="Removing team member"
          onConfirm={() => deleteMember(memberToDelete)}
          onClose={() => setMemberToDelete(null)}
        />
      ) : null}
    </div>
  );
}