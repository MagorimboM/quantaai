type ProjectUploadFilesInput = {
  userId?: string;
  companyId?: string;
  projectId?: string;
  documentType: string;
  files: File[];
};

export function projectUploadFiles(input: ProjectUploadFilesInput): FormData {
  const formData = new FormData();

  if (input.userId) formData.append("userId", input.userId);
  if (input.companyId) formData.append("companyId", input.companyId);
  if (input.projectId) formData.append("projectId", input.projectId);
  formData.append("documentType", input.documentType);

  for (const file of input.files) {
    formData.append("files", file);
  }

  return formData;
}
