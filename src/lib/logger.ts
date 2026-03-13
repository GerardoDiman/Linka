/**
 * Conditional logger utility for development vs production.
 * - log, info, debug: only in development (keeps production console clean)
 * - warn, error: ALWAYS logged (critical for production observability)
 */

const isDev = import.meta.env.DEV

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args)
    },
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args)
    },
    warn: (...args: unknown[]) => {
        console.warn(...args)
    },
    error: (...args: unknown[]) => {
        console.error(...args)
    },
    debug: (...args: unknown[]) => {
        if (isDev) console.debug(...args)
    }
}

export default logger
