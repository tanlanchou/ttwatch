import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('tasks')
export class TaskController {
    constructor(private readonly client: ClientProxy) { }

    // 获取所有任务
    @MessagePattern({ cmd: 'get_all_tasks' })
    async getAllTasks() {
        return this.client.send({ cmd: 'get_all_tasks' }, {});
    }

    // 根据用户ID获取任务
    @MessagePattern({ cmd: 'get_tasks_by_user_id' })
    async getTaskByUserId(@Payload() data: { userId: number; page: number; pageSize: number }) {
        return this.client.send({ cmd: 'get_tasks_by_user_id' }, data);
    }

    // 创建新任务
    @MessagePattern({ cmd: 'create_task' })
    async createTask(@Payload() body: { userId: number; feed: string; type?: number }) {
        return this.client.send({ cmd: 'create_task' }, body);
    }

    // 更新任务
    @MessagePattern({ cmd: 'update_task' })
    async updateTask(@Payload() data: { id: number; body: Partial<{ hasUpdate: boolean; status: string }> }) {
        return this.client.send({ cmd: 'update_task' }, data);
    }

    // 删除任务
    @MessagePattern({ cmd: 'delete_task' })
    async deleteTask(@Payload() id: number) {
        return this.client.send({ cmd: 'delete_task' }, { id });
    }
}
