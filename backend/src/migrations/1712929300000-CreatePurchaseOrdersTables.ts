import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePurchaseOrdersTables1712929300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create purchase_orders table
    await queryRunner.createTable(
      new Table({
        name: 'purchase_orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'outlet_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'po_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'supplier_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'order_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'delivery_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'total_amount',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'Pending'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['outlet_id'] }),
          new TableIndex({ columnNames: ['po_number'] }),
          new TableIndex({ columnNames: ['status'] }),
        ],
      }),
      true,
    );

    // Create purchase_order_items table
    await queryRunner.createTable(
      new Table({
        name: 'purchase_order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'purchase_order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'item_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'unit_price',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [new TableIndex({ columnNames: ['purchase_order_id'] })],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'purchase_order_items',
      new TableForeignKey({
        columnNames: ['purchase_order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchase_orders',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('purchase_order_items');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('purchase_order_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('purchase_order_items', foreignKey);
    }

    // Drop tables
    await queryRunner.dropTable('purchase_order_items', true);
    await queryRunner.dropTable('purchase_orders', true);
  }
}
