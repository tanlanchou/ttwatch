import { Injectable } from '@nestjs/common';
import { result } from 'lodash';
import { PrismaService } from 'src/common/prisma/service';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }

    // 获取所有任务
    async getAllTasks() {
        return await this.prisma.taskList.findMany();
    }

    async getTaskByUserId(userId: number, page: number = 1, pageSize: number = 10) {
        const skip = (page - 1) * pageSize;
        return this.prisma.taskList.findMany({
            where: { userId },
            skip,
            take: pageSize,
        });
    }

    // 创建新任务
    async createTask(data: any) {
        return this.prisma.taskList.create({
            data,
        });
    }

    // 更新任务
    async updateTask(id: number, data: any) {
        return this.prisma.taskList.update({
            where: { id },
            data,
        });
    }

    // 删除任务
    async deleteTask(id: number) {
        return this.prisma.taskList.delete({
            where: { id },
        });
    }
}
