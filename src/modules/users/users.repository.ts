import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  findAll() {
    return this.prisma.user.findMany({ where: { deletedAt: null } });
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

  update(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
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
}
