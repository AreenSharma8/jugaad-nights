import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFestivalTable1713000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'festivals',
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
            name: 'festival_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'expected_sales',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'actual_sales',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'budget',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'actual_expenses',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'planning'",
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
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['outlet_id'],
            referencedTableName: 'outlets',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
        indices: [
          {
            columnNames: ['outlet_id'],
          },
          {
            columnNames: ['status'],
          },
          {
            columnNames: ['created_at'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('festivals');
  }
}
