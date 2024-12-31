import { Module } from '@nestjs/common';
import { LogService } from './service';
import { LogController } from './controller';

@Module({
    providers: [LogService],
    controllers: [LogController],
    exports: [LogService],
})
export class LogModule { }
