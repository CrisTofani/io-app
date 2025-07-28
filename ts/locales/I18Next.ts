import OtaClient from "@crowdin/ota-client";
import i18next, { InitOptions, ModuleType } from "i18next";
import { initReactI18next } from "react-i18next";
import it from "../../locales/it/index.json";
import en from "../../locales/en/index.json";
import de from "../../locales/de/index.json";

class CrowdinOtaI18next {
  type: ModuleType;
  otaClient: OtaClient;

  constructor(hash: string) {
    this.type = "backend";
    this.otaClient = new OtaClient(hash);
  }

  read(language: string, _: any, callback: any) {
    this.otaClient
      .getStringsByLocale(language)
      .then(value => callback(null, value))
      .catch(e => callback(e, null));
  }
}

const module = new CrowdinOtaI18next("cb31c7d87a603b14565978a9cxg");

void i18next
  .use(module)
  .use(initReactI18next)
  .init({
    lng: "it",
    fallbackLng: "it",
    resources: {
      it,
      en,
      de
    }
  } as InitOptions);

export default i18next;
