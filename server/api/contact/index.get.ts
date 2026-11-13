// server/api/contact/index.get.ts
const withTimeout = <T>(promise: Promise<T>, ms = 2500): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Contact query timed out')), ms))
  ]);
};

export default defineEventHandler(async () => {
  try {
    const logs = await withTimeout(
      prisma.auditLog.findMany({
        where: {
          OR: [
            { action: 'CONTACT_INQUIRY' },
            { tableName: 'contact_inquiries' }
          ]
        },
        orderBy: { createdAt: 'desc' }
      }),
      3000
    );

    const inquiries = logs.map((l: any) => {
      const data = (typeof l.newData === 'object' && l.newData !== null) ? l.newData : {};
      return {
        id: l.logId,
        name: data.name || 'Patron / Student',
        email: data.email || 'N/A',
        phone: data.phone || 'N/A',
        studentId: data.studentId || l.userId || 'N/A',
        category: data.category || 'General Question',
        message: data.message || '',
        status: data.status || 'UNREAD', // UNREAD | RESOLVED | ESCALATED
        replyMessage: data.replyMessage || data.responseMessage || null,
        repliedBy: data.repliedBy || data.respondedBy || null,
        repliedAt: data.repliedAt || data.resolvedAt || null,
        escalationReason: data.escalationReason || data.escalationNote || null,
        escalatedBy: data.escalatedBy || null,
        escalatedAt: data.escalatedAt || null,
        isEscalated: Boolean(data.isEscalated || data.status === 'ESCALATED'),
        createdAt: l.createdAt
      };
    });

    return {
      success: true,
      data: inquiries
    };
  } catch (err: any) {
    console.error('Fetch contact inquiries error:', err);
    return {
      success: true,
      data: []
    };
  }
});
