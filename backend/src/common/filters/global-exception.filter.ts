import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    try {
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        
        if (typeof exceptionResponse === 'object') {
          message = (exceptionResponse as any).message || exception.message;
          code = (exceptionResponse as any).error || 'HTTP_EXCEPTION';
        } else {
          message = exceptionResponse as string;
        }
      } else if (exception instanceof Error) {
        if (exception.name === 'AggregateError') {
          // Handle aggregate errors (multiple errors)
          const aggregateErr = exception as AggregateError;
          const errors = aggregateErr.errors?.map((e: any) => e?.message || String(e)) || [];
          message = `Multiple errors occurred: ${errors.join(', ')}`;
          code = 'AGGREGATE_ERROR';
        } else if (exception.message?.includes('ECONNREFUSED')) {
          message = 'Service connection error';
          code = 'CONNECTION_ERROR';
          status = HttpStatus.SERVICE_UNAVAILABLE;
        } else if (exception.message?.includes('Redis')) {
          message = 'Cache service unavailable';
          code = 'REDIS_ERROR';
          status = HttpStatus.SERVICE_UNAVAILABLE;
        } else {
          message = exception.message || 'Unknown error occurred';
          code = 'INTERNAL_SERVER_ERROR';
        }
        this.logger.error(`[${code}] ${message}`, exception);
      } else {
        message = String(exception);
        this.logger.error('Unknown exception type:', exception);
      }
    } catch (filterError) {
      this.logger.error('Error in GlobalExceptionFilter:', filterError);
      message = 'Critical system error';
      code = 'FILTER_ERROR';
    }

    const apiResponse: ApiResponse = {
      status: 'error',
      message,
      code,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(apiResponse);
  }
}
