import { Module } from '@nestjs/common';
import { TaskModule } from './task/module';
import { PrismaModule } from 'src/common/prisma/module'
import { ConfigModule } from './common/config/config.module'; // Import the ConfigModule

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    TaskModule
  ]
})
export class AppModule { }
