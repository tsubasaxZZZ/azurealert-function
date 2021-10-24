import * as translator from "./translator"
import * as dotenv from "dotenv"

beforeAll(() => {
    dotenv.config();
});

test("Translator2", async () => {
    const s = `Starting at 09:51 UTC on 18 Mar 2020 you\nhave been identified as a customer using Log Analytics who may experience query failures and ingestion latency. Engineers are applying mitigation and some\ncustomers may be seeing signs of recovery at this time. <p></p>The\nnext update will be provided in 60 minutes, or as events warrant.<p></p>`;
    const t = new translator.TranslateAlert({ translateAPIURL: translator.APIEndpoint.get("EN2JA") });
    const d = await t.doTranslate(s);
    // 全文一致の場合翻訳が変わるとエラーになるので一部一致でもOKとする
    expect(d).toEqual(expect.stringContaining("2020 年"));
})
test("Translator-Error", async () => {
    const s = `Starting at 09:51 UTC on 18 Mar 2020 you\nhave been identified as a customer using Log Analytics who may experience query failures and ingestion latency. Engineers are applying mitigation and some\ncustomers may be seeing signs of recovery at this time. <p></p>The\nnext update will be provided in 60 minutes, or as events warrant.<p></p>`;
     // doTranslate でエラーとするためにわざと間違ったエンドポイントを指定 -> 400 Bad Request になる
    const t = new translator.TranslateAlert({ translateAPIURL: `https://api.cognitive.microsofttranslator.com/translate?api-version=0.0&from=en&to=ja` });
    const d = await t.doTranslate(s);
    expect(d).toBe(`Starting at 09:51 UTC on 18 Mar 2020 you have been identified as a customer using Log Analytics who may experience query failures and ingestion latency. Engineers are applying mitigation and some customers may be seeing signs of recovery at this time.  The next update will be provided in 60 minutes, or as events warrant.`);
})