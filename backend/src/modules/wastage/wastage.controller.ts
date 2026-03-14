import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WastageService } from './wastage.service';
import { CreateWastageEntryDto } from './dto/wastage.dto';

@ApiTags('Wastage')
@ApiBearerAuth()
@Controller('wastage')
export class WastageController {
  constructor(private readonly wastageService: WastageService) {}

  @Post()
  @ApiOperation({ summary: 'Log wastage entry' })
  async logWastage(@Body() createDto: CreateWastageEntryDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.wastageService.logWastage(createDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get wastage entries' })
  async getWastage(@Query('outlet_id') outlet_id: string) {
    return this.wastageService.getByOutlet(outlet_id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get wastage analytics' })
  async getAnalytics(@Query('outlet_id') outlet_id: string) {
    return this.wastageService.getWastageAnalytics(outlet_id);
  }
}
