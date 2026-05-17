import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  // ---- Create ----

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  // ---- Read ----

  findAll() {
    return this.prisma.user.findMany({ where: { deletedAt: null } });
  }

  findByRole(role: string) {
    return this.prisma.user.findMany({
      where: { deletedAt: null, role: role as never },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        studentProfile: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByInviteToken(inviteToken: string) {
    return this.prisma.user.findUnique({ where: { inviteToken } });
  }

  async findAllPaginated(options: {
    skip: number;
    take: number;
    role?: string;
    roles?: string[];
    status?: string;
    search?: string;
    sortBy?: 'fullName' | 'createdAt' | 'email';
    sortOrder?: 'asc' | 'desc';
  }) {
    const { skip, take, role, roles, status, search, sortBy, sortOrder } =
      options;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(status && { status: status as UserStatus }),
      ...(roles?.length
        ? { role: { in: roles as UserRole[] } }
        : role
          ? { role: role as UserRole }
          : {}),
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          {
            profile: {
              fullName: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortBy === 'fullName'
        ? { profile: { fullName: sortOrder || 'asc' } }
        : sortBy === 'email'
          ? { email: sortOrder || 'asc' }
          : { createdAt: sortOrder || 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          profile: {
            select: { fullName: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  // ---- Update ----

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  inviteUser(id: string, inviteToken: string, inviteTokenExpiresAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { inviteToken, inviteTokenExpiresAt, status: 'invited' },
    });
  }

  setResetToken(id: string, resetToken: string, resetTokenExpiresAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { inviteToken: resetToken, inviteTokenExpiresAt: resetTokenExpiresAt },
    });
  }

  activateUser(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        status: 'active',
        inviteToken: null,
        inviteTokenExpiresAt: null,
      },
    });
  }

  // ---- Delete ----

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
