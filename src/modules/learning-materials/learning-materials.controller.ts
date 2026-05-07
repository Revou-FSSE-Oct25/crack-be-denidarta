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
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.learningMaterialsService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
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
