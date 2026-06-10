import { openAi } from '@/core/Ai/openAi';
import * as fs from 'fs';
import path from 'path';
import {Injectable} from "@nestjs/common"


@Injectable()
export class ProjectUploadAiLayer {
  async EvaluateNewDocuments(
    uploadedDocument: string,
    existingDocument: string,
  ): Promise<{
    status: string;
    documentAVersion: string;
    documentBVersion: string;
    documentACreatedAt: string;
    documentBCreatedAt: string;
    isSameDocument: false;
    reason: string;
  }> {
    const prompt = fs
      .readFileSync('./prompts/evaluator.md', 'utf-8')
      .toString()
      .replace('{{documentA}}', uploadedDocument)
      .replace('{{documentB}}', existingDocument);

    const response = await openAi.chat.completions.create({
      model: 'o4-mini',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'document_version_comparison',
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: "Type of comparison result (e.g. 'updated')",
                enum: ['updated', 'identical', 'different', 'deprecated'],
              },
              documentAVersion: {
                type: 'string',
                description: 'Version label of Document A',
                minLength: 1,
              },
              documentBVersion: {
                type: 'string',
                description: 'Version label of Document B',
                minLength: 1,
              },
              documentACreatedAt: {
                type: 'string',
                description: "Creation date of Document A (e.g. 'March 2024')",
                minLength: 1,
              },
              documentBCreatedAt: {
                type: 'string',
                description:
                  "Creation date of Document B (e.g. 'January 2024')",
                minLength: 1,
              },
              isSameDocument: {
                type: 'boolean',
                description:
                  'Whether the two documents refer to the same underlying document',
              },
              reason: {
                type: 'string',
                description: 'Explanation for the comparison result',
              },
            },
            required: [
              'status',
              'documentAVersion',
              'documentBVersion',
              'documentACreatedAt',
              'documentBCreatedAt',
              'isSameDocument',
              'reason',
            ],
            additionalProperties: false,
          },
          strict: true,
        },
      },
      messages: [{ role: 'user', content: prompt }],
    });

    if (response?.choices[0]?.message.content)
    return JSON.parse(response?.choices[0]?.message.content);

    return {
    status: "", 
    documentAVersion: "", 
    documentBVersion: "", 
    documentACreatedAt: "", 
    documentBCreatedAt: "string", 
    isSameDocument: false, 
    reason: ""
  }
  }
}
