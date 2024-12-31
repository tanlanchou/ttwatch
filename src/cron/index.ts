import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from 'src/task/service';
import { ConfigService } from 'src/common/config/config.service';
import * as log from 'electron-log';
import ParserFactory from 'src/rss/factory';
import { get } from 'lodash';

@Injectable()
export class TaskCronService {
    constructor(private readonly taskService: TaskService, private readonly configService: ConfigService) { }

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
                const parser = ParserFactory.createParser(task.type, task.feed, host);
                await parser.parse();
                debugger;
            }

            log.info('Cron job executed successfully', tasks);
        } catch (ex) {
            log.error('Error in handleCron:', ex);
        }
    }
}
