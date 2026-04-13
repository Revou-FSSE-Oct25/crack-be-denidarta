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

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByInviteToken(inviteToken: string) {
    return this.prisma.user.findUnique({ where: { inviteToken } });
  }

  findAllPaginated(skip: number, take: number) {
    return Promise.all([
      this.prisma.user.findMany({ where: { deletedAt: null }, skip, take }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
  }

  // ---- Update ----

  update(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  inviteUser(id: number, inviteToken: string, inviteTokenExpiresAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { inviteToken, inviteTokenExpiresAt, status: 'INVITED' },
    });
  }

  activateUser(id: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        inviteToken: null,
        inviteTokenExpiresAt: null,
      },
    });
  }

  // ---- Delete ----

  remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
