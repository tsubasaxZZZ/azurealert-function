import * as uuidv4 from 'uuid/v4';
import axios, { AxiosInstance } from 'axios';
import { env } from "process"

const TranslateAPIURL = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=ja`;
const SubscriptionKey = env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY;

export class TranslateAlert {
    private translateAPI: AxiosInstance;
    constructor() {
        this.translateAPI = axios.create({
            headers: {
                'Ocp-Apim-Subscription-Key': SubscriptionKey,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            }
        });
    }

    public async translateEn2Ja(englishText: string): Promise<string | Error> {
        // html タグ/改行を削除
        englishText = englishText.replace(/(<([^>]+)>)/ig, " ").replace(/\r?\n/g, " ").replace("  ", " ").trim();

        let translatedText: any;
        try {
            translatedText = await this.translateAPI.post(
                TranslateAPIURL, [{ "text": englishText }]
            )
        } catch (error) {
            throw new Error(error);
        }
        if (translatedText) {
            return translatedText.data[0].translations[0].text;
        }
    }
}