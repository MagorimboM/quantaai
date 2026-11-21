import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

// Checks a request body (or query, or param) against a Zod schema before the
// route runs. On success the route gets the schema's checked and cleaned value:
// trimmed text, numbers instead of numeric strings, and so on. On failure the
// caller gets a 400 and the route never runs.
//
// Use it on one argument:
//   @Body(new ZodValidationPipe(createWorkspaceSchema)) body: CreateWorkspaceRequest
//
// The 400 looks like this, so the frontend's apiErrorMessage can show `message`
// and a form can match `errors` to its fields:
//   {
//     statusCode: 400,
//     message: "Enter a valid email address.",      // the first problem
//     errors: [{ field: "email", message: "..." }], // every problem
//   }
@Injectable()
export class ZodValidationPipe<TSchema extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.output<TSchema> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new BadRequestException({
      statusCode: 400,
      message: errors[0]?.message ?? 'The request is not valid',
      errors,
    });
  }
}