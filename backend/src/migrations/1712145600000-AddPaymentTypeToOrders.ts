import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * MIGRATION: AddPaymentTypeToOrders
 * 
 * This migration adds the payment_type column to the orders table.
 * This field stores the payment method for each order (Cash, Card, Online, Part Payment).
 * 
 * - Column: payment_type (varchar, nullable)
 * - Default value: null
 * - Used to track which payment method was used for the order
 */

export class AddPaymentTypeToOrders1712145600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'payment_type',
        type: 'varchar',
        isNullable: true,
        default: null,
        comment: 'Payment method: Cash, Card, Online, Part Payment',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'payment_type');
  }
}
