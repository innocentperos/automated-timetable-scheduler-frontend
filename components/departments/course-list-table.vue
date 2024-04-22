<template>
    <v-row>
        <v-col>
            <v-data-table
                :headers="HEADERS"
                :items="courses"
                show-select
                v-model="selectedCourses"
                item-value="pk"
                :loading="pending"
            >
                <template #top>
                    <div class="d-flex pa-8">
                        <span class="text-h6 text-uppercase">Department Courses</span>
                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-refresh" color="primary" @click="refresh"></v-btn>
                    </div>
                </template>

                <template #loading>
                    <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                </template>
            </v-data-table>

            <v-dialog v-model="deleteDialog" max-width="500px" transition="dialog-transition">
                <v-card>
                    <v-card-title primary-title class="pa-4"> Are you sure? </v-card-title>
                    <v-card-text>
                        You are about to delete the {{ selectedCourses.length }} selected courses
                    </v-card-text>
                    <v-card-actions class="pa-4">
                        <v-btn @click="onDelete" color="error" variant="elevated">
                            Yes, delete
                        </v-btn>
                        <v-btn class="ml-2" @click="deleteDialog = false">No, Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Course } from "~/types"

const HEADERS = [
    { title: "Title", key: "title", value: "title" },
    { title: "Code", key: "code", value: "code" },
    {
        title: "level",
        key: "level",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (course: any) => (course as Course).level + "L",
    },
    {
        title: "semester",
        key: "semester",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (course: any) => ((course as Course).semester == 1 ? "First" : "Second"),
    },
    {
        title: "Students",
        key: "student_count",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: "student_count",
    },
]

const props = defineProps<{ departmentPk: number; active: boolean }>()
const {
    data: courses,
    pending,
    refresh,
} = useFetch<Course[]>(`/departments/${props.departmentPk}/courses/`, {
    baseURL: useRuntimeConfig().public.baseURL,
    headers: useFetchHeader([]),
    retry: 5,
    retryDelay: 300,
    default() {
        return []
    },
})
const selectedCourses = ref<Array<number>>([])

let actions: symbol[] = []
onMounted(() => {
    actions = useNavigation().addActions([
        {
            title: "Delete",
            icon: "mdi-delete",
            color: "error",
            action() {
                deleteDialog.value = true
            },
            hidden: computed(() => {
                if (!useUser().isAdmin.value) return true
                return !props.active || selectedCourses.value.length < 1
            }),
            loading: computed(() => deleting.value),
        },
    ])
})
onUnmounted(() => {
    actions.forEach(useNotification().remove)
})

const deleteDialog = ref(false)
const deleting = ref(false)
async function onDelete() {
    if (selectedCourses.value.length < 1) return

    try {
        deleting.value = true
        await $fetch("/courses/multiple_delete/", {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "DELETE",
            body: selectedCourses.value,
            headers: useFetchHeader([]),
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
        deleteDialog.value = false
    }
}
</script>
