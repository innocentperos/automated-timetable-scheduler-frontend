import type { Course, Staff, Venue, User } from "~/types"

export type MinimalTimetableSlot = {
    index: number
    timetable: number
    pk?: number
    courses_count: number
}

export type TimetableSlot = {
    index: number
    timetable: number
    pk?: number
    courses_count: number
    courses: SlotCourse[]
}

export type Complain = {
    messages: Array<ComplainMessage>
    resolved: boolean
    pk: number
    user: User

    related_slot_course?: number
    related_course?: number
    slot_course: number
}

export type ComplainMessage = {
    user: User
    message: string
    time: string
    reply_to?: number
    complain?: number
}

export type SlotCourse = {
    course: Course
    venues: Array<Venue>
    invigilators: Array<Staff>
    supervisor: Staff
    pk?: number
    complain_count: number
}

export type TableComlain = {
    slot_course: number
    heading: ComplainMessage
    type: ComplainType
    related_slot_course?: number
}

export type ComplainType = "other-conflict" | "level-conflict"
