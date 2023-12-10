<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <v-dialog v-model="deletion.model" location="top center" persistent max-width="400">
                    <v-card>
                        <v-card-title class="headline"
                            >Delete {{ selectedCourses.length }} Courses</v-card-title
                        >
                        <v-card-text
                            >Are you sure you want to delete the selected courses</v-card-text
                        >
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" flat @click.native="deletion.model = false"
                                >Cancel</v-btn
                            >
                            <v-btn
                                size="large"
                                color="red"
                                v-if="selectedCourses.length > 0"
                                :loading="deletion.pending"
                                @click="onDelete"
                                >DELETE</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
            <v-col>
                <v-dialog v-model="addition.model" location="top center" persistent max-width="600">
                    <dialogs-add-course @add="onSave" @close="addition.model = false">
                    </dialogs-add-course>
                </v-dialog>
            </v-col>
        </v-row>
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
                                        class="ml-1"
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
    </v-container>
</template>
<script setup lang="ts">
import type { Course } from "~/types"

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

const deletion = ref({
    model: false,
    pending: false,
})
const addition = ref({
    model: false,
})
const selectedCourses = ref<Array<number>>([])
const configs = useRuntimeConfig()
const { add: addNotification } = useNotification()
const { addAction, removeActions } = useNavigation()

const headingActions: symbol[] = []
onMounted(() => {
    headingActions.push(
        addAction({
            title: "New Course",
            icon: "mdi-plus",
            description: "Add a new course",
            hidden: false,
            action() {
                addition.value.model = true
            },
        })
    )
    headingActions.push(
        addAction({
            title: "delete",
            description: computed(
                () => `delete the ${selectedCourses.value.length} selected courses`
            ),
            icon: "mdi-delete",
            color: "error",
            hidden: computed(() => selectedCourses.value.length < 1),
            action() {
                deletion.value.model = true
            },
        })
    )
})
onUnmounted(() => {
    removeActions(headingActions)
})

const { data: courses, pending } = useFetch<Array<Course>>("/courses/", {
    baseURL: configs.public.baseURL,
    default() {
        return []
    },
})

function onSave(course: Course) {
    courses.value.push(course)
    addNotification({
        text: `${course.title} was added Successfully`,
        icon: "mdi-plus",
        closable: true,
        color: "teal",
        action(closeCallback) {
            closeCallback()
        },
    })
}

async function onDelete() {
    if (selectedCourses.value.length < 1) return

    try {
        deletion.value.pending = true
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
        deletion.value.pending = false
        deletion.value.model = false
    }
}
</script>
