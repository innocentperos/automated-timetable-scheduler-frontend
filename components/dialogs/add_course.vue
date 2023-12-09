<template>
    <v-form @submit.prevent v-model="formValid" :disabled="loading">
        <v-card>
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
            <v-card-title primary-title> Add Course </v-card-title>
            <v-card-text>
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
                    <v-col cols="12">
                        <v-select
                            :items="departments"
                            v-model="courseDepartment"
                            label="Course Department"
                            :rules="[useRuleRequired]"
                            :loading="loadingDepartments"
                            item-value="pk"
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
                    <v-col cols="6">
                        <v-select
                            :items="LEVELS"
                            :rules="[useRuleRequired]"
                            v-model="level"
                            label="Level"
                        ></v-select>
                    </v-col>
                    <v-col cols="6">
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
                    >Save Course</v-btn
                >
                <v-btn color="primary" @click="onClose">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>
<script setup lang="ts">
import type { Course, Department, FetchError } from "~/types"
import { SEMESTERS, LEVELS } from "~/types"
const config = useRuntimeConfig()

const title = ref("")
const code = ref("")
const level = ref()
const semester = ref()
const student_count = ref()
const courseDepartment = ref()
const courseDepartments = ref<number[]>([])
const loading = ref(false)

const last_error = ref({
    icon: "",
    title: "",
    viewed: false,
})

const { data: departments, pending: loadingDepartments } = useFetch<Department[]>("/departments/", {
    baseURL: config.public.baseURL,
    default: () => [],
})

const emits = defineEmits<{
    (event: "close"): void
    (event: "add", course: Course): void
}>()

const formValid = ref(false)

function setLastError(text: string, icon: string = "") {
    last_error.value.title = text
    last_error.value.icon = icon
    last_error.value.viewed = false
}

async function onSave() {
    if (!formValid.value) return

    const form = new FormData()
    form.append("title", title.value)
    form.append("code", code.value)
    form.append("student_count", student_count.value)
    form.append("level", level.value)
    form.append("semester", semester.value)
    form.append("department", courseDepartment.value)

    courseDepartments.value.forEach((department) => {
        form.append("departments", department.toString())
    })

    try {
        loading.value = true

        const course = await $fetch<Course>("/courses/", {
            baseURL: config.public.baseURL,
            method: "post",
            body: form,
        })

        emits("add", course)
        onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.data) {
            switch ((error as FetchError).response.status) {
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
    student_count.value = []
    loading.value = false
    last_error.value.icon = ""
    last_error.value.viewed = false
    last_error.value.title = ""
    emits("close")
}
</script>
