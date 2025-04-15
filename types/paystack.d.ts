declare module '@paystack/inline-js' {
  export class PaystackPop {
    newTransaction(options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      ref?: string;
      metadata?: {
        custom_fields?: Array<{
          display_name: string;
          variable_name: string;
          value: string;
        }>;
      };
      onSuccess?: (transaction: any) => void;
      onCancel?: () => void;
    }): void;
  }
}
