import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

// True when the file really is a PDF. Every PDF starts with the bytes "%PDF",
// whatever its name or the type the browser claims, so a renamed photo or an
// .exe called "drawings.pdf" is caught.
export function isPdf(file: Buffer): boolean {
  return file.subarray(0, 4).toString('ascii') === '%PDF';
}

// Checks the files of a documents upload: there must be at least one, and each
// must be a real PDF. Every bad file is listed, not just the first, so the user
// can fix them all at once. The 400 has the same shape as ZodValidationPipe's
// ({ statusCode, message, errors }), so the frontend shows it the same way.
//
// Use it on the files:
//   @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[]
@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[] | undefined): Express.Multer.File[] {
    const errors =
      !files || files.length === 0
        ? [{ field: 'files', message: 'No files uploaded' }]
        : files
            .filter((file) => !isPdf(file.buffer))
            .map((file) => ({
              field: 'files',
              message: `${file.originalname} is not a valid PDF`,
            }));

    if (errors.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: errors[0].message,
        errors,
      });
    }
    return files as Express.Multer.File[];
  }
}