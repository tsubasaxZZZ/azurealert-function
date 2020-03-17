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