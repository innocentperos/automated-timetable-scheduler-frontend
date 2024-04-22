import type { ComputedRef } from "vue"

export type Department = {
    title: string
    code: string
    pk: number
}

export type Course = {
    title: string
    code: string
    department: Department
    departments: Array<Department>
    level: number
    semester: 1 | 2
    pk: number
    student_count: number
}

export type VenueCategory = {
    pk: number
    title: string
    venue_count: number
}
export type Venue = {
    pk: number
    title: string
    code: string
    capacity: number
    category: VenueCategory
}

export type Staff = {
    name: string
    staff_id: string
    can_supervise: boolean
    can_invigilate: string
    pk: number
    department: Department
}

export type Timetable = {
    pk: number
    title: string
    is_current: string
    created_on: string
    courses: number[]
    staffs: number[]
    venues: number[]
    slot_per_day: number
    start_date: Date
    end_date: Date
    excluded_week_days: number[]
    excluded_days: Date[]
    days_count?: number
    semester: 1 | 2
}
export type FetchError<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request?: Request
    // options?: FetchOptions
    response?: Response
    data?: T
    status?: number
    statusText?: string
    statusCode?: number
    statusMessage?: string
}

export const SEMESTERS = [
    { title: "First", value: 1 },
    { title: "Second", value: 2 },
]

export const LEVELS = [
    { title: "100L", value: 100 },
    { title: "200L", value: 200 },
    { title: "300L", value: 300 },
    { title: "400L", value: 400 },
    { title: "500L", value: 500 },
]

export const WEEKDAYS = [
    { title: "Sunday", short: "Sun", value: 0 },
    { title: "Monday", short: "Mon", value: 1 },
    { title: "Tuesday", short: "Tue", value: 2 },
    { title: "Wednesday", short: "Wed", value: 3 },
    { title: "Thursday", short: "Thur", value: 4 },
    { title: "Friday", short: "Fri", value: 5 },
    { title: "Saturday", short: "Sat", value: 6 },
]

export const MONTHS = [
    {
        title: "January",
        short: "Jan",
        value: 0,
    },
    {
        title: "Febuary",
        short: "Feb",
        value: 1,
    },
    {
        title: "March",
        short: "Mar",
        value: 2,
    },
    {
        title: "April",
        short: "April",
        value: 3,
    },
    {
        title: "May",
        short: "May",
        value: 4,
    },
    {
        title: "June",
        short: "Jun",
        value: 5,
    },
    {
        title: "July",
        short: "July",
        value: 6,
    },
    {
        title: "August",
        short: "Aug",
        value: 7,
    },
    {
        title: "September",
        short: "Sept",
        value: 8,
    },
    {
        title: "October",
        short: "Oct",
        value: 9,
    },
    {
        title: "November",
        short: "Nov",
        value: 10,
    },
    {
        title: "December",
        short: "Dec",
        value: 11,
    },
]

export function parseDate(date: Date) {
    const month = MONTHS[date.getMonth()]
    const day = WEEKDAYS[date.getDay()]
    const year = date.getFullYear().toString().padStart(4, "0")
    const dayInd = date.getDate().toString().padStart(2, "0")

    return `${day.short} ${dayInd} ${month.short}, ${year}`
}

export function parseToServerDate(date: Date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().padStart(4, "0")
    const dayInd = date.getDate().toString().padStart(2, "0")

    return `${year}-${month}-${dayInd}`
}

function thesameDate(a: Date, b: Date) {
    if (a.getFullYear() != b.getFullYear()) return false
    if (a.getMonth() != b.getMonth()) return false
    if (a.getDate() != b.getDate()) return false

    return true
}

export function parseTimetableDays(
    startDate: Date,
    endDate: Date,
    excluded_weekdays: number[],
    excluded_days: Date[]
) {
    const current = new Date(startDate)
    const end = new Date(endDate)
    let allowDays = 0
    let excludedDays = 0
    const dates: Date[] = []

    while (current <= end) {
        // Check if the current day is Monday (getDay() returns 1 for Monday)
        if (
            excluded_weekdays.includes(current.getDay()) ||
            excluded_days.find((date) => thesameDate(date, current))
        ) {
            excludedDays++
        } else {
            allowDays++
            dates.push(current)
        }

        // Move to the next day
        current.setDate(current.getDate() + 1)
    }

    return {
        excluded: excludedDays,
        allowed: allowDays,
        allowed_days: dates,
    }
}

export type NotificationAction = {
    action: (closeCallback: () => void) => void
    color?: string | "success" | "error" | "warn" | "info"
    loading?: boolean | ComputedRef<boolean>
    type: "icon" | "text" | "both",
    tooltip?: string
} & (
    | { icon: string | ComputedRef<string>; type: "icon" }
    | { text: string | ComputedRef<string>; type: "text" }
    | { text: string | ComputedRef<string>; icon: string | ComputedRef<string>; type: "both" }
)

export type _Notification = {
    title?: string
    text?: string
    /**
     * The icon to be prepended to the notification
     */
    icon?: `mdi-${string}` | string
    /**
     * The color of the notification
     */
    color?: string
    /**
     * If the notification should have a close button icon
     */
    closable?: boolean
    /**
     * How long the notification will last before it will be removed
     */
    duration?: number
    /**
     *
     * @param closeCallback The function that will forcefully close the notification
     * @return void
     */
    action?: (closeCallback: () => void) => void
    secondaryActions?: Array<NotificationAction>
}

export type _NavigationAction = {
    title: string | ComputedRef
    /**
     * The icon of the action
     */
    icon?: string
    /**
     * The color for the action button
     */
    color?: "primary" | "error" | "success" | "info" | "warn" | string
    /**
     * Determine if the action is enabled or disabled
     */
    disabled?: ComputedRef<boolean> | boolean
    /**
     * Determines if the action should be displayed
     */
    hidden?: ComputedRef<boolean> | boolean
    /**
     * The information that will be displayed when the user hover over the action button
     */

    description?: ComputedRef | string
    loading?: ComputedRef<boolean> | boolean
    action: () => void
}

export type StoreResult<T> = {
    value: ComputedRef<T | undefined>
    pending: ComputedRef<boolean>
}

export type UserType = "admin" | "staff" | "student" | "any"

export type AuthUser = {
    name: string
    token: string
    userType: UserType
    email: string
    department?: number
    level?: 100 | 200 | 300 | 400 | 500
}

export type User = {
    name: string
}
