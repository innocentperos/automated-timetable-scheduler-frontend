import type { Course, FetchError } from "~/types"

export const useCourse = () => {
    const __courses = ref<{ [pk: number]: Course }>({})
    const __coursesPending = ref<{ [pk: number]: boolean }>({})
    const __coursesErrors = ref<{ [pk: number]: FetchError<string> | undefined }>({})

    async function __fetch(pk: number) {
        try {
            __coursesPending.value[pk] = true

            const course = await $fetch<Course>(`/courses/${pk}/`, {
                baseURL: useRuntimeConfig().public.baseURL,
                headers: useFetchHeader([]),
            })

            __courses.value[pk] = course
            __coursesErrors.value[pk] = undefined
        } catch (_error) {
            const error = _error as FetchError<string>

            __coursesErrors.value[pk] = error
        } finally {
            __coursesPending.value[pk] = false
        }
    }

    const get = (pk: number, latest: boolean = false) => {
        const value = computed(() => __courses.value[pk])
        if (!value.value || latest) __fetch(pk)

        return {
            data: value,
            pending: __coursesPending.value[pk],
            error: __coursesErrors.value[pk],
            refresh: () => __fetch(pk),
        }
    }
    return {
        get,
    }
}
