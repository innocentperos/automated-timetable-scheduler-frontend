<template>
    <v-row>
        <v-col>
            <v-data-table
                :headers="HEADERS"
                :items="departmentCourse"
                show-select
                v-model="selectedCourses"
                item-value="pk"
            >
                <template #top>
                    <v-row justify="center">
                        <v-col
                            ><span class="text-h6 text-uppercase">Department Courses</span></v-col
                        >
                    </v-row>
                </template>

                <!-- <template #item.departments="{ value }">
                        <v-chip v-for="staff in value" :key="staff.pk" class="ml-1" color="teal">
                            {{ staff.staff_id }}
                        </v-chip>
                    </template> -->

                <template #loading>
                    <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                </template>
            </v-data-table>
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

const props = defineProps<{ departmentPk: number }>()

const departmentStore = useDepartmentStore()
const department = departmentStore.retrieve(props.departmentPk)

const selectedCourses = ref<Array<number>>([])
const courseStore = useCourseStore()

const courses = courseStore.all()
const departmentCoursesPk = departmentStore.courses(department.value.pk)
const departmentCourse = computed(() => {
    return courses.value.filter((course) =>
        departmentCoursesPk.value.includes(course.department.pk)
    )
})
</script>
