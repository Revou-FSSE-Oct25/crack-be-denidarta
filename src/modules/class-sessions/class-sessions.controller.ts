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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  paginationParams,
  paginatedResponse,
} from '../../common/utils/pagination.util';
import { ClassSessionsService } from './class-sessions.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Controller('class-sessions')
export class ClassSessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @Post()
  @Roles(UserRole.instructor, UserRole.admin)
  create(@Body() createClassSessionDto: CreateClassSessionDto) {
    return this.classSessionsService.create(createClassSessionDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const params = paginationParams({ page, limit });
    const [data, total] = await this.classSessionsService.findAll(
      params,
      user!,
    );
    return paginatedResponse(data, total, params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classSessionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassSessionDto: UpdateClassSessionDto,
  ) {
    return this.classSessionsService.update(id, updateClassSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classSessionsService.remove(id);
  }
}
