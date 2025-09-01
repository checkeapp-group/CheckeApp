CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL,
	`password` varchar(255) NOT NULL,
	`image` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`original_text` text NOT NULL,
	`status` enum('draft','processing_questions','sources_ready','generating_summary','completed','error') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_verification_original_text_length` CHECK(CHAR_LENGTH(`verification`.`original_text`) >= 10 AND CHAR_LENGTH(`verification`.`original_text`) <= 5000)
);
--> statement-breakpoint
CREATE TABLE `critical_questions` (
	`id` varchar(36) NOT NULL,
	`verification_id` varchar(36) NOT NULL,
	`question_text` text NOT NULL,
	`original_question` text NOT NULL,
	`is_edited` boolean NOT NULL DEFAULT false,
	`order_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `critical_questions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_critical_questions_verification_order` UNIQUE(`verification_id`,`order_index`),
	CONSTRAINT `chk_critical_questions_order_index` CHECK(`critical_questions`.`order_index` >= 0),
	CONSTRAINT `chk_critical_questions_text_length` CHECK(CHAR_LENGTH(`critical_questions`.`question_text`) >= 5 AND CHAR_LENGTH(`critical_questions`.`question_text`) <= 1000)
);
--> statement-breakpoint
CREATE TABLE `final_results` (
	`id` varchar(36) NOT NULL,
	`verification_id` varchar(36) NOT NULL,
	`final_text` text NOT NULL,
	`labels_json` json,
	`citations_json` json,
	`answers_json` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `final_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `final_results_verification_id_unique` UNIQUE(`verification_id`),
	CONSTRAINT `chk_final_results_text_length` CHECK(CHAR_LENGTH(`final_results`.`final_text`) >= 10),
	CONSTRAINT `chk_final_results_labels_json` CHECK(`final_results`.`labels_json` IS NULL OR JSON_VALID(`final_results`.`labels_json`)),
	CONSTRAINT `chk_final_results_citations_json` CHECK(`final_results`.`citations_json` IS NULL OR JSON_VALID(`final_results`.`citations_json`)),
	CONSTRAINT `chk_final_results_answers_json` CHECK(`final_results`.`answers_json` IS NULL OR JSON_VALID(`final_results`.`answers_json`))
);
--> statement-breakpoint
CREATE TABLE `process_logs` (
	`id` varchar(36) NOT NULL,
	`verification_id` varchar(36) NOT NULL,
	`step` varchar(100) NOT NULL,
	`status` enum('started','completed','error') NOT NULL,
	`error_message` text,
	`api_response` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `process_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_process_logs_error_message` CHECK((`process_logs`.`status` = 'error' AND `process_logs`.`error_message` IS NOT NULL) OR (`process_logs`.`status` != 'error')),
	CONSTRAINT `chk_process_logs_step_length` CHECK(CHAR_LENGTH(`process_logs`.`step`) >= 1 AND CHAR_LENGTH(`process_logs`.`step`) <= 100),
	CONSTRAINT `chk_process_logs_api_response` CHECK(`process_logs`.`api_response` IS NULL OR JSON_VALID(`process_logs`.`api_response`))
);
--> statement-breakpoint
CREATE TABLE `source` (
	`id` varchar(36) NOT NULL,
	`verification_id` varchar(36) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`title` varchar(500),
	`summary` text,
	`domain` varchar(255),
	`is_selected` boolean NOT NULL DEFAULT false,
	`scraping_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `source_id` PRIMARY KEY(`id`),
	CONSTRAINT `chk_source_url_length` CHECK(CHAR_LENGTH(`source`.`url`) > 0 AND CHAR_LENGTH(`source`.`url`) <= 2048),
	CONSTRAINT `chk_source_url_format` CHECK(`source`.`url` REGEXP '^https?://[^\s/$.?#].[^\s]*$')
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verification` ADD CONSTRAINT `verification_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `critical_questions` ADD CONSTRAINT `critical_questions_verification_id_verification_id_fk` FOREIGN KEY (`verification_id`) REFERENCES `verification`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `final_results` ADD CONSTRAINT `final_results_verification_id_verification_id_fk` FOREIGN KEY (`verification_id`) REFERENCES `verification`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `process_logs` ADD CONSTRAINT `process_logs_verification_id_verification_id_fk` FOREIGN KEY (`verification_id`) REFERENCES `verification`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source` ADD CONSTRAINT `source_verification_id_verification_id_fk` FOREIGN KEY (`verification_id`) REFERENCES `verification`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_verification_user_id` ON `verification` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_verification_status` ON `verification` (`status`);--> statement-breakpoint
CREATE INDEX `idx_verification_created_at` ON `verification` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_verification_user_status` ON `verification` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_critical_questions_verification_id` ON `critical_questions` (`verification_id`);--> statement-breakpoint
CREATE INDEX `idx_critical_questions_order` ON `critical_questions` (`verification_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `idx_final_results_verification_id` ON `final_results` (`verification_id`);--> statement-breakpoint
CREATE INDEX `idx_final_results_created_at` ON `final_results` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_process_logs_verification_id` ON `process_logs` (`verification_id`);--> statement-breakpoint
CREATE INDEX `idx_process_logs_step_status` ON `process_logs` (`verification_id`,`step`,`status`);--> statement-breakpoint
CREATE INDEX `idx_process_logs_created_at` ON `process_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_process_logs_status_created` ON `process_logs` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_source_verification_id` ON `source` (`verification_id`);--> statement-breakpoint
CREATE INDEX `idx_source_domain` ON `source` (`domain`);--> statement-breakpoint
CREATE INDEX `idx_source_is_selected` ON `source` (`verification_id`,`is_selected`);--> statement-breakpoint
CREATE INDEX `idx_source_created_at` ON `source` (`created_at`);