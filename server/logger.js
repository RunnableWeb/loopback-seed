/**
 * @returns {Logger}
 */

class Logger {
  // TODO get from env..
  // private debugLevel = 'ERROR'

  constructor() { }

  info(entityName, message) {
    const msg = this._formatMsg(Logger.LEVELS.INFO, entityName, message);
    console.info(msg);
  }

  warning(entityName, message) {
    const msg = this._formatMsg(Logger.LEVELS.WARN, entityName, message);
    console.warn(msg);
  }

  error(entityName, message, err) {
    const msg = this._formatMsg(Logger.LEVELS.ERROR, entityName, message, err);
    console.error(msg);
  }

  debug(entityName, message) {
    const msg = this._formatMsg(Logger.LEVELS.DEBUG, entityName, message);
    console.debug(msg);
  }

  /**
   * 
   * @param {*} level 
   * @param {*} fileName 
   * @param {*} msg 
   * @param {*} obj 
   */
  _formatMsg(level, fileName, msg, obj) {
    return `[${level}][${fileName}] - ${msg} ${obj ? `- ${this._formatAsJson(obj)}` : ''}`;
  }

  _formatAsJson(obj) {
    try {
      return Object.keys(obj).length ? JSON.stringify(obj, Object.getOwnPropertyNames(obj)) : obj.toString();
    } catch (err) {
      return obj.toString();
    }
  }
}

Logger.LEVELS = {
  ERROR: 'ERROR',
  INFO: 'INFO',
  WARN: 'WARN',
  DEBUG: 'DEBUG',
  SILLY: 'SILLY'
};

module.exports = new Logger();