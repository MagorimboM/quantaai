import { MdOutlineShield } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi2";

type Documents = {
  documentId: string;
  documentName: string;
  documentType: string;
};

// TODO :: move types to contracts
// TODO :: view selected document : grab the bytes, view them in iframe 


export function CompanyStandardsComplaintsDocs({
  companyStandardsComplaintsDocs,
  editCompanyStandardCompliantDocs,
}: {
  companyStandardsComplaintsDocs: Documents[] | null;
  editCompanyStandardCompliantDocs: (input: any) => void;
}) {


  function deleteDocument(doc: Documents) {
    editCompanyStandardCompliantDocs((prev: Documents[]) =>
      prev.filter((document) => document.documentId != doc.documentId),
    );
  }

  return (
    <>
      <div className=" flex flex-col gap-2 w-full border rounded-xl p-6">
        <div className="flex flex-row gap-4">
          <MdOutlineShield size={26} />
          <h1 className="font-bold text-2xl">Standards and Compliance</h1>
        </div>

        <ul>
          {companyStandardsComplaintsDocs?.map((doc, key) => (
            <li className=" flex flex-row gap-6" key={key}>
              <div className="flex flex-row gap-3">
                <p>{doc.documentName}</p> <p>{doc.documentType}</p>
              </div>
              <button onClick={() => deleteDocument(doc)}>
                <HiOutlineTrash size={24} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}; 


// read register, if data of tupe key board, ger the data, current focus  pass the keyboard to the current focus etc
// cpu write tot he NIC card this data,
// cpu reade from NIC registers
// cpu read from registers if NIC : send data oveer the network. 


// cpu writer to gpu card : render this data on cpu
// cpu read from gpu register : response  { if response is like this do this other wise do that etc}
// cpu rea






