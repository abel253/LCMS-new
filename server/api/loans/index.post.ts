// server/api/loans/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const itemId = Number(body.itemId)
    const userId = body.userId ? String(body.userId).trim() : null
    const loanType = String(body.loanType || 'LONG').toUpperCase() // SHORT | LONG
    
    // Duration in days: Short borrow default 3 days, Long borrow default 14 days
    let durationDays = Number(body.durationDays)
    if (!durationDays || isNaN(durationDays)) {
      durationDays = loanType === 'SHORT' ? 3 : 14
    }

    if (!itemId || isNaN(itemId)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid Book Item is required' })
    }

    // መጽሐፉን መፈለግና ቅጂ መኖሩን ማረጋገጥ
    const item = await prisma.item.findUnique({
      where: { itemId },
    })

    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Book not found' })
    }

    if ((item.availableQuantity ?? 0) <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'መጽሐፉ አልቋል እባክዎ እስኪመለስ ድረስ ትንሽ ይጠብቁ! (Sorry, this book is out of stock. Please wait until a copy is returned.)' })
    }

    // Verify patron or create walk-in student record if not registered
    let finalUserId: string | null = null
    if (userId) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: userId },
            { name: { contains: userId } },
          ],
        },
      })
      if (user) {
        finalUserId = user.userId
      } else {
        const cleanId = userId.replace(/\s+/g, '').toUpperCase()
        try {
          const created = await prisma.user.create({
            data: {
              userId: cleanId,
              name: body.studentName || body.borrowerName || `Student ${cleanId}`,
              email: body.studentEmail || `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.mkau.edu.et`,
              passwordHash: '$2a$10$Defau1tHashForPatronUserPassw0rd!',
              userType: 'Student',
              department: body.department || 'Undergraduate Department',
              status: 'ABLE_TO_BORROW',
            },
          })
          finalUserId = created.userId
        } catch {
          const firstUser = await prisma.user.findFirst()
          finalUserId = firstUser ? firstUser.userId : null
        }
      }
    } else {
      const firstUser = await prisma.user.findFirst()
      finalUserId = firstUser ? firstUser.userId : null
    }

    const issueDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + durationDays)

    // Create loan transaction and decrement item available quantity
    const [tx, updatedItem] = await prisma.$transaction([
      prisma.borrowTransaction.create({
        data: {
          userId: finalUserId,
          itemId,
          issueDate,
          dueDate,
          status: 'ISSUED',
          fineAmount: 0,
        },
      }),
      prisma.item.update({
        where: { itemId },
        data: {
          availableQuantity: { decrement: 1 },
          status: item.availableQuantity && item.availableQuantity <= 1 ? 'BORROWED' : item.status,
        },
      }),
    ])

    return {
      success: true,
      message: `Book successfully checked out for ${durationDays} days under ${loanType === 'SHORT' ? 'Short Loan (1-3 Days)' : 'Long Loan (14-30 Days)'}!`,
      transaction: tx,
    }
  } catch (error: any) {
    console.error('Issue loan error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to issue loan',
    })
  }
})
