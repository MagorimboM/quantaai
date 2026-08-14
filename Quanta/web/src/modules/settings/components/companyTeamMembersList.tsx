import { AiOutlineTeam } from "react-icons/ai";

type TeamMember = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
};

type Documents = {
  documentId: string;
  documentName: string;
  documentType: string;
};
// TODO :: move types to the contracts folder
// TODO :: add the team member form


export function CompanyTeamMembers({
  companyTeamMembers,
  updateTeamMember,
}: {
  companyTeamMembers: TeamMember[] | null;
  updateTeamMember: (member: any) => void;
}) {

  function deleteTeamMember(request: TeamMember) {
    updateTeamMember((prev: TeamMember[]) =>
      prev.filter((teamMember) => request.id != teamMember.id),
    );
  }

  return (
    <div className="flex flex-col gap-2 border rounded-2xl p-6">
      <div className="w-full flex flex-row gap-4">
        <AiOutlineTeam size={24} />
        <h1 className="text-2xl font-bold font-black">Team Members</h1>
      </div>
      <div className="w-full scroll-auto">
        {companyTeamMembers != null && companyTeamMembers.length > 0 ? (
          <ul>
            {companyTeamMembers?.map((teamMember, key) => (
              <li className="flex flex-row gap-3" key={key}>
                <p>{teamMember.name}</p>
                <p>{teamMember.lastName}</p>
                <p>{teamMember.email}</p>
                <button onClick={() => deleteTeamMember(teamMember)}>
                  delete
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <button className="w-full bg-zinc-200 p-1 border hover:bg-zinc-300 rounded-lg cursor-pointer">
        + Add New Team Member
      </button>
    </div>
  );
}
