import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AssistantRepository,
  type AssistantDocument,
} from '@/modules/assistant/assistant.repository';
import { openAi } from '@/core/Ai/openAi';

const ASSISTANT_MODEL = 'gpt-5.5';
const QUANTA_AI_SYSTEM_PROMPT = `

You are Quanta AI — a precise quantity surveying assistant built for construction professionals in Australia.

============================================================
IDENTITY
============================================================
You are a specialist QS assistant, not a general purpose AI.

There are three kinds of questions you'll receive. Handle each differently:

1. **Questions about quantities, measurements, or construction information found in the loaded documents** → answer using the RULES below (cite the document, use bullet points).

2. **Questions about yourself — what you do, who you are, what you can help with** → answer briefly and naturally, in 1-3 plain sentences, no bullet points. Example:
   "I'm Quanta AI, a quantity surveying assistant. I answer questions about quantities and measurements based on the documents loaded for this project — I don't handle pricing, and I only work from what's actually in your documents."

3. **Anything genuinely unrelated to QS or construction** (e.g. "write me a poem", "what's the weather") → respond exactly with:
   "I am a QS assistant. I can only help with quantity surveying questions based on your loaded documents."

If you're unsure whether a question is (2) or (3), lean toward (2) — a short, honest answer about your own scope is always safe; the canned refusal is only for requests that have nothing to do with you or QS at all.

============================================================
LOADED DOCUMENTS SUMMARY
============================================================
Only trigger this section when the user explicitly asks what documents are loaded, what you have access to, or asks you to list your documents — not for general "what do you do" questions.

When it does trigger:
- List all documents present under each section below
- If a section is empty, say "None loaded"
- Never say you cannot see or access the documents — they are injected directly into this prompt
- Always reference the document name when answering a substantive question afterward

============================================================
PERSONAL DOCUMENTS
============================================================
These are the user's personal reference notes and documents.

--- BEGIN OF PERSONAL DOCUMENTS ---
{personalDocuments}
--- END OF PERSONAL DOCUMENTS ---

============================================================
COMPANY DOCUMENTS
============================================================
These are company policies, standards and procedures.

--- BEGIN OF COMPANY DOCUMENTS ---
{companyDocuments}
--- END OF COMPANY DOCUMENTS ---

============================================================
PROJECT DOCUMENTS
============================================================
These are documents specific to the current project.

--- BEGIN OF PROJECT DOCUMENTS ---
{projectDocuments}
--- END OF PROJECT DOCUMENTS ---

============================================================
RULES (apply to substantive QS/document answers only — not to identity questions above)
============================================================
- Every answer must come directly from the loaded documents above
- Always state which document your answer came from
- Do not use any knowledge outside of the provided documents
- Never guess, assume or add information not found in the documents
- If the answer is not in the documents, say clearly: "This information is not in your loaded documents"
- Never discuss pricing — quantities only
- Use Australian standards and terminology
- Be precise with measurements and units
- Use bullet points, not paragraphs, for these answers specifically
- When multiple documents apply, reference all of them
- When asked about loaded documents, always reflect what is actually present in this prompt
- When a person's name is mentioned in a document, always include it in your answer
`

// Puts the documents of one type into a single block of text for the prompt.
// Each document is headed with its name so the model can say which document
// an answer came from ("32 MPa, site specification v4.2"), which is what the
// product promises: answers with their source.
function joinDocuments(
  documents: AssistantDocument[],
  documentType: AssistantDocument['documentType'],
): string {
  return documents
    .filter((document) => document.documentType === documentType)
    .map((document) => `# ${document.nameOfDocument}\n${document.content}`)
    .join('\n\n');
}

@Injectable()
export class AssistantService {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  // Works out who is asking and checks they own the company (and project) they
  // are asking about. Returns the user's own id. Not-found is used for both
  // failures so the response never confirms whether someone else's id exists.
  private async authorise(request: {
    clerkId: string;
    companyId: string;
    projectId?: string;
  }): Promise<string> {
    const user = await this.assistantRepository.findUserByClerkId(
      request.clerkId,
    );
    if (!user) {
      throw new NotFoundException('No local user found for this account');
    }

    const allowed = await this.assistantRepository.scopeBelongsToUser({
      userId: user.id,
      companyId: request.companyId,
      projectId: request.projectId,
    });
    if (!allowed) {
      throw new NotFoundException('Company or project not found');
    }

    return user.id;
  }

  /**
   * Answers one question from the user.
   *
   * HOW IT WORKS TODAY:
   *   1. Read the conversation so far (last 20 messages in this scope).
   *   2. Save the new question.
   *   3. Load the text of every active document the user may use here:
   *      project documents, company documents and personal documents.
   *   4. Put all of that text into the system prompt, add the conversation and
   *      the question, and ask the model.
   *   5. Save the reply and return it.
   *
   * TODO :: [backend] Retrieval. Step 3 sends WHOLE documents, so a few large
   * specs will exceed the model's context limit and make every question
   * expensive. The intended design is to embed the question, find the closest
   * chunks in document_embeddings with pgvector, and send only those. That is
   * not built yet.
   */
  async chat(request: {
    clerkId: string;
    companyId: string;
    projectId?: string;
    userMessage: string;
  }) {
    const userId = await this.authorise(request);
    const { companyId, projectId, userMessage } = request;

    // Read the history BEFORE saving the question. Reading after would include
    // the question, and it is appended again below, so the model would see it twice.
    const chatHistory = await this.assistantRepository.getChatHistory({
      userId,
      companyId,
      projectId,
    });

    await this.assistantRepository.saveMessage({
      message: userMessage,
      role: 'user',
      userId,
      companyId,
      projectId,
    });

    const documents = await this.assistantRepository.getAssistantDocuments({
      userId,
      companyId,
      projectId,
    });

    // Fill the three document slots in the system prompt. A function is passed
    // to replace() so characters like "$&" in a spec's text are inserted as they are.
    const systemPrompt = QUANTA_AI_SYSTEM_PROMPT.replace(
      '{personalDocuments}',
      () => joinDocuments(documents, 'userDocument'),
    )
      .replace('{companyDocuments}', () =>
        joinDocuments(documents, 'companyDocument'),
      )
      .replace('{projectDocuments}', () =>
        joinDocuments(documents, 'projectDocument'),
      );

    let reply: string;
    try {
      const response = await openAi.responses.create({
        model: ASSISTANT_MODEL,
        input: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.map((message) => ({
            role: message.role as 'user' | 'assistant',
            content: message.content,
          })),
          { role: 'user', content: userMessage },
        ],
      });
      reply = response.output_text;
    } catch {
      // The question stays saved in the history; the user can simply ask again
      throw new InternalServerErrorException('Cannot talk to the assistant');
    }

    const savedReply = await this.assistantRepository.saveMessage({
      message: reply,
      role: 'assistant',
      userId,
      companyId,
      projectId,
    });

    return { id: savedReply.id, role: 'assistant', content: reply };
  }

  // The caller's latest messages for this company/project, oldest first
  async getChatHistory(request: {
    clerkId: string;
    companyId: string;
    projectId?: string;
  }) {
    const userId = await this.authorise(request);

    return await this.assistantRepository.getChatHistory({
      userId,
      companyId: request.companyId,
      projectId: request.projectId,
    });
  }
}
