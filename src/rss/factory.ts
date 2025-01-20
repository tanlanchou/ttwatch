import WeiboParser from './parseClass/weibo';
import AbstractParser from './parseAbstract';
import { SocialMedia } from 'src/common/enum/social.media.type';
import { LogService } from 'src/log/service';

export default class ParserFactory {
    static createParser(type: SocialMedia, url: string, host: string, taskId: number, logService: LogService): AbstractParser {
        switch (type) {
            case SocialMedia.WEIBO:
                return new WeiboParser(url, host, taskId, logService);
            default:
                throw new Error(`Parser type ${type} is not supported`);
        }
    }
}
