import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UserEntity } from './entities/user.entity';
import {
  paginationParams,
  paginatedResponse,
  singleResponse,
} from '../../common/utils/pagination.util';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ---- Create ----

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return singleResponse(new UserEntity(user));
  }

  // ---- Read ----

  @Get()
  async findAll(@Query() query: FindAllUsersDto) {
    const { role, roles: rolesParam, page, limit, search, status } = query;
    const params = paginationParams({ page, limit });
    const roles = rolesParam
      ? rolesParam
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
      : undefined;

    const { items: data, total } = await this.usersService.findAllPaginated({
      skip: params.skip,
      take: params.take,
      role,
      search,
      roles,
      status,
    });

    const items = data.map((user) => new UserEntity(user));
    return paginatedResponse(items, total, params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return singleResponse(new UserEntity(user));
  }

  // ---- Update ----

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return singleResponse(new UserEntity(user));
  }

  // ---- Delete ----

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    return singleResponse(new UserEntity(user));
  }
}
