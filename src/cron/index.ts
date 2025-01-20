import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from 'src/task/service';
import { ConfigService } from 'src/common/config/config.service';
import * as log from 'electron-log';
import ParserFactory from 'src/rss/factory';
import { get } from 'lodash';
import { LogService } from 'src/log/service';
import { ClientProxy } from '@nestjs/microservices';
import { NetworkUtils } from 'src/common/helper/ip';
import { Action } from 'src/common/enum/action';

@Injectable()
export class TaskCronService {
    constructor(private readonly taskService: TaskService, private readonly configService: ConfigService, private readonly logService: LogService, @Inject("MICROSERVICE_LOG_CLIENT") private readonly client: ClientProxy) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {

        try {
            const rssConfig = await this.configService.get('rss');
            const count = get(rssConfig, 'rss.count', 10);
            const intervalMinutes = get(rssConfig, 'rss.intervalMinutes', 5);
            const host = get(rssConfig, 'rss.RSS_HUB_HOST');
            if (!host) {
                log.error('RSS_HUB_HOST is empty');
                throw new Error('RSS_HUB_HOST cannot be empty');
            }

            const tasks = await this.taskService.getTasksByIntervalAndLimit(count, intervalMinutes);
            for (const task of tasks) {
                const parser = ParserFactory.createParser(task.type, task.feed, host, task.id, this.logService);
                await parser.parse();
                this.taskService.updateTask(task.id, { lastFetchTime: new Date() });
            }

            log.info('Cron job executed successfully', tasks);
        } catch (ex) {
            this.client.send<object>(
                { cmd: 'addLog' },
                {
                    operation: Action.TTWATCH_CRON_ERROR,
                    operator: "ttwatch",
                    platform: "ttwatch",
                    details: `执行ttwatch_cron_job失败, 错误信息${ex.message}, ${NetworkUtils.getLocalIpAddress()}`
                },
            )
            log.error('Error in handleCron:', ex);
        }
    }
}
