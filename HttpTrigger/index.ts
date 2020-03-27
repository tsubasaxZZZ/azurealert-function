import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BaseAlert } from "./alert";
import { env } from "process"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

    context.log("Received alert request:" + JSON.stringify(req.body));
    const toObj = [];
    for (const t of env.MailTo.split(",")) {
        toObj.push({ "email": t })
    }
    context.log("Send to:" + JSON.stringify(toObj));

    // アラートの種類によってメッセージを構築する
    let alert: BaseAlert;
    let alertContent: string;
    let alertSubject: string;
    try {
        alert = BaseAlert.createAlert(req.body);
        alertSubject = `${alert.monitorCondition}: ${alert.subject}`
        alertContent = await alert.createMessage();
    } catch (error) {
        context.log(error);
        alertSubject = "アラートの解析に失敗しました";
        alertContent = "アラートの解析に失敗しました。Azure ポータルから Application Insights にアクセスし、エラーを確認してください。";
    }

    const message = {
        "personalizations": [{ "to": toObj }],
        from: { email: "azure-noreply@microsoft.com" },
        subject: alertSubject,
        content: [{
            type: 'text/plain',
            value: alertContent
        }]
    };
    context.bindings.sendgrid = message;
    context.done();

};

export default httpTrigger;