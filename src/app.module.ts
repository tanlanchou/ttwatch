import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module'; // Import the ConfigModule
import { PrismaModule } from 'src/common/prisma/module'

@Module({
  imports: [ConfigModule, PrismaModule],
})
export class AppModule { }
