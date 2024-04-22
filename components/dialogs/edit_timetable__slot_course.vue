<template>
    <v-card>
        <v-card-title>
            <div class="px-6 py-6 d-flex flex-column">
                <div class="d-flex">
                    <span class="text-h5">
                        {{ slotCourse.course.title }} ({{ slotCourse.course.code }})
                    </span>
                    <v-spacer></v-spacer>
                    <v-chip class="ml-auto">
                        {{ slotCourse.course.department.title }}
                        {{ slotCourse.course.department.code }}
                    </v-chip>
                </div>
                <span class="text-subtitle-2 mt-4">
                    Offered by {{ slotCourse.course.student_count }} Students across
                    {{ slotCourse.course.departments.length }} department{{
                        slotCourse.course.departments.length > 1 ? "s" : ""
                    }}
                </span>
                <div class="d-flex flex-wrap mt-1">
                    <v-chip
                        v-for="department in slotCourse.course.departments"
                        :key="department.pk"
                        class="mr-2"
                    >
                        {{ department.title }}
                    </v-chip>
                </div>
            </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0" style="height: 100%">
            <v-form v-model="formValid">
                <v-container fluid>
                    <v-row class="pa-6">
                        <v-col :cols="12">
                            <span>Supervisor *</span>
                        </v-col>
                        <v-col :cols="12">
                            <v-autocomplete
                                v-model="selectedSupervisor"
                                :items="staffs"
                                item-title="name"
                                item-value="pk"
                                :loading="loadingStaffs"
                                label="Supervisor *"
                                :rules="[useRuleRequired]"
                                append-inner-icon="mdi-refresh"
                                @click:append-inner="refreshStaffs"
                            >
                                <template #prepend-item>
                                    <span class="pa-3 d-block text-subtitle-2"
                                        >Select the supervisor for this course</span
                                    >
                                </template>

                                <template #item="{ item, props: itemProps }">
                                    <v-list-item
                                        v-bind="itemProps"
                                        :disabled="item.raw.pk == selectedSupervisor"
                                        class="py-4"
                                    >
                                        <template #subtitle>
                                            <div class="d-flex">
                                                <v-chip>
                                                    {{ item.raw.department.title }}
                                                </v-chip>
                                            </div>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>

                    <v-divider></v-divider>

                    <!-- Venues -->
                    <v-row no-gutters class="pa-6">
                        <v-col :cols="12">
                            <div class="d-flex my-4">
                                <span>Venues</span>
                                <v-spacer></v-spacer>
                                <div class="d-flex flex-column w-50 justify-end align-end">
                                    <v-chip
                                        class="mb-2"
                                        :class="{
                                            'text-red':
                                                totalCapacity / slotCourse.course.student_count < 1,
                                            'text-amber':
                                                totalCapacity / slotCourse.course.student_count >
                                                    1 &&
                                                totalCapacity / slotCourse.course.student_count <
                                                    1.3,
                                            'text-teal':
                                                totalCapacity / slotCourse.course.student_count >
                                                1.3,
                                        }"
                                        >{{ totalCapacity }} /
                                        {{ slotCourse.course.student_count }}</v-chip
                                    >
                                    <span class="text-subtitle-2 text-xs-right">
                                        The ratio of the venue capacity to course student count
                                    </span>
                                </div>
                            </div>
                        </v-col>
                        <v-col :cols="12">
                            <v-autocomplete
                                v-model="selectedVenues"
                                :items="AvailableVenues"
                                item-title="title"
                                item-value="pk"
                                :loading="loadingAvailableVenues"
                                label="Venues"
                                multiple
                                chips
                                append-inner-icon="mdi-refresh"
                                @click:append-inner="refreshVenues"
                            >
                                <template #prepend-item>
                                    <span class="pa-3 d-block text-subtitle-2"
                                        >Select the venues for this course</span
                                    >
                                </template>
                                <template #item="{ item, props: _props }">
                                    <v-list-item v-bind="_props" class="pa-3 py-4 mb-1">
                                        <template #prepend>
                                            <v-checkbox-btn
                                                :model-value="selectedVenues.includes(item.value)"
                                            ></v-checkbox-btn>
                                        </template>
                                        <template #title> {{ item.title }}</template>
                                        <template #subtitle>
                                            {{ item.raw.capacity }} Students</template
                                        >
                                    </v-list-item>
                                </template>
                            </v-autocomplete>
                            <v-slide-y-transition group>
                                <v-alert
                                    type="warning"
                                    v-if="totalCapacity / slotCourse.course.student_count > 1.3"
                                    translate="yes"
                                >
                                    The venue(s) selected capacity was exceeded the course capacity
                                    by morethan 30%, which is the margin for error, consider
                                    reducing the venues selected.
                                </v-alert>

                                <v-alert
                                    type="error"
                                    v-if="totalCapacity / slotCourse.course.student_count < 1"
                                    translate="yes"
                                >
                                    The venue(s) selected capacity is lessthan the course student
                                    count, consider selecting a venue of higher capacity or more
                                    venues.
                                </v-alert>
                            </v-slide-y-transition>
                        </v-col>
                    </v-row>

                    <v-divider></v-divider>

                    <!-- Invigilators -->
                    <v-row no-gutters class="pa-6">
                        <v-col :cols="12" class="py-4">
                            <div class="d-flex">
                                <span>Invigilators</span>
                                <v-spacer></v-spacer>
                            </div>
                        </v-col>
                        <v-col :cols="12" class="pb-2">
                            <v-slide-y-transition>
                                <v-alert
                                    type="warning"
                                    v-if="selectedInvigilators.length < selectedVenues.length"
                                    translate="yes"
                                >
                                    The number of selected invigilators is lessthan the number of
                                    selected venues, There will not be enough staffs to invigilator
                                    all venues. Consider adding more invigilators or reduce venues
                                    by selected venues with higher capacity.
                                </v-alert>
                            </v-slide-y-transition>
                        </v-col>
                        <v-col :cols="12">
                            <v-autocomplete
                                v-model="selectedInvigilators"
                                :items="availableInvigilators"
                                item-title="name"
                                item-value="pk"
                                :loading="loadingStaffs || loadingAvailableStaffs"
                                label="Invigilators"
                                multiple
                                chips
                                append-inner-icon="mdi-refresh"
                                @click:append-inner="refreshAvailableInvigilators"
                            >
                                <template #prepend-item>
                                    <div class="d-flex flex-column">
                                        <span class="pa-3 d-block text-subtitle-2"
                                            >Select the staffs to invigilate this course</span
                                        >
                                        <v-checkbox
                                            :label="`Show only ${slotCourse.course.department.title} (${slotCourse.course.department.code}) department staff`"
                                            v-model="showOnlyCourseDepartmentStaffs"
                                            hide-details
                                        ></v-checkbox>
                                    </div>
                                </template>

                                <template #no-data>
                                    <div class="pa-6">
                                        <span v-if="staffs.length < 1">
                                            Timetable has no staff selected
                                        </span>
                                        <span v-else>
                                            No staff from
                                            {{ slotCourse.course.department.title }} department is
                                            available
                                        </span>
                                    </div>
                                </template>

                                <template #item="{ item, props: itemProps }">
                                    <v-list-item
                                        v-bind="itemProps"
                                        :disabled="item.raw.pk == selectedSupervisor"
                                        class="py-4"
                                    >
                                        <template #prepend>
                                            <v-checkbox-btn
                                                :model-value="
                                                    selectedInvigilators.includes(item.value)
                                                "
                                            ></v-checkbox-btn>
                                        </template>
                                        <template #subtitle>
                                            <div class="d-flex">
                                                <v-chip
                                                    class="mr-1"
                                                    v-if="!showOnlyCourseDepartmentStaffs"
                                                >
                                                    {{ item.raw.department.code }}
                                                </v-chip>
                                                <v-chip
                                                    class="mr-1"
                                                    v-if="item.raw.pk == selectedSupervisor"
                                                >
                                                    is supervising
                                                </v-chip>
                                                <v-chip
                                                    class="mr-1"
                                                    v-show="!freeInvigilators.includes(item.value)"
                                                    color="warning"
                                                >
                                                    busy
                                                </v-chip>
                                            </div>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="error" variant="outlined" @click="close">
                <v-icon>mdi-close</v-icon>
                <span class="px-2">Close</span>
            </v-btn>
            <v-btn variant="elevated" color="primary" :disabled="!formValid" @click="onSave">
                <v-icon>mdi-content-save</v-icon>
                <span class="px-2">Save</span>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import type { FetchError, Staff, Timetable, Venue } from "~/types"
import type { SlotCourse, TimetableSlot } from "~/typing/timetable"

const props = defineProps<{
    slotCourse: SlotCourse
    timetable: Timetable
    timetableSlot: TimetableSlot
}>()

const emits = defineEmits<{
    update: [coursSlot: SlotCourse]
    close: []
}>()
const selectedSupervisor = ref(props.slotCourse.supervisor.pk)
const {
    data: staffs,
    pending: loadingStaffs,
    refresh: refreshStaffs,
} = useTimetableView().getTimetableStaffs(props.timetable.pk)

const selectedVenues = ref(props.slotCourse.venues.map((venue) => venue.pk))
const {
    data: AvailableVenues,
    pending: loadingAvailableVenues,
    refresh: refreshVenues,
} = useFetch<Venue[]>(`/timetables/${props.slotCourse.pk}/slot_available_venues/`, {
    baseURL: useRuntimeConfig().public.baseURL,
    cache: "default",
    retry: 5,
    retryDelay: 500,
    headers: useFetchHeader([]),
    default() {
        return props.slotCourse.venues
    },
})

const totalCapacity = computed(() => {
    let value = 0
    for (const venue of AvailableVenues.value.filter((v) => selectedVenues.value.includes(v.pk))) {
        value = value + venue.capacity
    }
    return value
})

const {
    data: availableStaffs,
    pending: loadingAvailableStaffs,
    refresh: refreshAvailableStaffs,
} = useFetch<Staff[]>(`/timetables/${props.slotCourse.pk}/slot_available_staffs/`, {
    baseURL: useRuntimeConfig().public.baseURL,
    cache: "default",
    retry: 5,
    retryDelay: 500,
    headers: useFetchHeader([]),
    default() {
        return props.slotCourse.invigilators
    },
})

function refreshAvailableInvigilators() {
    refreshAvailableStaffs()
    refreshStaffs()
}

const showOnlyCourseDepartmentStaffs = ref(true)
const selectedInvigilators = ref<number[]>(
    props.slotCourse.invigilators.map((invigilator) => invigilator.pk)
)
const freeInvigilators = computed(() => {
    return availableStaffs.value.map((staff) => staff.pk)
})

const availableInvigilators = computed(() => {
    if (showOnlyCourseDepartmentStaffs.value) {
        return staffs.value.filter(
            (staff) => staff.department.pk == props.slotCourse.course.department.pk
        )
    } else {
        return staffs.value
    }
})

const formValid = ref(false)

async function onSave() {
    const form = new FormData()
    form.append("supervisor", selectedSupervisor.value.toString())

    selectedVenues.value.forEach((venue) => {
        form.append("venues", venue.toString())
    })

    selectedInvigilators.value.forEach((invigilator) => {
        form.append("invigilators", invigilator.toString())
    })

    try {
        const slotValue = await $fetch<SlotCourse>(
            `/timetables/${props.slotCourse.pk}/update_slot_course/`,
            {
                baseURL: useRuntimeConfig().public.baseURL,
                method: "POST",
                headers: useFetchHeader([]),
                body: form,
            }
        )

        emits("update", slotValue)
    } catch (error: unknown) {
        const _error = error as FetchError<string>

        useLogger().error(
            "Edit Timetable Slot Course",
            "Unable to update slot course",
            _error as Error
        )
        if (!_error.statusCode) {
            useNotification().add({
                title: "Oops",
                text: "Could not update course slot, please make sure you have a stable internet connection and try again.",
                icon: "mdi-network-off",
                closable: true,
                color: "red",
            })
        } else {
            switch (_error.statusCode) {
                case 400:
                    useNotification().add({
                        title: "Missing fields",
                        text: "Please provide all the required fields marked with *",
                        icon: "mdi-alert-circle",
                        closable: true,
                        color: "warning",
                    })
                    break

                default:
                    useNotification().add({
                        title: "Error occured",
                        text: "Something went wrong on the server, please try again later",
                        icon: "mdi-alert-circle",
                        closable: true,
                        color: "warning",
                    })
                    break
            }
        }
    }
}

function close() {
    emits("close")
}
</script>
