import type { Timetable } from "~/types"

export const useTimetableStore = defineStore("timetable-store", () => {
    const _timetables = ref<{ [pk: number]: Timetable | undefined }>({})

    function retrieve(pk: number) {
        return computed(() => _timetables.value[pk])
    }

    function insert(timetable: Timetable) {
        _timetables.value[timetable.pk] = timetable
    }

    function bulkInsert(timetables: Timetable[]) {
        timetables.forEach((timetable) => {
            insert(timetable)
        })
    }

    function remove(pk: number) {
        if (pk in _timetables.value) {
            delete _timetables.value[pk]
        }
    }

    function bulkRemove(pks: number[]) {
        pks.forEach((pk) => {
            remove(pk)
        })
    }

    return {
        retrieve,
        insert,
        bulkInsert,
        remove,
        bulkRemove,
        all: () => computed(() => Object.values(_timetables.value)),
    }
})
