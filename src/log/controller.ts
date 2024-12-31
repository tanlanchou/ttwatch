import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from './service';
import { success, error } from 'src/common/helper/result';
import * as log from 'electron-log';
import { UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccessVerifyInterceptor } from 'src/common/interceptor/access.verify.interceptor';


@Controller('logs')
export class LogController {
    constructor(private readonly logService: LogService) { }

    // 新增日志
    @MessagePattern({ cmd: 'create_log' })
    @UseInterceptors(AccessVerifyInterceptor)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createLog(@Payload() data: any) {
        try {
            const result = await this.logService.createLog(data);
            return success(result);
        } catch (ex) {
            log.error('Error in createLog:', ex);
            return error('新增日志失败');
        }
    }

    // 根据 taskId 查询日志
    @MessagePattern({ cmd: 'get_logs_by_task_id' })
    @UseInterceptors(AccessVerifyInterceptor)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getLogsByTaskId(@Payload() data: { taskId: number; page?: number; pageSize?: number; keywords?: string }) {
        try {
            const { taskId, page, pageSize, keywords } = data;
            const result = await this.logService.getLogsByTaskId(taskId, page, pageSize, keywords);
            return success(result);
        } catch (ex) {
            log.error('Error in getLogsByTaskId:', ex);
            return error('根据 taskId 查询日志失败');
        }
    }
}
