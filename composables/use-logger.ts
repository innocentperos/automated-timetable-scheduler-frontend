import { useDisplay } from "vuetify/lib/framework.mjs"

const listeners: { [key: symbol]: eventCallbak } = {}

type eventCallbak = (event: LogEvent) => void
type LogEvent = {
    level: "debug" | "info" | "warning" | "error" | "servere" | "fatal"
    stackTrace?: unknown
    error?: unknown
    message: string
    tag: string
}

function addListener(callback: eventCallbak) {
    const id = Symbol()
    listeners[id] = callback
    return id
}

function log(event: LogEvent) {
    const callbacks = Object.values<eventCallbak>(listeners)
    callbacks.forEach((listener) => listener(event))

    
    switch (event.level) {
        case "debug":
            console.debug(event)
            break
        case "info":
            console.info(event)
            break
        case "warning":
            console.warn(event)
            break
        default:
            console.error(event)
    }
}

function debug(tag: string, message: string, object?: unknown) {
    log({
        level: "debug",
        message: message,
        tag: tag,
        error: object,
    })
}

function info(tag: string, message: string, error: unknown) {
    log({
        level: "info",
        message: message,
        tag: tag,
        error: error,
    })
}

function error(tag: string, message: string, error: Error) {
    log({
        level: "debug",
        message: message,
        tag: tag,
        error: error,
    })
}

export const useLogger = function () {
    return {
        addListener,
        log,
        debug,
        info,
        error,
    }
}
