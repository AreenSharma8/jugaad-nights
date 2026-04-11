import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReorderLevelToInventory1712929200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory_items',
      new TableColumn({
        name: 'reorder_level',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 5,
        comment: 'Stock level threshold for sending reorder notifications to owner and head of restaurant',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory_items', 'reorder_level');
  }
}
