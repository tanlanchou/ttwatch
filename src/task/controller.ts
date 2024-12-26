import {
    Controller, UseInterceptors, UsePipes,
    ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskService } from './service';
import { VerifyTokenInterceptor } from 'src/common/interceptor/verify.token.interceptor';
import { AccessVerifyInterceptor } from 'src/common/interceptor/access.verify.interceptor';
import { success } from 'src/common/helper/result';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    // 获取所有任务
    @MessagePattern({ cmd: 'get_all_tasks' })
    @UseInterceptors(AccessVerifyInterceptor)
    @UsePipes(new ValidationPipe({ transform: true })) // 
    async getAllTasks(data: any) {
        try {
            const result = await this.taskService.getAllTasks();
            return success(result);
        }
        catch (ex) {
            debugger;
        }
    }

    // 根据用户ID获取任务
    @MessagePattern({ cmd: 'get_tasks_by_user_id' })
    async getTaskByUserId(@Payload() data: { userId: number; page: number; pageSize: number }) {
        return this.taskService.getTaskByUserId(data.userId, data.page, data.pageSize);
    }

    // 创建新任务
    @MessagePattern({ cmd: 'create_task' })
    async createTask(@Payload() body: { userId: number; feed: string; type?: number }) {
        return this.taskService.createTask(body);
    }

    // 更新任务
    @MessagePattern({ cmd: 'update_task' })
    async updateTask(@Payload() data: { id: number; body: Partial<{ hasUpdate: boolean; status: string }> }) {
        return this.taskService.updateTask(data.id, data.body);
    }

    // 删除任务
    @MessagePattern({ cmd: 'delete_task' })
    async deleteTask(@Payload() id: number) {
        return this.taskService.deleteTask(id);
    }
}
