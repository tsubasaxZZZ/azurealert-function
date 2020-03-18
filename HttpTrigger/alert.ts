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
    public get firedDateTime(): Date {
        return this._alertBody.data.essentials.firedDateTime || "-";
    }
    public get resolvedDateTime(): Date {
        return this._alertBody.data.essentials.resolvedDateTime || "-";
    }
    public abstract createMessage(): string;
}

class PlatformAlert extends Alert {
    constructor(public alertBody: string, public monitoringService: string) {
        super();
        this.alertBody = alertBody;
        this.monitoringService = monitoringService;
    }

    public createMessage(): string {
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

    public createMessage(): string {
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
        const message: string = `アラート名: ${this.subject}
アラート状態: ${this.monitorCondition}
アラート概要: ${this.defaultLanguageTitle}
アラート重要度: ${this.severity}
アラート発生日時: ${this.firedDateTime}
アラート解決日時: ${this.resolvedDateTime}
アラート種別: ${this.monitoringService}
対象サブスクリプション: ${this.alertTargetIDs.join(",")}
アラートタイプ: ${this.incidentType}
トラッキング ID: ${this.trackingID}
影響サービス[リージョン]: ${formatImpactedService(this.impactedServices)}

${this.defaultLanguageContent}
`;
        return message;
    }

}