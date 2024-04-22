<template>
    <v-container fluid>
        <v-dialog v-model="deletion.model" location="top center" persistent max-width="400">
            <v-card>
                <v-card-title class="headline"
                    >Delete {{ selectedCourses.length }} Courses</v-card-title
                >
                <v-card-text>Are you sure you want to delete the selected courses</v-card-text>
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
        <v-dialog v-model="addition.model" location="top center" persistent max-width="600">
            <dialogs-add-course @add="onSave" @close="addition.model = false"> </dialogs-add-course>
        </v-dialog>

        <v-row no-gutters>
            <v-col>
                <v-data-table
                    :headers="SELECTEDHEADERS"
                    :items="visibleCourses"
                    :loading="loading"
                    :show-select="authService.isAdmin.value"
                    v-model="selectedCourses"
                    item-value="pk"
                    :show-expand="authService.isAdmin.value || authService.isStaff.value"
                    show-current-page
                    sticky
                    :items-per-page="50"
                    fixed-header
                    :height="height"
                    header-color="success"
                >
                    <template #top>
                        <v-row justify="center" align-content="center" align="center" class="pa-4">
                            <v-col>
                                <span class="text-h5">
                                    {{
                                        currentCoursesShown == "all" ? "All Courses" : "My Courses"
                                    }}
                                </span>
                            </v-col>
                            <v-col>
                                <v-chip closable v-if="query" @click:close="setQuery('')"
                                    >Filtered by: {{ query }}</v-chip
                                >
                            </v-col>
                            <v-spacer></v-spacer>
                            <ui-is-authenticated :user-type="['staff', 'student']">
                                <v-col cols="auto">
                                    <v-btn-toggle color="teal" v-model="currentCoursesShown">
                                        <v-btn value="all">All Courses</v-btn>
                                        <v-btn value="my">My Courses</v-btn>
                                    </v-btn-toggle>
                                </v-col>
                            </ui-is-authenticated>
                        </v-row>
                    </template>

                    <template #expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length">
                                <v-container class="d-flex flex-wrap">
                                    <div class="pa-1">Department offering course:</div>
                                    <br />
                                    <div
                                        class="pa-1"
                                        v-for="department in item.departments"
                                        :key="department.pk"
                                    >
                                        <nuxt-link :to="'/departments/' + department.pk">
                                            <v-chip color="teal" link>
                                                {{ department.title }} ({{ department.code }})
                                            </v-chip>
                                        </nuxt-link>
                                    </div>
                                </v-container>
                            </td>
                        </tr>
                    </template>

                    <template #item.title="{ value, item }">
                        <v-tooltip text="edit course">
                            <template #activator="{ props: _props }">
                                <div
                                    v-ripple
                                    class="d-flex justify-space-between align-center cursor-pointer text-primary"
                                >
                                    <span class="">{{ value }}</span>
                                    <v-btn
                                        @click="onEditCourse(item)"
                                        color="primary"
                                        v-bind="_props"
                                        size="small"
                                        append-icon="mdi-pencil"
                                        >edit</v-btn
                                    >
                                </div>
                            </template>
                        </v-tooltip>
                    </template>

                    <template #loading>
                        <v-skeleton-loader type="table-row@20"></v-skeleton-loader>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>

        <v-bottom-sheet inset v-model="editModel">
            <lazy-dialogs-edit-course
                v-if="editingCourse"
                :course="editingCourse"
                :department-id="undefined"
                @close="onCloseEditSheet()"
                @updated="onCloseEditSheet"
            >
            </lazy-dialogs-edit-course>
        </v-bottom-sheet>
    </v-container>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs"
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

const MOBILEHEADERS = [
    { title: "Title", key: "title", value: "title" },
    { title: "Code", key: "code", value: "code" },
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

const authService = useUser()

const headingActions: symbol[] = []
onMounted(() => {
    headingActions.push(
        addAction({
            title: "New Course",
            icon: "mdi-plus",
            description: "Add a new course",
            hidden: computed(() => !authService.isAdmin.value),
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

const currentCoursesShown = ref<"all" | "my">(useUser().isAdmin.value ? "all" : "my")

const { data: courses, pending } = useFetch<Array<Course>>("/courses/", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    default() {
        return []
    },
})

const { data: DepartmentCourses, pending: pendingDepartmentCourses } = useFetch<Array<Course>>(
    `/departments/${authService.currentUser.value?.department}/courses/`,
    {
        baseURL: configs.public.baseURL,
        headers: useFetchHeader([]),
        default() {
            return []
        },
        transform: (_courses) => {
            const user = useUser().currentUser
            if (useUser().isStudent.value) {
                return _courses.filter((course) => course.level == user.value?.level)
            }
            return _courses
        },
    }
)

const currentCourses = computed(() => {
    if (currentCoursesShown.value == "my") {
        return DepartmentCourses.value
    }
    return courses.value
})

const { query, setQuery } = useNavigation()

const visibleCourses = computed(() => {
    return currentCourses.value.filter((course) => {
        return (
            course.title.toLowerCase().includes(query.value.toLowerCase()) ||
            course.code.toLowerCase().includes(query.value.toLowerCase())
        )
    })
})

const loading = computed(() => {
    return pendingDepartmentCourses.value || pending.value
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
        deletion.value.pending = false
        deletion.value.model = false
    }
}

const screen = useDisplay()

const height = computed(() => {
    return screen.height.value - 240
})

const SELECTEDHEADERS = computed(() => {
    if (screen.mobile.value) {
        return MOBILEHEADERS
    }
    return HEADERS
})

function viewCourse(course: Course) {
    useRouter().push({
        name: "courses-course_pk",
        params: {
            course_pk: course.pk,
        },
    })
}

const editModel = ref(false)
const editingCourse = ref<Course | undefined>()
function onEditCourse(course: Course) {
    editModel.value = true
    editingCourse.value = course
}

function onCloseEditSheet(course: Course | undefined = undefined) {
    editModel.value = false
    editingCourse.value = undefined

    if (course) {
        const index = courses.value.findIndex((c) => c.pk == course.pk)

        useNotification().add({
            title: "Updated",
            text: `${course.title} was updated Successfully.`,
            icon: "mdi-check-circle",
            color: "success",
            closable: true,
            action(closeCallback) {
                closeCallback()
            },
            secondaryActions: [
                {
                    type: "both",
                    text: "View",
                    icon: "mdi-launch",
                    color: "success",
                    tooltip: "View course",
                    action(closeCallback) {
                        closeCallback()
                        viewCourse(course)
                    },
                },
            ],
        })

        if (index > -1) {
            courses.value[index] = course
        }
    }
}
</script>
