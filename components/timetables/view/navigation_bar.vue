<template>
    <v-navigation-drawer :rail="rail" expand-on-hover fixed permanent location="right" width="450">
        <v-list>
            <v-list-item>
                <div class="d-flex align-center justify-space-between">
                    <v-btn @click="rail = !rail">
                        <v-icon v-if="rail">mdi-eye-off</v-icon>
                        <v-icon v-else>mdi-pin-off</v-icon>

                        <span class="pl-2">{{ !rail ? "Unpin" : "pin" }}</span>
                    </v-btn>
                </div>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-expansion-panels variant="accordion">
            <v-expansion-panel>
                <v-expansion-panel-title>
                    <v-list-item prepend-icon="mdi-filter"> Filtering </v-list-item>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-list>
                        <v-list-item>
                            <div class="d-flex flex-column">
                                <ui-is-authenticated :user-type="['student']">
                                    <v-btn
                                        block
                                        color="primary"
                                        class="mb-4"
                                        @click="filterMyCourses"
                                        >My Courses</v-btn
                                    >
                                </ui-is-authenticated>
                                <v-autocomplete
                                    label="Levels courses to show"
                                    :items="LEVELS"
                                    item-value="value"
                                    item-text="title"
                                    item-key="value"
                                    color="primary"
                                    multiple
                                    autocomplete
                                    chips
                                    :model-value="selectedLevels"
                                    @update:model-value="levelSelected"
                                    prepend-inner-icon="mdi-account-school-outline"
                                ></v-autocomplete>

                                <v-autocomplete
                                    label="Department courses to show"
                                    :items="departments"
                                    item-value="pk"
                                    item-text="title"
                                    item-key="pk"
                                    multiple
                                    autocomplete
                                    :model-value="selectedDepartments"
                                    @update:model-value="departmentSelected"
                                    append-inner-icon="mdi-refresh"
                                    @click:append-inner="departmentStore.refreshDepartments"
                                    prepend-inner-icon="mdi-school"
                                    chips
                                ></v-autocomplete>

                                <ui-is-authenticated user-type="admin">
                                    <v-autocomplete
                                        label="Staff"
                                        :items="staffs"
                                        item-value="pk"
                                        item-text="name"
                                        item-title="name"
                                        item-key="pk"
                                        multiple
                                        autocomplete
                                        :model-value="selectedStaffs"
                                        @update:model-value="setStaffs"
                                        :loading="loadingStaffs"
                                        append-inner-icon="mdi-refresh"
                                        @click:append-inner="reloadStaffs"
                                        prepend-inner-icon="mdi-account-group"
                                        chips
                                    ></v-autocomplete>
                                </ui-is-authenticated>

                                <v-autocomplete
                                    label="Venues"
                                    :items="[{ title: 'All Venues', pk: 0 }, ...venues]"
                                    item-value="pk"
                                    item-text="title"
                                    item-key="pk"
                                    multiple
                                    autocomplete
                                    :model-value="selectedVenues"
                                    @update:model-value="setVenues"
                                    :loading="loadingVenues"
                                    prepend-inner-icon="mdi-city"
                                    append-inner-icon="mdi-refresh"
                                    @click:append-inner="refreshVenues(timetable.pk)"
                                    chips
                                ></v-autocomplete>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-expansion-panel-text>
            </v-expansion-panel>
            <ui-is-authenticated user-type="admin">
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-list-item prepend-icon="mdi-refresh-auto"> Automation </v-list-item>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-list>
                            <v-card color="teal" class="my-3">
                                <v-card-text>
                                    <div class="d-flex align-center text-subtitle-1">
                                        <v-icon class="mr-3">mdi-home-city-outline</v-icon>
                                        <span>Assign Venues </span>
                                    </div>
                                    <div>
                                        <span>
                                            This will try to auto assign venues to all courses that
                                            do not have venue(s) assigned to them
                                        </span>
                                        <v-checkbox
                                            label="Inforce adjacent slot optimization"
                                            hide-details
                                        >
                                        </v-checkbox>
                                        <v-alert type="info" color="transparent">
                                            This option issues that one venue is not been used in
                                            adjacent day slots
                                        </v-alert>
                                        <v-btn
                                            block
                                            class="my-2"
                                            color="primary"
                                            @click="assignVenues"
                                            :loading="assigningVenues"
                                            >Assign Venues</v-btn
                                        >
                                    </div>
                                </v-card-text>
                            </v-card>

                            <v-divider></v-divider>

                            <v-card :ref="card" color="teal" class="my-3 relative" border>
                                <v-card-text>
                                    <div class="d-flex align-center text-subtitle-1">
                                        <v-icon class="mr-3">mdi-account-group</v-icon>
                                        <span>Auto Assign Invigilators </span>
                                    </div>
                                    <div>
                                        <span>
                                            This will try to auto assign invigilator to all venues
                                            of the courses that have venue(s) assigned to them
                                        </span>
                                        <v-checkbox
                                            label="Inforce adjacent slot optimization"
                                            hide-details
                                        >
                                        </v-checkbox>
                                        <v-alert type="info" color="transparent">
                                            This option insures that a staff does not invigilator
                                            two adjacent venue in thesame day
                                        </v-alert>
                                        <v-btn
                                            block
                                            class="my-2"
                                            color="primary"
                                            @click="assignInvigilators"
                                            :loading="assigningInvigilators"
                                            >Assign Invigilators</v-btn
                                        >
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-list>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </ui-is-authenticated>
            <v-expansion-panel>
                <v-expansion-panel-title>
                    <v-list-item prepend-icon="mdi-forum"> Issues and Complains </v-list-item>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-0 ma-0">
                    <v-skeleton-loader v-if="loadingComplains" type="list-item-two-line@4">
                    </v-skeleton-loader>
                    <v-list class="ma-0 pa-0" v-else-if="complains.length > 0">
                        <v-list-item> List of complains </v-list-item>
                        <lazy-timetables-view-complain-item
                            v-for="(complain, index) in complains"
                            :key="index"
                            :complain="complain"
                        >
                        </lazy-timetables-view-complain-item>
                    </v-list>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-title>
                    <v-list-item prepend-icon="mdi-file-export"> Exports </v-list-item>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-0 ma-0">
                    <v-list class="ma-0 pa-0">
                        <v-list-item subtitle="select export format"> </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item
                            title="Excel"
                            prepend-icon="mdi-file-excel"
                            class="mt-2"
                            loading
                            @click="exportFile('excel')"
                        >
                            <template #append>
                                <v-progress-circular
                                    indeterminate
                                    v-if="exporting"
                                ></v-progress-circular>
                            </template>
                        </v-list-item>
                        <!-- <v-list-item
                            title="Pdf"
                            prepend-icon="mdi-file-pdf-box"
                            @click="exportFile('pdf')"
                        ></v-list-item> -->
                    </v-list>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { LEVELS, type FetchError, type Timetable } from "~/types"

const props = defineProps<{
    timetable: Timetable
}>()

const departmentStore = useDepartmentStore()

const departments = departmentStore.all()

const {
    selectedDepartments,
    setDepartments,
    selectedLevels,
    setLevels,
    selectedVenues,
    setVenues,
    // staffs
    selectedStaffs,
    setStaffs,
} = useTimetableView()

const {
    data: venues,
    pending: loadingVenues,
    refresh: refreshVenues,
} = useTimetableView().getTimetableVenues(props.timetable.pk)

const {
    data: staffs,
    pending: loadingStaffs,
    refresh: reloadStaffs,
} = useTimetableView().getTimetableStaffs(props.timetable.pk)

function departmentSelected(value: number[]) {
    setDepartments(value)
}

function levelSelected(value: number[]) {
    setLevels(value)
}

const rail = ref(false)

const card = ref()
const assigningInvigilators = ref(false)
async function assignInvigilators() {
    assigningInvigilators.value = true

    try {
        await $fetch(`/timetables/${props.timetable.pk}/auto_assign_invigilators/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
            method: "POST",
        })
    } catch (_error) {
        const error = _error as FetchError<string>

        if (!error.statusCode) {
            useNotification().postNetowrkIssue()
        } else {
            switch (error.statusCode) {
                case 404:
                    useNotification().add({
                        title: "Invalid timetable",
                        text: "This timetable does not seem to exist on the system database",
                        icon: "mdi-close-circle",
                        closable: true,
                        action(closeCallback) {
                            closeCallback()
                        },
                    })
                    break

                default:
                    useNotification().postServerIssue()
                    break
            }
        }
    } finally {
        assigningInvigilators.value = false
    }
}

const assigningVenues = ref(false)
async function assignVenues() {
    try {
        assigningVenues.value = true

        await $fetch(`/timetables/${props.timetable.pk}/auto_assign_venues/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
            method: "POST",
        })
    } catch (_error) {
        const error = _error as FetchError<string>

        if (!error.statusCode) {
            useNotification().postNetowrkIssue()
        } else {
            switch (error.statusCode) {
                case 404:
                    useNotification().add({
                        title: "Invalid timetable",
                        text: "This timetable does not seem to exist on the system database",
                        icon: "mdi-close-circle",
                        closable: true,
                        action(closeCallback) {
                            closeCallback()
                        },
                    })
                    break

                default:
                    useNotification().postServerIssue()
                    break
            }
        }
    } finally {
        assigningVenues.value = false
    }
}

const {
    data: complains,
    pending: loadingComplains,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refresh: reloadComplains,
} = useComplainStore().loadTable(props.timetable.pk)

const authService = useUser()
function filterMyCourses() {
    const currentUser = authService.currentUser
    if (authService.isAuthenticated.value && currentUser.value && authService.isStudent.value) {
        setLevels([currentUser.value.level!])
        setDepartments([currentUser.value.department!])
    }
}

const exporting = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function exportFile(type: "pdf" | "excel") {
    try {
        exporting.value = true
        const response = await fetch(
            `${useRuntimeConfig().public.baseURL}/timetables/${props.timetable.pk}/export/`,
            {
                headers: useFetchHeader([]),
            }
        )
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, "Download")
    } catch (error) {
        console.error(error)
        useNotification().add({
            title: "Export failed",
            text: "An error occured while exporting the timetable",
            icon: "mdi-close-circle",
            closable: true,
            color: "error",
            action(closeCallback) {
                closeCallback()
            },
        })
    } finally {
        exporting.value = false
    }
}
</script>
