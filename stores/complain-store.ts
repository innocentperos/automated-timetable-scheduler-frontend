import type { FetchError } from "~/types"
import type { Complain, ComplainMessage, TableComlain } from "~/typing/timetable"

async function __loadComplain(
    pk: number,
    set: (complain: Complain) => void,
    setPending?: (pk: number, state: boolean) => void,

    setError?: (pk: number, error: FetchError<string> | undefined) => void
) {
    try {
        if (setPending) {
            setPending(pk, true)
        }
        const complain = await $fetch<Complain>(`complains/${pk}/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })

        set(complain)
        if (setError) setError(pk, undefined)
    } catch (error) {
        useLogger().error("ComplainsStore", "Could not get the complain", error as Error)
        if (setError) {
            setError(pk, error as FetchError<string>)
        } else {
            throw error
        }
    } finally {
        if (setPending) {
            setPending(pk, false)
        }
    }
}

async function __loadSlotComplains(
    pk: number,
    set: (complain: Complain[]) => void,
    setPending?: (pk: number, state: boolean) => void,

    setError?: (pk: number, error: FetchError<string> | undefined) => void
) {
    try {
        if (setPending) {
            setPending(pk, true)
        }
        const complain = await $fetch<Complain[]>(`complains/${pk}/slot/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })

        set(complain)
        if (setError) setError(pk, undefined)
    } catch (error) {
        useLogger().error("ComplainsStore", "Could not get the slot complains", error as Error)
        if (setError) {
            setError(pk, error as FetchError<string>)
        } else {
            throw error
        }
    } finally {
        if (setPending) {
            setPending(pk, false)
        }
    }
}

export const useComplainStore = defineStore("complain-store", function () {
    const complains = ref<{
        [key: number]: Complain
    }>({})

    const complainLoading = ref<{
        [key: number]: boolean
    }>({})

    const complainError = ref<{
        [key: number]: FetchError<string> | undefined
    }>({})

    const slotComplainError = ref<{
        [key: number]: FetchError<string> | undefined
    }>({})

    const slotComplainLoading = ref<{
        [key: number]: boolean
    }>({})

    const slotComplainMapping = ref<{
        [key: number]: number[]
    }>({})

    function get(pk: number) {
        return computed(() => complains.value[pk])
    }

    function load(pk: number, wait = false) {
        if (!complains.value[pk] && wait == false) {
            __loadComplain(
                pk,
                set,
                (pk, pendingStatus) => {
                    complainLoading.value[pk] = pendingStatus
                },
                (pk, error) => {
                    complainError.value[pk] = error
                }
            )
        }
        return {
            data: computed(() => complains.value[pk]),
            pending: computed(() => complainLoading.value[pk]),
            refresh: () => {
                __loadComplain(
                    pk,
                    set,
                    (pk, pendingStatus) => {
                        complainLoading.value[pk] = pendingStatus
                    },
                    (pk, error) => {
                        complainError.value[pk] = error
                    }
                )
            },
        }
    }

    function loadSlot(pk: number) {
        if (!slotComplainMapping.value[pk]) {
            __loadSlotComplains(
                pk,
                (complains) => {
                    slotComplainMapping.value[pk] = complains.map((complain) => complain.pk)
                    complains.forEach((complain) => set(complain))
                },
                (pk, pendingStatus) => {
                    slotComplainLoading.value[pk] = pendingStatus
                },
                (pk, error) => {
                    slotComplainError.value[pk] = error
                }
            )
        }

        return {
            data: computed(() => {
                if (!slotComplainMapping.value[pk]) {
                    return []
                }

                return slotComplainMapping.value[pk].map(
                    (complainPk) => complains.value[complainPk]
                )
            }),
            pending: computed(() => slotComplainLoading.value[pk]),
            error: computed(() => slotComplainError.value[pk]),
            refresh: () => {
                __loadSlotComplains(
                    pk,
                    (complains) => {
                        slotComplainMapping.value[pk] = complains.map((complain) => complain.pk)
                        complains.forEach((complain) => set(complain))
                    },
                    (pk, pendingStatus) => {
                        slotComplainLoading.value[pk] = pendingStatus
                    },
                    (pk, error) => {
                        slotComplainError.value[pk] = error
                    }
                )
            },
        }
    }

    function isAvailable(pk: number) {
        return computed(() => {
            if (complains.value[pk]) return true
            return false
        })
    }

    function isLoading(pk: number) {
        return computed(() => complainLoading.value[pk])
    }

    function set(complain: Complain) {
        complains.value[complain.pk] = complain
    }

    function addMessage(message: ComplainMessage) {
        if (message.complain && complains.value[message.complain]) {
            complains.value[message.complain].messages.push(message)
        }
    }

    async function __loadTimetableComplains(
        id: number,
        data: globalThis.Ref<TableComlain[]>,
        pending: globalThis.Ref<boolean>,
        error: globalThis.Ref<FetchError<string> | undefined>
    ) {
        try {
            pending.value = true
            const complains = await $fetch<TableComlain[]>(`complains/${id}/timetable/`, {
                baseURL: useRuntimeConfig().public.baseURL,
                headers: useFetchHeader([]),
            })
            data.value = complains
        } catch (_error) {
            error.value = _error as FetchError<string>
        } finally {
            pending.value = false
        }
    }

    function loadTable(tablePk: number, auto = true) {
        const pending = ref(false)
        const error = ref<FetchError<string>>()
        const data = ref<TableComlain[]>([])

        if (auto) {
            __loadTimetableComplains(tablePk, data, pending, error)
        }

        return {
            pending: computed(() => pending.value),
            data: computed(() => data.value),
            error: computed(() => error.value),
            refresh: () => {
                __loadTimetableComplains(tablePk, data, pending, error)
            },
        }
    }

    return {
        get,
        set,
        load,
        isAvailable,
        isLoading,
        addMessage,

        loadSlot,
        loadTable,
    }
})
