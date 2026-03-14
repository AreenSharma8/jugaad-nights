import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CashFlowService } from './cashflow.service';
import { CreateCashFlowEntryDto } from './dto/cashflow.dto';

@ApiTags('Cash Flow')
@ApiBearerAuth()
@Controller('cash-flow')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Post()
  @ApiOperation({ summary: 'Add cash flow entry' })
  async addEntry(@Body() createDto: CreateCashFlowEntryDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.cashFlowService.addEntry(createDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get cash flow entries' })
  async getEntries(@Query('outlet_id') outlet_id: string) {
    return this.cashFlowService.getByOutlet(outlet_id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get cash flow summary' })
  async getSummary(@Query('outlet_id') outlet_id: string) {
    return this.cashFlowService.getCashFlowSummary(outlet_id);
  }
}
