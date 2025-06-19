import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePostTable1713427300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the "Post" table with userId column
    await queryRunner.createTable(
      new Table({
        name: 'Post',
        columns: [
          {
            name: 'id',
            type: 'INTEGER',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'message',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'likes',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'userId', // Required for ManyToOne relationship
            type: 'integer',
            isNullable: true, // Because of onDelete: 'SET NULL'
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
          {
            name : 'hashtags',
            type : 'vachar',
            isNullable : true
          }
        ],
      })
    );

    // 2. Add the foreign key constraint
    await queryRunner.createForeignKey(
      'Post',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createTable(new Table({
      name: "post_like_users_users",
      columns: [
          { name: "postId", type: "int", isPrimary: true },
          { name: "userId", type: "int", isPrimary: true },
      ],
      foreignKeys: [
          {
              columnNames: ["postId"],
              referencedColumnNames: ["id"],
              referencedTableName: "post",
              onDelete: "CASCADE",
          },
          {
              columnNames: ["userId"],
              referencedColumnNames: ["id"],
              referencedTableName: "users",
              onDelete: "CASCADE",
          }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('Post');
  }
}
