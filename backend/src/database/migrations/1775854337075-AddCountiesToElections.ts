import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountiesToElections1775854337075 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "elections" ADD COLUMN "counties" text[] DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "elections" DROP COLUMN "counties"`);
    }

}
