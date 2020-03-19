import { TranslateAlert } from "./translator"

test("Translator1", async () => {
    const t = new TranslateAlert();
    const d = await t.translateEn2Ja("Test");
    expect(d).toBe("テスト");
})
test("Translator2", async () => {
    const s = `Starting at 09:51 UTC on 18 Mar 2020 you\nhave been identified as a customer using Log Analytics who may experience query failures and ingestion latency. Engineers are applying mitigation and some\ncustomers may be seeing signs of recovery at this time. <p></p>The\nnext update will be provided in 60 minutes, or as events warrant.<p></p>`;
    const t = new TranslateAlert();
    const d = await t.translateEn2Ja(s);
    expect(d).toBe("2020 年 3 月 18 日の 09:51 UTC 以降、Log Analytics を使用して、クエリの失敗やインジェスの待機時間が発生する可能性がある顧客として識別されました。エンジニアは緩和策を適用しており、一部のお客様は現時点で回復の兆しを見ている可能性があります。 次回の更新プログラムは、60 分後に提供されるか、またはイベントの保証として提供されます。");
})