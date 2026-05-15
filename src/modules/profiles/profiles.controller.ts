import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // ---- Create ----

  @Post('users/:userId')
  async create(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return singleResponse(
      await this.profilesService.create(userId, createProfileDto),
    );
  }

  // ---- Read ----

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.profilesService.findAll(query);
  }

  @Get('me')
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return singleResponse(await this.profilesService.findByUserId(user.sub));
  }

  @Get('users/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return singleResponse(await this.profilesService.findByUserId(userId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.profilesService.findOne(id));
  }

  // ---- Update ----

  @Patch('me')
  async upsertMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return singleResponse(
      await this.profilesService.upsertByUserId(user.sub, updateProfileDto),
    );
  }

  @Patch('users/:userId')
  async upsertByUserId(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return singleResponse(
      await this.profilesService.upsertByUserId(userId, updateProfileDto),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return singleResponse(
      await this.profilesService.update(id, updateProfileDto),
    );
  }

  // ---- Delete ----

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.profilesService.remove(id));
  }
}
