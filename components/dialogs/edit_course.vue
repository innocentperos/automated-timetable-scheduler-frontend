<template>
    <v-form @submit.prevent v-model="formValid" :disabled="loading">
        <v-card height="600">
            <v-banner
                stick="top"
                v-show="!last_error.viewed && last_error.title"
                lines="one"
                :icon="last_error.icon"
            >
                <template #text>
                    {{ last_error.title }}
                </template>

                <template #actions>
                    <v-btn color="error" @click="last_error.viewed = true"> close </v-btn>
                </template>
            </v-banner>
            <v-card-title primary-title class="pa-6">
                Update Course ({{ course.title }})
            </v-card-title>
            <v-card-text class="h-100 overflow-auto">
                <v-row>
                    <v-col cols="8">
                        <v-text-field
                            name="title"
                            label="Title"
                            id="title"
                            v-model="title"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="4">
                        <v-text-field
                            name="code"
                            label="Code"
                            id="Code"
                            v-model="code"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" v-show="departmentId == undefined">
                        <v-select
                            :items="departments"
                            v-model="courseDepartment"
                            label="Course Department"
                            :rules="[useRuleRequired]"
                            :loading="loadingDepartments"
                            item-value="pk"
                            :disabled="departmentId != undefined"
                        ></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-select
                            :items="departments"
                            v-model="courseDepartments"
                            label="Offered By Department"
                            :loading="loadingDepartments"
                            item-value="pk"
                            multiple
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            :items="LEVELS"
                            :rules="[useRuleRequired]"
                            v-model="level"
                            label="Level"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            :items="SEMESTERS"
                            :rules="[useRuleRequired]"
                            v-model="semester"
                            label="Semester"
                        ></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            name="student_count"
                            label="Student Count"
                            id="student_count"
                            v-model="student_count"
                            :rules="[useRuleRequired, useRuleNumber]"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn class="ml-4" type="submit" color="primary" @click="onSave" :loading="loading"
                    >Update Course</v-btn
                >
                <v-btn color="error" @click="onClose">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>
<script setup lang="ts">
import type { Course, Department, FetchError } from "~/types"
import { SEMESTERS, LEVELS } from "~/types"
const config = useRuntimeConfig()

const props = defineProps<{ course: Course; departmentId: number | undefined }>()

const title = ref(props.course.title)
const code = ref(props.course.code)
const level = ref<null | number>(props.course.level)
const semester = ref<null | number>(props.course.semester)
const student_count = ref<null | number>(props.course.student_count)
const courseDepartment = ref<null | number>(props.course.department.pk)
const courseDepartments = ref<number[]>(props.course.departments.map((department) => department.pk))

onMounted(() => {
    if (props.departmentId) {
        courseDepartment.value = props.departmentId
    }
})
const loading = ref(false)

const last_error = ref({
    icon: "",
    title: "",
    viewed: false,
})

const { data: departments, pending: loadingDepartments } = useFetch<Department[]>("/departments/", {
    baseURL: config.public.baseURL,
    headers: useFetchHeader([]),
    default: () => [],
})

const emits = defineEmits<{
    (event: "close"): void
    (event: "updated", course: Course): void
}>()

const formValid = ref(false)

function setLastError(text: string, icon: string = "") {
    last_error.value.title = text
    last_error.value.icon = icon
    last_error.value.viewed = false
}

async function onSave() {
    if (!formValid.value) {
        console.log("Invalid course edit form")
        return
    }

    const form = new FormData()
    form.append("title", title.value)
    form.append("code", code.value)
    form.append("student_count", student_count.value!.toString())
    form.append("level", level.value!.toString())
    form.append("semester", semester.value!.toString())
    form.append("department", courseDepartment.value!.toString())
    form.append("id", props.course.pk.toString())

    courseDepartments.value.forEach((department) => {
        form.append("departments", department.toString())
    })

    try {
        loading.value = true

        const course = await $fetch<Course>("/courses/" + props.course.pk + "/", {
            baseURL: config.public.baseURL,
            headers: useFetchHeader([]),

            method: "PUT",
            body: form,
        })

        emits("updated", course)
        onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_error) {
        const error = _error as FetchError<string>
        useLogger().error("Edit Course Dialog", "Unable to edit a new course", error as Error)
        if (error.statusCode) {
            switch (error.statusCode) {
                case 400:
                    // Invalid form
                    setLastError("Invalid form provided", "mdi-information-variant-circle")
                    break
                default:
                    // Error on server
                    setLastError(
                        "Oops, something wrong happened on the server, try again later",
                        "mdi-server-network-off"
                    )
                    break
            }
        } else {
            // Network Issue
            setLastError(
                "Oops, make sure you have a stable internet connection and try again",
                "mdi-wifi-strength-alert-outline"
            )
        }
    } finally {
        loading.value = false
    }
}
function onClose() {
    title.value = ""
    code.value = ""
    level.value = null
    semester.value = null
    courseDepartment.value = null
    courseDepartments.value = []
    student_count.value = 0
    loading.value = false
    last_error.value.icon = ""
    last_error.value.viewed = false
    last_error.value.title = ""
    emits("close")
}
</script>
