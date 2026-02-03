/**
 * Conditional logger utility for development vs production
 * Only logs in development mode to keep production console clean
 */

const isDev = import.meta.env.DEV

export const logger = {
    log: (...args: any[]) => {
        if (isDev) console.log(...args)
    },
    info: (...args: any[]) => {
        if (isDev) console.info(...args)
    },
    warn: (...args: any[]) => {
        if (isDev) console.warn(...args)
    },
    error: (...args: any[]) => {
        if (isDev) console.error(...args)
    },
    debug: (...args: any[]) => {
        if (isDev) console.debug(...args)
    }
}

export default logger
