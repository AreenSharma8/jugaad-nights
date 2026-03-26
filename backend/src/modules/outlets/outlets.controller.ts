import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { CreateOutletDto, UpdateOutletDto } from './dto/outlet.dto';

@ApiTags('Outlets')
@ApiBearerAuth()
@Controller('outlets')
export class OutletsController {
  private readonly logger = new Logger(OutletsController.name);

  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new outlet' })
  @ApiResponse({ status: 201, description: 'Outlet created successfully' })
  async create(@Body() createOutletDto: CreateOutletDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.outletsService.create(createOutletDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get all outlets' })
  @ApiResponse({ status: 200, description: 'Outlets retrieved successfully' })
  async findAll() {
    return this.outletsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an outlet by ID' })
  @ApiResponse({ status: 200, description: 'Outlet retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.outletsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an outlet' })
  @ApiResponse({ status: 200, description: 'Outlet updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateOutletDto: UpdateOutletDto,
  ) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.outletsService.update(id, updateOutletDto, updated_by);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an outlet' })
  @ApiResponse({ status: 200, description: 'Outlet deleted successfully' })
  async remove(@Param('id') id: string) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    await this.outletsService.remove(id, updated_by);
    return { message: 'Outlet deleted successfully' };
  }
}
