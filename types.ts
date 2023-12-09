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

export type FetchError = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
    request: Request
    response: Response
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
