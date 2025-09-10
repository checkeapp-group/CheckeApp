ALTER TABLE `critical_questions` DROP CONSTRAINT `chk_critical_questions_text_length`;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `name` text NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `emailVerified` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `critical_questions` ADD CONSTRAINT `chk_critical_questions_text_length` CHECK (CHAR_LENGTH(`critical_questions`.`question_text`) >= 5 AND CHAR_LENGTH(`critical_questions`.`question_text`) <= 200);