// server/utils/paymentProofs.ts
// In-memory cache + persistent fallback for penalty payment slips across sessions

export interface PaymentProof {
  transactionId: number
  userId?: string
  studentName?: string
  bookTitle?: string
  paymentMethod: string
  bankName?: string
  accountNumber?: string
  txnReference: string
  fineAmount: number
  receiptScreenshot?: string | null
  studentNote?: string
  verifiedBy?: string | null
  verifiedAt?: string | null
  submittedAt: string
  status: 'PAID_PENDING_VERIFICATION' | 'VERIFIED_PAID' | 'WAIVED'
}

declare global {
  var __globalPaymentProofs: Map<number, PaymentProof> | undefined
}

if (!globalThis.__globalPaymentProofs) {
  globalThis.__globalPaymentProofs = new Map<number, PaymentProof>()
}

export const paymentProofsCache = globalThis.__globalPaymentProofs

export const savePaymentProofCache = (transactionId: number, proof: PaymentProof) => {
  paymentProofsCache.set(Number(transactionId), proof)
}

export const getPaymentProofCache = (transactionId: number): PaymentProof | undefined => {
  return paymentProofsCache.get(Number(transactionId))
}

export const getAllPaymentProofsCache = (): Map<number, PaymentProof> => {
  return paymentProofsCache
}
