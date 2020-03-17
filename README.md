# Azure Monitor アラートカスタム Functions

## これはなに？

Azure Monitor のアラートのアクション グループに設定できる、Azure Functions アプリケーションです。次の機能があります。

- Azure Monitor のアクション グループから共通スキーマのアラートを受信します
- SendGrid を使ってメールを送信します
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

### 1. Azure Functions の アプリケーション設定

以下をキーとし、予め設定しておきます。

- MailTo : 送信先のメールアドレスです。カンマ区切りで複数指定できます。
- SENDGRID_APIKEY : SendGrid の API キーを指定します。

### 2. Azure Functions にデプロイ

[Visual Studio Code での展開](https://docs.microsoft.com/ja-jp/azure/azure-functions/functions-create-first-function-vs-code?pivots=programming-language-csharp#publish-the-project-to-azure) が簡単です。

### 3. Azure Monitor のアクション グループの設定

[こちら](https://docs.microsoft.com/ja-jp/azure/azure-monitor/platform/action-groups)を参照します。

## 参考

[共通アラート スキーマ定義](https://docs.microsoft.com/ja-jp/azure/azure-monitor/platform/alerts-common-schema-definitions)

## 開発時の Tips

### 1. ローカル環境でのテスト

#### local.settings.json に以下を設定

func start した時に読み込まれます。

```json
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "SENDGRID_APIKEY": "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",
        "MailTo": "tsunomur@microsoft.com,tsubasa@nomupro.com"
    }
}
```

#### 環境変数に MailTo を設定

npm test した時に使います。

#### テスト

モジュール単位のテストは、`npm test` を実行します。 HttpTrigger/testdata にテスト用のアラート定義(Azure Monitorから渡されるもの)を保存しています。

func start を使用したテストは、Postman でリクエストを投げます。
