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
            default: // ToDo: とりあえず共通の内容としておく
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
