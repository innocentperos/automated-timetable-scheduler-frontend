import type { Course, FetchError, StoreResult } from "~/types"

export const useCourseStore = defineStore("course-store", () => {
    const _courses = ref<Map<number, Course>>(new Map())
    const _pending = ref<Map<number, boolean>>(new Map())

    function insert(courses: Course[]) {
        courses.forEach((course) => {
            _courses.value.set(course.pk, course)
        })
    }

    function retrieve(
        pk: number,
        handler: (error: FetchError<string>) => void | undefined
    ): StoreResult<Course> {
        if (_courses.value.has(pk)) {
            return {
                value: computed(() => _courses.value.get(pk)),
                pending: computed(() => _pending.value.get(pk) ?? false),
            }
        } else {
            _pending.value.set(pk, true)
            $retrieve(pk, handler)
            return {
                value: computed(() => _courses.value.get(pk)),
                pending: computed(() => _pending.value.get(pk) ?? true),
            }
        }
    }

    function all() {
        return computed(() => {
            const courses = []
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [, course] of _courses.value) {
                courses.push(course)
            }
            return courses
        })
    }

    async function $retrieve(pk: number, handler: (error: FetchError<string>) => void | undefined) {
        try {
            const course = await $fetch<Course>(`/courses/${pk}/`, {
                baseURL: useRuntimeConfig().public.baseURL,
            })

            insert([course])
        } catch (error) {
            handler(error as FetchError<string>)
        }
    }

    return {
        insert,
        retrieve,
        all,
    }
})
