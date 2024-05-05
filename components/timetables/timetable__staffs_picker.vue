<!-- eslint-disable vue/no-template-shadow -->
<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" lg="3">
                <v-card elevation="0" color="primary">
                    <v-card-text class="pa-0">
                        <v-list bg-color="primary" density="compact">
                            <v-list-item>
                                <v-list-item-title class="text-button">
                                    Departments
                                </v-list-item-title>
                                <template #append>
                                    <v-tooltip location="top center">
                                        Select all departments
                                        <template #activator="{ props }">
                                            <v-checkbox-btn
                                                v-bind="props"
                                                :model-value="
                                                    selectedDepartments.length == departments.length
                                                "
                                                @update:model-value="toggleAllDepartments($event)"
                                            ></v-checkbox-btn>
                                        </template>
                                    </v-tooltip>
                                </template>
                            </v-list-item>
                            <v-divider></v-divider>
                            <div v-if="loadingDepartments" class="d-flex flex-column">
                                <v-skeleton-loader
                                    color="primary"
                                    type="list-item"
                                    elevation="0"
                                    v-for="i in 3"
                                    :key="i"
                                ></v-skeleton-loader>
                            </div>

                            <v-list-item v-for="department in departments" :key="department.pk">
                                <v-list-item-title>
                                    {{ department.title }}
                                </v-list-item-title>
                                <template #append>
                                    <v-checkbox-btn
                                        :model-value="selectedDepartments.includes(department.pk)"
                                        @update:model-value="selectDepartment(department, $event)"
                                    ></v-checkbox-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="9">
                <div class="d-block mx-4 mt-4 mb-2">Selected Staff</div>
                <v-progress-circular v-show="loadingStaffs"></v-progress-circular>
                <v-slide-x-transition group>
                    <v-chip class="ma-1" @click="removeAllStaffs" color="error" variant="elevated">
                        <div class="d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                size="16"
                                width="2"
                                class="mr-2"
                                v-show="removinggMultipe"
                            ></v-progress-circular>
                            <span>Remove All Staffs</span>
                        </div>
                    </v-chip>

                    <div
                        class="d-inline-block ma-1"
                        v-for="staff in selectedStaffs"
                        :key="staff.pk"
                    >
                        <v-tooltip location="top center">
                            <div>{{ staff.name }}, with a maximum capacity of</div>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    color="primary"
                                    class="ma-1"
                                    variant="flat"
                                    @click="removeStaff(staff)"
                                    >{{ staff.name }}
                                    <template #append>
                                        <v-progress-circular
                                            v-if="pendingStatus[staff.pk]"
                                            size="x-small"
                                            class="ml-2"
                                            indeterminate
                                        ></v-progress-circular>
                                        <v-icon
                                            v-else-if="timetable?.staffs.includes(staff.pk)"
                                            class="ml-2"
                                            >mdi-check-all</v-icon
                                        >
                                    </template>
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>
                </v-slide-x-transition>

                <div class="d-block ma-4 mb-1">Staff Pool</div>
                <v-slide-x-transition group>
                    <v-chip class="ma-1" @click="addAllStaffs" color="error" variant="elevated">
                        <div class="d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                size="16"
                                width="2"
                                class="mr-2"
                                v-show="addingMultipe"
                            ></v-progress-circular>
                            <span>Add All Staffs</span>
                        </div>
                    </v-chip>
                    <div
                        class="d-inline-block ma-1"
                        v-for="staff in availableStaffsPool"
                        :key="staff.pk"
                    >
                        <v-tooltip location="top center">
                            <div>{{ staff.name }} ({{ staff.department.code }})</div>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    class="ma-1"
                                    variant="flat"
                                    @click="addStaff(staff)"
                                    >{{ staff.name }} ({{ staff.department.code }})
                                    <template #append>
                                        <v-progress-circular
                                            v-if="pendingStatus[staff.pk]"
                                            size="x-small"
                                            class="ml-2"
                                            indeterminate
                                        ></v-progress-circular>
                                    </template>
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>

                    <div class="d-block ma-1" key="add-course">
                        <v-tooltip location="top center">
                            <template #default>
                                <div>Add a new staff</div>
                            </template>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    color="teal"
                                    class="ma-1"
                                    variant="flat"
                                    @click="addStaffModel = true"
                                    >new staff
                                    <template #append>
                                        <v-icon class="ml-2">mdi-plus</v-icon>
                                    </template>
                                </v-chip>

                                <v-dialog persistent max-width="560" v-model="addStaffModel">
                                    <dialogs-add-staff
                                        @add="onStaffAdded"
                                        @close="addStaffModel = false"
                                    ></dialogs-add-staff>
                                </v-dialog>
                            </template>
                        </v-tooltip>
                    </div>
                </v-slide-x-transition>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import type { Department, FetchError, Staff } from "~/types"

const props = defineProps<{ tablePk: number }>()
const configs = useRuntimeConfig()

const timetableStore = useTimetableStore()

const timetable = timetableStore.retrieve(props.tablePk)

const { data: departments, pending: loadingDepartments } = useFetch<Department[]>("/departments/", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    default() {
        return []
    },
})
watch([departments], () => {
    if (departments.value.length > 0 && selectedDepartments.value.length <= 0) {
        selectedDepartments.value = departments.value.map((department) => department.pk)
    }
})
const selectedDepartments = ref<number[]>([])
function toggleAllDepartments(value: boolean) {
    if (value) {
        selectedDepartments.value = departments.value.map((department) => department.pk)
    } else {
        selectedDepartments.value = []
    }
}
function selectDepartment(department: Department, value: boolean) {
    if (value == false) {
        selectedDepartments.value = selectedDepartments.value.filter((pk) => pk != department.pk)
    } else {
        selectedDepartments.value.push(department.pk)
    }
}

const { data: _staffs, pending: loadingStaffs } = useFetch<Staff[]>("/staffs/", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    default() {
        return []
    },
})
const staffs = computed(() => {
    return _staffs.value.filter((staff) => selectedDepartments.value.includes(staff.department.pk))
})

const selectedStaffs = computed(() =>
    _staffs.value.filter((staff) => timetable.value?.staffs.includes(staff.pk))
)
const availableStaffsPool = computed(() =>
    staffs.value.filter((staff) => !timetable.value?.staffs.includes(staff.pk))
)

const pendingStatus = ref<{ [pk: number]: boolean }>({})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function removeStaff(staff: Staff) {
    if (!timetable.value) return
    try {
        pendingStatus.value[staff.pk] = true
        await $fetch(`/timetables/${timetable.value.pk}/staffs/`, {
            baseURL: configs.public.baseURL,
            headers: useFetchHeader([]),
            method: "delete",
            body: [staff.pk],
        })
        timetable.value.staffs = timetable.value.staffs.filter((pk) => pk != staff.pk)
    } catch (_error) {
        const error = _error as FetchError<string>
        if (!error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        pendingStatus.value[staff.pk] = false
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addStaff(staff: Staff) {
    if (!timetable.value) return
    try {
        pendingStatus.value[staff.pk] = true
        await $fetch(`/timetables/${timetable.value.pk}/staffs/`, {
            baseURL: configs.public.baseURL,
            headers: useFetchHeader([]),
            method: "post",
            body: [staff.pk],
        })
        timetable.value.staffs.push(staff.pk)
    } catch (_error) {
        const error = _error as FetchError<string>
        if (!error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        pendingStatus.value[staff.pk] = false
    }
}

const addStaffModel = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onStaffAdded(staff: Staff) {
    _staffs.value.push(staff)

    useNotification().add({
        text: `${staff.name} was added to staffs`,
        icon: "mdi-check-all",
        color: "teal",
    })
}



const removinggMultipe = ref(false)
async function removeAllStaffs() {
    const ids = selectedStaffs.value.map((staff) => staff.pk)

    try {
        removinggMultipe.value = true
        await $fetch(`/timetables/${timetable.value?.pk}/staffs/`, {
            method: "DELETE",
            baseURL: configs.public.baseURL,
            body: ids,
            headers: useFetchHeader([]),
        })

        if (timetable.value) {
            timetable.value.staffs = timetable.value.staffs.filter((id) => !ids.includes(id))
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        removinggMultipe.value = false
    }
}


const addingMultipe = ref(false)
async function addAllStaffs() {
    const ids = staffs.value.map((staff) => staff.pk)

    try {
        addingMultipe.value = true
        await $fetch(`/timetables/${timetable.value?.pk}/staffs/`, {
            method: "POST",
            baseURL: configs.public.baseURL,
            body: ids,
            headers: useFetchHeader([]),
        })

        if (timetable.value) {
            timetable.value.staffs = [...timetable.value.staffs, ...ids]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        addingMultipe.value = false
    }
}
</script>
