import { HiOutlineOfficeBuilding } from "react-icons/hi";

type Address = {
  state: string;
  city: string;
  postCode: string;
  street: string;
  houseNumber: number | null;
};

type CompanyInformation = {
  companyId: string;
  companyName: string;
  companyAddress: Address;
};

// TODO :: move types to contracts folder
// TODO :: change the font of the placeholder

export function CompanyProfile({
  companyInformation,
  updateCompanyInformation,
}: {
  companyInformation: CompanyInformation | null;
  updateCompanyInformation: (updatedInfo: any) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-2 border rounded-2xl p-6 ">
        <div className="flex flex-row gap-4">
          <HiOutlineOfficeBuilding size={24} />
          <h1 className="text-2xl font-bold font-black">Company Information</h1>
        </div>
        <div className="flex flex-col gap-2">
          <label className="">Company Name</label>
          <input
            className="border-2 p-2 rounded-lg"
            placeholder={companyInformation?.companyName}
            onChange={(e) => {
              updateCompanyInformation((prev: CompanyInformation) => ({
                ...prev,
                companyName: e.target.value.trim(),
              }));
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>Company Address</label>
          <input
            className="border-2 p-2 rounded-lg"
            placeholder={companyInformation?.companyAddress.state}
            onChange={(e) => {
              updateCompanyInformation((prev: CompanyInformation) => ({
                ...prev,
                companyAddress: e.target.value.trim(),
              }));
            }}
          />
        </div>
      </div>
    </>
  );
}
