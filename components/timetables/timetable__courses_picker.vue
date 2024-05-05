<!-- eslint-disable vue/no-template-shadow -->
<template>
    <v-container fluid>
        <v-row no-gutters>
            <v-col cols="12" :lg="3">
                <v-card elevation="0" color="primary" class="mb-4">
                    <v-card-text class="pa-0">
                        <v-list bg-color="primary" density="compact">
                            <v-list-item>
                                <v-list-item-title class="text-button"> Levels </v-list-item-title>
                                <template #append>
                                    <v-checkbox-btn
                                        :model-value="selectedLevels.length == LEVELS.length"
                                        @update:model-value="toggleAllLevel($event)"
                                    ></v-checkbox-btn>
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
                            <v-list-item v-for="level in LEVELS" :key="level.value">
                                <v-list-item-title>
                                    {{ level.title }}
                                </v-list-item-title>
                                <template #append>
                                    <v-checkbox-btn
                                        :model-value="selectedLevels.includes(level.value)"
                                        @update:model-value="selectLevel(level, $event)"
                                    ></v-checkbox-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>

                <v-card elevation="0" color="primary">
                    <v-card-text class="pa-0">
                        <v-list bg-color="primary" density="compact">
                            <v-list-item>
                                <v-list-item-title class="text-button">
                                    Departments
                                </v-list-item-title>
                                <template #append>
                                    <v-checkbox-btn
                                        :model-value="
                                            selectedDepartments.length == departments.length
                                        "
                                        @update:model-value="toggleAllDepartments($event)"
                                    ></v-checkbox-btn>
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
            <v-col cols="12" :lg="9" class="pa-4">
                <div class="d-block ma-2">Selected Courses</div>
                <div v-if="_selectedCourses.length == 0" class="d-block mx-2">
                    <v-alert type="info" color="blue lighten-2" dismissible>
                        <span class="text-subtitle-1">No course selected into this table</span>
                        <br />
                        <span class="text-body-1"
                            >Click on a course in the course poll to add it into this
                            timetable</span
                        >
                    </v-alert>
                </div>

                <v-slide-x-transition group>
                    <v-chip class="ma-1" @click="removeAllCourse" color="error" variant="elevated">
                        <div class="d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                size="16"
                                width="2"
                                class="mr-2"
                                v-show="removinggMultipe"
                            ></v-progress-circular>
                            <span>Remove All Courses</span>
                        </div>
                    </v-chip>
                    <div
                        class="d-inline-block ma-1"
                        v-for="course in _selectedCourses"
                        :key="course.pk"
                    >
                        <v-tooltip location="top center">
                            <template #default>
                                <div>
                                    {{ course.title }} offered by <br />
                                    {{ course.departments.flatMap((d) => d.code).join(", ") }}
                                </div>
                            </template>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    :color="timetable?.courses.includes(course.pk) ? 'primary' : ''"
                                    class="ma-1"
                                    variant="flat"
                                    @click="toggleCourse(course)"
                                    l
                                    >{{ course.code }}
                                    <template #append>
                                        <v-progress-circular
                                            v-if="pendingStatus[course.pk]"
                                            size="x-small"
                                            class="ml-2"
                                            indeterminate
                                        ></v-progress-circular>
                                        <v-icon
                                            v-else-if="timetable?.courses.includes(course.pk)"
                                            class="ml-2"
                                            >mdi-check-all</v-icon
                                        >
                                    </template>
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>
                </v-slide-x-transition>

                <div class="d-block ma-2 mt-5">Course Poll</div>

                <v-slide-x-transition group>
                    <v-chip class="ma-1" @click="addAllCourse" color="success" variant="elevated">
                        <div class="d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                size="16"
                                width="2"
                                class="mr-2"
                                v-show="addingMultipe"
                            ></v-progress-circular>
                            <span>Add All Courses</span>
                        </div>
                    </v-chip>

                    <div
                        class="d-inline-block ma-1"
                        v-for="course in _unSelectedCourses"
                        :key="course.pk"
                    >
                        <v-tooltip location="top center">
                            <template #default>
                                <div>
                                    {{ course.title }} offered by <br />
                                    {{ course.departments.flatMap((d) => d.code).join(", ") }}
                                </div>
                            </template>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    :color="timetable?.courses.includes(course.pk) ? 'primary' : ''"
                                    class="ma-1"
                                    variant="flat"
                                    @click="toggleCourse(course)"
                                    l
                                    >{{ course.code }}
                                    <template #append>
                                        <v-progress-circular
                                            v-if="pendingStatus[course.pk]"
                                            size="x-small"
                                            class="ml-2"
                                            indeterminate
                                        ></v-progress-circular>
                                        <v-icon
                                            v-else-if="timetable?.courses.includes(course.pk)"
                                            class="ml-2"
                                            >mdi-check-all</v-icon
                                        >
                                    </template>
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>

                    <div class="d-block ma-1" key="add-course">
                        <v-tooltip location="top center">
                            <template #default>
                                <div>Add a new course</div>
                            </template>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    color="teal"
                                    class="ma-1"
                                    variant="flat"
                                    @click="addCourseModel = true"
                                    >new course
                                    <template #append>
                                        <v-icon class="ml-2">mdi-plus</v-icon>
                                    </template>
                                </v-chip>

                                <v-dialog persistent max-width="560" v-model="addCourseModel">
                                    <dialogs-add-course
                                        @add="onCourseAdded"
                                        @close="addCourseModel = false"
                                    ></dialogs-add-course>
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
import type { Course, Department, FetchError } from "~/types"
import { LEVELS } from "~/types"
const props = defineProps<{ tablePk: number }>()
const configs = useRuntimeConfig()

const timetableStore = useTimetableStore()

const timetable = timetableStore.retrieve(props.tablePk)
const { data: departments, pending: loadingDepartments } = useFetch<Array<Course>>(
    "/departments/",
    {
        baseURL: configs.public.baseURL,
        headers: useFetchHeader([]),
        default: () => [],
    }
)

watch(departments, () => {
    if (departments.value.length > 0 && selectedDepartments.value.length <= 0) {
        selectedDepartments.value = departments.value.map((department) => department.pk)
    }
})
const selectedLevels = ref<number[]>([])
const selectedDepartments = ref<number[]>([])
function selectDepartment(department: Department, value: boolean) {
    if (value) {
        selectedDepartments.value.push(department.pk)
    } else {
        selectedDepartments.value = selectedDepartments.value.filter((pk) => pk != department.pk)
    }
}
function toggleAllDepartments(value: boolean) {
    if (value == false) {
        selectedDepartments.value = []
    } else {
        selectedDepartments.value = departments.value.map((department) => department.pk)
    }
}

function selectLevel(level: { value: number }, value: boolean) {
    if (value) {
        selectedLevels.value.push(level.value)
    } else {
        selectedLevels.value = selectedLevels.value.filter((pk) => pk != level.value)
    }
}

function toggleAllLevel(value: boolean) {
    if (value == false) {
        selectedLevels.value = []
    } else {
        selectedLevels.value = LEVELS.map((level) => level.value)
    }
}

const { data: _courses } = useFetch<Array<Course>>("/courses/?semester=", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    default: () => [],
})
const courses = computed(() => {
    return _courses.value.filter(
        (course) =>
            selectedDepartments.value.includes(course.department.pk) &&
            !timetable.value?.courses.includes(course.pk) &&
            (selectedLevels.value.includes(course.level) || selectedLevels.value.length == 0) &&
            course.semester == timetable.value?.semester
    )
})
const _selectedCourses = computed(() => {
    return _courses.value.filter((course) => timetable.value?.courses.includes(course.pk))
})
const _unSelectedCourses = computed(() => {
    return courses.value.filter((course) => !timetable.value?.courses.includes(course.pk))
})

const pendingStatus = ref<{ [id: number]: boolean }>({})

async function toggleCourse(course: Course) {
    if (!timetable.value) return
    try {
        pendingStatus.value[course.pk] = true
        if (timetable.value.courses.includes(course.pk)) {
            await removeCourse(course)
        } else {
            await addCourse(course)
        }
    } finally {
        pendingStatus.value[course.pk] = false
    }
}

async function removeCourse(course: Course) {
    try {
        await $fetch(`/timetables/${timetable.value?.pk}/courses/`, {
            method: "DELETE",
            baseURL: configs.public.baseURL,
            body: [course.pk],
            headers: useFetchHeader([]),
        })
        if (timetable.value) {
            timetable.value.courses = timetable.value?.courses.filter((c) => c != course.pk)
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
    }
}
const removinggMultipe = ref(false)
async function removeAllCourse() {
    const ids = _selectedCourses.value.map((table) => table.pk)

    try {
        removinggMultipe.value = true
        await $fetch(`/timetables/${timetable.value?.pk}/courses/`, {
            method: "DELETE",
            baseURL: configs.public.baseURL,
            body: ids,
            headers: useFetchHeader([]),
        })

        if (timetable.value) {
            timetable.value.courses = timetable.value.courses.filter((id) => !ids.includes(id))
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

async function addCourse(course: Course) {
    try {
        await $fetch(`/timetables/${timetable.value?.pk}/courses/`, {
            method: "POST",
            baseURL: configs.public.baseURL,
            body: [course.pk],
            headers: useFetchHeader([]),
        })
        timetable.value?.courses.push(course.pk)
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
    }
}

const addingMultipe = ref(false)
async function addAllCourse() {
    const ids = courses.value.map((table) => table.pk)

    try {
        addingMultipe.value = true
        await $fetch(`/timetables/${timetable.value?.pk}/courses/`, {
            method: "POST",
            baseURL: configs.public.baseURL,
            body: ids,
            headers: useFetchHeader([]),
        })

        if (timetable.value) {
            timetable.value.courses = [...timetable.value.courses, ...ids]
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
const addCourseModel = ref(false)
function onCourseAdded(course: Course) {
    _courses.value.push(course)
    useNotification().add({
        text: `${course.title} added to courses`,
        icon: "mdi-check-all",
        color: "teal",
        closable: true,
    })
}
</script>
