export interface User {
	_id: string;
	email?: string;
	phone?: string;
	password: string;
	fileId?: string;
	fileUri?: string;
	fileThumbnailUri?: string;
	bankAccountName?: string;
	bankAccountHolder?: string;
	bankAccountNumber?: string;
}

export interface UserCredential {
	_id: string;
	email: string;
	phone: string;
	password: string;
}
