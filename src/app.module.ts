import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/media/',
        }),
        AttendanceModule,
        PrismaModule,
    ],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class AppModule {}
