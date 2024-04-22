import type { Course, FetchError, Staff, Venue } from "~/types"
import type { SlotCourse } from "~/typing/timetable"

const selectedDepartments = ref<number[]>([])
const selectLevels = ref<number[]>([])
const selectedVenues = ref<number[]>([])
const { query } = useNavigation()

function setDepartments(departmentPk: number[]) {
    selectedDepartments.value = departmentPk
}

function setLevels(levels: number[]) {
    selectLevels.value = levels
}

function setVenues(venues: number[]) {
    selectedVenues.value = venues
}

const selectedStaffs = ref<number[]>([])
function setStaffs(staffs: number[]) {
    selectedStaffs.value = staffs
}
function showSlotCourse(course: SlotCourse) {
    const _query = query.value.toLowerCase().trim()
    if (_query.length > 0) {
        if (
            !course.course.code.toLowerCase().includes(_query) &&
            !course.course.title.toLowerCase().includes(_query)
        ) {
            return false
        }
    }

    if (selectLevels.value.length > 0 && !selectLevels.value.includes(course.course.level)) {
        return false
    }

    if (selectedVenues.value.length > 0) {
        let found = false

        for (const venue of course.venues) {
            if (selectedVenues.value.includes(venue.pk)) {
                found = true
                break
            }
        }

        if (!found) return false
    }

    const _departments = new Set(course.course.departments)
    _departments.add(course.course.department)

    if (selectedDepartments.value.length > 0) {
        let found = false
        for (const department of _departments) {
            if (selectedDepartments.value.includes(department.pk)) {
                found = true
                break
            }
        }

        if (!found) return false
    }

    return true
}

const currentTimetableInjectSymbol = Symbol()

const _timetables_ignored_courses = ref<{ [index: number]: Course[] }>({})
const _loading_table_unassigned_courses = ref<{ [index: number]: boolean }>({})

type FOption<T, E> = {
    onError?: (error: FetchError<E>) => void
    default?: () => T
    refresh?: boolean
}

function __loadUnassingCourses<E>(timetablePk: number, options?: FOption<Course[], E>) {
    _loading_table_unassigned_courses.value[timetablePk] = true

    $fetch<Course[]>(`/timetables/${timetablePk}/unassigned_courses/`, {
        baseURL: useRuntimeConfig().public.baseURL,
        retry: 5,
        retryDelay: 500,
        headers: useFetchHeader([]),
    })
        .then((result) => {
            _timetables_ignored_courses.value[timetablePk] = result
        })
        .catch((error) => {
            useLogger().error(
                "useTimetableView",
                "Could not not get timetable unassinged courses",
                error
            )
            if (options && options.onError) {
                options.onError(error)
            }
        })
        .finally(() => {
            _loading_table_unassigned_courses.value[timetablePk] = false
        })
}
function getTimetableUnassingedCourses<E>(
    timetablePk: number,
    options?: FOption<Course[], FetchError<E>>
) {
    const value = _timetables_ignored_courses.value[timetablePk]
    if (!value || value.length < 1 || (options && options.refresh)) {
        if (options && options.default) {
            _timetables_ignored_courses.value[timetablePk] = options.default()
        } else {
            _timetables_ignored_courses.value[timetablePk] = []
        }
        __loadUnassingCourses(timetablePk, options)
    }
    return {
        courses: computed(() => _timetables_ignored_courses.value[timetablePk]),
        pending: computed(() => _loading_table_unassigned_courses.value[timetablePk]),
        refresh: () => __loadUnassingCourses(timetablePk, options),
    }
}

const _timetable_staffs = ref<{ [index: number]: Staff[] }>({})
const _loading_table_staffs = ref<{ [index: number]: boolean }>({})

function __loadTimetableStaffs<E>(timetablePk: number, options?: FOption<Staff[], E>) {
    $fetch<Staff[]>(`/timetables/${timetablePk}/staffs/`, {
        baseURL: useRuntimeConfig().public.baseURL,
        retry: 5,
        retryDelay: 500,
        headers: useFetchHeader([]),
    })
        .then((response) => {
            _timetable_staffs.value[timetablePk] = response
        })
        .catch((error) => {
            useLogger().error(
                "useTimetableView",
                "Could not not get timetable unassinged staffs",
                error
            )
            if (options && options.onError) options.onError(error as FetchError<E>)
        })
        .finally(() => {
            _loading_table_staffs.value[timetablePk] = false
        })
}
function getTimetableStaffs<T>(timetablePk: number, options?: FOption<Staff[], T>) {
    const staffs = _timetable_staffs.value[timetablePk]

    if (!staffs || (options && options.refresh)) {
        _loading_table_staffs.value[timetablePk] = true
        if (options && options.default) {
            _timetable_staffs.value[timetablePk] = options.default()
        } else {
            _timetable_staffs.value[timetablePk] = []
        }
        __loadTimetableStaffs(timetablePk, options)
    }

    return {
        data: computed(() => _timetable_staffs.value[timetablePk]),
        pending: computed(() => _loading_table_staffs.value[timetablePk]),
        refresh: () => __loadTimetableStaffs(timetablePk, options),
    }
}

const _timetable_venues = ref<{ [index: number]: Venue[] }>({})
const _loading_table_venues = ref<{ [index: number]: boolean }>({})

function __loadTimetableVenues<E>(timetablePk: number, options?: FOption<Venue[], E>) {
    $fetch<Venue[]>(`/timetables/${timetablePk}/venues/`, {
        baseURL: useRuntimeConfig().public.baseURL,
        retry: 5,
        retryDelay: 500,
        headers: useFetchHeader([]),
    })
        .then((response) => {
            _timetable_venues.value[timetablePk] = response
        })
        .catch((error) => {
            useLogger().error("useTimetableView", "Could not not get timetable venues", error)
            if (options && options.onError) options.onError(error as FetchError<E>)
        })
        .finally(() => {
            _loading_table_venues.value[timetablePk] = false
        })
}

function getTimetableVenues<T>(timetablePk: number, options?: FOption<Venue[], T>) {
    const venues = _loading_table_venues.value[timetablePk]

    if (!venues || (options && options.refresh)) {
        _loading_table_venues.value[timetablePk] = true
        if (options && options.default) {
            _timetable_venues.value[timetablePk] = options.default()
        } else {
            _timetable_venues.value[timetablePk] = []
        }
        __loadTimetableVenues(timetablePk, options)
    }

    return {
        data: computed(() => _timetable_venues.value[timetablePk]),
        pending: computed(() => _loading_table_venues.value[timetablePk]),
        refresh: (_timetablePk: number) => getTimetableVenues(_timetablePk, options),
    }
}

export const useTimetableView = function () {
    return {
        selectedDepartments: computed(() => selectedDepartments.value),
        selectedLevels: computed(() => selectLevels.value),
        selectedVenues: computed(() => selectedVenues.value),
        setDepartments,
        setLevels,
        setVenues,
        setStaffs,
        selectedStaffs: computed(() => selectedStaffs.value),
        showSlotCourse,
        currentTimetableInjectSymbol,
        getTimetableUnassingedCourses,
        getTimetableStaffs,
        getTimetableVenues,
    }
}
