import httpTrigger from "."
import { Context } from "@azure/functions"
import * as fs from "fs"

function createLogFunc() {
    const log = function (...args: any) {
        console.log(args);
    }
    log.warn = (...args: any[]) => { };
    log.error = (...args: any[]) => { };
    log.info = (...args: any[]) => { };
    log.verbose = (...args: any[]) => { };
    return log;
}
const ctx: Context = {
    bindingData: {},
    invocationId: "",
    bindingDefinitions: [],
    bindings: {},
    done: jest.fn(),
    log: createLogFunc(),
    executionContext: <any>{},
    traceContext: <any>{}
}

const defaultMailSetting = {
    "personalizations": [{ "to": [{ "email": "tsubasa@nomupro.com" }, { "email": "tsunomur@nomupro.com" }] }],
    from: { email: "tsunomur@microsoft.com" },
    subject: "WCUS-R2-Gen2",
    content: [{
        type: 'text/plain',
        value: "HOGEHOGE"
    }]
};

// Platform アラートのテスト
test("SendMail-Platform-Resolved", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_platform.json").toString("utf8"))
    const req = {
        body: sampleBody,
        query: {}
    };

    await httpTrigger(ctx, req);

    console.log(ctx.bindings.sendgrid.content);

    const messageValue: string = `アラート名: WCUS-R2-Gen2
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
    expect(ctx.bindings.sendgrid.subject).toBe(`解決: ${defaultMailSetting.subject}`);
    expect(ctx.bindings.sendgrid.content[0].value).toBe(messageValue);

});

// Log Analytics アラートのテスト
test("SendMail-LogAnalytics-Resolved", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_loganalytics.json").toString("utf8"))
    const req = {
        body: sampleBody,
        query: {}
    };

    await httpTrigger(ctx, req);

    console.log(ctx.bindings.sendgrid.content);

    const messageValue: string = `アラート名: WCUS-R2-Gen2
アラート状態: 解決
アラート説明: アラートの説明です
アラート重要度: Sev3
アラート発生日時: 2019-03-22 22:58:24
アラート解決日時: 2019-03-22 23:03:16
アラート種別: Log Analytics
リソース グループ: pipelinealertrg
リソース タイプ: microsoft.compute/virtualmachines
対象リソース: wcus-r2-gen2
`;
    expect(ctx.bindings.sendgrid.subject).toBe(`解決: ${defaultMailSetting.subject}`);
    expect(ctx.bindings.sendgrid.content[0].value).toBe(messageValue);

});

// Service Health アラートのテスト
test("SendMail-ServiceHealth-Resolved", async () => {
    const sampleBody = JSON.parse(fs.readFileSync("./HttpTrigger/testdata/test_servicehealth2.json").toString("utf8"))
    const req = {
        body: sampleBody,
        query: {}
    };

    await httpTrigger(ctx, req);

    console.log(ctx.bindings.sendgrid.content);

    const messageValue: string = `アラート名: 正常性アラート
アラート概要: Log Analytics - Applying Mitigation
アラート重要度: Sev4
アラート発生日時: 2020-03-18 21:56:15
アラート解決日時: -
アラート種別: ServiceHealth
対象サブスクリプション: /subscriptions/33325c7f-089d-493b-9ad9-1400a8da5394
アラートタイプ: Incident
トラッキング ID: 8V_4-FC0
影響サービス[リージョン]: Log Analytics[Australia Central/Australia East/Australia Southeast/Canada Central/Central India/East Asia/East US/East US 2/France Central/Japan East/Korea Central/North Central US/North Europe/South Central US/UK South/West Central US/West US/West US 2]

Starting at 09:51 UTC on 18 Mar 2020 you\nhave been identified as a customer using Log Analytics who may experience query failures and ingestion latency. Engineers are applying mitigation and some\ncustomers may be seeing signs of recovery at this time. <p></p>The\nnext update will be provided in 60 minutes, or as events warrant.<p></p>
`;
    expect(ctx.bindings.sendgrid.subject).toBe(`通知: 正常性アラート`);
    expect(ctx.bindings.sendgrid.content[0].value).toBe(messageValue);

});