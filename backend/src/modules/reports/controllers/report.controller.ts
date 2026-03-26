import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseFilters,
  Logger,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import { GlobalExceptionFilter } from '../../../common/filters/global-exception.filter';
import { ReportService } from '../services/report.service';
import { CreateReportDto, GenerateReportDto } from '../dto/report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseFilters(GlobalExceptionFilter)
@Controller('reports')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private reportService: ReportService) {}

  @Post('generate/summary')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate summary report' })
  async generateSummaryReport(
    @Body() generateReportDto: GenerateReportDto,
  ) {
    this.logger.log(`Generating summary report for outlet: ${generateReportDto.outlet_id}`);

    const htmlContent = await this.reportService.generateSummaryReportHTML(
      generateReportDto.outlet_id,
    );

    const report = await this.reportService.generatePDFReport(
      generateReportDto.outlet_id,
      'Summary Report',
      htmlContent,
      'system',
    );

    return {
      status: 'success',
      data: report,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate/sales')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate sales report (PDF or Excel)' })
  async generateSalesReport(
    @Body() generateReportDto: GenerateReportDto,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
  ) {
    this.logger.log(
      `Generating ${format} sales report for outlet: ${generateReportDto.outlet_id}`,
    );

    const startDate = generateReportDto.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = generateReportDto.end_date || new Date();

    const salesData = await this.reportService.getSalesReport(
      generateReportDto.outlet_id,
      startDate,
      endDate,
    );

    if (format === 'excel') {
      const report = await this.reportService.generateExcelReport(
        generateReportDto.outlet_id,
        'Sales Report',
        [salesData],
        ['Order ID', 'Date', 'Amount', 'Payment Method', 'Status'],
        'system',
      );

      return {
        status: 'success',
        data: report,
        timestamp: new Date().toISOString(),
      };
    }

    // PDF format
    const htmlContent = `
      <html>
        <head><title>Sales Report</title></head>
        <body>
          <h1>Sales Report</h1>
          <p>Period: ${startDate.toDateString()} to ${endDate.toDateString()}</p>
          <p>Total Orders: ${salesData.total_orders}</p>
          <p>Total Revenue: $${salesData.total_revenue}</p>
          <p>Average Order Value: $${salesData.average_order_value}</p>
        </body>
      </html>
    `;

    const report = await this.reportService.generatePDFReport(
      generateReportDto.outlet_id,
      'Sales Report',
      htmlContent,
      'system',
    );

    return {
      status: 'success',
      data: report,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate/inventory')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate inventory report' })
  async generateInventoryReport(
    @Body() generateReportDto: GenerateReportDto,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
  ) {
    this.logger.log(
      `Generating ${format} inventory report for outlet: ${generateReportDto.outlet_id}`,
    );

    const inventoryData = await this.reportService.getInventoryReport(generateReportDto.outlet_id);

    if (format === 'excel') {
      const report = await this.reportService.generateExcelReport(
        generateReportDto.outlet_id,
        'Inventory Report',
        [inventoryData],
        ['Item Name', 'Category', 'Quantity', 'Unit Cost', 'Total Value'],
        'system',
      );

      return {
        status: 'success',
        data: report,
        timestamp: new Date().toISOString(),
      };
    }

    // PDF format
    const htmlContent = `
      <html>
        <head><title>Inventory Report</title></head>
        <body>
          <h1>Inventory Report</h1>
          <p>Total Items: ${inventoryData.total_items}</p>
          <p>Low Stock Items: ${inventoryData.low_stock_items}</p>
          <p>Total Inventory Value: $${inventoryData.total_value}</p>
        </body>
      </html>
    `;

    const report = await this.reportService.generatePDFReport(
      generateReportDto.outlet_id,
      'Inventory Report',
      htmlContent,
      'system',
    );

    return {
      status: 'success',
      data: report,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate/wastage')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate wastage report' })
  async generateWastageReport(
    @Body() generateReportDto: GenerateReportDto,
  ) {
    this.logger.log(`Generating wastage report for outlet: ${generateReportDto.outlet_id}`);

    const startDate = generateReportDto.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = generateReportDto.end_date || new Date();

    const wastageData = await this.reportService.getWastageReport(
      generateReportDto.outlet_id,
      startDate,
      endDate,
    );

    const htmlContent = `
      <html>
        <head><title>Wastage Report</title></head>
        <body>
          <h1>Wastage Report</h1>
          <p>Period: ${startDate.toDateString()} to ${endDate.toDateString()}</p>
          <p>Total Wastage Cost: $${wastageData.total_wastage_cost}</p>
          <p>Total Entries: ${wastageData.total_entries}</p>
        </body>
      </html>
    `;

    const report = await this.reportService.generatePDFReport(
      generateReportDto.outlet_id,
      'Wastage Report',
      htmlContent,
      'system',
    );

    return {
      status: 'success',
      data: report,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports for outlet' })
  @ApiQuery({ name: 'outlet_id', required: true })
  async getReports(@Query('outlet_id') outlet_id: string) {
    const reports = await this.reportService.getReportsByOutlet(outlet_id);

    return {
      status: 'success',
      data: reports,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async getReportById(@Param('id') id: string) {
    const report = await this.reportService.getReportById(id);

    return {
      status: 'success',
      data: report,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report file' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const { filePath, filename } = await this.reportService.downloadReport(id);

    res.download(filePath, filename);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async deleteReport(@Param('id') id: string) {
    const report = await this.reportService.deleteReport(id, 'system');

    return {
      status: 'success',
      data: report,
      timestamp: new Date().toISOString(),
    };
  }
}
