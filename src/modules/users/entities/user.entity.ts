import { Exclude, Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class UserEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;

  username: string;
  email: string;

  @Exclude()
  passwordHash: string | null;

  role: UserRole;
  status: UserStatus;

  @Exclude()
  inviteToken: string | null;

  @Exclude()
  inviteTokenExpiresAt: Date | null;

  // For nested relations
  @Type(() => ProfileEntity)
  profile?: ProfileEntity | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export class ProfileEntity {
  fullName: string | null;

  constructor(partial: Partial<ProfileEntity>) {
    Object.assign(this, partial);
  }
}
