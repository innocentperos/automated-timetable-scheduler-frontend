<template>
    <v-container fluid>
        <v-row v-if="department && !loadingDepartment" align="center">
            <v-col cols="auto" class="px-4 d-inline-block">
                <span class="text-subtitle-1">{{ department.title }}</span>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
                <v-tabs v-model="currentTab" color="primary" align-tabs="center">
                    <v-tab :value="1">
                        <v-slide-x-transition>
                            <v-icon v-show="currentTab == 1">mdi-account-group</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2">Staffs </span>
                    </v-tab>
                    <v-tab :value="2">
                        <v-slide-x-transition>
                            <v-icon v-show="currentTab == 2">mdi-book-multiple</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2">Courses </span>
                    </v-tab>
                </v-tabs>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
        <v-row v-if="department && !loadingDepartment">
            <v-col cols="12">
                <v-window v-model="currentTab">
                    <v-window-item :value="1">
                        <LazyDepartmentsStaffListTable
                            :department-pk="department.pk"
                        ></LazyDepartmentsStaffListTable>
                    </v-window-item>
                    <v-window-item :value="2">
                        <LazyDepartmentsCourseListTable
                            :department-pk="department.pk"
                        ></LazyDepartmentsCourseListTable>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>
        <v-row v-else-if="loadingDepartment" justify="center">
            <v-col cols="auto">
                <v-progress-circular indeterminate></v-progress-circular>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="additions.course" max-width="600px" location="top center" persistent>
                <LazyDialogsAddCourse @add="courseAdded" @close="additions.course = false" />
            </v-dialog>
            <v-dialog v-model="additions.staff" max-width="500px" location="top center" persistent>
                <LazyDialogsAddStaff @add="staffAdded" @close="additions.staff = false" />
            </v-dialog>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import type { Course, Department, Staff } from "~/types"

const configs = useRuntimeConfig()
const { add: addNotification } = useNotification()
const route = useRoute()

const departmentStore = useDepartmentStore()
const currentTab = ref(2)

const {
    data: department,
    pending: loadingDepartment,
    error,
    refresh,
} = useFetch<Department & { staffs: Staff[]; courses: Course[] }>(
    `/departments/${route.params.department_pk}/`,
    {
        retry: 5,
        retryDelay: 300,
        baseURL: configs.public.baseURL,
        server: false,
        lazy: true,
    }
)
async function loadStaffs(department: Department) {
    try {
        const staffs = await $fetch<Staff[]>(`/departments/${department.pk}/staffs/`, {
            baseURL: configs.public.baseURL,
            retry: 5,
            retryDelay: 300,
        })
        departmentStore.insertStaff(department.pk, staffs)
    } catch (error) {
        useNotification().add({
            text: "Something went wrong while fetching staffs list",
            icon: "mdi-close",
        })
    }
}

async function loadCourses(department: Department) {
    try {
        const courses = await $fetch<Course[]>(`/departments/${department.pk}/courses/`, {
            baseURL: configs.public.baseURL,
            retry: 5,
            retryDelay: 300,
        })
        departmentStore.insertCourse(department.pk, courses)
    } catch (error) {
        useNotification().add({
            text: "Something went wrong while fetching courses list",
            icon: "mdi-close",
        })
    }
}

watch(department, async () => {
    console.log({
        title: "Got department",
        table: department.value,
    })

    if (department.value) {
        departmentStore.insert(department.value)

        await loadStaffs(department.value)
        await loadCourses(department.value)
    }
})

watch(error, () => {
    if (error.value) {
        addNotification({
            text: "Could not get the department",
            action(closeCallback) {
                refresh()
                closeCallback()
            },
        })
    }
})

const additions = ref({
    staff: false,
    course: false,
})
let actions: symbol[] = []
onMounted(() => {
    actions = useNavigation().addActions([
        {
            title: "Add Staff",
            icon: "mdi-plus",
            hidden: computed(() => currentTab.value != 1),
            action() {
                additions.value.staff = true
            },
        },
        {
            title: "Add Course",
            icon: "mdi-plus",
            hidden: computed(() => currentTab.value != 2),
            action() {
                additions.value.course = true
            },
        },
    ])
})
onUnmounted(() => {
    useNavigation().removeActions(actions)
})

function staffAdded(staff: Staff) {
    useNotification().add({
        text: `${staff.name} was added to staff`,
        icon: "mdi-check-all",
        color: "teal",
    })
    if (staff.department.pk == department.value?.pk) {
        departmentStore.insertStaff(department.value.pk, [staff])
    } else {
        useStaffStore().insert([staff])
    }
}
function courseAdded(course: Course) {
    useNotification().add({
        text: `${course.title} was added to courses`,
        icon: "mdi-check-all",
        color: "teal",
    })
    if (course.department.pk == department.value?.pk) {
        departmentStore.insertCourse(department.value.pk, [course])
    } else {
        useCourseStore().insert([course])
    }
}
</script>
