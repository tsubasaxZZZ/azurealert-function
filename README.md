# Azure Monitor アラートカスタム Functions

## これはなに？

Azure Monitor のアラートのアクション グループに設定できる、Azure Functions アプリケーションです。次の機能があります。

- Azure Monitor のアクション グループから共通スキーマのアラートを受信します
- SendGrid を使ってメールを送信します
- Cognitive Service(Translator Text API) を使って翻訳します
- 複数の宛先にテキストメールを送信します

以下のようなアラートを受信できます。

```txt
アラート名: Azure Function と連携したテストアラートです
アラート状態: 解決
アラート説明: アラートの説明です。
アラート重要度: Sev3
アラート発生日時: 2020-03-17T10:29:43.0282546Z
アラート解決日時: 2020-03-17T10:32:39.3435543Z
アラート種別: Platform
リソース グループ: sjk-ftp-test
リソース タイプ: microsoft.compute/virtualmachines
対象リソース: ftpvm
```

## 環境

- Azure Functions ランタイム v2.0 で動作します
- Node.js(TypeScript) で作成しています

## セットアップの手順

### 1. Azure Functions にデプロイ

[Visual Studio Code での展開](https://docs.microsoft.com/ja-jp/azure/azure-functions/functions-create-first-function-vs-code?pivots=programming-language-csharp#publish-the-project-to-azure) が簡単です。

### 2. Azure Monitor のアクション グループの設定

[こちら](https://docs.microsoft.com/ja-jp/azure/azure-monitor/platform/action-groups)を参照します。

### 3. SendGrid のデプロイ

メール送信に使用する SendGrid をデプロイします。

### 4. Translator Text のデプロイ

メールの翻訳に使用する Translator Text をデプロイします。

### 5. Azure Functions の アプリケーション設定

以下をキーとして設定します。

- MailTo : 送信先のメールアドレスです。カンマ区切りで複数指定できます。
- SENDGRID_APIKEY : SendGrid の API キーを指定します。
- TRANSLATOR_TEXT_SUBSCRIPTION_KEY: Translator API のキーを指定します。

## 参考

[共通アラート スキーマ定義](https://docs.microsoft.com/ja-jp/azure/azure-monitor/platform/alerts-common-schema-definitions)

## 開発時の Tips

### ローカル環境でのテスト

ローカル環境では 2 つのテスト方法があります。

1 つ目は単体テスト(npm test)、2 つ目は結合テスト(npm run start)です。結合テストは、HttpTriger をテストするため、Postman 等を使って HTTP リクエストを投げる必要があります。

#### local.settings.json に以下を設定

npm run start(func start) した時に読み込まれます。

```json
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "SENDGRID_APIKEY": "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",
        "MailTo": "tsunomur@microsoft.com,tsubasa@nomupro.com",
        "TRANSLATOR_TEXT_SUBSCRIPTION_KEY": "74b2c19e0e604ee584dc9999996d0ba6"
    }
}
```

#### 環境変数に MailTo を設定

npm test した時のテストに使います。.env ファイルを作成して、local.settings.json と同じキー・値を設定することもできます。

#### テスト

モジュール単位のテストは、`npm test` を実行します。 HttpTrigger/testdata にテスト用のアラート定義(Azure Monitorから渡されるもの)を保存しています。

func start を使用したテストは、Postman でリクエストを投げます。
