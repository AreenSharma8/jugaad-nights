import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * MIGRATION: AddSequentialOrderNumber
 * 
 * This migration adds fields for daily sequential order numbering.
 * - order_number: Sequential number (1, 2, 3...) that resets daily
 * - order_date: Date of order for tracking daily sequences
 */

export class AddSequentialOrderNumber1712232000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'order_number',
        type: 'integer',
        isNullable: true,
        comment: 'Sequential order number for the day (1, 2, 3...)',
      }),
    );

    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'order_date',
        type: 'date',
        isNullable: true,
        comment: 'Date of order for daily sequence tracking',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'order_date');
    await queryRunner.dropColumn('orders', 'order_number');
  }
}
