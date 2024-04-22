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
                            :department-pk="departmentPk"
                            :active="currentTab == 1"
                        ></LazyDepartmentsStaffListTable>
                    </v-window-item>
                    <v-window-item :value="2">
                        <LazyDepartmentsCourseListTable
                            :department-pk="departmentPk"
                            :active="currentTab == 2"
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
                <LazyDialogsAddCourse
                    :department-id="route.params.department_pk as any"
                    @add="courseAdded"
                    @close="additions.course = false"
                ></LazyDialogsAddCourse>
            </v-dialog>
            <v-dialog v-model="additions.staff" max-width="600px" location="top center" persistent>
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
const departmentPk = parseInt(route.params.department_pk as string)

const departmentStore = useDepartmentStore()
const currentTab = ref(2)

const {
    data: department,
    pending: loadingDepartment,
    refresh,
} = useFetch<Department & { staffs: Staff[]; courses: Course[] }>(`/departments/${departmentPk}/`, {
    retry: 5,
    retryDelay: 300,
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    server: false,
    lazy: true,
    onRequestError() {
        addNotification({
            text: "Could not get the department",
            action(closeCallback) {
                refresh()
                closeCallback()
            },
        })
    },
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
