import { Expose, Type } from 'class-transformer';

class UploaderDto {
  @Expose() id: string;
  @Expose() fullName: string | null;
}

class CourseLinkDto {
  @Expose() id: string;
  @Expose() name: string;
}

export class ResponseLearningMaterialDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() materialType: string;
  @Expose() fileUrl: string | null;
  @Expose() orderIndex: number;
  @Expose() createdAt: Date;
  @Expose() @Type(() => UploaderDto) uploader: UploaderDto | null;
  @Expose() @Type(() => CourseLinkDto) course: CourseLinkDto;
}
