import {
    Body,
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    ParseUUIDPipe,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post('checkin')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(__dirname, '..', '..', 'uploads'),
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
        }),
    )
    async checkIn(
        @Body(new ParseUUIDPipe()) employeeId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5000 }),
                    new FileTypeValidator({
                        fileType: '/(jpg|jpeg|png|webp)$/i',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.attendanceService.checkIn(employeeId, file.path);
    }

    @Patch('checkout')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(__dirname, '..', '..', 'uploads'),
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
        }),
    )
    async checkOut(
        @Body(new ParseUUIDPipe()) employeeId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5000 }),
                    new FileTypeValidator({
                        fileType: '/(jpg|jpeg|png|webp)$/i',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.attendanceService.checkOut(employeeId, file.path);
    }
}
