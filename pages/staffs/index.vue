<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <v-data-table
                    :headers="HEADERS"
                    :items="filteredStaffs"
                    :loading="loadingStaffs"
                    show-select
                    v-model="selectedStaffs"
                    item-value="pk"
                    :search="searchQuery"
                    :height="height - 180"
                    fixed-header
                >
                    <template #top>
                        <v-row justify="center" align="center" class="pa-8">
                            <v-col cols="4">
                                <span class="text-h5 text-uppercase">Staff</span>
                            </v-col>
                            <v-col cols="4">
                                <div v-if="searchQuery.length > 0">
                                    Searching:
                                    <v-chip closable @click:close="clearSearch">{{
                                        searchQuery
                                    }}</v-chip>
                                </div>
                            </v-col>
                            <v-col cols="4">
                                <v-menu
                                    v-model="selectDepartmentModal"
                                    location="bottom"
                                    :close-on-content-click="false"
                                >
                                    <template #activator="{ props: _props }">
                                        <!-- <div :bind="_props" class="w-100" v-ripple>Hello</div> -->
                                        <v-text-field
                                            label="Departments to show"
                                            density="compact"
                                            v-bind="_props"
                                            @click="selectDepartmentModal = true"
                                            @update:model-value="updateDepartmentQuery"
                                            :model-value="selectDepartmentInputValue"
                                            :messages="`${selectedDepartments.size} departments selected`"
                                            append-inner-icon="mdi-menu-down"
                                        ></v-text-field>
                                    </template>
                                    <v-list max-height="300">
                                        <v-list-item subtitle="selected"></v-list-item>
                                        <v-slide-y-transition group>
                                            <v-list-item
                                                v-for="department in filteredDepartments.filter(
                                                    (i) => selectedDepartments.has(i.pk)
                                                )"
                                                :key="department.pk"
                                                @click="selectDepartment(department)"
                                            >
                                                <template #title>
                                                    <div class="d-flex align-center justify-start">
                                                        <v-checkbox-btn
                                                            :model-value="
                                                                selectedDepartments.has(
                                                                    department.pk
                                                                )
                                                            "
                                                            class="mr-2"
                                                            inline
                                                        ></v-checkbox-btn>
                                                        <span>{{ department.title }}</span>
                                                        <v-spacer></v-spacer>
                                                    </div>
                                                </template>
                                            </v-list-item>
                                        </v-slide-y-transition>
                                        <v-divider></v-divider>
                                        <v-list-item subtitle="unselected"></v-list-item>
                                        <v-slide-y-transition group>
                                            <v-list-item
                                                v-for="department in filteredDepartments.filter(
                                                    (i) => !selectedDepartments.has(i.pk)
                                                )"
                                                :key="department.pk"
                                                @click="selectDepartment(department)"
                                            >
                                                <template #title>
                                                    <div class="d-flex align-center justify-start">
                                                        <v-checkbox-btn
                                                            :model-value="
                                                                selectedDepartments.has(
                                                                    department.pk
                                                                )
                                                            "
                                                            class="mr-2"
                                                            inline
                                                        ></v-checkbox-btn>
                                                        <span>{{ department.title }}</span>
                                                        <v-spacer></v-spacer>
                                                    </div>
                                                </template>
                                            </v-list-item>
                                        </v-slide-y-transition>
                                    </v-list>
                                </v-menu>
                            </v-col>
                        </v-row>
                    </template>

                    <template #item.can_supervise="{ item, value }">
                        <v-icon :color="value ? 'teal' : 'error'">
                            {{ item.can_supervise ? "mdi-check-all" : "mdi-close" }}
                        </v-icon>
                    </template>

                    <template #item.can_invigilate="{ item, value }">
                        <v-icon :color="value ? 'teal' : 'error'">
                            {{ item.can_invigilate ? "mdi-check-all" : "mdi-close" }}
                        </v-icon>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="d-flex">
                            <v-spacer></v-spacer>
                            <v-btn
                                @click="onEdit(item)"
                                color="primary"
                                prepend-icon="mdi-pencil"
                                density="compact"
                                >Edit</v-btn
                            >
                        </div>
                    </template>

                    <template #item.user="">
                        <v-menu>
                            <template #activator="{ props: _props }">
                                <v-chip v-bind="_props">
                                    <template #prepend>
                                        <v-avatar class="mr-1">
                                            <v-icon>mdi-account</v-icon>
                                        </v-avatar>
                                    </template>
                                    <template #default> email address </template>
                                </v-chip>
                            </template>
                            <v-card>
                                <v-card-text>
                                    <v-list>
                                        <v-list-item
                                            prepend-icon="mdi-lock"
                                            title="Change Password"
                                        >
                                        </v-list-item>
                                        <v-list-item
                                            prepend-icon="mdi-delete"
                                            title="Remove account"
                                            color="error"
                                        >
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-card>
                        </v-menu>
                    </template>

                    <template #item.department="{ item }">
                        <v-chip> {{ item.department.title }} ({{ item.department.code }}) </v-chip>
                    </template>

                    <template #loading>
                        <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>

        <v-bottom-sheet inset v-model="addStaffModel">
            <lazy-dialogs-add-staff-modal @close="onCloseModal" @add="onCloseModal">
            </lazy-dialogs-add-staff-modal>
        </v-bottom-sheet>

        <v-bottom-sheet v-if="currentEditingStaff" inset v-model="editModal">
            <lazy-dialogs-update-staff-modal
                :staff="currentEditingStaff"
                @close="onCloseEditModal"
                @update="onCloseEditModal"
            >
            </lazy-dialogs-update-staff-modal>
        </v-bottom-sheet>

        <v-dialog v-model="deleteStaffModal" location="top center" persistent max-width="400">
            <v-card>
                <v-card-title class="headline"
                    >Delete {{ selectedStaffs.length }} Staff</v-card-title
                >
                <v-card-text>Are you sure you want to delete the selected staff</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click.native="deleteStaffModal = false"
                        >Cancel</v-btn
                    >
                    <v-btn
                        size="large"
                        color="red"
                        v-if="selectedStaffs.length > 0"
                        :loading="deletingStaffs"
                        @click="onDeleteStaffs"
                        >DELETE</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs"
import type { Department, FetchError, Staff } from "~/types"

const actions: Array<symbol> = []

const searchQuery = computed(() => {
    return useNavigation().query.value
})

function clearSearch() {
    useNavigation().setQuery("")
}

onMounted(() => {
    actions.push(
        useNavigation().addAction({
            title: "New Staff",
            icon: "mdi-plus",
            description: "Add a new staff",
            action() {
                addStaffModel.value = true
            },
        })
    )

    actions.push(
        useNavigation().addAction({
            title: computed(() => {
                return `Delete (${selectedStaffs.value.length})`
            }),
            hidden: computed(() => selectedStaffs.value.length < 1),
            icon: "mdi-delete",
            color: "error",
            action() {
                deleteStaffModal.value = true
            },
        })
    )

    useNavigation().setTitle("Staffs")
})

onUnmounted(() => {
    useNavigation().removeActions(actions)
})

const HEADERS = [
    { title: "Name", key: "name", value: "name" },
    {
        title: "Department",
        key: "department",
        value: (item: unknown) => {
            return (item as Staff).department.pk
        },
    },
    {
        title: "Staff Id",
        key: "staff_id",
        value: "staff_id",
    },
    {
        title: "Supervises",
        key: "can_supervise",
        value: "can_supervise",
    },
    {
        title: "Invigilates",
        key: "can_invigilate",
        value: "can_invigilate",
    },
    {
        title: "",
        key: "actions",
        value: () => "true",
        align: "end",
    },
]

const screen = useDisplay()
const height = computed(() => {
    return screen.height.value - 96
})

const selectedStaffs = ref<number[]>([])
const {
    data: staffs,
    pending: loadingStaffs,
    refresh: refreshStaffs,
} = useFetch<Staff[]>("/staffs", {
    baseURL: useRuntimeConfig().public.baseURL,
    headers: useFetchHeader([]),
    default() {
        return []
    },
})
const filteredStaffs = computed(() => {
    return staffs.value.filter((staff) => {
        if (
            selectedDepartments.value.size > 0 &&
            !selectedDepartments.value.has(staff.department.pk)
        ) {
            return false
        }
        return true
    })
})

const departments = useDepartmentStore().all()
const filteredDepartments = computed(() => {
    return departments.value.filter((i) => {
        return i.title.toLowerCase().includes(departmentQuery.value)
    })
})
const selectedDepartments = ref(new Set<number>([]))
const selectDepartmentModal = ref(false)
const departmentQuery = ref("")
const selectDepartmentInputValue = computed(() => {
    if (selectDepartmentModal.value) {
        return departmentQuery.value
    }

    if (selectedDepartments.value.size == 0) {
        return "Showing all departments"
    }
    return selectedDepartments.value.size + " selected departments"
})
function updateDepartmentQuery(value: string) {
    departmentQuery.value = value
}
function selectDepartment(department: Department) {
    if (selectedDepartments.value.has(department.pk)) {
        selectedDepartments.value.delete(department.pk)
    } else {
        selectedDepartments.value.add(department.pk)
    }
}
// Adding staff components
const addStaffModel = ref(false)

function onCloseModal(staff?: Staff) {
    addStaffModel.value = false
    if (staff) {
        staffs.value.push(staff)
        useNotification().add({
            title: "New Staff",
            text: `New staff ${staff.name} as added successfully`,
            icon: "mdi-check-bold",
            color: "teal",
            closable: true,
            action(closeCallback) {
                closeCallback()
            },
        })
        return
    }
}

// Deleting staffs
const deletingStaffs = ref(false)
const deleteStaffModal = ref(false)
async function onDeleteStaffs() {
    try {
        deletingStaffs.value = true
        await $fetch("/staffs/multiple/", {
            method: "DELETE",
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
            body: selectedStaffs.value,
        })

        useNotification().add({
            title: "Success",
            text: "The selected staff have be deleted.",
            icon: "mdi-delete",
            closable: true,
            color: "success",
            action(closeCallback) {
                closeCallback()
            },
            secondaryActions: [
                {
                    type: "both",
                    icon: "mdi-undo-variant",
                    text: "undo",
                    action(closeCallback) {
                        closeCallback()
                    },
                },
            ],
        })
        refreshStaffs()
    } catch (_error: unknown) {
        const error = _error as FetchError<string>

        if (!error.statusCode) {
            useNotification().postNetowrkIssue()
        } else {
            switch (error.statusCode) {
                case 400:
                    break

                default:
                    useNotification().postServerIssue()
                    break
            }
        }
    } finally {
        deletingStaffs.value = false
        deleteStaffModal.value = false
        selectedStaffs.value = []
    }
}

// Editing staff
const editModal = ref(false)
const currentEditingStaff = ref<Staff>()
function onEdit(staff: Staff) {
    currentEditingStaff.value = staff
    editModal.value = true
}

async function onCloseEditModal(staff?: Staff) {
    editModal.value = false
    if (staff) {
        useNotification().add({
            title: "Success",
            text: `staff ${staff.name} was updated successfully`,
            icon: "mdi-check-circle",
            color: "success",
            closable: true,
        })

        const index = staffs.value.findIndex((item) => item.pk == staff.pk)
        staffs.value[index] = staff
    }
}
</script>
