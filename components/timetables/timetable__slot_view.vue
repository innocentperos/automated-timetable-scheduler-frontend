<template>
    <v-menu
        location="right center"
        :offset="-25"
        :close-on-content-click="false"
        :disabled="!authService.isAdmin.value"
    >
        <template #activator="{ props: menuProps }">
            <div
                v-bind="menuProps"
                class="w-100 h-100 pa-2"
                :class="{ 'not-empty': courses.length > 0 }"
            >
                <div
                    v-if="!daySlot || daySlot.courses.length < 1"
                    class="w-100 d-flex align-center justify-center"
                    :class="{ ' flex-column': fullView }"
                >
                    <v-chip class="pa-2 mb-2" variant="tonal" color="warning">No Course</v-chip>
                </div>
                <v-progress-circular v-else-if="pending"></v-progress-circular>
                <div v-else :class="{ 'd-flex flex-wrap': true }">
                    <timetables-timetable-slot-course
                        v-for="slotCourse in courses"
                        :key="slotCourse.course.pk"
                        :slot-course="slotCourse"
                        :full-view="fullView"
                        :timetable="timetable!"
                        :timetable-slot="daySlot"
                        :adjacent-courses="daySlot.courses.filter((course) => course != slotCourse)"
                    >
                    </timetables-timetable-slot-course>
                </div>
            </div>
        </template>
        <v-list class="py-0">
            <v-menu location="right center" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                    <v-list-item v-bind="menuProps" :disabled="addingCourse">
                        <template #append>
                            <v-icon>mdi-plus</v-icon>
                        </template>
                        <template #prepend>
                            <v-progress-circular
                                indeterminate
                                size="20"
                                class="mr-2"
                                v-show="addingCourse"
                            ></v-progress-circular>
                        </template>
                        Add Course
                    </v-list-item>
                </template>
                <v-card width="400" class="mx-2">
                    <v-card-text>
                        <v-autocomplete
                            label="Course"
                            :items="unAssingedCourses"
                            item-title="title"
                            item-value="pk"
                            :loading="loadingUnAssingedCourses"
                            v-model="additionForm.course"
                            append-inner-icon="mdi-refresh"
                            @click:append-inner="refreshUnAssignCourses"
                        >
                            <template #item="{ props: _props, item }">
                                <v-list-item v-bind="_props">
                                    <template #title>
                                        {{ item.raw.title }} ({{ item.raw.code }})
                                    </template>
                                    <template #subtitle>
                                        <div class="d-flex flex-wrap py-2">
                                            <v-chip
                                                v-for="department in item.raw.departments"
                                                :key="department.pk"
                                                class="mr-1"
                                            >
                                                {{ department.code }}
                                            </v-chip>
                                        </div>
                                    </template>
                                </v-list-item>
                            </template>
                        </v-autocomplete>

                        <v-autocomplete
                            label="Supervisor"
                            :items="timetableStaffs"
                            :loading="loadingTimetableStaffs"
                            item-title="name"
                            item-value="pk"
                            v-model="additionForm.supervisor"
                        >
                        </v-autocomplete>
                        <div class="d-flex">
                            <v-btn
                                @click="addCourse"
                                color="primary"
                                :disabled="additionFormInvalid"
                                :loading="addingCourse"
                            >
                                <v-icon>mdi-plus</v-icon>
                                <span class="pl-2">Add Course</span>
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>
            <v-list-item :disabled="assigningVenues" @click="assignVenues(daySlot!)">
                <template #append>
                    <v-icon>mdi-map-marker-check</v-icon>
                </template>
                <template #prepend>
                    <v-progress-circular
                        indeterminate
                        size="20"
                        class="mr-2"
                        v-show="assigningVenues"
                    ></v-progress-circular>
                </template>
                Assign Venues
            </v-list-item>
            <v-list-item :disabled="assigningVenues" @click="assignInvigilators(daySlot!)">
                <template #append>
                    <v-icon>mdi-account-group</v-icon>
                </template>
                <template #prepend>
                    <v-progress-circular
                        indeterminate
                        size="20"
                        class="mr-2"
                        v-show="assigningInvigilators"
                    ></v-progress-circular>
                </template>
                Assign Invigilators
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="clearCourses">
                <template #append>
                    <v-icon color="error">mdi-close-box</v-icon>
                </template>
                <template #title>Clear courses</template>
                <template #subtitle> This will remove all courses in this slot </template>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
<style>
.not-empty {
    background-color: rgba(5, 87, 73, 0.133);
}
</style>
<script setup lang="ts">
import type { FetchError, Timetable } from "~/types"
import type { SlotCourse, TimetableSlot } from "~/typing/timetable"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
    daySlot?: TimetableSlot
    fullView: boolean
    pending: boolean
}>()

const authService = useUser()

const timetable = inject<Ref<Timetable>>(useTimetableView().currentTimetableInjectSymbol)
const refreshDaySlots = inject<() => void>("refres-day-slots")

const { showSlotCourse } = useTimetableView()

const courses = computed<SlotCourse[]>(() => {
    if (!props.daySlot) return []

    return props.daySlot.courses
        .filter(showSlotCourse)
        .sort((course1, course2) => course1.course.student_count - course2.course.student_count)
        .reverse()
})

const {
    courses: unAssingedCourses,
    pending: loadingUnAssingedCourses,
    refresh: refreshUnAssignCourses,
} = useTimetableView().getTimetableUnassingedCourses(timetable!.value.pk)

const { data: timetableStaffs, pending: loadingTimetableStaffs } =
    useTimetableView().getTimetableStaffs(timetable!.value.pk, {
        default() {
            return []
        },
        onError(error) {
            if (!error.statusCode) {
                useNotification().add({
                    title: "Oops",
                    text: "Could not load staff list for timetable",
                    icon: "mdi-alert",
                    closable: true,
                })
            } else {
                useNotification().add({
                    title: "Oops",
                    text: "Could not load staff list for timetable",
                    icon: "mdi-alert",
                    closable: true,
                })
            }
        },
    })
const additionForm = ref<{ supervisor?: number; course?: number }>({})
const additionFormInvalid = computed(() => {
    return !additionForm.value.course || !additionForm.value.supervisor
})
const addingCourse = ref(false)
async function addCourse() {
    if (additionFormInvalid.value) return
    try {
        const response = await useSlotCourse().addCourseSlot(
            additionForm.value.course!,
            additionForm.value.supervisor!,
            props.daySlot!.pk!
        )
        refreshUnAssignCourses()
        if (refreshDaySlots) refreshDaySlots()
        useNotification().add({
            title: `${response.course.code} Added`,
            text: `${response.course.title} (${response.course.code}) was added to the timetable`,
            icon: "mdi-plus",
            color: "teal",
            closable: true,
        })
    } catch (error) {
        const _error = error as FetchError<string>
        if (!_error.statusCode) {
            useNotification().postNetowrkIssue()
        } else {
            switch (_error.statusCode) {
                case 404:
                    useNotification().add({
                        title: "Oops",
                        text: "Timetable could not be found",
                        color: "amber",
                        icon: "mdi-alert",
                    })
                    break

                default:
                    useNotification().postServerIssue()
                    break
            }
        }
    } finally {
        addingCourse.value = false
    }
}

const { execute: assignVenues, pending: assigningVenues } = useTimetableSlot().assignVenues(
    props.daySlot!,
    refreshDaySlots
)

const { execute: assignInvigilators, pending: assigningInvigilators } =
    useTimetableSlot().assignInvigilators(props.daySlot!, refreshDaySlots)

async function clearCourses() {}
</script>
