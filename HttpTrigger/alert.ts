import { TranslateAlert, APIEndpoint } from "./translator"

// 共通アラートスキーマに合わせた型定義
// Ref: https://docs.microsoft.com/ja-jp/azure/azure-monitor/platform/alerts-common-schema-definitions
export type CommonAlert = {
    data: {
        essentials: {
            alertId: string,
            alertRule: string,
            severity: string,
            signalType: string,
            monitorCondition: string,
            monitoringService: string,
            alertTargetIDs: string[],
            originalAlertId: string,
            firedDateTime: string,
            resolvedDateTime: string,
            description: string,
            essentialsVersion: string,
            alertContextVersion: string,
        },
        alertContext: any
    }
};

export async function factoryAlert(alertBody: CommonAlert): Promise<BaseAlert> {
    let obj: BaseAlert;
    switch (alertBody.data.essentials.monitoringService) {
        case "Platform":
            obj = new PlatformAlert(alertBody);
            break;
        case "ServiceHealth":
            obj = new ServiceHealthAlert(alertBody);
            break;
        default: // ToDo: これ以外は共通の内容として Platform にしておく
            obj = new PlatformAlert(alertBody);
            break;
    }
    return obj;

}
export abstract class BaseAlert {
    abstract alertBody: CommonAlert;
    public get monitorCondition(): string {
        const c = this.alertBody.data.essentials.monitorCondition;
        switch (c) {
            case "Fired":
                return "障害発生"
            case "Resolved":
                return "解決"
            default:
                return "-";
        }
    }

    public get monitoringService(): string {
        return this.alertBody.data.essentials.monitoringService || "-";
    }

    public get severity(): string {
        return this.alertBody.data.essentials.severity || "-";
    }
    public get subject(): string {
        return this.alertBody.data.essentials.alertRule || "-";
    }

    public get alertTargetIDs(): string[] {
        return this.alertBody.data.essentials.alertTargetIDs || ["-"];
    }

    public get resourceGroups(): string[] {
        const resourcegroups = [];
        for (const id of this.alertBody.data.essentials.alertTargetIDs) {
            resourcegroups.push(String(id).split("/")[4]);
        }
        return resourcegroups || ["-"];
    }
    public get resources(): string[] {
        const resources = [];
        for (const id of this.alertBody.data.essentials.alertTargetIDs) {
            resources.push(String(id).split("/")[8]);
        }
        return resources || ["-"];
    }
    public get resourceTypes(): string[] {
        const resourceTypes = [];
        for (const id of this.alertBody.data.essentials.alertTargetIDs) {
            resourceTypes.push(String(id).split("/")[6] + "/" + String(id).split("/")[7]);
        }
        return resourceTypes || ["-"];
    }
    public get description(): string {
        return this.alertBody.data.essentials.description || "-";
    }
    public get firedDateTime(): string {
        let d = "-";
        let fd = this.alertBody.data.essentials.firedDateTime;
        if (fd) {
            if (!(/Z$/).test(fd)) {
                fd += "Z";
            }
            d = this.formatAndLocalizeDate(fd);
        }
        return d;
    }
    public get resolvedDateTime(): string {
        let d = "-";
        if (this.alertBody.data.essentials.resolvedDateTime) {
            d = this.formatAndLocalizeDate(this.alertBody.data.essentials.resolvedDateTime);
        }
        return d;
    }
    public abstract createMessage(): Promise<string>;

    /**
     * 日付をフォーマットする
     * @param  {String}   dateString     日付
     * @param  {String} [format] フォーマット
     * @return {String}          フォーマット済み日付
    */
    private formatAndLocalizeDate(dateString: string, format: string = undefined): string {
        // JST にする
        const date = new Date(new Date(Date.parse(dateString)).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
        if (!format) format = 'YYYY-MM-DD hh:mm:ss';
        format = format.replace(/YYYY/g, date.getFullYear().toString());
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
        format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
        return format;
    };
}

export class PlatformAlert extends BaseAlert {
    constructor(public alertBody: CommonAlert) {
        super();
    }

    public async createMessage(): Promise<string> {
        const message: string = `アラート名: ${this.subject}
状態: ${this.monitorCondition}
説明: ${this.description}
重要度: ${this.severity}
発生日時: ${this.firedDateTime}
解決日時: ${this.resolvedDateTime}
種別: ${this.monitoringService}
リソース グループ: ${this.resourceGroups.join(",")}
リソース タイプ: ${this.resourceTypes.join(",")}
対象: ${this.resources.join(",")}
`;
        return message;
    }
}

export class ServiceHealthAlert extends BaseAlert {
    constructor(public alertBody: CommonAlert) {
        super();
    }

    // サービス正常性は状態が無いので常に通知にしておく
    public get monitorCondition(): string {
        return "通知"
    }

    public get incidentType(): string {
        return this.alertBody.data.alertContext.properties.incidentType || "-";
    }

    public get trackingID(): string {
        return this.alertBody.data.alertContext.properties.trackingId || "-";
    }

    public get defaultLanguageTitle(): string {
        return this.alertBody.data.alertContext.properties.defaultLanguageTitle || "-";
    }

    public get impactedServices(): any {
        return JSON.parse(this.alertBody.data.alertContext.properties.impactedServices);
    }


    public get defaultLanguageContent(): string {
        return this.alertBody.data.alertContext.properties.defaultLanguageContent || "-";
    }

    public async createMessage(): Promise<string> {
        // ↓の形式でくる JSON を <サービス名2>[<リージョン1>/<リージョン2>/...], <サービス名2>[<リージョン1>/<リージョン2>/...] の形式に整形
        // "impactedServices": "[{\"ImpactedRegions\":[{\"RegionName\":\"East US\"},{\"RegionName\":\"South Central US\"},{\"RegionName\":\"West US\"},{\"RegionName\":\"West US 2\"}],\"ServiceName\":\"Application Insights\"}]"
        const formatImpactedService = (services: any): string => {
            const result = [];
            for (const s of services) {
                let str = `${s.ServiceName}[`;
                const region = [];
                for (const r of s.ImpactedRegions) {
                    region.push(r.RegionName);
                }
                str += region.join("/") + ']';
                result.push(str);
            }
            return result.join(",");
        };

        const message = `アラート名: ${this.subject}
概要: ${this.defaultLanguageTitle}
重要度: ${this.severity}
発生日時: ${this.firedDateTime}
解決日時: ${this.resolvedDateTime}
種別: ${this.monitoringService}
対象: ${this.alertTargetIDs.join(",")}
タイプ: ${this.incidentType}
トラッキング ID: ${this.trackingID}
影響サービス[リージョン]: ${formatImpactedService(this.impactedServices)}

${await new TranslateAlert({ translateAPIURL: APIEndpoint.get("EN2JA") }).doTranslate(this.defaultLanguageContent)}
`;
        return message;
    }

}