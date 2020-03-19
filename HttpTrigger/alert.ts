import { TranslateAlert } from "./translator"
export abstract class Alert {
    _alertBody: any;
    _monitoringService: string;

    // factory alert object
    public static createAlert(alertBody: string, monitoringService: string): Alert {
        let obj: Alert | undefined = undefined;
        switch (monitoringService) {
            case "Platform":
                obj = new PlatformAlert(alertBody, monitoringService);
                break;
            case "ServiceHealth":
                obj = new ServiceHealthAlert(alertBody, monitoringService);
                break;
            default: // ToDo: これ以外は共通の内容として Platform にしておく
                obj = new PlatformAlert(alertBody, monitoringService);
                break;
        }
        return obj;

    }

    public set monitoringService(v: string) {
        this._monitoringService = v;
    }
    public set alertBody(v: any) {
        this._alertBody = v;
    }


    public get monitorCondition(): string {
        const c = this._alertBody.data.essentials.monitorCondition;
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
        return this._monitoringService || "-";
    }

    public get severity(): string {
        return this._alertBody.data.essentials.severity || "-";
    }
    public get subject(): string {
        return this._alertBody.data.essentials.alertRule || "-";
    }

    public get alertTargetIDs(): string[] {
        return this._alertBody.data.essentials.alertTargetIDs || ["-"];
    }

    public get resourceGroups(): string[] {
        const resourcegroups = [];
        for (const id of this._alertBody.data.essentials.alertTargetIDs) {
            resourcegroups.push(String(id).split("/")[4]);
        }
        return resourcegroups || ["-"];
    }
    public get resources(): string[] {
        const resources = [];
        for (const id of this._alertBody.data.essentials.alertTargetIDs) {
            resources.push(String(id).split("/")[8]);
        }
        return resources || ["-"];
    }
    public get resourceTypes(): string[] {
        const resourceTypes = [];
        for (const id of this._alertBody.data.essentials.alertTargetIDs) {
            resourceTypes.push(String(id).split("/")[6] + "/" + String(id).split("/")[7]);
        }
        return resourceTypes || ["-"];
    }
    public get description(): string {
        return this._alertBody.data.essentials.description || "-";
    }
    public get firedDateTime(): string {
        let d = "-";
        let fd = this._alertBody.data.essentials.firedDateTime;
        console.log(fd);
        if (fd) {
            if (!(/Z$/).test(fd)) {
                fd += "Z";
            }
            d = this.formatAndLocalizeDate(fd);
        }
        console.log(d);
        return d;
    }
    public get resolvedDateTime(): string {
        let d = "-";
        if (this._alertBody.data.essentials.resolvedDateTime) {
            d = this.formatAndLocalizeDate(this._alertBody.data.essentials.resolvedDateTime);
        }
        return d;
    }
    public async abstract createMessage(): Promise<string>;

    /**
     * 日付をフォーマットする
     * @param  {String}   dateString     日付
     * @param  {String} [format] フォーマット
     * @return {String}          フォーマット済み日付
    */
    private formatAndLocalizeDate(dateString: string, format: string = undefined): string {
        // JST にする
        const date = new Date(Date.parse(dateString) + 9);
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

class PlatformAlert extends Alert {
    constructor(public alertBody: string, public monitoringService: string) {
        super();
        this.alertBody = alertBody;
        this.monitoringService = monitoringService;
    }

    public async createMessage(): Promise<string> {
        const message: string = `アラート名: ${this.subject}
アラート状態: ${this.monitorCondition}
アラート説明: ${this.description}
アラート重要度: ${this.severity}
アラート発生日時: ${this.firedDateTime}
アラート解決日時: ${this.resolvedDateTime}
アラート種別: ${this.monitoringService}
リソース グループ: ${this.resourceGroups.join(",")}
リソース タイプ: ${this.resourceTypes.join(",")}
対象リソース: ${this.resources.join(",")}
`;
        return message;
    }
}

class ServiceHealthAlert extends Alert {
    constructor(public alertBody: string, public monitoringService: string) {
        super();
        this.alertBody = alertBody;
        this.monitoringService = monitoringService;
    }

    // サービス正常性は状態が無いので常に通知にしておく
    public get monitorCondition(): string {
        return "通知"
    }

    public get incidentType(): string {
        return this._alertBody.data.alertContext.properties.incidentType || "-";
    }

    public get trackingID(): string {
        return this._alertBody.data.alertContext.properties.trackingId || "-";
    }

    public get defaultLanguageTitle(): string {
        return this._alertBody.data.alertContext.properties.defaultLanguageTitle || "-";
    }

    public get impactedServices(): any {
        return JSON.parse(this._alertBody.data.alertContext.properties.impactedServices);
    }


    public get defaultLanguageContent(): string {
        return this._alertBody.data.alertContext.properties.defaultLanguageContent || "-";
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
アラート概要: ${this.defaultLanguageTitle}
アラート重要度: ${this.severity}
アラート発生日時: ${this.firedDateTime}
アラート解決日時: ${this.resolvedDateTime}
アラート種別: ${this.monitoringService}
対象サブスクリプション: ${this.alertTargetIDs.join(",")}
アラートタイプ: ${this.incidentType}
トラッキング ID: ${this.trackingID}
影響サービス[リージョン]: ${formatImpactedService(this.impactedServices)}

${await new TranslateAlert().translateEn2Ja(this.defaultLanguageContent)}
`;
        return message;
    }

}