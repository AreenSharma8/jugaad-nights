import { Controller, Get, Post, Body, Patch, Delete, Param, Query, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { CreateFestivalDto, UpdateFestivalDto } from '../dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics for outlet' })
  @ApiQuery({ name: 'outlet_id', required: true })
  @ApiQuery({ name: 'force_refresh', required: false, type: Boolean })
  async getDashboardMetrics(
    @Query('outlet_id') outlet_id: string,
    @Query('force_refresh') forceRefresh: boolean = false,
  ) {
    this.logger.log(`Fetching dashboard metrics for outlet: ${outlet_id}`);

    const metrics = await this.analyticsService.getDashboardMetrics(outlet_id, forceRefresh);

    return {
      status: 'success',
      data: metrics,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Compare metrics across multiple outlets' })
  @ApiQuery({ name: 'outlet_ids', required: true, type: String })
  async getOutletComparison(@Query('outlet_ids') outlet_ids: string) {
    const outletsArray = outlet_ids.split(',');

    this.logger.log(`Comparing outlets: ${outletsArray.join(', ')}`);

    const comparison = await this.analyticsService.getOutletComparison(outletsArray);

    return {
      status: 'success',
      data: comparison,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get sales trends' })
  @ApiQuery({ name: 'outlet_id', required: true })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getSalesTrends(
    @Query('outlet_id') outlet_id: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('days') days: number = 30,
  ) {
    this.logger.log(`Fetching ${period} sales trends for outlet: ${outlet_id}`);

    const trends = await this.analyticsService.getSalesTrends(outlet_id, period, days);

    return {
      status: 'success',
      data: trends,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get revenue by payment method' })
  @ApiQuery({ name: 'outlet_id', required: true })
  async getRevenueByPaymentMethod(@Query('outlet_id') outlet_id: string) {
    this.logger.log(`Fetching payment method breakdown for outlet: ${outlet_id}`);

    const data = await this.analyticsService.getRevenueByPaymentMethod(outlet_id);

    return {
      status: 'success',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('top-items')
  @ApiOperation({ summary: 'Get top selling items' })
  @ApiQuery({ name: 'outlet_id', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopSellingItems(
    @Query('outlet_id') outlet_id: string,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(`Fetching top ${limit} items for outlet: ${outlet_id}`);

    const items = await this.analyticsService.getTopSellingItems(outlet_id, limit);

    return {
      status: 'success',
      data: items,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('inventory-health')
  @ApiOperation({ summary: 'Get inventory health score' })
  @ApiQuery({ name: 'outlet_id', required: true })
  async getInventoryHealthScore(@Query('outlet_id') outlet_id: string) {
    this.logger.log(`Fetching inventory health for outlet: ${outlet_id}`);

    const health = await this.analyticsService.getInventoryHealthScore(outlet_id);

    return {
      status: 'success',
      data: health,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('clear-cache')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear analytics cache' })
  @ApiQuery({ name: 'outlet_id', required: false })
  async clearCache(@Query('outlet_id') outlet_id?: string) {
    if (outlet_id) {
      await this.analyticsService.clearDashboardCache(outlet_id);
      this.logger.log(`Cache cleared for outlet: ${outlet_id}`);
    } else {
      await this.analyticsService.clearAllAnalyticsCaches();
      this.logger.log('All analytics caches cleared');
    }

    return {
      status: 'success',
      data: { message: 'Cache cleared successfully' },
      timestamp: new Date().toISOString(),
    };
  }

  // ========== FESTIVAL ENDPOINTS ==========

  @Post('festivals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new festival' })
  async createFestival(@Body() createFestivalDto: CreateFestivalDto) {
    this.logger.log(`Creating festival for outlet: ${createFestivalDto.outlet_id}`);
    const festival = await this.analyticsService.createFestival(createFestivalDto, '123e4567-e89b-12d3-a456-426614174000');
    
    return {
      status: 'success',
      data: festival,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('festivals')
  @ApiOperation({ summary: 'Get all festivals for an outlet' })
  @ApiQuery({ name: 'outlet_id', required: true })
  async getFestivals(@Query('outlet_id') outlet_id: string) {
    this.logger.log(`Fetching festivals for outlet: ${outlet_id}`);
    const festivals = await this.analyticsService.getFestivalsByOutlet(outlet_id);
    
    return {
      status: 'success',
      data: festivals,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('festivals/:id')
  @ApiOperation({ summary: 'Get festival by ID' })
  async getFestivalById(@Param('id') id: string) {
    this.logger.log(`Fetching festival: ${id}`);
    const festival = await this.analyticsService.getFestivalById(id);
    
    return {
      status: 'success',
      data: festival,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('festivals/:id')
  @ApiOperation({ summary: 'Update festival' })
  async updateFestival(
    @Param('id') id: string,
    @Body() updateFestivalDto: UpdateFestivalDto,
  ) {
    this.logger.log(`Updating festival: ${id}`);
    const festival = await this.analyticsService.updateFestival(
      id,
      updateFestivalDto,
      '123e4567-e89b-12d3-a456-426614174000',
    );
    
    return {
      status: 'success',
      data: festival,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('festivals/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete festival' })
  async deleteFestival(@Param('id') id: string) {
    this.logger.log(`Deleting festival: ${id}`);
    await this.analyticsService.deleteFestival(id);
    
    return {
      status: 'success',
      data: { message: 'Festival deleted successfully' },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('festivals/:id/metrics')
  @ApiOperation({ summary: 'Get festival metrics and ROI' })
  async getFestivalMetrics(
    @Param('id') id: string,
    @Query('outlet_id') outlet_id: string,
  ) {
    this.logger.log(`Fetching metrics for festival: ${id}`);
    const metrics = await this.analyticsService.getFestivalMetrics(id, outlet_id);
    
    return {
      status: 'success',
      data: metrics,
      timestamp: new Date().toISOString(),
    };
  }
}
