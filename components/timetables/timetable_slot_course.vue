<template>
    <v-menu location="bottom" :close-on-content-click="false">
        <template #activator="{ props: _props }">
            <div class="ma-1" v-bind="_props">
                <lazy-timetables-timetable-slot-course-full-view
                    v-if="fullView"
                    :slot-course="slotCourse"
                    :error-color="errorColor"
                >
                </lazy-timetables-timetable-slot-course-full-view>
                <lazy-timetables-timetable-slot-course-mini-view
                    :slot-course="slotCourse"
                    :color="errorColor"
                    :processing="processing"
                    v-if="!fullView"
                ></lazy-timetables-timetable-slot-course-mini-view>
            </div>
        </template>
        <lazy-timetables-slot-course-menu
            :slot-course="slotCourse"
            :errors="errors"
            :error-count="errorCount"
            :timetable="timetable"
            @refresh="reload"
            @edit="onEdit"
            @loading="($event) => (menuLoading = $event)"
        ></lazy-timetables-slot-course-menu>
    </v-menu>

    <v-dialog v-model="editModel" scrollable :width="800" height="100%" persistent>
        <lazy-dialogs-edit-timetable-slot-course
            :slot-course="slotCourse"
            :timetable="timetable"
            :timetable-slot="timetableSlot"
            @close="editModel = false"
            @update="update"
        ></lazy-dialogs-edit-timetable-slot-course>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Timetable } from "~/types"
import type { SlotCourse, TimetableSlot } from "~/typing/timetable"

const props = defineProps<{
    slotCourse: SlotCourse
    fullView: boolean
    timetable: Timetable
    timetableSlot: TimetableSlot
    adjacentCourses: SlotCourse[]
}>()

const authService = useUser()

const errors = computed(() => {
    const errors: {
        venue?: string
        confict?: SlotCourse[]
        invigilators?: boolean
    } = {}
    if (props.slotCourse.venues.length < 1) {
        errors.venue = "No venue was asigned"
    } else {
        if (props.slotCourse.invigilators.length < props.slotCourse.venues.length) {
            errors.invigilators = true
        }
    }

    const confict = props.adjacentCourses.filter((slotCourse) => {
        if (slotCourse.course.level != props.slotCourse.course.level) return false

        const adjacent_course_departments = slotCourse.course.departments.map(
            (department) => department.pk
        )
        const currentDepartments = props.slotCourse.course.departments.map(
            (department) => department.pk
        )

        const common = currentDepartments.filter((el) => adjacent_course_departments.includes(el))

        return common.length > 0
    })

    if (confict.length > 0) {
        errors["confict"] = confict
    }
    return errors
})

const errorCount = computed(() => {
    let count = 0
    const _errors = errors.value

    if (_errors.venue) count = count + 1
    if (_errors.confict) count = count + 1
    if (_errors.invigilators) count = count + 1

    return count
})

const errorColor = computed(() => {
    if (authService.isStudent.value) return "success"
    if (errorCount.value < 1) return "success"

    if (errors.value.confict) return "error"
    return "warning"
})

const emits = defineEmits<{
    update: [courseSlot: SlotCourse]
}>()

const editModel = ref(false)
const menuLoading = ref<boolean[]>([])

const processing = computed(() => menuLoading.value.includes(true))
const refreshDaySlots = inject<() => void>("refres-day-slots")

function update(item: SlotCourse) {
    emits("update", item)
    reload()
}

function reload() {
    if (refreshDaySlots) {
        refreshDaySlots()
    }
}

function onEdit() {
    editModel.value = true
}
</script>
