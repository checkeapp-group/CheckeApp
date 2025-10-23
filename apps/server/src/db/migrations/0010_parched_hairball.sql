CREATE TABLE `auth_verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp,
	`updatedAt` timestamp,
	CONSTRAINT `auth_verification_id` PRIMARY KEY(`id`)
);
