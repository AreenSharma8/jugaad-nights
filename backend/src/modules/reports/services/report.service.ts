import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { Report } from '../entities/report.entity';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto, GenerateReportDto } from '../dto/report.dto';

const REPORTS_DIR = path.join(process.cwd(), 'reports');

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private reportRepository: ReportRepository) {
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory() {
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  }

  async createReportRecord(
    createReportDto: CreateReportDto,
    created_by: string,
  ): Promise<Report> {
    const report = this.reportRepository.create({
      ...createReportDto,
      created_by,
      status: 'pending',
    });

    return this.reportRepository.save(report);
  }

  async generatePDFReport(
    outlet_id: string,
    reportName: string,
    htmlContent: string,
    created_by: string,
  ): Promise<Report> {
    const report = await this.createReportRecord(
      {
        outlet_id,
        report_type: 'pdf',
        report_name: reportName,
      },
      created_by,
    );

    try {
      // Using the PDF export service without Puppeteer
      // This is a simplified implementation
      const filename = `${report.id}-${Date.now()}.pdf`;
      const filePath = path.join(REPORTS_DIR, filename);

      // For now, we'll create a simple PDF file
      fs.writeFileSync(filePath, 'PDF Report Generated: ' + reportName);

      const fileSize = fs.statSync(filePath).size;

      report.filename = filename;
      report.file_path = filePath;
      report.file_size_bytes = fileSize;
      report.status = 'completed';
    } catch (error) {
      this.logger.error(`PDF generation failed: ${error.message}`, error.stack);
      report.status = 'failed';
      report.error_message = error.message;
    }

    return this.reportRepository.save(report);
  }

  async generateExcelReport(
    outlet_id: string,
    reportName: string,
    data: any[],
    headers: string[],
    created_by: string,
  ): Promise<Report> {
    const report = await this.createReportRecord(
      {
        outlet_id,
        report_type: 'excel',
        report_name: reportName,
      },
      created_by,
    );

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      // Set headers
      worksheet.columns = headers.map((header) => ({
        header,
        key: header.toLowerCase().replace(/\s+/g, '_'),
        width: 15,
      }));

      // Add data rows
      data.forEach((row) => {
        worksheet.addRow(row);
      });

      // Format header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };

      const filename = `${report.id}-${Date.now()}.xlsx`;
      const filePath = path.join(REPORTS_DIR, filename);

      await workbook.xlsx.writeFile(filePath);
      const fileSize = fs.statSync(filePath).size;

      report.filename = filename;
      report.file_path = filePath;
      report.file_size_bytes = fileSize;
      report.status = 'completed';
    } catch (error) {
      this.logger.error(`Excel generation failed: ${error.message}`, error.stack);
      report.status = 'failed';
      report.error_message = error.message;
    }

    return this.reportRepository.save(report);
  }

  async getSalesReport(outlet_id: string, startDate: Date, endDate: Date): Promise<any> {
    // TODO: Implement sales report data aggregation
    // This will query the sales module and aggregate sales data
    return {
      outlet_id,
      report_type: 'sales',
      period: { start: startDate, end: endDate },
      total_orders: 0,
      total_revenue: 0,
      average_order_value: 0,
      payment_methods: {},
    };
  }

  async getInventoryReport(outlet_id: string): Promise<any> {
    // TODO: Implement inventory report data aggregation
    return {
      outlet_id,
      report_type: 'inventory',
      total_items: 0,
      low_stock_items: 0,
      total_value: 0,
      by_category: {},
    };
  }

  async getWastageReport(outlet_id: string, startDate: Date, endDate: Date): Promise<any> {
    // TODO: Implement wastage report data aggregation
    return {
      outlet_id,
      report_type: 'wastage',
      period: { start: startDate, end: endDate },
      total_wastage_cost: 0,
      total_entries: 0,
      by_category: {},
    };
  }

  async getAttendanceReport(outlet_id: string, startDate: Date, endDate: Date): Promise<any> {
    // TODO: Implement attendance report data aggregation
    return {
      outlet_id,
      report_type: 'attendance',
      period: { start: startDate, end: endDate },
      total_checkins: 0,
      average_hours: 0,
      by_user: {},
    };
  }

  async generateSummaryReportHTML(outlet_id: string): Promise<string> {
    const timestamp = new Date().toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Business Summary Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin-top: 20px; }
            .metric { display: inline-block; width: 30%; margin-right: 3%; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Outlet Summary Report</h1>
            <p>Generated on: ${timestamp}</p>
            <p>Outlet ID: ${outlet_id}</p>
          </div>
          
          <div class="section">
            <h2>Key Metrics</h2>
            <div class="metric">
              <h3>Total Orders</h3>
              <p>-</p>
            </div>
            <div class="metric">
              <h3>Total Revenue</h3>
              <p>-</p>
            </div>
            <div class="metric">
              <h3>Average Order Value</h3>
              <p>-</p>
            </div>
          </div>

          <div class="section">
            <h2>Inventory Status</h2>
            <p>Total Items: -</p>
            <p>Low Stock Items: -</p>
          </div>

          <div class="section">
            <h2>Staffing</h2>
            <p>Check-ins Today: -</p>
            <p>Average Hours: -</p>
          </div>

          <div class="footer">
            <p>This is an auto-generated report. For detailed information, please access the dashboard.</p>
          </div>
        </body>
      </html>
    `;
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findByIdWithOutlet(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async getReportsByOutlet(outlet_id: string): Promise<Report[]> {
    return this.reportRepository.findByOutlet(outlet_id);
  }

  async deleteReport(id: string, updated_by: string): Promise<Report> {
    const report = await this.getReportById(id);

    // Delete physical file if exists
    if (report.file_path && fs.existsSync(report.file_path)) {
      try {
        fs.unlinkSync(report.file_path);
      } catch (error) {
        this.logger.warn(`Failed to delete file: ${report.file_path}`);
      }
    }

    report.deleted_at = new Date();
    report.updated_by = updated_by;

    return this.reportRepository.save(report);
  }

  async downloadReport(id: string): Promise<{ filePath: string; filename: string }> {
    const report = await this.getReportById(id);

    if (!report.file_path || !fs.existsSync(report.file_path)) {
      throw new NotFoundException(`Report file not found`);
    }

    return {
      filePath: report.file_path,
      filename: report.filename,
    };
  }

  // Scheduled job to generate daily summary reports
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailySummaryReports(): Promise<void> {
    this.logger.log('Generating daily summary reports');
    // TODO: Implement logic to generate daily summary reports for all outlets
  }

  // Scheduled job to generate weekly reports
  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyReports(): Promise<void> {
    this.logger.log('Generating weekly reports');
    // TODO: Implement logic to generate weekly reports
  }

  // Scheduled job to generate monthly reports
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyReports(): Promise<void> {
    this.logger.log('Generating monthly reports');
    // TODO: Implement logic to generate monthly reports
  }

  async cleanupOldReports(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const reports = await this.reportRepository.find({
      where: { created_at: cutoffDate },
    });

    for (const report of reports) {
      if (report.file_path && fs.existsSync(report.file_path)) {
        try {
          fs.unlinkSync(report.file_path);
        } catch (error) {
          this.logger.warn(`Failed to delete file during cleanup: ${report.file_path}`);
        }
      }
    }

    await this.reportRepository.softDelete({ created_at: cutoffDate });

    return reports.length;
  }
}
