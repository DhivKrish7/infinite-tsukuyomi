import { FinanceFeeType, TransactionType } from "@prisma/client";
import type { FinanceFeeQuote } from "../core/domain";

type FeeInput = {
  type: TransactionType;
  amount: string;
  currency: string;
  method?: string | null;
};

export class FinanceFeeEngine {
  quote(input: FeeInput): FinanceFeeQuote[] {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) return [];

    const percentage =
      input.type === TransactionType.WITHDRAWAL ? 0.006 : input.type === TransactionType.DEPOSIT ? 0.0035 : 0;
    const minimum = input.type === TransactionType.WITHDRAWAL ? 8 : 2;
    const fee = Math.max(amount * percentage, minimum);

    if (fee <= 0) return [];

    return [
      {
        type: input.type === TransactionType.WITHDRAWAL ? FinanceFeeType.WITHDRAWAL : FinanceFeeType.DEPOSIT,
        name: `${input.type.toLowerCase()} ${input.method ?? "standard"} processing`,
        amount: fee.toFixed(2),
        currency: input.currency,
        ruleSnapshot: {
          version: "2026.05",
          percentage,
          minimum,
          method: input.method ?? "standard"
        }
      }
    ];
  }
}

export const financeFeeEngine = new FinanceFeeEngine();
