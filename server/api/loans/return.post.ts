// server/api/loans/return.post.ts
import { savePaymentProofCache, getPaymentProofCache } from '../../utils/paymentProofs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const transactionId = Number(body.transactionId || body.id)
    const condition = String(body.condition || 'Good Condition').trim()
    const librarianNotes = String(body.notes || body.librarianNotes || '').trim()
    const librarianName = String(body.librarianName || 'Circulation Librarian').trim()

    if (!transactionId || isNaN(transactionId)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid transaction ID is required' })
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

    if (tx.status === 'RETURNED') {
      return {
        success: true,
        alreadyReturned: true,
        message: 'This book has already been returned',
        receiptNo: `RET-${new Date(tx.returnDate || tx.dueDate).getFullYear()}-${String(tx.transactionId).padStart(5, '0')}`,
        returnDate: tx.returnDate || tx.dueDate,
        fineAmount: Number(tx.fineAmount || 0),
      }
    }

    const returnDate = new Date()
    const dueDate = new Date(tx.dueDate)
    let fineAmount = 0

    // ያረፈደ ከሆነ የቅጣት ሂሳብ ማስላት (Calculate penalty if overdue)
    if (returnDate.getTime() > dueDate.getTime()) {
      const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const diffDays = Math.round((dueDate.getTime() - new Date(tx.issueDate).getTime()) / (1000 * 60 * 60 * 24))
      const isShortLoan = diffDays <= 4
      const rate = isShortLoan ? 2.0 : 1.0 // 2 ETB / day for Short, 1 ETB / day for Long
      fineAmount = daysOverdue * rate
    }

    const receiptNo = `RET-${returnDate.getFullYear()}-${String(tx.transactionId).padStart(5, '0')}`

    // Update memory payment proof state to VERIFIED_PAID
    const existingProof = getPaymentProofCache(transactionId)
    if (existingProof) {
      existingProof.status = 'VERIFIED_PAID'
      existingProof.verifiedBy = librarianName
      existingProof.verifiedAt = returnDate.toISOString()
      savePaymentProofCache(transactionId, existingProof)
    }

    // 1. መጽሐፉን መመለስ እና የመጽሐፉን Available Quantity በ 1 መጨመር
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.borrowTransaction.update({
        where: { transactionId },
        data: {
          status: 'RETURNED',
          returnDate,
          fineAmount,
        },
      })

      if (tx.itemId) {
        await prismaTx.item.update({
          where: { itemId: tx.itemId },
          data: {
            availableQuantity: { increment: 1 },
            status: 'AVAILABLE',
          },
        })
      }

      // 2. የመመለሻ ማረጋገጫ ደረሰኝ በ AuditLog ውስጥ ማስቀመጥ (Official Return Clearance Record)
      await prismaTx.auditLog.create({
        data: {
          tableName: 'borrow_transactions',
          recordId: transactionId,
          action: 'BOOK_RETURN_CONFIRMED',
          oldData: {
            status: tx.status,
            dueDate: tx.dueDate,
          },
          newData: {
            receiptNo,
            returnDate: returnDate.toISOString(),
            fineAmount,
            finePaymentMethod: body.paymentMethod || (fineAmount > 0 ? 'DESK_VERIFIED' : 'NO_FINE'),
            finePaymentReceipt: body.paymentReceipt || 'CLEARED',
            condition,
            librarianNotes,
            librarianName,
            borrowerId: tx.userId,
            borrowerName: tx.user?.name,
            bookTitle: tx.item?.title,
          },
        },
      })
    })

    const receiptData = {
      receiptNo,
      transactionId: tx.transactionId,
      bookTitle: tx.item?.title || 'Library Item',
      author: tx.item?.author || 'N/A',
      isbn: tx.item?.isbn || 'N/A',
      studentName: tx.user?.name || 'Student Borrower',
      studentId: tx.userId || 'N/A',
      issueDate: tx.issueDate,
      dueDate: tx.dueDate,
      returnDate: returnDate.toISOString(),
      fineAmount,
      condition,
      librarianName,
      status: 'RETURNED',
    }

    return {
      success: true,
      receiptNo,
      returnDate: returnDate.toISOString().split('T')[0],
      fineAmount,
      receipt: receiptData,
      message: fineAmount > 0
        ? `Book returned successfully! An overdue penalty of ${fineAmount} ETB has been calculated. Receipt No: ${receiptNo}`
        : `Book returned on time and in good condition! No fines assessed. Receipt No: ${receiptNo}`,
    }
  } catch (error: any) {
    console.error('Process return error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to process return',
    })
  }
})
