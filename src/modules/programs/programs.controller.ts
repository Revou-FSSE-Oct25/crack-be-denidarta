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
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  async create(@Body() createProgramDto: CreateProgramDto) {
    return singleResponse(await this.programsService.create(createProgramDto));
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.programsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.programsService.findOne(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return singleResponse(
      await this.programsService.update(id, updateProgramDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.programsService.remove(id));
  }
}
