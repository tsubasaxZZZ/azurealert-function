import * as fs from "fs"
import { Alert } from "./alert"
test("Alertcreate-Platform-Resolved", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_platform.json").toString("utf8"))
    const alert = Alert.createAlert(sampleBody, sampleBody.data.essentials.monitoringService);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("解決");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe(sampleBody.data.essentials.firedDateTime);
    expect(alert.resolvedDateTime).toBe(sampleBody.data.essentials.resolvedDateTime);
    expect(alert.resources).toEqual(expect.arrayContaining(["wcus-r2-gen2"]));
    expect(alert.resourceGroups).toEqual(expect.arrayContaining(["pipelinealertrg"]));
    expect(alert.resourceTypes).toEqual(expect.arrayContaining(["microsoft.compute/virtualmachines"]));
    const message = alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
アラート状態: 解決
アラート説明: アラートの説明です
アラート重要度: Sev3
アラート発生日時: 2019-03-22T13:58:24.3713213Z
アラート解決日時: 2019-03-22T14:03:16.2246313Z
アラート種別: Platform
リソース グループ: pipelinealertrg
リソース タイプ: microsoft.compute/virtualmachines
対象リソース: wcus-r2-gen2
`;
    expect(message).toBe(testmessage);
});

test("Alertcreate-ServiceHealth-Fired", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth.json").toString("utf8"))
    const alert = Alert.createAlert(sampleBody, sampleBody.data.essentials.monitoringService);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("障害発生");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe(sampleBody.data.essentials.firedDateTime);
    expect(alert.resolvedDateTime).toBe(sampleBody.data.essentials.resolvedDateTime);
    expect(alert.alertTargetIDs).toEqual(expect.arrayContaining(["/subscriptions/18d80846-9dcd-4b75-99a3-4f6746769768"]));
    const message = alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
アラート状態: 障害発生
アラート概要: Application Insights - East US - Mitigated
アラート重要度: Sev3
アラート発生日時: 2019-03-22T13:58:24.3713213Z
アラート解決日時: 2019-03-22T14:03:16.2246313Z
アラート種別: ServiceHealth
対象サブスクリプション: /subscriptions/18d80846-9dcd-4b75-99a3-4f6746769768
アラートタイプ: Incident
トラッキング ID: 9VR0-DS8
影響サービス[リージョン]: Application Insights[East US/South Central US/West US/West US 2]

Summary of impact: Between 17:46 and 23:10 UTC on 17 Mar 2020, you were identified as a customer using Application Insights in East US who may have experienced intermittent data latency, data gaps and incorrect alert activations for resources hosted in this region. More information can be found on https://aka.ms/appinsightsblog <https://aka.ms/appinsightsblog> .Preliminary root cause: Engineers determined that instances of a backend service that Application Insights depends on became unhealthy, preventing these requests from completing.Mitigation: Engineers determined that the backend service self-healed, allowing Application Insights to recover.Next steps: Engineers will continue to investigate to establish the full root cause and prevent future occurrences. Stay informed about Azure service issues by creating custom service health alerts: https://aka.ms/ash-videos <https://aka.ms/ash-videos> for video tutorials and https://aka.ms/ash-alerts <https://aka.ms/ash-alerts> for how-to documentation.
`;
    expect(message).toBe(testmessage);
});

test("Alertcreate-ServiceHealth-Fired2", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth2.json").toString("utf8"))
    const alert = Alert.createAlert(sampleBody, sampleBody.data.essentials.monitoringService);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("障害発生");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe(sampleBody.data.essentials.firedDateTime);
    expect(alert.resolvedDateTime).toBe("-");
    expect(alert.alertTargetIDs).toEqual(expect.arrayContaining(["/subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394"]));
    const message = alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
アラート状態: 障害発生
アラート概要: Log Analytics - Applying Mitigation
アラート重要度: Sev4
アラート発生日時: 2020-03-18T12:56:15.9264354
アラート解決日時: -
アラート種別: ServiceHealth
対象サブスクリプション: /subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394
アラートタイプ: Incident
トラッキング ID: 8V_4-FC0
影響サービス[リージョン]: Log Analytics[Australia Central/Australia East/Australia Southeast/Canada Central/Central India/East Asia/East US/East US 2/France Central/Japan East/Korea Central/North Central US/North Europe/South Central US/UK South/West Central US/West US/West US 2]

Starting at 09:51 UTC on 18 Mar 2020 you\nhave been identified as a customer using Log Analytics who may experience query failures and ingestion latency. Engineers are applying mitigation and some\ncustomers may be seeing signs of recovery at this time. <p></p>The\nnext update will be provided in 60 minutes, or as events warrant.<p></p>
`;
    expect(message).toBe(testmessage);
});