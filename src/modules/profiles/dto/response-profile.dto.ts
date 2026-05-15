import { Expose } from 'class-transformer';

export class ResponseProfileDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() fullName: string | null;
  @Expose() bio: string | null;
  @Expose() avatarUrl: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
