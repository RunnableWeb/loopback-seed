/**
 * LocaleService
 */
class LocaleService {
    /**
     *
     * @param i18nProvider The i18n provider
     */
    constructor(i18nProvider) {
      this.i18nProvider = i18nProvider;
      this._currentReq = null;
    }
    /**
     *
     * @returns {string} The current locale code
     */
    getCurrentLocale(req) {
      return this.i18nProvider.getLocale(req);
    }
    /**
     *
     * @returns string[] The list of available locale codes
     */
    getLocales() {
      return this.i18nProvider.getLocales();
    }
    /**
     *
     * @param locale The locale to set. Must be from the list of available locales.
     */
    setLocale(req ,locale) {
      this._currentReq = req;
      if (this.getLocales().indexOf(locale) !== -1) {
        this.i18nProvider.setLocale(req, locale);
      }
    }
    /**
     *
     * @param key String to translate
     * @param args Extra parameters
     * @returns {string} Translated string
     */
    translate(key, locale= undefined, args = undefined) {
      let translation = '';
      if(locale) {
        translation =  this.i18nProvider.__({phrase: key, locale}, args);
      } else {
        translation = this._currentReq.__(key, args);
      }
      
      return translation;
    }

    translateDefault(key, args = undefined) {
      return this.i18nProvider.__(
        { phrase: key, locale: this.getDefaultLocale() },
        args
      );
    }

    getDefaultLocale() {
      return this.i18nProvider.getLocale();
    }

    /**
     *
     * @param phrase Object to translate
     * @param count The plural number
     * @returns {string} Translated string
     */
    translatePlurals(phrase, count) {
      return this._currentReq.__n(phrase, count)
    }
  }

  module.exports = LocaleService;