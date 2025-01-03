import {
    Controller, UseInterceptors, UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskService } from './service';
import { VerifyTokenInterceptor } from 'src/common/interceptor/verify.token.interceptor';
import { AccessVerifyInterceptor } from 'src/common/interceptor/access.verify.interceptor';
import { success, error } from 'src/common/helper/result';
import * as log from 'electron-log';
import { SocialMedia } from 'src/common/enum/social.media.type';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    // 获取所有任务
    @MessagePattern({ cmd: 'get_all_tasks' })
    @UseInterceptors(AccessVerifyInterceptor)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getAllTasks() {
        try {
            const result = await this.taskService.getAllTasks();
            return success(result);
        } catch (ex) {
            log.error('Error in getAllTasks:', ex);
            return error('获取所有任务失败');
        }
    }

    // 根据用户ID获取任务
    @MessagePattern({ cmd: 'get_tasks_by_user_id' })
    async getTaskByUserId(@Payload() data: { userId: number; page?: number; pageSize?: number }) {
        try {
            return await this.taskService.getTaskByUserId(data.userId, data.page, data.pageSize);
        } catch (ex) {
            log.error('Error in getTaskByUserId:', ex);
            return error('根据用户ID获取任务失败');
        }
    }

    // 创建新任务
    @MessagePattern({ cmd: 'create_task' })
    async createTask(@Payload() body: { userId: number; feed: string; type?: SocialMedia }) {
        try {
            const { userId, feed, type } = body;

            // Check if feed is unique
            const existingTask = await this.taskService.getTaskByFeed(feed);
            if (existingTask) {
                return error('Feed必须是唯一的');
            }

            const processedBody = { userId, feed, type };
            return await this.taskService.createTask(processedBody);
        } catch (ex) {
            log.error('Error in createTask:', ex);
            return error('创建任务失败');
        }
    }

    // 更新任务
    @MessagePattern({ cmd: 'update_task' })
    async updateTask(@Payload() data: { id: number; hasUpdate?: boolean; lastFetchTime?: Date; status?: string; smsNotificationStatus?: string; emailNotificationStatus?: string; pushNotificationStatus?: string; feedStatus?: string }) {
        try {
            const { id, ...fields } = data;
            if (!id) {
                return error('更新任务时必须提供ID');
            }
            const allowedFields = ['hasUpdate', 'lastFetchTime', 'status', 'smsNotificationStatus', 'emailNotificationStatus', 'pushNotificationStatus', 'feedStatus'];
            const processedFields = Object.keys(fields).reduce((acc, key) => {
                if (allowedFields.includes(key) && fields[key] !== undefined) {
                    acc[key] = fields[key];
                }
                return acc;
            }, {});

            if (Object.keys(processedFields).length === 0) {
                return error('更新任务时必须提供至少一个有效字段');
            }

            return await this.taskService.updateTask(id, processedFields);
        } catch (ex) {
            log.error('Error in updateTask:', ex);
            return error('更新任务失败');
        }
    }

    // 删除任务
    @MessagePattern({ cmd: 'delete_task' })
    async deleteTask(@Payload() data: { id: number }) {
        try {
            const { id } = data;
            if (!id) {
                return error('删除任务时必须提供ID');
            }
            return await this.taskService.deleteTask(id);
        } catch (ex) {
            log.error('Error in deleteTask:', ex);
            return error('删除任务失败');
        }
    }
}
