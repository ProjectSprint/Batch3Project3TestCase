import { hashPassword, isValidEmail, isValidPhone } from "./helper.auth.ts";

export class User {
  id: string;
  email: string;
  phone: string;
  fileId: string;
  password: string;
  fileUri: string;
  fileThumbnailUri: string;
  bankAccountName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;


  constructor(data?: Partial<User>) {
    this.id = data?.id ?? "";
    this.email = data?.email ?? "";
    this.phone = data?.phone ?? "";
    this.password = data?.password ?? "";
    this.fileId = data?.fileId ?? "";
    this.fileUri = data?.fileUri ?? "";
    this.fileThumbnailUri = data?.fileThumbnailUri ?? "";
    this.bankAccountName = data?.bankAccountName ?? "";
    this.bankAccountHolder = data?.bankAccountHolder ?? "";
    this.bankAccountNumber = data?.bankAccountNumber ?? "";
    this.validate()
  }

}
export class EmailDTO {
  email: string;
  password: string;

  constructor(data: { email?: string; password?: string } = {}) {
    this.email = data.email || "";
    this.password = data.password || "";
  }

  validate(): string[] {
    const errors: string[] = [];

    if (this.email === "") errors.push("Email wajib diisi");
    else if (!isValidEmail(this.email)) errors.push("Email tidak valid");

    if (this.password === "") errors.push("Password wajib diisi");

    return errors;
  }
}

export class PhoneDTO {
  phone: string;
  password: string;

  constructor(data: { phone?: string; password?: string } = {}) {
    this.phone = data.phone || "";
    this.password = data.password || "";
  }

  validate(): string[] {
    const errors: string[] = [];

    if (this.phone === "") errors.push("Phone wajib diisi");
    else if (!isValidPhone(this.phone)) errors.push("Phone tidak valid");

    if (this.password === "") errors.push("Password wajib diisi");

    return errors;
  }
}
