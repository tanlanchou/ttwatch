import * as parser from 'rss-parser';
import { removeHTMLTags } from 'src/common/helper/dom';
import { LogService } from 'src/log/service';
import * as deepDiff from 'deep-diff';
import { diffAction } from 'src/common/enum/action';
import { ChangeLog, ContentItem } from 'src/common/interface/IRssHub';

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
    protected compareItemContent(newContent: ContentItem[], oldContent: ContentItem[]): ChangeLog[] {
        const changeLog: ChangeLog[] = [];

        // Create a map for oldContent by link for quick lookup
        const oldContentMap = new Map(oldContent.map((item, index) => [item.link, { item, index }]));

        // Track processed links to identify deletions later
        const processedLinks = new Set<string>();

        // Check for added and updated items in newContent
        newContent.forEach((newItem, newIndex) => {
            const oldEntry = oldContentMap.get(newItem.link);
            if (!oldEntry) {
                // Check if the item is truly new based on pubDate
                const isTrulyNew = oldContent.every(old => new Date(newItem.pubDate).getTime() > new Date(old.pubDate).getTime());
                if (isTrulyNew) {
                    changeLog.push({ item: "item", index: newIndex, action: diffAction.ADD, log: newItem.title });
                }
            } else {
                const oldItem = oldEntry.item;
                const changes = [];
                if (newItem.title !== oldItem.title) {
                    changes.push(`title: ${oldItem.title} -> ${newItem.title}`);
                }
                if (newItem.content !== oldItem.content) {
                    changes.push(`content: ${oldItem.content} -> ${newItem.content}`);
                }
                if (newItem.contentSnippet !== oldItem.contentSnippet) {
                    changes.push(`contentSnippet: ${oldItem.contentSnippet} -> ${newItem.contentSnippet}`);
                }
                if (newItem.pubDate !== oldItem.pubDate) {
                    changes.push(`pubDate: ${oldItem.pubDate} -> ${newItem.pubDate}`);
                }
                if (changes.length > 0) {
                    // Item exists but has been updated
                    changeLog.push({ item: "item", index: newIndex, action: diffAction.UPDATE, log: changes.join(', ') });
                }
                // Mark the link as processed
                processedLinks.add(newItem.link);
            }
        });

        // Identify deleted items (present in oldContent but not in newContent)
        oldContent.forEach((oldItem, oldIndex) => {
            if (!processedLinks.has(oldItem.link)) {
                changeLog.push({ item: "item", index: oldIndex, action: "delete", log: oldItem.title });
            }
        });

        return changeLog;
    }

    protected compareContent(oldContent: any, newContent: any): ChangeLog[] {
        //data stuct
        // "title": "菜样样的微博",
        // "description": "天下无双 越来越好 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)",
        // "link": "https://weibo.com/1703386861/",
        // "items": [
        // " {
        // "creator": "菜样样",
        // "title": "今天听同事说我是传说中的淡人。。 [图片][图片][图片]",
        // "link": "https://weibo.com/1703386861/P8w029uoa",
        // "pubDate": "Tue, 07 Jan 2025 13:40:41 GMT",
        // "author": "菜样样",
        // "content": "今天听同事说我是传说中的淡人。。 ",
        // "contentSnippet": "今天听同事说我是传说中的淡人。。",
        // "guid": "https://weibo.com/1703386861/P8w029uoa",
        // "isoDate": "2025-01-07T13:40:41.000Z"
        // }

        const differences: ChangeLog[] = [];

        if (oldContent.title !== newContent.title) {
            differences.push({ item: 'title', action: diffAction.UPDATE, log: oldContent.title + "->" + newContent.title });
        }

        if (oldContent.description !== newContent.description) {
            differences.push({ item: 'description', action: diffAction.UPDATE, log: oldContent.description + "->" + newContent.description });
        }

        if (oldContent.link !== newContent.link) {
            differences.push({ item: 'link', action: diffAction.UPDATE, log: oldContent.link + "->" + newContent.link });
        }

        const itemDifferences = this.compareItemContent(newContent.items, oldContent.items);

        differences.push(...itemDifferences);

        return differences;
    }

    async parse(): Promise<ChangeLog[]> {
        let rssHubObject = await this.getRssHub();
        if (rssHubObject) {
            rssHubObject = JSON.parse(removeHTMLTags(JSON.stringify(rssHubObject)));
        }

        const latestLog = await this.logService.getLatestLogByTaskId(this.taskId);
        let isDuplicate = false;
        let differences: ChangeLog[] = [];

        if (latestLog) {
            const logContent = JSON.parse(latestLog.content);

            const filteredLogContent = {
                title: logContent.title,
                description: logContent.description,
                link: logContent.link,
                items: logContent.items
            };

            const filteredRssHubObject = {
                title: rssHubObject.title,
                description: rssHubObject.description,
                link: rssHubObject.link,
                items: rssHubObject.items
            };

            if (JSON.stringify(filteredLogContent) === JSON.stringify(filteredRssHubObject)) {
                isDuplicate = true;
            } else {
                differences = this.compareContent(JSON.parse(latestLog.content), rssHubObject);
            }
        }

        await this.logService.createLog({
            taskId: this.taskId,
            content: isDuplicate ? "" : JSON.stringify(rssHubObject),
            isDuplicate: isDuplicate,
            scanTime: new Date(),
            diff: differences.length > 0 ? JSON.stringify(differences) : ""
        });

        return differences;
    }

    abstract getUrl(): string;

    async getRssHub(): Promise<any> {
        const url = this.getUrl();
        const p = new parser();
        return p.parseURL(url).then((res) => {
            return res;
        });
    }
}
