<template>
    <v-list class="py-0 my-1" width="400">
        <v-list-item
            class="py-2 teal bg-teal"
            :title="slotCourse.course.code"
            :subtitle="slotCourse.course.title"
        >
        </v-list-item>
        <v-list-item class="py-2">
            <template #title> Venues </template>
            <template #subtitle>
                <v-chip v-for="venue in slotCourse.venues" :key="venue.pk" class="mr-1">
                    {{ venue.title }}</v-chip
                >
            </template>
        </v-list-item>
        <v-divider></v-divider> 
        <lazy-ui-is-authenticated v-if="false" user-type="admin">
            <v-menu location="right" class="ml-2" :close-on-content-click="false">
                <template #activator="{ props: moveProps }">
                    <v-list-item v-bind="moveProps">
                        <template #append>
                            <v-icon>mdi-arrange-bring-forward</v-icon>
                        </template>
                        <v-list-item-title>Move to slot</v-list-item-title>
                    </v-list-item>
                </template>
                <v-card :width="400" class="mx-2">
                    <v-card-text>
                        <v-select :items="days"> </v-select>

                        <v-select :items="daySlots">
                            <option v-for="daySlot in timetable.slot_per_day" :key="daySlot">
                                Slot {{ daySlot }}
                            </option>
                        </v-select>

                        <div class="d-flex justify-end">
                            <v-btn color="primary">
                                <v-icon>mdi-arrange-bring-forward</v-icon>
                                <span class="pl-2">Move</span>
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>
        </lazy-ui-is-authenticated>
        <lazy-ui-is-authenticated user-type="admin">
            <v-list-item @click="emits('edit')">
                <template #append>
                    <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Edit sourse slot</v-list-item-title>
            </v-list-item>
        </lazy-ui-is-authenticated>

        <lazy-ui-is-authenticated user-type="admin">
            <v-menu location="left" class="ml-2" :close-on-content-click="false">
                <template #activator="{ props: moveProps }">
                    <v-list-item v-bind="moveProps" :disabled="deleting">
                        <template #append>
                            <v-icon v-show="!deleting">mdi-delete</v-icon>
                        </template>
                        <template #prepend>
                            <v-progress-circular
                                indeterminate
                                :size="20"
                                class="mr-2"
                                v-show="deleting"
                            ></v-progress-circular>
                        </template>
                        <v-list-item-title>{{
                            deleting ? "Deleting" : "Delete from slot"
                        }}</v-list-item-title>
                    </v-list-item>
                </template>
                <v-card :width="400" class="mx-2">
                    <v-card-text>
                        <span> Are you sure you want to remove the course from this slot </span>

                        <div class="d-flex justify-end">
                            <v-btn @click="deleteSlotCourse" :loading="deleting" color="error">
                                <v-icon>mdi-delete</v-icon>
                                <span class="pl-2">Delete</span>
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>
        </lazy-ui-is-authenticated>

        <lazy-ui-is-authenticated :user-type="['staff', 'student']">
            <v-list-item @click="reportIssue">
                <template #append>
                    <v-icon>mdi-comment</v-icon>
                </template>
                <v-list-item-title>Report issues</v-list-item-title>
            </v-list-item>
        </lazy-ui-is-authenticated>

        <lazy-ui-is-authenticated :user-type="['staff', 'admin']">
            <v-menu
                v-if="errorCount > 0"
                location="right"
                :close-on-content-click="false"
                :offset="10"
            >
                <template #activator="{ props: menuProps }">
                    <v-list-item v-bind="menuProps">
                        <template #append>
                            <v-icon color="amber">mdi-alert-circle-outline</v-icon>
                        </template>
                        <template #prepend>
                            <v-badge location="center center" color="amber" :content="errorCount">
                                <v-progress-circular
                                    v-show="solvingIssue"
                                    indeterminate
                                    color="amber"
                                ></v-progress-circular>
                            </v-badge>
                        </template>
                        <v-list-item-title class="text-amber">View issues</v-list-item-title>
                    </v-list-item>
                </template>
                <div class="d-flex flex-column my-2 relative">
                    <v-expand-transition origin="50%" group>
                        <v-alert type="error" v-show="errorAssigningVenue" dismissible>
                            Error while assigning venue
                            <template #close>
                                <v-btn
                                    color="white"
                                    @click="errorAssigningVenue = undefined"
                                    icon="mdi-close"
                                ></v-btn>
                            </template>
                        </v-alert>
                        <v-alert
                            type="error"
                            v-show="errorAssigningInvigilator"
                            class="my-1"
                            dismissible
                            :width="400"
                        >
                            <span v-if="errorAssigningInvigilator?.statusCode == 412">
                                No available staff from
                                {{ slotCourse.course.department.title }} ({{
                                    slotCourse.course.department.code
                                }}) department to assign
                            </span>
                            <span v-else-if="errorAssigningInvigilator?.statusCode == 406">
                                No venue assigned to course
                            </span>
                            <span v-else> No available department staff to assign </span>
                            <template #close>
                                <v-btn
                                    color="white"
                                    @click="resetInvigilatorAssign"
                                    icon="mdi-close"
                                ></v-btn>
                            </template>
                        </v-alert>
                    </v-expand-transition>
                </div>
                <v-list variant="tonal" width="400" class="my-0 py-0">
                    <v-list-item v-if="errors.venue">
                        <div class="d-flex justify-space-between">
                            <span>No venue assigned</span>
                            <lazy-ui-is-authenticated :user-type="['admin']">
                                <v-tooltip location="bottom">
                                    <template #activator="{ props: toolProps }">
                                        <v-btn
                                            size="small"
                                            v-bind="toolProps"
                                            :loading="assigningInvigilator"
                                            @click="assignVenue(slotCourse)"
                                            >slove issue</v-btn
                                        >
                                    </template>
                                    Assign venue automatically
                                </v-tooltip>
                            </lazy-ui-is-authenticated>
                        </div>
                    </v-list-item>

                    <v-list-item v-if="errors.invigilators">
                        <div class="d-flex justify-space-between">
                            <span>Insufficient invigilators assigned</span>
                            <lazy-ui-is-authenticated :user-type="['admin']">
                                <v-tooltip location="bottom">
                                    <template #activator="{ props: toolProps }">
                                        <v-btn
                                            size="small"
                                            v-bind="toolProps"
                                            :loading="assigningInvigilator"
                                            @click="assignInvigilator"
                                            >slove issue</v-btn
                                        >
                                    </template>
                                    Assign invigilators automatically
                                </v-tooltip>
                            </lazy-ui-is-authenticated>
                        </div>
                    </v-list-item>
                    <v-list-item v-if="errors.confict">
                        <template #title>
                            <span class="pa-1">
                                <v-badge
                                    class="text-amber pl-5"
                                    location="left center"
                                    :content="errors.confict.length"
                                    :offset-x="-15"
                                    color="amber"
                                    >Conflict</v-badge
                                >
                                , students on thesame day also offering
                            </span>
                        </template>
                        <template #subtitle>
                            <div class="d-flex flex-wrap pa-1">
                                <v-chip
                                    v-for="clashCourses in errors.confict"
                                    :key="clashCourses.pk"
                                    class="mr-1"
                                    color="amber"
                                >
                                    {{ clashCourses.course.code }}
                                </v-chip>
                            </div>
                        </template>
                    </v-list-item>
                </v-list>
            </v-menu>
        </lazy-ui-is-authenticated>
        <lazy-ui-is-authenticated :user-type="['staff', 'admin']">
            <lazy-timetables-slot-course-complains
                :slot-course="slotCourse"
            ></lazy-timetables-slot-course-complains>
        </lazy-ui-is-authenticated>
    </v-list>
</template>
<script setup lang="ts">
import type { Timetable } from "~/types"
import type { SlotCourse } from "~/typing/timetable"

const props = defineProps<{
    slotCourse: SlotCourse
    timetable: Timetable
    errors: {
        venue?: string | undefined
        confict?: SlotCourse[] | undefined
        invigilators?: boolean | undefined
    }
    errorCount: number
}>()

const emits = defineEmits<{
    refresh: []
    edit: []
    loading: [boolean[]]
}>()

function refresh() {
    emits("refresh")
}

const {
    pending: assigningInvigilator,
    error: errorAssigningInvigilator,
    execute: assignInvigilator,
    reset: resetInvigilatorAssign,
} = useSlotCourse().assignInvigilator(props.slotCourse, refresh)

const {
    pending: assigningVenue,
    execute: assignVenue,
    error: errorAssigningVenue,
} = useSlotCourse().assignVenueAutomatically(refresh)

watch([errorAssigningInvigilator], () => {
    if (errorAssigningInvigilator.value) {
        if (!errorAssigningInvigilator.value.statusCode) {
            useNotification().postNetowrkIssue()
            return
        }
        switch (errorAssigningInvigilator.value.statusCode) {
            case 406:
                useNotification().add({
                    title: "Invigilator assigning failed",
                    text: `No venues assigned to course ${props.slotCourse.course.title} (${props.slotCourse.course.code})`,
                    closable: true,
                    color: "amber",
                    icon: "mdi-alert-circle",
                })
                break
            case 412:
                useNotification().add({
                    title: "Invigilator assigning failed",
                    text:
                        "No staff from  " +
                        `${props.slotCourse.course.department.title} (${props.slotCourse.course.department.code})` +
                        ` is available to invigilate ${props.slotCourse.course.title} (${props.slotCourse.course.code})`,
                    closable: true,
                    color: "amber",
                    icon: "mdi-alert-circle",
                })
                break
            default:
                useNotification().add({
                    title: "Invigilator assigning failed",
                    text:
                        "Something went wrong on the server while attempting to assign invigilator(s) to " +
                        props.slotCourse.course.title +
                        ` (${props.slotCourse.course.code})`,
                    closable: true,
                    color: "amber",
                    icon: "mdi-alert-circle",
                })
        }
    }
})

const days = computed(() => {
    const _days: string[] = []

    for (let index = 0; index < props.timetable.days_count!; index++) {
        _days.push("Day " + (index + 1))
    }

    return _days
})

const daySlots = computed(() => {
    const _days: string[] = []

    for (let index = 0; index < props.timetable.slot_per_day!; index++) {
        _days.push("Slot " + (index + 1))
    }

    return _days
})

const solvingIssue = computed(() => assigningVenue.value || assigningInvigilator.value)

const slotCourseUtils = useSlotCourse()

const { pending: deleting, execute: deleteSlotCourse } = slotCourseUtils.deleteSlotCourse(
    props.slotCourse,
    refresh
)

watch([assigningVenue, assigningInvigilator, deleting], () => {
    emits("loading", [assigningInvigilator.value, assigningVenue.value, deleting.value])
})

const { show } = useGlobalView().makeComplainDialog()
async function reportIssue() {
    show(props.slotCourse)
    // execute(props.slotCourse)
}
</script>
