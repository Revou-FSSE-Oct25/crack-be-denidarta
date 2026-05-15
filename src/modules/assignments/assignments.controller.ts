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
import { PaginatedResponse } from '../../common/utils/pagination.util';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.assignmentsService.create(createAssignmentDto, currentUser);
  }

  @Get()
  @ApiOkResponse({
    type: ResponseAssignmentDto,
    isArray: true,
    description: 'Paginated list of assignments',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<PaginatedResponse<ResponseAssignmentDto>> {
    return this.assignmentsService.findAll(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
      user!,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseAssignmentDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<ResponseAssignmentDto | null> {
    return this.assignmentsService.findOne(id, user!);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}
