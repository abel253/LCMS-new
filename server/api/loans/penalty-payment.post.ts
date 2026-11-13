// server/api/loans/penalty-payment.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { savePaymentProofCache } from '../../utils/paymentProofs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const transactionId = Number(body.transactionId || body.id)
    const isLibrarian = Boolean(body.isLibrarianVerification || body.action === 'VERIFY' || body.paymentMethod)
    const paymentMethod = String(body.paymentMethod || 'CBE').toUpperCase() // CASH | CBE | TELEBIRR | WAIVED
    const txnReference = String(body.txnReference || body.refNumber || (isLibrarian ? `${paymentMethod}-DESK-${Date.now().toString().slice(-6)}` : '')).trim().toUpperCase()
    const bankName = String(body.bankName || (paymentMethod === 'TELEBIRR' ? 'Telebirr' : paymentMethod === 'CASH' ? 'Cash at Desk' : 'Commercial Bank of Ethiopia (CBE)')).trim()
    const accountNumber = String(body.accountNumber || '1000345678912').trim()
    const fineAmount = Number(body.fineAmount || 0)
    const receiptScreenshot = body.receiptScreenshot || body.screenshot || ''
    const studentNote = String(body.notes || body.librarianNotes || '').trim()
    const verifiedBy = String(body.verifiedBy || body.librarianName || 'Circulation Librarian').trim()
    const verificationScore = Number(body.verificationScore || 100)
    const verificationDetails = body.verificationDetails || {}

    if (!transactionId || isNaN(transactionId)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid transaction ID is required' })
    }

    // Validation for student online submission
    if (!isLibrarian) {
      if (!txnReference) {
        throw createError({ statusCode: 400, statusMessage: 'Please enter a valid CBE Transaction Reference Number' })
      }
    }

    const tx = await prisma.borrowTransaction.findUnique({
      where: { transactionId },
      include: {
        item: true,
        user: true,
      },
    })

    if (!tx) {
      throw createError({ statusCode: 404, statusMessage: 'Borrow transaction not found' })
    }

    const statusValue = isLibrarian ? (paymentMethod === 'WAIVED' ? 'WAIVED' : 'VERIFIED_PAID') : 'PAID_PENDING_VERIFICATION'

    const proofData: any = {
      transactionId,
      userId: tx.userId,
      studentName: tx.user?.name,
      bookTitle: tx.item?.title,
      paymentMethod,
      bankName,
      accountNumber,
      txnReference,
      fineAmount,
      receiptScreenshot: receiptScreenshot || null,
      studentNote,
      verifiedBy: isLibrarian ? verifiedBy : null,
      verifiedAt: isLibrarian ? new Date().toISOString() : null,
      verificationScore,
      verificationDetails,
      isVerifiedSlip: true,
      submittedAt: new Date().toISOString(),
      status: statusValue,
    }

    // 1. Save to high-speed shared memory cache
    savePaymentProofCache(transactionId, proofData)

    // 2. AuditLog ላይ የክፍያ ማረጋገጫውን በቋሚነት ማስቀመጥ
    const actionName = isLibrarian 
      ? (paymentMethod === 'WAIVED' ? 'PENALTY_PAYMENT_WAIVED' : 'PENALTY_PAYMENT_VERIFIED') 
      : 'PENALTY_PAYMENT_SUBMITTED'

    try {
      await prisma.auditLog.create({
        data: {
          action: actionName,
          tableName: 'borrow_transactions',
          recordId: transactionId,
          userId: tx.userId,
          newData: proofData,
        },
      })
    } catch (auditErr) {
      console.warn('AuditLog save notice (fallback active):', auditErr)
    }

    return {
      success: true,
      message: isLibrarian 
        ? `Fine payment of ${fineAmount} ETB verified successfully via ${paymentMethod}. You can now complete the book return.`
        : 'Penalty payment proof submitted successfully! The librarian can now review your receipt and complete the book return.',
      data: proofData,
    }
  } catch (error: any) {
    console.error('Submit penalty payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to submit payment proof',
    })
  }
})
