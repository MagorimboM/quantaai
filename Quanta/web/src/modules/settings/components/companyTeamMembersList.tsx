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
  "w-full rounded-lg border border-[#F0EDE8] bg-[#FAFAF9] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-colors hover:border-[#FFD9C9] focus:border-[#FF6B35] focus:bg-white focus:ring-[3px] focus:ring-[#FFF4EE]";

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
    <div className="flex flex-col gap-5 rounded-2xl border border-[#F0EDE8] bg-white p-6">
      <div className="flex flex-row items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#FFF4EE] text-[#FF6B35]">
          <AiOutlineTeam size={18} />
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-[#1C1917]">Team Members</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#78716C]">Loading team…</p>
      ) : members.length > 0 ? (
        <ul className="flex flex-col divide-y divide-[#F0EDE8]">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-row items-center justify-between gap-3 py-3"
            >
              <div className="flex flex-col">
                <p className="text-sm font-medium text-[#1C1917]">
                  {member.name} {member.lastName}
                  {member.position ? (
                    <span className="ml-2 rounded-full bg-[#FFF4EE] px-2 py-0.5 text-xs font-normal text-[#FF6B35]">
                      {member.position}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-[#78716C]">
                  {member.email}
                  {member.phoneNumber ? ` · ${member.phoneNumber}` : ""}
                </p>
              </div>
              <button
                onClick={() => setMemberToDelete(member)}
                aria-label={`Remove ${member.name} ${member.lastName}`}
                className="rounded-lg p-2 text-[#A8A29E] transition-colors hover:bg-[#FFF4EE] hover:text-red-600 cursor-pointer"
              >
                <FiTrash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#78716C]">No team members yet.</p>
      )}

      {showForm ? (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#FFD9C9] bg-[#FFF4EE]/40 p-4">
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
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="flex flex-row justify-end gap-3">
            <button
              onClick={closeForm}
              disabled={isAdding}
              className="rounded-lg border border-[#F0EDE8] bg-white px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:border-[#FFD9C9] hover:bg-[#FFF4EE] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={addMember}
              disabled={isAdding}
              className="rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E85A26] focus:outline-none focus:ring-[3px] focus:ring-[#FFF4EE] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              {isAdding ? "Adding..." : "Add Team Member"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border border-dashed border-[#F0EDE8] bg-white p-2.5 text-sm font-medium text-[#78716C] transition-colors hover:border-[#FFD9C9] hover:bg-[#FFF4EE] hover:text-[#FF6B35] cursor-pointer"
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