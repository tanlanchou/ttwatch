import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from './service';
import { success, error } from 'src/common/helper/result';
import * as log from 'electron-log';
import { UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccessVerifyInterceptor } from 'src/common/interceptor/access.verify.interceptor';
import { ClientProxy } from "@nestjs/microservices";
import { Action } from 'src/common/enum/action';
import { NetworkUtils } from 'src/common/helper/ip';
import { LogMethods } from 'src/common/enum/methods';
import { getAbc } from 'src/common/helper/access.verifiy';
import { ConfigService } from 'src/common/config/config.service';

@Controller('logs')
export class LogController {
    constructor(private readonly logService: LogService, @Inject("MICROSERVICE_LOG_CLIENT") private readonly client: ClientProxy, private readonly configService: ConfigService) { }

    // 新增日志
    @MessagePattern({ cmd: LogMethods.LOG_SERVICE_ADD_LOG })
    @UseInterceptors(AccessVerifyInterceptor)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createLog(@Payload() data: { taskId: number; content: string; isDuplicate: boolean; scanTime: Date; diff: string }) {
        try {
            const tempData = {
                taskId: data.taskId,
                content: data.content,
                isDuplicate: data.isDuplicate,
                scanTime: data.scanTime,
                diff: data.diff
            }
            const result = await this.logService.createLog(tempData);
            return success(result);
        } catch (ex) {
            log.error('Error in createLog:', ex);
            const [curTime, abc] = await getAbc(this.configService);
            this.client.send<object>(
                { cmd: LogMethods.LOG_SERVICE_ADD_LOG },
                {
                    operation: Action.CREATE_LOG,
                    operator: "ttwatch",
                    platform: "ttwatch",
                    details: `新增日志失败, 错误信息${ex.message}, ${NetworkUtils.getLocalIpAddress()}`,
                    curTime, abc
                },
            )
            return error('新增日志失败');
        }
    }

    // 根据 taskId 查询日志
    @MessagePattern({ cmd: LogMethods.LOG_SERVICE_GET_LOGS_BY_TASK_ID })
    @UseInterceptors(AccessVerifyInterceptor)
    @UsePipes(new ValidationPipe({ transform: true }))
    async getLogsByTaskId(@Payload() data: { taskId: number; page?: number; pageSize?: number; keywords?: string }) {
        try {
            const { taskId, page, pageSize, keywords } = data;
            const result = await this.logService.getLogsByTaskId(taskId, page, pageSize, keywords);
            return success(result);
        } catch (ex) {
            log.error('Error in getLogsByTaskId:', ex);
            const [curTime, abc] = await getAbc(this.configService);
            this.client.send<object>(
                { cmd: LogMethods.LOG_SERVICE_ADD_LOG },
                {
                    operation: Action.GET_LOGS_BY_TASK_ID,
                    operator: "ttwatch",
                    platform: "ttwatch",
                    details: `根据 taskId 查询日志失败, 错误信息${ex.message}, ${NetworkUtils.getLocalIpAddress()}`,
                    curTime, abc
                },
            )
            return error('根据 taskId 查询日志失败');
        }
    }
}
