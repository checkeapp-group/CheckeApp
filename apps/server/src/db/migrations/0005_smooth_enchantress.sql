ALTER TABLE `user` ADD `is_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` ADD `share_token` varchar(36);--> statement-breakpoint
ALTER TABLE `verification` ADD CONSTRAINT `verification_share_token_unique` UNIQUE(`share_token`);--> statement-breakpoint
CREATE INDEX `idx_verification_share_token` ON `verification` (`share_token`);