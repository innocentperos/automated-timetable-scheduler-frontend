<template>
    <v-container>
        <v-row>
            <v-col>
                <v-data-table
                    :headers="HEADERS"
                    :items="departments"
                    :loading="pendingDepartments"
                    show-select
                    v-model="selectedDepartments"
                    item-value="pk"
                >
                    <template #top>
                        <v-row justify="center">
                            <v-col><span class="text-h5 text-uppercase">Departments</span></v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="auto"
                                ><v-dialog v-model="addDepartmentModel" persistent max-width="500">
                                    <template #activator="{ props }">
                                        <v-btn
                                            color="primary"
                                            variant="text"
                                            prepend-icon="mdi-plus"
                                            v-bind="props"
                                        >
                                            Add Department
                                        </v-btn>
                                    </template>

                                    <dialogs-add-department
                                        @add="onSave"
                                        @close="addDepartmentModel = false"
                                    >
                                    </dialogs-add-department> </v-dialog
                            ></v-col>
                        </v-row>
                    </template>

                    <template #item.departments="{ value }">
                        <v-chip
                            v-for="department in value"
                            :key="department.pk"
                            class="ml-1"
                            color="teal"
                        >
                            {{ department.code }}
                        </v-chip>
                    </template>

                    <template #loading>
                        <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="auto">
                <v-layout row justify-center>
                    <v-dialog v-model="deleteModel" persistent max-width="400">
                        <template #activator="{ props }">
                            <v-btn
                                size="large"
                                color="red"
                                v-bind="props"
                                v-if="selectedDepartments.length > 0"
                                >DELETE</v-btn
                            >
                        </template>
                        <v-card>
                            <v-card-title class="headline"
                                >Delete {{ selectedDepartments.length }} Departments</v-card-title
                            >
                            <v-card-text
                                >Are you sure you want to delete the selected
                                departments</v-card-text
                            >
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" flat @click.native="deleteModel = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    size="large"
                                    color="red"
                                    v-if="selectedDepartments.length > 0"
                                    :loading="deleting"
                                    @click="onDelete"
                                    >DELETE</v-btn
                                >
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-layout>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import type { Department } from "~/types"

const HEADERS = [
    { title: "Title", key: "title", value: "title" },
    { title: "Code", key: "code", value: "code" },
    {
        title: "Staff Count",
        key: "staff_count",
        value: "staff_count",
    },
    {
        title: "Courses Count",
        key: "course_count",
        value: "course_count",
    },
]

const configs = useRuntimeConfig()
const addDepartmentModel = ref(false)

const selectedDepartments = ref<Array<number>>([])
const { data: departments, pending: pendingDepartments } = useFetch<Array<Department>>(
    "/departments/",
    {
        baseURL: configs.public.baseURL,
        default() {
            return []
        },
    }
)

function onSave(department: Department) {
    departments.value.push(department)
    addDepartmentModel.value = false
}

const deleteModel = ref(false)
const deleting = ref(false)

async function onDelete() {
    if (selectedDepartments.value.length < 1) return

    try {
        deleting.value = true
        await $fetch("/courses/multiple_delete/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            body: selectedDepartments.value,
        })

        departments.value = departments.value.filter((department) => {
            return !selectedDepartments.value.includes(department.pk)
        })
        useNotification().add({
            text: `Successfully deleted ${selectedDepartments.value.length} departments`,
            icon: "mdi-delete",
            color: "teal",
            action: (event) => event(),
        })
        selectedDepartments.value = []
    } catch (error) {
        console.log({ error })
    } finally {
        deleting.value = false
        deleteModel.value = false
    }
}
</script>
