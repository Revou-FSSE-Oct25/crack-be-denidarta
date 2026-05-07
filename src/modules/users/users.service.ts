import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

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

  findOne(id: string) {
    return this.userRepository.findOne(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findByInviteToken(inviteToken: string) {
    return this.userRepository.findByInviteToken(inviteToken);
  }

  findAllPaginated(
    skip: number,
    take: number,
    role?: string,
    search?: string,
    roles?: string[],
  ) {
    return this.userRepository.findAllPaginated(
      skip,
      take,
      role,
      search,
      roles,
    );
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
