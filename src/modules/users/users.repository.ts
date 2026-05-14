import { Injectable } from '@nestjs/common';
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
    return this.prisma.user.findUnique({ where: { id } });
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
  }) {
    const { skip, take, role, roles, status, search } = options;

    const where: any = {
      deletedAt: null,
      ...(status && { status }),
      ...(roles?.length ? { role: { in: roles } } : role ? { role } : {}),
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

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
