class LoggingMiddleware {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; 
  }

  static LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
  };

  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.persistLogs();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level}] ${message}`, data);
    }
  }

  info(message, data = null) {
    this.log(LoggingMiddleware.LEVELS.INFO, message, data);
  }

  warn(message, data = null) {
    this.log(LoggingMiddleware.LEVELS.WARN, message, data);
  }

  error(message, data = null) {
    this.log(LoggingMiddleware.LEVELS.ERROR, message, data);
  }

  debug(message, data = null) {
    this.log(LoggingMiddleware.LEVELS.DEBUG, message, data);
  }

  persistLogs() {
    try {
      localStorage.setItem('urlShortenerLogs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  loadLogs() {
    try {
      const storedLogs = localStorage.getItem('urlShortenerLogs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      this.error('Failed to load logs from localStorage', error);
    }
  }

  getLogs(level = null, limit = null) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('urlShortenerLogs');
  }
}

const loggingMiddleware = new LoggingMiddleware();

loggingMiddleware.loadLogs();

export default loggingMiddleware; 