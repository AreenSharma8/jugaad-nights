import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    // In real implementation, get created_by from request context
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.usersService.create(createUserDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query('outlet_id') outlet_id?: string) {
    return this.usersService.findAll(outlet_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.usersService.update(id, updateUserDto, updated_by);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    await this.usersService.remove(id, updated_by);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  async assignRoles(
    @Param('id') id: string,
    @Body() { role_ids }: { role_ids: string[] },
  ) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.usersService.assignRoles(id, role_ids, updated_by);
  }
}
