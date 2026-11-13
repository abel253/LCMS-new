// server/api/service-status.get.ts
const withTimeout = <T>(promise: Promise<T>, ms = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Database query timed out')), ms))
  ]);
};

export default defineEventHandler(async () => {
  try {
    const configs = await withTimeout(
      prisma.systemConfig.findMany({
        where: {
          configKey: {
            in: [
              'library_service_status',
              'library_service_message',
              'library_reopen_time',
              'library_working_hours',
              'library_announcement_active',
              'library_status_updated_by'
            ]
          }
        }
      }),
      2500
    )

    const configMap: Record<string, { value: string; desc?: string | null }> = {}
    for (const c of configs) {
      configMap[c.configKey] = { value: c.configValue, desc: c.description }
    }

    const status = (configMap['library_service_status']?.value || 'OPEN').toUpperCase() as 'OPEN' | 'CLOSED' | 'MAINTENANCE'
    const isOpen = status === 'OPEN'
    const noticeMessage = configMap['library_service_message']?.desc || configMap['library_service_message']?.value || 'The library is currently closed. Please visit during regular circulation hours.'
    const reopenTime = configMap['library_reopen_time']?.desc || configMap['library_reopen_time']?.value || 'Tomorrow at 8:30 AM'
    const workingHours = configMap['library_working_hours']?.desc || configMap['library_working_hours']?.value || 'Monday - Friday: 8:00 AM - 10:00 PM | Saturday - Sunday: 8:30 AM - 6:00 PM'
    const isAnnouncementActive = configMap['library_announcement_active']?.value === 'true' || status !== 'OPEN'
    const updatedBy = configMap['library_status_updated_by']?.value || 'MAU Library Circulation'

    return {
      success: true,
      isOpen,
      status,
      noticeMessage,
      reopenTime,
      workingHours,
      isAnnouncementActive,
      updatedBy,
      updatedAt: new Date().toISOString()
    }
  } catch (err: any) {
    console.error('Error fetching service status:', err)
    return {
      success: true,
      isOpen: true,
      status: 'OPEN' as const,
      noticeMessage: 'ላይብረሪው ክፍት ነው (Library service is open)',
      reopenTime: 'ነገ ጥዋት 2:30 ሰዓት (8:30 AM)',
      workingHours: 'ከሰኞ - አርብ፡ 2:00 ጥዋት - 4:00 ማታ | ቅዳሜና እሁድ፡ 2:30 ጥዋት - 12:00 ቀን',
      isAnnouncementActive: false,
      updatedBy: 'System Default',
      updatedAt: new Date().toISOString()
    }
  }
})
