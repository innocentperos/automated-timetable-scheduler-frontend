import type { useDisplay } from 'vuetify/lib/framework.mjs'; import type ts from 'typescript';
<template>
    <v-layout row justify-center>
        <v-dialog v-model="model" scrollable fullscreen>
            <v-card>
                <v-card-title>Report Issue or complain</v-card-title>
                <v-divider></v-divider>
                <v-card-text style="height: 100%">
                    <v-container fluid>
                        <v-row>
                            <v-col v-if="currentSlotCourse" :cols="12" :md="4">
                                <LazyTimetablesTimetableSlotCourseFullView
                                    :slot-course="currentSlotCourse"
                                    full-width
                                ></LazyTimetablesTimetableSlotCourseFullView>
                            </v-col>
                            <v-col :cols="12" :md="8">
                                <v-select
                                    :items="complainOptions"
                                    v-model="complainType"
                                    label="Conflict type"
                                >
                                </v-select>
                                <v-slide-x-transition group>
                                    <v-autocomplete
                                        v-if="complainType == 'other-conflict'"
                                        :items="courses"
                                        item-title="code"
                                        item-value="pk"
                                        :loading="loadingCourses"
                                        label="Related Course"
                                        append-inner-icon="mdi-refresh"
                                        @click:append-inner="loadCourses"
                                        v-model="relatedCourse"
                                    >
                                        <template #selection="{ item }">
                                            <span v-if="item">
                                                {{ item.raw.title }}
                                                ({{ item.raw.code }})
                                            </span>
                                            <span v-else></span>
                                        </template>
                                        <template #item="{ item: course, props: itemProps }">
                                            <v-list-item v-bind="itemProps">
                                                <template #title>
                                                    {{ course.raw.title }} ({{ course.raw.code }})
                                                </template>
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>

                                    <v-autocomplete
                                        v-if="complainType == 'level-conflict'"
                                        :items="slotCourses"
                                        item-title="course.code"
                                        item-value="pk"
                                        :loading="loadingSlotCourses"
                                        label="Course conflicting with"
                                        append-inner-icon="mdi-refresh"
                                        @click:append-inner="loadSimilarSlotCourses"
                                        v-model="relatedSlotCourse"
                                    >
                                        <template #selection="{ item }">
                                            <span v-if="item">
                                                {{ item.raw.course.title }}
                                                ({{ item.raw.course.code }})
                                            </span>
                                            <span v-else></span>
                                        </template>
                                        <template #item="{ item: course, props: itemProps }">
                                            <v-list-item v-bind="itemProps">
                                                <template #title>
                                                    {{ course.raw.course.title }}
                                                    ({{ course.raw.course.code }})
                                                </template>
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </v-slide-x-transition>
                                <v-textarea
                                    :model-value="message"
                                    @update:model-value="updateMessage"
                                    label="Write complain here..."
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="blue darken-1" flat @click.native="hide">Close</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="onPost" :disabled="!valid"
                        >Save</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script setup lang="ts">
import type { Course, FetchError } from "~/types"
import type { SlotCourse } from "~/typing/timetable"

const { model, message, updateMessage, hide, currentSlotCourse, execute } =
    useGlobalView().makeComplainDialog()

const complainOptions = [
    {
        title: "Department and level conflict",
        value: "level-conflict",
    },
    {
        title: "Other",
        value: "other-conflict",
    },
]

const courses = ref<Course[]>([])
const loadingCourses = ref(false)

async function loadCourses() {
    if (!currentSlotCourse.value) return
    const slotId = currentSlotCourse.value.pk
    try {
        loadingCourses.value = true
        const _courses = await $fetch<Course[]>(`timetables/${slotId}/courses_by_slot_course/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })
        courses.value = _courses
    } catch (error) {
        loadingCourses.value = false
        const _error = error as FetchError<string>
        if (!_error.statusCode) {
            useNotification().postNetowrkIssue()
            return
        }
        switch (_error.status) {
            case 404:
                useNotification().add({
                    title: "Oops",
                    text: "Slot course could not be found ",
                    color: "amber",
                    icon: "mdi-alert-circle-outline",
                    closable: true,
                })
                break

            default:
                useNotification().postServerIssue()
                break
        }
    } finally {
        loadingCourses.value = false
    }
}

const slotCourses = ref<SlotCourse[]>([])
const loadingSlotCourses = ref(false)

async function loadSimilarSlotCourses() {
    if (!currentSlotCourse.value) return
    const slotId = currentSlotCourse.value.pk
    try {
        loadingSlotCourses.value = true
        const _courses = await $fetch<SlotCourse[]>(`complains/${slotId}/level_courses/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })
        slotCourses.value = _courses
    } catch (error) {
        loadingSlotCourses.value = false
        const _error = error as FetchError<string>
        if (!_error.statusCode) {
            useNotification().postNetowrkIssue()
            return
        }
        switch (_error.status) {
            case 404:
                useNotification().add({
                    title: "Oops",
                    text: "Slot course could not be found ",
                    color: "amber",
                    icon: "mdi-alert-circle-outline",
                    closable: true,
                })
                break

            default:
                useNotification().postServerIssue()
                break
        }
    } finally {
        loadingSlotCourses.value = false
    }
}

const complainType = ref<"level-conflict" | "other-conflict">("other-conflict")
const relatedSlotCourse = ref<number>()
const relatedCourse = ref<number>()

watch([complainType], function () {
    if (complainType.value == "level-conflict") {
        loadSimilarSlotCourses()
    } else if (complainType.value == "other-conflict") {
        loadCourses()
    }
})

const valid = computed(() => {
    if (!message.value) return false

    if (complainType.value == "level-conflict" && !relatedSlotCourse.value) return false
    if (complainType.value == "other-conflict" && !relatedCourse.value) return false

    return true
})
function onPost() {
    if (!message.value) return
    execute(
        complainType.value,
        complainType.value == "level-conflict" ? relatedSlotCourse.value : relatedCourse.value
    )
}
</script>
