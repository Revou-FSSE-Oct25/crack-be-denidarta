import { Expose } from 'class-transformer';

export class ResponseProfileDto {
  // Profile fields
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() fullName: string | null;
  @Expose() phoneNumber: string | null;
  @Expose() dateOfBirth: Date | null;
  @Expose() gender: string | null;
  @Expose() streetAddress: string | null;
  @Expose() fullAddress: string | null;
  @Expose() city: string | null;
  @Expose() province: string | null;
  @Expose() district: string | null;
  @Expose() subdistrict: string | null;
  @Expose() postalCode: string | null;
  @Expose() country: string | null;
  @Expose() timezone: string | null;
  @Expose() avatarUrl: string | null;
  @Expose() linkedinUrl: string | null;
  @Expose() githubUrl: string | null;
  @Expose() personalWebsite: string | null;
  @Expose() shortBio: string | null;
  @Expose() currentOccupation: string | null;
  @Expose() company: string | null;
  @Expose() highestEducation: string | null;
  @Expose() fieldOfStudy: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  // StudentProfile fields (merged flat, null if not a student)
  @Expose() nim: string | null;
  @Expose() enrollmentYear: number | null;
  @Expose() major: string | null;
  @Expose() faculty: string | null;
  @Expose() currentSemester: number | null;
  @Expose() gpa: unknown | null;
  @Expose() academicStatus: string | null;
}
