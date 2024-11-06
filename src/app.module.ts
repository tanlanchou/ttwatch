import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module'; // Import the ConfigModule
import { IpIntervalModule } from './common/ipInterval/ip.interval.module'

@Module({
  imports: [ConfigModule],
})
export class AppModule { }
