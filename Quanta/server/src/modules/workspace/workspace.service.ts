import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { WorkspaceRepository } from '@/modules/workspace/workspace.repository';
import { AccessService } from '@/auth/services/access.service';
import type {
  CreateWorkspaceRequest,
  CompanyPolicyFile,
} from '@/modules/workspace/contracts/workspace.schema';
import type {
  CompanyWorkspace,
  PersonalWorkspace,
  DueProject,
} from '@/modules/workspace/contracts/workspace.response.contracts';
import { openAi } from '@/core/Ai/openAi';

// A detail left blank is stored as empty rather than as blank text
function orNull(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

// These routes list what belongs to the signed-in person, so there is no company
// to check: the person is identified from their Clerk token alone, and every
// query is limited to their own data.
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly accessService: AccessService,
  ) {}

  async getWorkspaces(clerkId: string): Promise<CompanyWorkspace[]> {
    const userId = await this.accessService.getUserId(clerkId);
    return await this.workspaceRepository.getCompanyWorkspaces(userId);
  }

  async getPersonalWorkspace(
    clerkId: string,
  ): Promise<PersonalWorkspace | null> {
    const userId = await this.accessService.getUserId(clerkId);
    return await this.workspaceRepository.getPersonalWorkspace(userId);
  }

  async getWorkspaceProjects(clerkId: string): Promise<DueProject[]> {
    const userId = await this.accessService.getUserId(clerkId);
    return await this.workspaceRepository.getDueProjects(userId);
  }

  // Creates a company and the workspace that opens it. The body and the file
  // have already been checked by their schemas (fields present and valid; the
  // file a real PDF of 10 MB or less), so only what needs the database or the
  // file's contents is checked here: the name must be one the person doesn't
  // already use (ignoring case), and the PDF must have text in it.
  async createNewWorkspace(
    clerkId: string,
    body: CreateWorkspaceRequest,
    file: CompanyPolicyFile,
  ): Promise<CompanyWorkspace> {
    const userId = await this.accessService.getUserId(clerkId);

    // Checked before the PDF is read
    if (await this.workspaceRepository.companyNameTaken(userId, body.name)) {
      throw new ConflictException('You already have a company with this name');
    }

    const companyPolicyDocument: {
      documentTitle: string;
      documentPageNumber: string | number;
      documentContent: string;
    }[] = file ? await this.readPolicyText(file) : null;

    const CHUNK_SIZE = 700;
    const chunkedDocuments: {
      documentTitle: string;
      documentPageNumber: number | string;
      chunkedContent: string[];
    }[] = [];

    for (const eachPage of companyPolicyDocument) {
      const arrayOfChunkedText: string[] = [];
      const chars = eachPage.documentContent.trim().split('');

      let currentIndex = 0;
      while (currentIndex < chars.length) {
        let chunkText = '';
        const endIndex = Math.min(currentIndex + CHUNK_SIZE, chars.length);

        for (let i = currentIndex; i < endIndex; i++) {
          chunkText += chars[i];
        }

        arrayOfChunkedText.push(chunkText);
        currentIndex += CHUNK_SIZE;
      }

      chunkedDocuments.push({
        documentTitle: eachPage.documentTitle,
        documentPageNumber: eachPage.documentPageNumber,
        chunkedContent: arrayOfChunkedText,
      });
    }
    console.log(chunkedDocuments);

    // TODO :: send it over to the repository to be saved in the data base.
    // TODO :: save the file to postgres SQL bucket.

    return await this.workspaceRepository.createCompanyWorkspace({
      userId,
      name: body.name,
      address: orNull(body.address),
      city: orNull(body.city),
      state: orNull(body.state),
      postcode: orNull(body.postcode),
      country: body.country?.trim() || 'Australia',
      phone: orNull(body.phone),
      email: orNull(body.email),
      contactName: orNull(body.contactName),
      contactPhone: orNull(body.contactPhone),
      contactEmail: orNull(body.contactEmail),
      companyType: orNull(body.companyType),
      chunkedCompanyPolicy:chunkedDocuments,
      companyPolicy:file
    });
  }

  // The policy's text, all pages together. The file is already known to be a
  // PDF; here it must also have text in it, since a scanned PDF is only pictures.
  private async readPolicyText(file: Express.Multer.File): Promise<any> {
    const parser = new PDFParse({ data: file.buffer });
    const pages = await parser.getText();
    const companyPolicyDocument = pages.pages;

    return companyPolicyDocument.map((page) => ({
      documentTitle: file.originalname,
      documentPageNumber: page.num,
      documentContent: page.text,
    }));
  }
}
