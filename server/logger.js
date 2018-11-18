let stInstance;

/**
 * @returns {Logger}
 */
module.exports = function() {  
    stInstance = stInstance || new Logger();
    return stInstance;
}

class Logger {
    // TODO get from env..
    // private debugLevel = 'ERROR'
  
    constructor() { }

    info(entityName, message) {
      const { _formatMsg} = this;
      const msg = _formatMsg(Logger.LEVELS.INFO, entityName, message);
      console.info(msg);
    }
  
    warning(entityName, message) {    
      const { _formatMsg} = this;
      const msg = _formatMsg(Logger.LEVELS.WARN, entityName, message);
      console.warn(msg);
    }
  
    error(entityName, message, err) {
      const { _formatMsg} = this;
      const msg = _formatMsg(Logger.LEVELS.ERROR, entityName, message, err);
      console.error(msg);
    }

    debug(entityName, message) {
      const { _formatMsg} = this;
      const msg = _formatMsg(Logger.LEVELS.DEBUG, entityName, message);
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
        return `[${level}][${fileName}] - ${msg} ${obj ? `- ${obj}`: ''}`;
    }
  }

Logger.LEVELS = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    WARN: 'WARN',
    DEBUG: 'DEBUG',
    SILLY: 'SILLY'
};