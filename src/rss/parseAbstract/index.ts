import * as parser from 'rss-parser';
import { removeHTMLTags } from 'src/common/helper/dom';
import { LogService } from 'src/log/service';

export default abstract class AbstractParser {
    protected url: string;
    protected host: string;
    protected logService: LogService;
    protected taskId: number;

    constructor(url: string, host: string, taskId: number, logService: LogService) {
        this.url = url;
        this.host = host;
        this.taskId = taskId;
        this.logService = logService;
    }

    protected compareContent(oldContent: any, newContent: any): string {
        return "";
    }

    async parse(): Promise<any> {
        debugger;
        let rssHubObject = await this.getRssHub();
        if (rssHubObject !== null && rssHubObject !== undefined) {
            rssHubObject = JSON.parse(removeHTMLTags(JSON.stringify(rssHubObject)));
        }

        const latestLog = await this.logService.getLatestLogByTaskId(this.taskId);
        let isDuplicate = 0;

        if (latestLog !== null && latestLog !== undefined) {
            const logContent = JSON.parse(latestLog.content);
            if (JSON.stringify(latestLog.content) === JSON.stringify(rssHubObject)) {
                isDuplicate = 1;

                //比对两次的具体差异
                this.compareContent(logContent, rssHubObject);
            }
        }

        await this.logService.createLog({
            taskId: this.taskId,
            content: JSON.stringify(rssHubObject),
            isDuplicate: isDuplicate,
            scanTime: new Date(),
        });


    };

    abstract getUrl(): string;

    async getRssHub(): Promise<object> {
        const url = this.getUrl();
        const p = new parser();
        return p.parseURL(url).then((res) => {
            return res;
        });
    }
}


