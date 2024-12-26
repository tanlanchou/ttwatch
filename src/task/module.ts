import { Module } from '@nestjs/common';
import { TaskService } from './service';
import { TaskController } from './controller';

@Module({
    providers: [TaskService],
    controllers: [TaskController],
    exports: [TaskService],
})
export class TaskModule { }
