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
    semester: number
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
}

export type _NavigationAction = {
    title: string
    /**
     * The icon of the action
     */
    icon?: string
    /**
     * The color for the action button
     */
    color?: "primary" | "error" | "success" | "info" | "warn"
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
