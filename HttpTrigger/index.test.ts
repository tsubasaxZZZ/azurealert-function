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
アラート発生日時: 2019-03-22T13:58:24.3713213Z
アラート解決日時: 2019-03-22T14:03:16.2246313Z
アラート種別: Platform
リソース グループ: pipelinealertrg
リソース タイプ: microsoft.compute/virtualmachines
対象リソース: wcus-r2-gen2
`;
    expect(ctx.bindings.sendgrid.subject).toBe(`解決: ${defaultMailSetting.subject}`);
    expect(ctx.bindings.sendgrid.content[0].value).toBe(messageValue);

});