import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/hostel/rooms
router.get('/rooms', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { block, roomType } = req.query;
    const where: any = {};

    if (block && block !== 'ALL') where.block = block as string;
    if (roomType && roomType !== 'ALL') where.roomType = roomType as string;

    const rooms = await prisma.hostelRoom.findMany({
      where,
      include: {
        students: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            department: { select: { code: true } },
          },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch hostel rooms', error: error.message });
  }
});

// POST /api/hostel/rooms
router.post('/rooms', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { roomNumber, block, floor, capacity, roomType, feePerSemester } = req.body;

    if (!roomNumber || !block) {
      res.status(400).json({ message: 'Room number and block are required' });
      return;
    }

    const room = await prisma.hostelRoom.create({
      data: {
        roomNumber: String(roomNumber).trim(),
        block: String(block),
        floor: floor ? parseInt(floor) : 1,
        capacity: capacity ? parseInt(capacity) : 2,
        roomType: roomType ? String(roomType) : 'NON_AC',
        feePerSemester: feePerSemester ? parseFloat(feePerSemester) : 32000,
      },
    });

    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create hostel room', error: error.message });
  }
});

// PUT /api/hostel/rooms/:id
router.put('/rooms/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { block, floor, capacity, roomType, feePerSemester } = req.body;

    const updated = await prisma.hostelRoom.update({
      where: { id },
      data: {
        block: block ? String(block) : undefined,
        floor: floor !== undefined ? parseInt(floor) : undefined,
        capacity: capacity !== undefined ? parseInt(capacity) : undefined,
        roomType: roomType ? String(roomType) : undefined,
        feePerSemester: feePerSemester !== undefined ? parseFloat(feePerSemester) : undefined,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update hostel room', error: error.message });
  }
});

// POST /api/hostel/rooms/:id/assign - Assign student to room
router.post('/rooms/:id/assign', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({ message: 'studentId is required' });
      return;
    }

    const room = await prisma.hostelRoom.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const currentCount = (room as any).students?.length || 0;
    if (currentCount >= room.capacity) {
      res.status(400).json({ message: 'Hostel room is already at full capacity' });
      return;
    }

    await prisma.$transaction([
      prisma.student.update({
        where: { id: String(studentId) },
        data: { hostelRoomId: id },
      }),
      prisma.hostelRoom.update({
        where: { id },
        data: { occupied: currentCount + 1 },
      }),
    ]);

    res.json({ message: 'Student successfully assigned to room' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to assign room', error: error.message });
  }
});

// POST /api/hostel/rooms/:id/remove - Remove student from room
router.post('/rooms/:id/remove', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { studentId } = req.body;

    await prisma.$transaction([
      prisma.student.update({
        where: { id: String(studentId) },
        data: { hostelRoomId: null },
      }),
      prisma.hostelRoom.update({
        where: { id },
        data: { occupied: { decrement: 1 } },
      }),
    ]);

    res.json({ message: 'Student removed from room' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to remove student from room', error: error.message });
  }
});

// DELETE /api/hostel/rooms/:id
router.delete('/rooms/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.hostelRoom.delete({ where: { id } });
    res.json({ message: 'Hostel room deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
});

export default router;
