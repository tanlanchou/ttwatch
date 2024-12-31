import WeiboParser from './parseClass/weibo';
import AbstractParser from './parseAbstract';
import { SocialMedia } from 'src/common/enum/social.media.type';

export default class ParserFactory {
    static createParser(type: SocialMedia, url: string, host: string): AbstractParser {
        switch (type) {
            case SocialMedia.WEIBO:
                return new WeiboParser(url, host);
            default:
                throw new Error(`Parser type ${type} is not supported`);
        }
    }
}
