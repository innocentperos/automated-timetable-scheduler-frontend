import type { Course, FetchError } from "~/types"

export const useCourseStore = defineStore("course-store", () => {
    // const _courses = ref<Map<number, Course>>(new Map())
    // const _pending = ref<Map<number, boolean>>(new Map())

    function insert(courses: Course[]) {
        courses.forEach((course) => {
            __courses.value[course.pk] = course
        })
    }

    // function retrieve(
    //     pk: number,
    //     handler: (error: FetchError<string>) => void | undefined
    // ): StoreResult<Course> {
    //     if (_courses.value.has(pk)) {
    //         return {
    //             value: computed(() => _courses.value.get(pk)),
    //             pending: computed(() => _pending.value.get(pk) ?? false),
    //         }
    //     } else {
    //         _pending.value.set(pk, true)
    //         $retrieve(pk, handler)
    //         return {
    //             value: computed(() => _courses.value.get(pk)),
    //             pending: computed(() => _pending.value.get(pk) ?? true),
    //         }
    //     }
    // }

    function all() {
        return computed(() => {
            const courses = []
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const course of Object.values(__courses.value)) {
                courses.push(course)
            }
            return courses
        })
    }

    // async function $retrieve(pk: number, handler: (error: FetchError<string>) => void | undefined) {
    //     try {
    //         const course = await $fetch<Course>(`/courses/${pk}/`, {
    //             baseURL: useRuntimeConfig().public.baseURL,
    //             headers: useFetchHeader([]),
    //         })

    //         insert([course])
    //     } catch (error) {
    //         handler(error as FetchError<string>)
    //     } finally {
    //         _pending.value.set(pk, true)
    //     }
    // }

    // return {
    //     insert,
    //     retrieve,
    //     all,
    // }

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
            pending: computed(() => __coursesPending.value[pk]),
            error: computed(() => __coursesErrors.value[pk]),
            refresh: () => __fetch(pk),
        }
    }
    return {
        get,
        all,
        insert
    }
})
