import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ---- Create ----

  create(dto: CreateUserDto) {
    return this.userRepository.create(dto);
  }

  // ---- Read ----

  findAll() {
    return this.userRepository.findAll();
  }

  findByRole(role: string) {
    return this.userRepository.findByRole(role);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);
    return ensureFound(user, `User ${id} not found`);
  }

  async findMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        studentProfile: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findByInviteToken(inviteToken: string) {
    return this.userRepository.findByInviteToken(inviteToken);
  }

  findAllPaginated(options: {
    skip: number;
    take: number;
    role?: string;
    search?: string;
    roles?: string[];
    status?: string;
  }) {
    return this.userRepository.findAllPaginated(options);
  }

  // ---- Update ----

  update(id: string, dto: UpdateUserDto) {
    return this.userRepository.update(id, dto);
  }

  setInviteToken(id: string, inviteToken: string, inviteTokenExpiresAt: Date) {
    return this.userRepository.inviteUser(
      id,
      inviteToken,
      inviteTokenExpiresAt,
    );
  }

  activateUser(id: string, hashedPassword: string) {
    return this.userRepository.activateUser(id, hashedPassword);
  }

  // ---- Delete ----

  remove(id: string) {
    return this.userRepository.remove(id);
  }
}
