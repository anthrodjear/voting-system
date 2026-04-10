import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegistrationStatusToVoters1775793037178 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "voters" 
            ADD COLUMN "registration_status" varchar(20) NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`CREATE INDEX "idx_voters_registration_status" ON "voters" ("registration_status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_voters_registration_status"`);
        await queryRunner.query(`ALTER TABLE "voters" DROP COLUMN "registration_status"`);
    }

}
