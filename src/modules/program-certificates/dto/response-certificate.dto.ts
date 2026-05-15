import { Expose, Type } from 'class-transformer';

class CertUserDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string | null;
}

class CertProgramDto {
  @Expose() id: string;
  @Expose() name: string;
}

export class ResponseCertificateDto {
  @Expose() id: string;
  @Expose() certNumber: string;
  @Expose() fileUrl: string | null;
  @Expose() studentNameSnapshot: string;
  @Expose() programNameSnapshot: string;
  @Expose() issuedAt: Date;
  @Expose() userId: string;
  @Expose() programId: string;
  @Expose() @Type(() => CertUserDto) user: CertUserDto | null;
  @Expose() @Type(() => CertProgramDto) program: CertProgramDto | null;
}
