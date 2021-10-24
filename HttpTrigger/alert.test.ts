import * as fs from "fs"
import * as dotenv from "dotenv"
import { BaseAlert, factoryAlert } from "./alert"

beforeAll(() => {
    dotenv.config();
});

test("Alertcreate-Platform-Resolved", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_platform.json").toString("utf8"))
    const alert = await factoryAlert(sampleBody);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("解決");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe("2019-03-22 22:58:24");
    expect(alert.resolvedDateTime).toBe("2019-03-22 23:03:16");
    expect(alert.resources).toEqual(expect.arrayContaining(["wcus-r2-gen2"]));
    expect(alert.resourceGroups).toEqual(expect.arrayContaining(["pipelinealertrg"]));
    expect(alert.resourceTypes).toEqual(expect.arrayContaining(["microsoft.compute/virtualmachines"]));
    const message = await alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
状態: 解決
説明: アラートの説明です
重要度: Sev3
発生日時: 2019-03-22 22:58:24
解決日時: 2019-03-22 23:03:16
種別: Platform
リソース グループ: pipelinealertrg
リソース タイプ: microsoft.compute/virtualmachines
対象: wcus-r2-gen2
`;
    expect(message).toBe(testmessage);
});

test("Alertcreate-ServiceHealth-Fired", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth.json").toString("utf8"))
    const alert = await factoryAlert(sampleBody);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("通知");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe("2019-03-22 22:58:24");
    expect(alert.resolvedDateTime).toBe("2019-03-22 23:03:16");
    expect(alert.alertTargetIDs).toEqual(expect.arrayContaining(["/subscriptions/18d80846-9dcd-4b75-99a3-4f6746769768"]));
    const message = await alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
概要: Application Insights - East US - Mitigated
重要度: Sev3
発生日時: 2019-03-22 22:58:24
解決日時: 2019-03-22 23:03:16
種別: ServiceHealth
対象: /subscriptions/18d80846-9dcd-4b75-99a3-4f6746769768
タイプ: Incident
トラッキング ID: 9VR0-DS8
影響サービス[リージョン]: Application Insights[East US/South Central US/West US/West US 2]
`;
    expect(message).toEqual(expect.stringContaining(testmessage));
});

test("Alertcreate-ServiceHealth-Fired2", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth2.json").toString("utf8"))
    const alert = await factoryAlert(sampleBody);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("通知");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe("2020-03-18 21:56:15");
    expect(alert.resolvedDateTime).toBe("-");
    expect(alert.alertTargetIDs).toEqual(expect.arrayContaining(["/subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394"]));
    const message = await alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
概要: Log Analytics - Applying Mitigation
重要度: Sev4
発生日時: 2020-03-18 21:56:15
解決日時: -
種別: ServiceHealth
対象: /subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394
タイプ: Incident
トラッキング ID: 8V_4-FC0
影響サービス[リージョン]: Log Analytics[Australia Central/Australia East/Australia Southeast/Canada Central/Central India/East Asia/East US/East US 2/France Central/Japan East/Korea Central/North Central US/North Europe/South Central US/UK South/West Central US/West US/West US 2]
`;
    expect(message).toEqual(expect.stringContaining(testmessage));
});