import { Module } from '@nestjs/common';
import { TaskModule } from './task/module';
import { PrismaModule } from 'src/common/prisma/module'
import { ConfigModule } from './common/config/config.module'; // Import the ConfigModule
import { ScheduleModule } from '@nestjs/schedule';
import { TaskCronService } from './cron';
import { LogModule } from './log/module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    TaskModule,
    LogModule,
    ScheduleModule.forRoot()
  ],
  providers: [TaskCronService]
})
export class AppModule { }
