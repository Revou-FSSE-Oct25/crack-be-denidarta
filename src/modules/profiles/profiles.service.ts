import { Injectable } from '@nestjs/common';
import { ProfilesRepository } from './profiles.repository';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  // ---- Create ----

  create(userId: number, dto: CreateProfileDto) {
    return this.profilesRepository.create(userId, dto);
  }

  // ---- Read ----

  findAll() {
    return this.profilesRepository.findAll();
  }

  findOne(id: number) {
    return this.profilesRepository.findOne(id);
  }

  findByUserId(userId: number) {
    return this.profilesRepository.findByUserId(userId);
  }

  // ---- Update ----

  update(id: number, dto: UpdateProfileDto) {
    return this.profilesRepository.update(id, dto);
  }

  upsertByUserId(userId: number, dto: UpdateProfileDto) {
    return this.profilesRepository.upsertByUserId(userId, dto);
  }

  // ---- Delete ----

  remove(id: number) {
    return this.profilesRepository.remove(id);
  }
}
