import type { FetchError } from "~/types"
import type { Complain, ComplainType, SlotCourse } from "~/typing/timetable"

async function __assignVenue(
    slotCoursePk: number,
    loading: Ref<boolean>,
    error: Ref<FetchError<string> | undefined>,
    callback?: () => void
) {
    try {
        loading.value = true
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await $fetch(`slot_courses/${slotCoursePk}/auto_assign_venue/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "POST",
            headers: useFetchHeader([]),
        })
        if (callback) callback()
    } catch (_error) {
        error.value = _error as FetchError<string>
    } finally {
        loading.value = false
    }
}
function assignVenueAutomatically(callback?: () => void) {
    const pending = ref(false)
    const error = ref<FetchError<string>>()

    return {
        pending,
        error,
        execute: (slotCourse: SlotCourse) =>
            __assignVenue(slotCourse.pk!, pending, error, callback),
    }
}

async function __deleteSlotCourse(
    slotCourse: SlotCourse,
    loading: Ref<boolean>,
    error: Ref<FetchError<string> | undefined>,
    callBack?: () => void
) {
    try {
        loading.value = true
        await $fetch(`/timetables/${slotCourse.pk}/slot_course/`, {
            method: "delete",
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })
        if (callBack) callBack()
    } catch (__error) {
        const _error = __error as FetchError<string>
        error.value = _error
        console.log(_error)

        if (!_error.status) {
            useNotification().add({
                title: "Oops",
                text: "Please make sure you have a stable internet connection adn try again",
                icon: "mdi-network-off",
                closable: true,
                color: "amber",
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useNotification().add({
                        title: "Oops",
                        text: "Could not find the slot course on the server",
                        icon: "mdi-alert-box",
                        closable: true,
                        color: "amber",
                    })
                    break
                default:
                    useNotification().add({
                        title: "Oops",
                        text: "Something went wrong on the server, please try again",
                        icon: "mdi-alert-circle-outline",
                        closable: true,
                        color: "amber",
                    })
            }
        }
    } finally {
        loading.value = false
    }
}
function deleteSlotCourse(slotCourse: SlotCourse, callBack?: () => void) {
    const pending = ref(false)
    const error = ref<FetchError<string>>()

    return {
        execute: () => __deleteSlotCourse(slotCourse, pending, error, callBack),
        pending,
        error,
    }
}

async function addCourseSlot(coursePk: number, supervisorPk: number, slotPk: number) {
    try {
        const response = await $fetch<SlotCourse>("/slot_courses/", {
            method: "POST",
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
            body: {
                slot: slotPk,
                course: coursePk,
                supervisor: supervisorPk,
            },
        })

        return response
    } catch (error) {
        useLogger().error(
            "useSlotCourse AddSlotCourse",
            "Cloud not add a new slot course",
            error as Error
        )
        throw error
    }
}

type Pending = Ref<boolean>
type FError<T> = Ref<FetchError<T> | undefined>

async function __asignInvigilator(
    slotCoursePk: number,
    pending: Pending,
    error: FError<string>,
    callback?: () => void
) {
    try {
        pending.value = true
        const response = await $fetch(`/slot_courses/${slotCoursePk}/auto_assign_invigilator/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "POST",
            headers: useFetchHeader([]),
        })
        if (callback) callback()
        return response
    } catch (_error) {
        useLogger().error("useSlotCourse", "Could not assign invigilator", _error as Error)
        error.value = _error as FetchError<string>
    } finally {
        pending.value = false
    }
}
function assignInvigilator(slotCourse: SlotCourse, callback?: () => void) {
    const pending = ref(false)
    const error = ref<FetchError<string>>()

    return {
        pending: computed(() => pending.value),
        error: computed(() => error.value),
        execute: () => __asignInvigilator(slotCourse.pk!, pending, error, callback),
        reset: () => {
            pending.value = false
            error.value = undefined
        },
    }
}

async function makeComplain(
    slotCourse: SlotCourse,
    message: string,
    complain_type: ComplainType,
    relatedSlotCoursePk?: number
) {
    try {
        const response = await $fetch<Complain>("/complains/", {
            method: "POST",
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
            body: {
                slot_course: slotCourse.pk,
                message,
                complain_type,
                related_slot_course: complain_type != "level-conflict" ? null : relatedSlotCoursePk,
                related_course: complain_type == "level-conflict" ? null : relatedSlotCoursePk,
            },
        })
        return response
    } catch (error) {
        useLogger().error("MakeComplain", "Error while making a complain", error as Error)
        throw error
    }
}
export const useSlotCourse = () => {
    return {
        assignVenueAutomatically,
        deleteSlotCourse,
        addCourseSlot,
        assignInvigilator,
        makeComplain,
    }
}
