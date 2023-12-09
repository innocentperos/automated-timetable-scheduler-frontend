<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <v-data-table
                    :headers="HEADERS"
                    :items="courses"
                    :loading="pending"
                    show-select
                    v-model="selectedCourses"
                    item-value="pk"
                    show-expand
                    show-current-page
                >
                    <template #top>
                        <v-row justify="center">
                            <v-col><span class="text-h5 text-uppercase">Courses</span></v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="auto"
                                ><v-dialog v-model="addingDialog" persistent max-width="500">
                                    <template #activator="{ props }">
                                        <v-btn color="primary" dark v-bind="props">
                                            Add Venue
                                        </v-btn>
                                    </template>

                                    <dialogs-add-course @add="onSave" @close="addingDialog = false">
                                    </dialogs-add-course> </v-dialog
                            ></v-col>
                        </v-row>
                    </template>

                    <template #expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length">
                                <v-container>
                                    Department offering course: <br />
                                    <nuxt-link
                                        v-for="department in item.departments"
                                        :key="department.pk"
                                        class="ml-1 "
                                        to="/departments/"
                                    >
                                        <v-chip color="teal" link>
                                            {{ department.title }} ({{ department.code }})
                                        </v-chip>
                                    </nuxt-link>
                                </v-container>
                            </td>
                        </tr>
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
                                v-if="selectedCourses.length > 0"
                                >DELETE</v-btn
                            >
                        </template>
                        <v-card>
                            <v-card-title class="headline"
                                >Delete {{ selectedCourses.length }} Courses</v-card-title
                            >
                            <v-card-text
                                >Are you sure you want to delete the selected courses</v-card-text
                            >
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" flat @click.native="deleteModel = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    size="large"
                                    color="red"
                                    v-if="selectedCourses.length > 0"
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
import type { Course } from "~/types"

const addingDialog = ref(false)

const HEADERS = [
    { title: "Title", key: "title", value: "title" },
    { title: "Code", key: "code", value: "code" },
    {
        title: "Students",
        key: "student_count",
        value: "student_count",
    },
    {
        title: "Department",
        key: "department.code",
        value: "department.code",
    },
    {
        title: "Level",
        key: "level",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (course: any) => (course as Course).level + "L",
    },
    {
        title: "Semester",
        key: "semester",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (course: any) => ((course as Course).semester == 1 ? "First" : "Second"),
    },
]

const configs = useRuntimeConfig()
const selectedCourses = ref<Array<number>>([])
const { data: courses, pending } = useFetch<Array<Course>>("/courses/", {
    baseURL: configs.public.baseURL,
    default() {
        return []
    },
})

function onSave(course: Course) {
    courses.value.push(course)
}

const deleteModel = ref(false)
const deleting = ref(false)

async function onDelete() {
    if (selectedCourses.value.length < 1) return

    try {
        deleting.value = true
        await $fetch("/courses/multiple_delete/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            body: selectedCourses.value,
        })

        courses.value = courses.value.filter((course) => {
            return !selectedCourses.value.includes(course.pk)
        })

        useNotification().add({
            text: `Successfully deleted ${selectedCourses.value.length} courses`,
            icon: "mdi-delete",
            color: "teal",
            action: (event) => event(),
        })

        selectedCourses.value = []
    } catch (error) {
        console.log({ error })
    } finally {
        deleting.value = false
        deleteModel.value = false
    }
}
</script>
