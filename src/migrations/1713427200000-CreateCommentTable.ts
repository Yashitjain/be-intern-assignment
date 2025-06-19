import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCommentTable1713427400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Comment table
    await queryRunner.createTable(
      new Table({
        name: 'Comment',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'integer',
            isNullable: true, // Because of onDelete: SET NULL
          },
          {
            name: 'postId',
            type: 'integer',
            isNullable: false, // Required
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'likes',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // 2. Add foreign key to users table
    await queryRunner.createForeignKey(
      'Comment',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    // 3. Add foreign key to Post table
    await queryRunner.createForeignKey(
      'Comment',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedTableName: 'Post',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('Comment');
  }
}
