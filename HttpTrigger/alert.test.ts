import * as fs from "fs"
import * as dotenv from "dotenv"
import { BaseAlert } from "./alert"

beforeAll(() => {
    dotenv.config();
});

test("Alertcreate-Platform-Resolved", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_platform.json").toString("utf8"))
    const alert = BaseAlert.createAlert(sampleBody);
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
アラート状態: 解決
アラート説明: アラートの説明です
アラート重要度: Sev3
アラート発生日時: 2019-03-22 22:58:24
アラート解決日時: 2019-03-22 23:03:16
アラート種別: Platform
リソース グループ: pipelinealertrg
リソース タイプ: microsoft.compute/virtualmachines
対象リソース: wcus-r2-gen2
`;
    expect(message).toBe(testmessage);
});

test("Alertcreate-ServiceHealth-Fired", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth.json").toString("utf8"))
    const alert = BaseAlert.createAlert(sampleBody);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("通知");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe("2019-03-22 22:58:24");
    expect(alert.resolvedDateTime).toBe("2019-03-22 23:03:16");
    expect(alert.alertTargetIDs).toEqual(expect.arrayContaining(["/subscriptions/18d80846-9dcd-4b75-99a3-4f6746769768"]));
    const message = await alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
アラート概要: Application Insights - East US - Mitigated
アラート重要度: Sev3
アラート発生日時: 2019-03-22 22:58:24
アラート解決日時: 2019-03-22 23:03:16
アラート種別: ServiceHealth
対象サブスクリプション: /subscriptions/18d80846-9dcd-4b75-99a3-4f6746769768
アラートタイプ: Incident
トラッキング ID: 9VR0-DS8
影響サービス[リージョン]: Application Insights[East US/South Central US/West US/West US 2]

影響の概要: 2020 年 3 月 17 日の 17:46 から 23:10 UTC の間に、この地域でホストされているリソースの断続的なデータ待ち時間、データ ギャップ、および不適切なアラートのアクティブ化が発生した可能性がある米国東部のアプリケーション インサイトを使用して、顧客として識別されました。詳細については、 https://aka.ms/appinsightsblog を参照してください。 予備的な根本原因: エンジニアは、Application Insights が依存するバックエンド サービスのインスタンスが異常になり、これらの要求が完了するのを防いでいると判断しました。 軽減策: バックエンド サービスが自己修復されたと判断し、アプリケーションインサイトを回復できるようにしました。 次のステップ: エンジニアは引き続き調査を行い、根本原因を完全に確立し、今後の発生を防ぎます。カスタム サービス正常性アラート (ビデオ チュートリアルのhttps://aka.ms/ash-videos、ハウツー ドキュメントのhttps://aka.ms/ash-alerts) を作成して、Azure サービスの問題に関する情報を常に把握します。
`;
    expect(message).toBe(testmessage);
});

test("Alertcreate-ServiceHealth-Fired2", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth2.json").toString("utf8"))
    const alert = BaseAlert.createAlert(sampleBody);
    expect(alert.subject).toBe(sampleBody.data.essentials.alertRule);
    expect(alert.monitorCondition).toBe("通知");
    expect(alert.description).toBe(sampleBody.data.essentials.description);
    expect(alert.severity).toBe(sampleBody.data.essentials.severity);
    expect(alert.firedDateTime).toBe("2020-03-18 21:56:15");
    expect(alert.resolvedDateTime).toBe("-");
    expect(alert.alertTargetIDs).toEqual(expect.arrayContaining(["/subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394"]));
    const message = await alert.createMessage();
    const testmessage: string = `アラート名: ${alert.subject}
アラート概要: Log Analytics - Applying Mitigation
アラート重要度: Sev4
アラート発生日時: 2020-03-18 21:56:15
アラート解決日時: -
アラート種別: ServiceHealth
対象サブスクリプション: /subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394
アラートタイプ: Incident
トラッキング ID: 8V_4-FC0
影響サービス[リージョン]: Log Analytics[Australia Central/Australia East/Australia Southeast/Canada Central/Central India/East Asia/East US/East US 2/France Central/Japan East/Korea Central/North Central US/North Europe/South Central US/UK South/West Central US/West US/West US 2]

2020 年 3 月 18 日の 09:51 UTC 以降、Log Analytics を使用して、クエリの失敗やインジェスの待機時間が発生する可能性がある顧客として識別されました。エンジニアは緩和策を適用しており、一部のお客様は現時点で回復の兆しを見ている可能性があります。 次回の更新プログラムは、60 分後に提供されるか、またはイベントの保証として提供されます。
`;
    expect(message).toBe(testmessage);
});