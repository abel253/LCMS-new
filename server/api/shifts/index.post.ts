// server/api/shifts/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const action = body?.action || 'update-roster'

    if (action === 'set-duty') {
      // Admin announces who is on duty today
      const { librarianId, shiftType, announcementText, stationDesk } = body

      // Fetch current roster
      const rosterConfig = await prisma.systemConfig.findUnique({
        where: { configKey: 'LIBRARIAN_SHIFTS_ROSTER' },
      })

      let roster: any[] = []
      if (rosterConfig?.configValue) {
        try {
          roster = JSON.parse(rosterConfig.configValue)
        } catch {
          roster = []
        }
      }

      // Update on-duty flags in roster
      let activeOfficer: any = null
      roster = roster.map((shift) => {
        const isSelected = shift.librarianId === librarianId || shift.id === body.shiftId
        if (isSelected) {
          activeOfficer = { ...shift }
          if (shiftType) shift.shiftType = shiftType
          if (stationDesk) shift.stationDesk = stationDesk
        }
        return {
          ...shift,
          isOnDutyToday: isSelected,
          status: isSelected ? 'ACTIVE' : 'SCHEDULED',
        }
      })

      // Update SystemConfig for roster
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

      // Create announcement
      const announcement = {
        title: "Today's Active Circulation Duty",
        dutyLibrarianId: activeOfficer?.librarianId || librarianId,
        dutyLibrarianName: activeOfficer?.librarianName || body.librarianName || 'On-Duty Librarian',
        shiftType: shiftType || activeOfficer?.shiftType || 'MORNING',
        shiftHours: activeOfficer?.shiftHours || '08:00 AM - 02:00 PM',
        stationDesk: stationDesk || activeOfficer?.stationDesk || 'Main Circulation Desk',
        broadcastNotice:
          announcementText ||
          `Duty Announcement: ${activeOfficer?.librarianName || 'Officer'} is officially on duty today for the ${shiftType || 'current'} shift. All student borrow and return requests can be handled without restriction.`,
        updatedAt: new Date().toISOString(),
      }

      await prisma.systemConfig.upsert({
        where: { configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT' },
        create: {
          configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT',
          configValue: JSON.stringify(announcement),
          description: 'Announcement of today active librarian duty',
        },
        update: {
          configValue: JSON.stringify(announcement),
        },
      })

      return {
        success: true,
        message: `Successfully announced ${announcement.dutyLibrarianName} as On-Duty Librarian for today!`,
        roster,
        announcement,
        activeLibrarian: activeOfficer,
      }
    }

    if (action === 'update-roster' || action === 'reorder') {
      const newRoster = Array.isArray(body?.roster) ? body.roster : []

      // Normalize orders
      const normalizedRoster = newRoster.map((item: any, index: number) => ({
        ...item,
        order: index + 1,
      }))

      await prisma.systemConfig.upsert({
        where: { configKey: 'LIBRARIAN_SHIFTS_ROSTER' },
        create: {
          configKey: 'LIBRARIAN_SHIFTS_ROSTER',
          configValue: JSON.stringify(normalizedRoster),
          description: 'Librarian shift schedule and duty roster',
        },
        update: {
          configValue: JSON.stringify(normalizedRoster),
        },
      })

      // If active librarian changed, update announcement as well
      const active = normalizedRoster.find((s: any) => s.isOnDutyToday)
      let announcement = null
      if (active) {
        announcement = {
          title: "Today's Active Circulation Duty",
          dutyLibrarianId: active.librarianId,
          dutyLibrarianName: active.librarianName,
          shiftType: active.shiftType,
          shiftHours: active.shiftHours,
          stationDesk: active.stationDesk,
          broadcastNotice:
            body?.announcementText ||
            `Duty Announcement: ${active.librarianName} is on duty today at ${active.stationDesk}. Universal student borrow & return services open.`,
          updatedAt: new Date().toISOString(),
        }

        await prisma.systemConfig.upsert({
          where: { configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT' },
          create: {
            configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT',
            configValue: JSON.stringify(announcement),
            description: 'Announcement of today active librarian duty',
          },
          update: {
            configValue: JSON.stringify(announcement),
          },
        })
      }

      return {
        success: true,
        message: 'Shift schedule & roster updated successfully!',
        roster: normalizedRoster,
        announcement,
      }
    }

    if (action === 'broadcast-announcement') {
      const announcement = {
        title: body.title || "Today's Active Circulation Duty",
        dutyLibrarianId: body.dutyLibrarianId || '',
        dutyLibrarianName: body.dutyLibrarianName || 'Active Librarian',
        shiftType: body.shiftType || 'MORNING',
        shiftHours: body.shiftHours || '08:00 AM - 02:00 PM',
        stationDesk: body.stationDesk || 'Main Circulation Desk',
        broadcastNotice: body.broadcastNotice || 'All library desks active.',
        updatedAt: new Date().toISOString(),
      }

      await prisma.systemConfig.upsert({
        where: { configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT' },
        create: {
          configKey: 'TODAY_ACTIVE_SHIFT_ANNOUNCEMENT',
          configValue: JSON.stringify(announcement),
          description: 'Announcement of today active librarian duty',
        },
        update: {
          configValue: JSON.stringify(announcement),
        },
      })

      return {
        success: true,
        message: 'Shift duty announcement published successfully!',
        announcement,
      }
    }

    return {
      success: false,
      message: 'Unknown action specified',
    }
  } catch (error: any) {
    console.error('Update shifts error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to update shifts',
    })
  }
})
