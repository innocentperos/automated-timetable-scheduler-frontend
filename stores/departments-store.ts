import type { Course, Department, FetchError, Staff } from "~/types"
import { useStaffStore } from "./staff-store"
import { useLogger } from "~/composables/use-logger"

const logger = useLogger()

export const useDepartmentStore = defineStore("department-store", () => {
    const _departments = ref<{ [pk: number]: Department }>({})

    const _staffsMapping = ref<{ [departmentPk: number]: number[] }>({})
    const _coursesMapping = ref<{ [coursePk: number]: number[] }>({})

    const _staffStore = useStaffStore()
    const _courseStore = useCourseStore()

    function staffs(departmentPk: number) {
        if (!(departmentPk in _staffsMapping.value)) {
            _staffsMapping.value[departmentPk] = []
        }

        return computed(() => _staffsMapping.value[departmentPk])
    }

    function insertStaff(departmentPk: number, staffs: Staff[]) {
        if (!(departmentPk in _staffsMapping.value)) {
            _staffsMapping.value[departmentPk] = []
        }

        staffs.forEach((staff) => {
            _staffsMapping.value[departmentPk].push(staff.pk)
        })

        _staffStore.insert(staffs)
    }

    function removeStaff(departmentPk: number, staffs: number[]) {
        if (!(departmentPk in _staffsMapping.value)) {
            _staffsMapping.value[departmentPk] = []
            return
        }

        _staffsMapping.value[departmentPk] = _staffsMapping.value[departmentPk].filter(
            (staffpk) => !staffs.includes(staffpk)
        )

        // Todo add staff to staff store
    }

    function courses(departmentPk: number) {
        if (!(departmentPk in _coursesMapping.value)) {
            _coursesMapping.value[departmentPk] = []
        }

        return computed(() => _coursesMapping.value[departmentPk])
    }

    function insertCourse(departmentPk: number, courses: Course[]) {
        if (!(departmentPk in _coursesMapping.value)) {
            _coursesMapping.value[departmentPk] = []
        }

        courses.forEach((staff) => {
            _coursesMapping.value[departmentPk].push(staff.pk)
        })

        _courseStore.insert(courses)
    }

    function removeCourse(departmentPk: number, courses: number[]) {
        if (!(departmentPk in _coursesMapping.value)) {
            _coursesMapping.value[departmentPk] = []
            return
        }

        _coursesMapping.value[departmentPk] = _coursesMapping.value[departmentPk].filter(
            (staffpk) => !courses.includes(staffpk)
        )

        // Todo add staff to staff store
    }

    function insert(department: Department) {
        _departments.value[department.pk] = department
        logger.debug("Department Store", "Added a department", department)
    }

    function retrieve(pk: number) {
        return computed(() => _departments.value[pk])
    }

    function bulkInsert(departments: Department[]) {
        departments.forEach((department) => {
            insert(department)
        })
    }

    function remove(pk: number) {
        if (pk in _departments.value) {
            delete _departments.value[pk]
        }
    }
    function bulkRemove(pks: number[]) {
        pks.forEach((pk) => {
            remove(pk)
        })
    }

    async function getOrFetch(pk: number) {
        const error = ref<FetchError<Department> | null>(null)
        if (pk in _departments.value) {
            return { data: retrieve(pk), error: computed(() => error.value) }
        }

        try {
            const response = await $fetch<Department>(`/departments/${pk}/`, {
                baseURL: useRuntimeConfig().public.baseURL,
                headers: useFetchHeader([]),
            })
            _departments.value[response.pk] = response
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            error.value = error
        }
        return { data: retrieve(pk), error: computed(() => error.value) }
    }

    async function refreshDepartments() {
        try {
            const response = await $fetch<Department[]>("/departments/", {
                baseURL: useRuntimeConfig().public.baseURL,
                retry: 5,
                retryDelay: 300,
                headers: useFetchHeader([]),
            })
            bulkInsert(response)
        } catch (error) {
            if ((error as FetchError<string>).statusCode) {
                useNotification().add({
                    text: "An error occured on the server, try again.",
                    icon: "mdi-server",
                    closable: true,
                })
            } else {
                console.log(error)

                useNotification().add({
                    text: "Oops, please make sure you have a stable internet connection and try again",
                    icon: "mdi-wifi-alert",
                    closable: true,
                })
            }
        }
    }

    return {
        insert,
        retrieve,
        bulkInsert,
        remove,
        bulkRemove,
        getOrFetch,
        refreshDepartments,
        all: () => {
            if (Object.keys(_departments.value).length < 1) {
                $fetch<Department[]>("/departments/", {
                    baseURL: useRuntimeConfig().public.baseURL,
                    headers: useFetchHeader([]),
                })
                    .then(bulkInsert)
                    .catch((error) => {
                        logger.log({
                            level: "error",
                            tag: "Department Store; all()",
                            message: "Error getting department list",
                            stackTrace: Error.captureStackTrace(error),
                            error: error,
                        })
                    })
            }

            return computed(() => Object.values(_departments.value))
        },
        count: () => computed(() => Object.keys(_departments).length),

        staffs,
        insertStaff,
        removeStaff,

        courses,
        insertCourse,
        removeCourse,
    }
})
