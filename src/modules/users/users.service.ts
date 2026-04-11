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

  findOne(id: number) {
    return this.userRepository.findOne(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findByInviteToken(inviteToken: string) {
    return this.userRepository.findByInviteToken(inviteToken);
  }

  // ---- Update ----

  update(id: number, dto: UpdateUserDto) {
    return this.userRepository.update(id, dto);
  }

  setInviteToken(id: number, inviteToken: string, inviteTokenExpiresAt: Date) {
    return this.userRepository.inviteUser(
      id,
      inviteToken,
      inviteTokenExpiresAt,
    );
  }

  activateUser(id: number, hashedPassword: string) {
    return this.userRepository.activateUser(id, hashedPassword);
  }

  // ---- Delete ----

  remove(id: number) {
    return this.userRepository.remove(id);
  }
}
