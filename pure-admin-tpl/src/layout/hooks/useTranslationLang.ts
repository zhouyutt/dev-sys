import { useNav } from "./useNav";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { watch, onBeforeMount, type Ref } from "vue";

export function useTranslationLang(ref?: Ref) {
  const { $storage, changeTitle, handleResize } = useNav();
  const { locale, t } = useI18n();
  const route = useRoute();

  function setLocale(lang: "zh" | "en" | "ms") {
    $storage.locale = { locale: lang };
    locale.value = lang;
    ref && handleResize(ref.value);
  }

  function translationCh() {
    setLocale("zh");
  }

  function translationEn() {
    setLocale("en");
  }

  function translationMs() {
    setLocale("ms");
  }

  watch(
    () => locale.value,
    () => {
      changeTitle(route.meta);
    }
  );

  onBeforeMount(() => {
    const savedLocale = $storage.locale?.locale;
    locale.value = ["zh", "en", "ms"].includes(savedLocale)
      ? savedLocale
      : "zh";
  });

  return {
    t,
    route,
    locale,
    translationCh,
    translationEn,
    translationMs
  };
}
