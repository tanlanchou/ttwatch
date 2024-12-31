import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service';

@Injectable()
export class LogService {
    constructor(private readonly prisma: PrismaService) { }
    // 新增日志
    async createLog(data: any) {
        return this.prisma.logList.create({
            data,
        });
    }

    // 根据 taskId 查询日志
    async getLogsByTaskId(taskId: number, page: number = 1, pageSize: number = 10, keywords: string = '') {
        const skip = (page - 1) * pageSize;
        const [logs, total] = await Promise.all([
            this.prisma.logList.findMany({
                where: {
                    taskId,
                    content: {
                        contains: keywords,
                    },
                },
                orderBy: { scanTime: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.logList.count({
                where: {
                    taskId,
                    content: {
                        contains: keywords,
                    },
                },
            }),
        ]);
        return { logs, total };
    }

    // 根据 taskId 查询最近一条日志
    async getLatestLogByTaskId(taskId: number) {
        return this.prisma.logList.findFirst({
            where: {
                taskId,
            },
            orderBy: {
                scanTime: 'desc',
            },
        });
    }

    // 删除超过指定小时数的日志
    async deleteLogsOlderThan(hours: number) {
        const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.prisma.logList.deleteMany({
            where: {
                scanTime: {
                    lt: cutoffDate,
                },
            },
        });
    }
}