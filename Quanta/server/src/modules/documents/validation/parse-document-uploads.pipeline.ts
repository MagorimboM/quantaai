import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isPdf } from '@/modules/documents/validation/pdf.signature.validator';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    for (const file of files) {
      if (!isPdf(file.buffer)) {
        throw new BadRequestException(
          `${file.originalname} is not a valid PDF`,
        );
      }
    }

    return files;
  }
}