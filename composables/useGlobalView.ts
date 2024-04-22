import type { ComplainType, SlotCourse } from "~/typing/timetable"

const currentMakeComplainCourseSlot = ref<SlotCourse>()
const _makeComplainDialogModel = ref(false)
const _message = ref("")

async function __makeComplain(
    pending: Ref<boolean>,
    slotCourse: SlotCourse,
    message: string,
    complain_type: ComplainType,
    relatedSlotCoursePk?: number
) {
    try {
        pending.value = true

        const response = await useSlotCourse().makeComplain(
            slotCourse,
            message,
            complain_type,
            relatedSlotCoursePk
        )
        pending.value = false
        return response
    } catch (error) {
        console.log(error)
    } finally {
        pending.value = false
    }
}
function makeComplainDialog() {
    const pending = ref(false)

    return {
        show: (slotCourse: SlotCourse) => {
            currentMakeComplainCourseSlot.value = slotCourse
            _makeComplainDialogModel.value = true
        },
        hide: () => (_makeComplainDialogModel.value = false),
        clear: () => {
            _makeComplainDialogModel.value = false
            currentMakeComplainCourseSlot.value = undefined
            _message.value = ""
        },

        execute: (complain_type: ComplainType, relatedSlotCoursePk?: number) => {
            if (currentMakeComplainCourseSlot.value) {
                __makeComplain(
                    pending,
                    currentMakeComplainCourseSlot.value,
                    _message.value,
                    complain_type,
                    relatedSlotCoursePk
                )
            }
        },
        pending,
        model: computed(() => _makeComplainDialogModel.value),
        currentSlotCourse: computed(() => currentMakeComplainCourseSlot.value),
        message: computed(() => _message.value),
        updateMessage: (value: string) => {
            _message.value = value
        },
    }
}
export const useGlobalView = () => {
    return {
        makeComplainDialog,
    }
}
