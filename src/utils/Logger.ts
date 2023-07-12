const projectName = import.meta.env.VITE_GLOB_APP_TITLE;
const level = import.meta.env.VITE_LOGGER_LEVEL;

const log = (message?: any, ...optionalParams: any[]) => {
  if (level >= 0 && level <= 4) {
    console.log(`[${projectName} warn]:${message}`, optionalParams);
  }
};

const warn = (message?: any, ...optionalParams: any[]) => {
  if (level >= 3 && level <= 4) {
    console.warn(`[${projectName} warn]:${message}`, optionalParams);
  }
};

const error = (message?: any, ...optionalParams: any[]) => {
  if (level == 4) {
    console.error(`[${projectName} error]:${message}`, optionalParams);
  }
};

export const logger = {
  log: log,
  warn: warn,
  error: error,
};
