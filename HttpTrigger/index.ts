import { AzureFunction, Context, HttpRequest } from "@azure/functions"
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

    context.log(req.body);
    const toObj = [];
    for (const t of env.MailTo.split(",")) {
        toObj.push({ "email": t })
    }
    context.log("Send to:" + JSON.stringify(toObj));

    // アラートの中身
    const alertContext = req.body.data.essentials.alertContext;

    // アラートの種類によってメッセージを構築する
    const alertMessage = createAlertMessageByService(context, alertContext, req.body.data.essentials.monitoringService);

    const messageValue = `アラート名: ${req.body.data.essentials.alertRule}
アラート状態: ${req.body.data.essentials.monitorCondition}
${alertMessage}`;

    const message = {
        "personalizations": [{ "to": toObj }],
        from: { email: "tsunomur@microsoft.com" },
        subject: req.body.data.essentials.alertRule,
        content: [{
            type: 'text/plain',
            value: messageValue
        }]
    };
    context.bindings.sendgrid = message;
    context.done();

};

function createAlertMessageByService(context: Context, alertContext: string, monitoringService: string): string {
    context.log(alertContext);
    return ""
}

export default httpTrigger;