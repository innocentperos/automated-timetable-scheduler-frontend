import type { Course, FetchError } from "~/types"

const __courses = ref<{
    [index: number]: Course[]
}>({})

const __coursesLoading = ref<{
    [index: number]: boolean
}>({})

async function __getTimetableCourses(
    timetablePk: number,
    pending?: Ref<boolean>,
    data?: Ref<Course[]>,
    error?: Ref<FetchError<string> | undefined>
) {
    try {
        if (pending) {
            pending.value = true
        } else {
            __coursesLoading.value[timetablePk] = true
        }

        const courses = await $fetch<Course[]>(`timetables/${timetablePk}/courses/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })
        if (data) {
            data.value = courses
        } else {
            __courses.value[timetablePk] = courses

            return computed(() => __courses.value[timetablePk])
        }
    } catch (_error) {
        if (error) {
            error.value = _error as FetchError<string>
        } else {
            throw error
        }
    } finally {
        if (pending) {
            pending.value = false
        } else {
            __coursesLoading.value[timetablePk] = false
        }
    }
}

function timetableCourses(timetablePk: number) {
    const error = ref<FetchError<string>>()
    if (!__courses.value[timetablePk]) {
        __courses.value[timetablePk] = []
        __coursesLoading.value[timetablePk] = false
        __getTimetableCourses(timetablePk, undefined, undefined, error)
    }

    return {
        pending: computed(() => __coursesLoading.value[timetablePk]),
        data: computed(() => __courses.value[timetablePk]),
        error: computed(() => error.value),
        execute: () => __getTimetableCourses(timetablePk, undefined, undefined, error),
    }
}
export const useTimetable = () => {
    return {
        timetableCourses,
    }
}
