// server/api/contact/[id].patch.ts
export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, 'id');
    const id = Number(idParam);
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid inquiry ID is required' });
    }

    const body = await readBody(event);
    const status = String(body.status || 'RESOLVED').toUpperCase();
    const replyMessage = body.replyMessage ? String(body.replyMessage).trim() : undefined;
    const repliedBy = body.repliedBy ? String(body.repliedBy).trim() : undefined;
    const escalationReason = body.escalationReason ? String(body.escalationReason).trim() : undefined;
    const escalatedBy = body.escalatedBy ? String(body.escalatedBy).trim() : undefined;

    const existing = await prisma.auditLog.findUnique({
      where: { logId: id }
    });

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Inquiry not found' });
    }

    const currentData = (typeof existing.newData === 'object' && existing.newData !== null) ? (existing.newData as any) : {};
    const updatedData = {
      ...currentData,
      status,
      ...(replyMessage ? { 
        replyMessage, 
        repliedBy: repliedBy || 'Circulation Librarian', 
        repliedAt: new Date().toISOString() 
      } : {}),
      ...(escalationReason ? { 
        escalationReason, 
        escalatedBy: escalatedBy || 'Circulation Librarian', 
        escalatedAt: new Date().toISOString(),
        isEscalated: true
      } : {}),
      resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : (status === 'UNREAD' ? null : currentData.resolvedAt)
    };

    const updated = await prisma.auditLog.update({
      where: { logId: id },
      data: {
        newData: updatedData
      }
    });

    return {
      success: true,
      message: status === 'ESCALATED' 
        ? 'Inquiry escalated to Library Administration successfully'
        : (replyMessage ? 'Response sent and inquiry marked as resolved' : `Inquiry status updated to ${status}`),
      data: updated
    };
  } catch (err: any) {
    console.error('Update inquiry error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to update inquiry'
    });
  }
});
