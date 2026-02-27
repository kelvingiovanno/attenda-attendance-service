import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Attendance, AttendanceStatus } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private readonly prismaService: PrismaService) {}

    async checkIn(
        employeeId: string,
        checkInPhoto: string,
    ): Promise<Attendance> {
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await this.prismaService.attendance.findFirst({
            where: {
                employee_id: employeeId,
                check_in: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        if (attendance) {
            throw new ConflictException();
        }

        const lateLimit = new Date(now);
        lateLimit.setHours(9, 0, 0, 0);

        const status =
            now > lateLimit ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        const newAttendance = await this.prismaService.attendance.create({
            data: {
                employee_id: employeeId,
                check_in: now,
                status: status,
                check_in_photo: checkInPhoto,
            },
        });

        return newAttendance;
    }

    async checkOut(
        employeeId: string,
        checkOutPhoto: string,
    ): Promise<Attendance> {
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(0, 0, 0, 0);

        const attendance = await this.prismaService.attendance.findFirst({
            where: {
                employee_id: employeeId,
                check_in: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        if (!attendance) {
            throw new NotFoundException();
        }

        if (!attendance.check_out) {
            throw new ConflictException();
        }

        const updatedAttendance = await this.prismaService.attendance.update({
            where: { id: attendance.id },
            data: {
                check_out: now,
                check_out_photo: checkOutPhoto,
            },
        });

        return updatedAttendance;
    }
}
