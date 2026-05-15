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
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ClassSessionsService } from './class-sessions.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Controller('class-sessions')
export class ClassSessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @Post()
  @Roles(UserRole.instructor, UserRole.admin)
  async create(@Body() createClassSessionDto: CreateClassSessionDto) {
    return singleResponse(
      await this.classSessionsService.create(createClassSessionDto),
    );
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    return this.classSessionsService.findAll(query, user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.classSessionsService.findOne(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassSessionDto: UpdateClassSessionDto,
  ) {
    return singleResponse(
      await this.classSessionsService.update(id, updateClassSessionDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.classSessionsService.remove(id));
  }
}
