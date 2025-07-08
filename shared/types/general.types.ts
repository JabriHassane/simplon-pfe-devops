export interface Entity {
	id: string;
	ref: string;
	createdAt: Date;
	updatedAt: Date | null;
	deletedAt: Date | null;
	createdBy: string;
	updatedBy: string | null;
	deletedBy: string | null;
}