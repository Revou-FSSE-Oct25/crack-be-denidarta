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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResponseAssignmentDto } from './dto/response-assignment.dto';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  async create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.assignmentsService.create(createAssignmentDto, currentUser),
    );
  }

  @Get()
  @ApiOkResponse({
    type: ResponseAssignmentDto,
    isArray: true,
    description: 'Paginated list of assignments',
  })
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    return this.assignmentsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseAssignmentDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return singleResponse(await this.assignmentsService.findOne(id, user));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return singleResponse(
      await this.assignmentsService.update(id, updateAssignmentDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.assignmentsService.remove(id));
  }
}
