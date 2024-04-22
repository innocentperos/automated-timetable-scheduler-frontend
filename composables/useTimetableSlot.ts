import type { FetchError } from "~/types"
import type { TimetableSlot } from "~/typing/timetable"

async function __assignVenues(
    slotPk: number,
    pending: Ref<boolean>,
    error: Ref<FetchError<string> | undefined>,
    callback: undefined | (() => void)
) {
    try {
        pending.value = true
        await $fetch(`slots/${slotPk}/auto_assign_venues/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "POST",
            headers: useFetchHeader([]),
        })
        pending.value = false
        if (callback) callback()
    } catch (_error) {
        useLogger().error("useTimetableSlot", "Could not assign venues", _error as Error)
        error.value = _error as FetchError<string>
    } finally {
        pending.value = false
    }
}
function assignVenues(slot: TimetableSlot, callback: undefined | (() => void)) {
    const pending = ref(false)
    const error = ref<FetchError<string>>()

    return {
        pending,
        error,
        execute: (slot: TimetableSlot) => {
            __assignVenues(slot.pk!, pending, error, callback)
        },
    }
}

// For assigning invigilators

async function __assignInvigilators(
    slotPk: number,
    pending: Ref<boolean>,
    error: Ref<FetchError<string> | undefined>,
    callback: undefined | (() => void)
) {
    try {
        pending.value = true
        await $fetch(`slots/${slotPk}/auto_assign_invigilators/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
            method: "POST",
        })
        pending.value = false
        if (callback) callback()
    } catch (_error) {
        useLogger().error("useTimetableSlot", "Could not assign venues", _error as Error)
        error.value = _error as FetchError<string>
    } finally {
        pending.value = false
    }
}
function assignInvigilators(slot: TimetableSlot, callback: undefined | (() => void)) {
    const pending = ref(false)
    const error = ref<FetchError<string>>()

    return {
        pending,
        error,
        execute: (slot: TimetableSlot) => {
            __assignInvigilators(slot.pk!, pending, error, callback)
        },
    }
}

export const useTimetableSlot = () => {
    return { assignVenues, assignInvigilators }
}
