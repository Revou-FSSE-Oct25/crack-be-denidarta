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
import { LearningMaterialsService } from './learning-materials.service';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('learning-materials')
export class LearningMaterialsController {
  constructor(
    private readonly learningMaterialsService: LearningMaterialsService,
  ) {}

  @Post()
  async create(@Body() createLearningMaterialDto: CreateLearningMaterialDto) {
    return singleResponse(
      await this.learningMaterialsService.create(createLearningMaterialDto),
    );
  }

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    return this.learningMaterialsService.findAll(query, search);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.learningMaterialsService.findByCourse(courseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.learningMaterialsService.findOne(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLearningMaterialDto: UpdateLearningMaterialDto,
  ) {
    return singleResponse(
      await this.learningMaterialsService.update(id, updateLearningMaterialDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.learningMaterialsService.remove(id));
  }
}
