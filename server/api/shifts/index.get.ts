// server/api/shifts/index.get.ts
export default defineEventHandler(async () => {
  try {
    // 1. Fetch saved shift roster & announcement from systemConfig
    const [rosterConfig, announcementConfig] = await Promise.all([
      prisma.systemConfig.findUnique({ where: { configKey: 'LIBRARIAN_SHIFTS_ROSTER' } }),
      prisma.systemConfig.findUnique({ where: { configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT' } }),
    ])

    let roster: any[] = []
    let announcement: any = null

    if (rosterConfig && rosterConfig.configValue) {
      try {
        roster = JSON.parse(rosterConfig.configValue)
      } catch {
        roster = []
      }
    }

    if (announcementConfig && announcementConfig.configValue) {
      try {
        announcement = JSON.parse(announcementConfig.configValue)
      } catch {
        announcement = null
      }
    }

    // 2. If no roster yet, seed from librarians in User table or create initial default schedule
    if (!roster || roster.length === 0) {
      const librariansFromDb = await prisma.user.findMany({
        where: {
          OR: [
            { userType: { contains: 'Librarian' } },
            { userType: { contains: 'Admin' } },
          ],
        },
        select: { userId: true, name: true, email: true, department: true },
        take: 10,
      })

      const defaultShifts = [
        {
          id: 'shift-1',
          librarianId: librariansFromDb[0]?.userId || 'LIB-001',
          librarianName: librariansFromDb[0]?.name || 'Librarian Desk Officer',
          librarianEmail: librariansFromDb[0]?.email || 'librarian@mkau.edu.et',
          shiftType: 'MORNING',
          shiftName: 'Morning Shift',
          shiftHours: '08:00 AM - 02:00 PM',
          stationDesk: 'Main Circulation Desk (Ground Floor)',
          day: 'Monday - Friday',
          order: 1,
          isOnDutyToday: true,
          status: 'ACTIVE',
          handoverNotes: 'Direct patron borrowing and open stacks circulation active.',
        },
        {
          id: 'shift-2',
          librarianId: librariansFromDb[1]?.userId || 'LIB-002',
          librarianName: librariansFromDb[1]?.name || 'Abebe Tadesse (Senior Cataloger)',
          librarianEmail: librariansFromDb[1]?.email || 'abebe.t@mkau.edu.et',
          shiftType: 'AFTERNOON',
          shiftName: 'Afternoon Shift',
          shiftHours: '02:00 PM - 08:00 PM',
          stationDesk: 'Reference & Closed Shelf Desk (1st Floor)',
          day: 'Monday - Friday',
          order: 2,
          isOnDutyToday: false,
          status: 'SCHEDULED',
          handoverNotes: 'Handles afternoon research consultations and reserve collection.',
        },
        {
          id: 'shift-3',
          librarianId: librariansFromDb[2]?.userId || 'LIB-003',
          librarianName: librariansFromDb[2]?.name || 'Sara Mohammed (Circulation Assistant)',
          librarianEmail: librariansFromDb[2]?.email || 'sara.m@mkau.edu.et',
          shiftType: 'NIGHT',
          shiftName: 'Night / Evening Shift',
          shiftHours: '08:00 PM - 08:00 AM',
          stationDesk: '24/7 Digital Learning & Study Commons Desk',
          day: 'Rotating Schedule',
          order: 3,
          isOnDutyToday: false,
          status: 'SCHEDULED',
          handoverNotes: 'Overnight study hall monitoring and automated book drop collection.',
        },
        {
          id: 'shift-4',
          librarianId: 'LIB-004',
          librarianName: 'Chala Gemechu (Weekend Officer)',
          librarianEmail: 'chala.g@mkau.edu.et',
          shiftType: 'WEEKEND',
          shiftName: 'Weekend Duty',
          shiftHours: '09:00 AM - 06:00 PM',
          stationDesk: 'Universal Circulation & Student Service Desk',
          day: 'Saturday - Sunday',
          order: 4,
          isOnDutyToday: false,
          status: 'SCHEDULED',
          handoverNotes: 'Weekend campus loans, returns, and walk-in clearance services.',
        },
      ]

      roster = defaultShifts

      // Persist defaults
      await prisma.systemConfig.upsert({
        where: { configKey: 'LIBRARIAN_SHIFTS_ROSTER' },
        create: {
          configKey: 'LIBRARIAN_SHIFTS_ROSTER',
          configValue: JSON.stringify(roster),
          description: 'Librarian shift schedule and duty roster',
        },
        update: {
          configValue: JSON.stringify(roster),
        },
      })
    }

    // Default announcement if none
    if (!announcement) {
      const activeLibrarian = roster.find((s) => s.isOnDutyToday) || roster[0]
      announcement = {
        title: "Today's Active Circulation Duty",
        dutyLibrarianId: activeLibrarian?.librarianId || '',
        dutyLibrarianName: activeLibrarian?.librarianName || 'Primary Librarian Officer',
        shiftType: activeLibrarian?.shiftType || 'MORNING',
        shiftHours: activeLibrarian?.shiftHours || '08:00 AM - 02:00 PM',
        stationDesk: activeLibrarian?.stationDesk || 'Main Circulation Desk (Ground Floor)',
        broadcastNotice:
          'Official Announcement: Primary on-duty librarian is stationed at the main circulation desk. Universal borrow and return access is enabled for all library staff across all shifts.',
        updatedAt: new Date().toISOString(),
      }
    }

    return {
      success: true,
      roster,
      announcement,
      activeLibrarian: roster.find((s) => s.isOnDutyToday) || roster[0],
    }
  } catch (err: any) {
    console.error('Fetch shifts error:', err)
    return {
      success: false,
      message: err.message || 'Failed to fetch librarian shift schedule',
      roster: [],
      announcement: null,
      activeLibrarian: null,
    }
  }
})
