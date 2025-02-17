import { Module } from '@nestjs/common';
import { TaskModule } from './task/module';
import { PrismaModule } from 'src/common/prisma/module'
import { ConfigModule } from './common/config/config.module'; // Import the ConfigModule
import { ScheduleModule } from '@nestjs/schedule';
import { TaskCronService } from './cron';
import { LogModule } from './log/module';
import { GlobalLogClientsModule } from 'src/common/global/log';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    TaskModule,
    LogModule,
    GlobalLogClientsModule,
    ScheduleModule.forRoot()
  ],
  providers: [TaskCronService]
})
export class AppModule { }
