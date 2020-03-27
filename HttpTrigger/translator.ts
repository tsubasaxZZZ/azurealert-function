import * as uuidv4 from 'uuid/v4';
import axios, { AxiosInstance } from 'axios';
import { env } from "process"
import * as dotenv from "dotenv"
dotenv.config();

export const APIEndpoint = new Map<string, string>([
    ["EN2JA", `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=ja`],
]);

const SubscriptionKey = env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY;

export class TranslateAlert {
    private translateAPI: AxiosInstance;
    private translateAPIURL: string;

    constructor({ translateAPIURL }: { translateAPIURL: string; }) {
        this.translateAPIURL = translateAPIURL;
        this.translateAPI = axios.create({
            headers: {
                'Ocp-Apim-Subscription-Key': SubscriptionKey,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            }
        });
    }

    public async doTranslate(targetText: string): Promise<string> {
        // html タグ/改行を削除
        targetText = targetText.replace(/(<([^>]+)>)/ig, " ").replace(/\r?\n/g, " ").replace("  ", " ").trim();

        let translatedText: any = targetText;
        try {
            translatedText = await this.translateAPI.post(
                this.translateAPIURL, [{ "text": targetText }]
            );
            if (translatedText) {
                translatedText = translatedText.data[0].translations[0].text;
            }
        } catch (error) {
            // API でエラーが出た場合は、オリジナルの内容とする
            console.log(error);
            translatedText = targetText;
        }

        return translatedText;
    }
}