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
import {
  paginationParams,
  paginatedResponse,
} from '../../common/utils/pagination.util';

@Controller('learning-materials')
export class LearningMaterialsController {
  constructor(
    private readonly learningMaterialsService: LearningMaterialsService,
  ) {}

  @Post()
  create(@Body() createLearningMaterialDto: CreateLearningMaterialDto) {
    return this.learningMaterialsService.create(createLearningMaterialDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const params = paginationParams({ page, limit });
    const [data, total] = await this.learningMaterialsService.findAll(
      params.skip,
      params.take,
      search,
    );
    return paginatedResponse(data, total, params);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.learningMaterialsService.findByCourse(courseId);
  }

  @Get('program/:programId')
  findByProgram(@Param('programId') programId: string) {
    return this.learningMaterialsService.findByProgram(programId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningMaterialsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLearningMaterialDto: UpdateLearningMaterialDto,
  ) {
    return this.learningMaterialsService.update(id, updateLearningMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningMaterialsService.remove(id);
  }
}
