import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }

    // 获取所有任务
    async getAllTasks() {
        return await this.prisma.taskList.findMany();
    }

    async getTasksByIntervalAndLimit(limit: number, intervalMinutes: number) {
        const intervalDate = new Date(Date.now() - intervalMinutes * 60000);

        return await this.prisma.taskList.findMany({
            where: {
                OR: [
                    { lastFetchTime: null },
                    { lastFetchTime: { lt: intervalDate } }
                ]
            },
            orderBy: [
                { lastFetchTime: 'asc' }
            ],
            take: limit
        });
    }

    async getTaskByUserId(userId: number, page: number = 1, pageSize: number = 10) {
        const skip = (page - 1) * pageSize;
        const [tasks, total] = await Promise.all([
            this.prisma.taskList.findMany({
                where: { userId },
                skip,
                take: pageSize,
            }),
            this.prisma.taskList.count({
                where: { userId },
            }),
        ]);
        return { tasks, total };
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

    // 检查 feed 是否唯一
    async getTaskByFeed(feed: string) {
        return this.prisma.taskList.findFirst({
            where: { feed },
        });
    }
}
