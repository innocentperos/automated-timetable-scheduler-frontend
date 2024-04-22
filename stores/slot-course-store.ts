import type { FetchError } from "~/types"
import type { SlotCourse } from "~/typing/timetable"

export const useSlotCourseStore = defineStore("slot-course", () => {
    const __slotCourses = ref<{ [id: number]: SlotCourse }>({})
    const __PendingSlotCourses = ref<{ [id: number]: boolean }>({})
    const __ErrorSlotCourses = ref<{ [id: number]: FetchError<string> }>({})

    function get(pk: number): ComputedRef<SlotCourse> {
        return computed(() => __slotCourses.value[pk])
    }

    function set(slot_course: SlotCourse) {
        __slotCourses.value[slot_course.pk!] = slot_course
    }

    async function __load(pk: number) {
        try {
            __PendingSlotCourses.value[pk] = true

            const slot_course = await $fetch<SlotCourse>(`slot_courses/${pk}/`, {
                method: "GET",
                baseURL: useRuntimeConfig().public.baseURL,
                headers: useFetchHeader([]),
            })

            set(slot_course)
        } catch (error) {
            const _error = error as FetchError<string>
            useLogger().error(
                "slot-course-store",
                "Error getting slot course with id " + pk,
                error as Error
            )

            __ErrorSlotCourses.value[pk] = _error
        } finally {
            __PendingSlotCourses.value[pk] = false
        }
    }

    function load(pk: number) {
        return {
            data: get(pk),
            pending: computed(() => __PendingSlotCourses.value[pk]),
            error: computed(() => __ErrorSlotCourses.value[pk]),
            refresh: () => __load(pk),
        }
    }

    return {
        get,
        set,
        load,
    }
})
