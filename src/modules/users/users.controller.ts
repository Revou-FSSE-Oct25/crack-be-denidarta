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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  paginationParams,
  paginatedResponse,
} from '../../common/utils/pagination.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ---- Create ----

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ---- Read ----

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (role) return this.usersService.findByRole(role);
    const params = paginationParams({ page, limit });
    const [data, total] = await this.usersService.findAllPaginated(
      params.skip,
      params.take,
    );
    return paginatedResponse(data, total, params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ---- Update ----

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // ---- Delete ----

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
