import { Body, FooterActions, useIOToast } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";
import { Alert } from "react-native";
import { useTranslate } from "@tolgee/react";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  appReviewNegativeFeedback,
  appReviewPositiveFeedback,
  TopicKeys
} from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { requestAppReview } from "../utils/storeReview";
import {
  appFeedbackEnabledSelector,
  appFeedbackUriConfigSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { canAskFeedbackSelector } from "../store/selectors";
import { tolgee } from "../../../App";

type AppFeedbackContextType = {
  requestFeedback: (topic: TopicKeys) => void;
};

export const AppFeedbackContext = createContext<AppFeedbackContextType>({
  requestFeedback: () => null
});

export const AppFeedbackProvider = ({ children }: PropsWithChildren) => {
  const [topic, setTopic] = useState<TopicKeys | undefined>();
  const dispatch = useIODispatch();
  const { show } = useIOToast();
  const surveyUrl = useIOSelector(appFeedbackUriConfigSelector(topic));
  const appFeedbackEnabled = useIOSelector(appFeedbackEnabledSelector);
  const canAskFeedback = useIOSelector(canAskFeedbackSelector(topic));
  const { t } = useTranslate();
  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: t("appFeedback.bottomSheet.title"),
    component: <Body>{t("appFeedback.bottomSheet.description")}</Body>,
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: t("appFeedback.bottomSheet.continue"),
            onPress: () => {
              if (surveyUrl) {
                void openAuthenticationSession(surveyUrl, "");
              }
              setTopic(undefined);
              dismiss();
            }
          },
          secondary: {
            label: t("appFeedback.bottomSheet.discard"),
            onPress: () => {
              show(t("appFeedback.toast.negativeFeedback"));
              setTopic(undefined);
              dismiss();
            }
          }
        }}
      />
    )
  });

  useEffect(() => {
    if (topic === undefined || !canAskFeedback) {
      return;
    }
    if (appFeedbackEnabled) {
      Alert.alert(
        t("appFeedback.alert.title"),
        tolgee.t("appFeedback.alert.description"),
        [
          {
            text: t("appFeedback.alert.discard"),
            onPress: () => {
              dispatch(appReviewNegativeFeedback(topic));
              present();
            }
          },
          {
            text: t("appFeedback.alert.continue"),
            style: "default",
            onPress: () => {
              requestAppReview();
              setTopic(undefined);
              dispatch(appReviewPositiveFeedback());
            }
          }
        ]
      );
    } else {
      requestAppReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appFeedbackEnabled, canAskFeedback, dispatch, present, topic]);

  return (
    <AppFeedbackContext.Provider value={{ requestFeedback: setTopic }}>
      {children}
      {bottomSheet}
    </AppFeedbackContext.Provider>
  );
};

export const useAppFeedbackContext = () => useContext(AppFeedbackContext);
