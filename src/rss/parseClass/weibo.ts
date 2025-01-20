import { LogService } from 'src/log/service';
import AbstractParser from '../parseAbstract';
import { get } from 'lodash';

export default class WeiboParser extends AbstractParser {
    constructor(url: string, host: string, taskId: number, logService: LogService) {
        super(url, host, taskId, logService);
    }

    getUrl(): string {
        const urlParts = this.url.split('/');
        const targetId = get(urlParts, `[${urlParts.length - 1}]`, '');
        if (!targetId) {
            throw new Error('targetId is empty or does not exist');
        }
        return `${this.host}/weibo/user/${targetId}`;
    }

}
