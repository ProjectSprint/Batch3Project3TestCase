declare namespace Types {
  export enum ContactType {
    phone = 'phone',
    email = 'email',
  }

  export type User = {
    fileId?: string;
    fileUri?: string;
    bankAccountName?: string;
    bankAccountHolder?: string;
    bankAccountNumber?: string;
    imageUri?: string;
    email: string;
    phone: string;
    password: string;
    token: string;
  };

  export type File = {
    fileId: string;
    fileUri: string;
    fileThumbnailUri: string;
  }

  export type Product = {
    productId: string;
    name: string;
    category: string;
    qty: number;
    price: number;
    sku: string;
    fileId: string;
    fileUri?: string;
    fileThumbnailUri?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export type PurchaseRequest = {
    purchasedItems: Array<{
      productId: string;
      qty: number;
    }>;
    senderName: string | null;
    senderContactType: ContactType;
    senderContactDetail: string;
  }

  export type PurchaseResponse = {
    purchasedItems: Array<Product>;
    totalPrice: number;
    paymentDetails: {
      bankAccountName: string;
      bankAccountHolder: string;
      bankAccountNumber: string;
      totalPrice: number;
    }
  }

}
