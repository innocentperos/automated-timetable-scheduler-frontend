<template>
    <v-skeleton-loader v-if="loadingSlotCourse" type="list-item-two-line"></v-skeleton-loader>
    <v-list-item v-else-if="slot_course" color="amber">
        <template #prepend>
            <!-- <v-checkbox-btn></v-checkbox-btn> -->
            <v-avatar color="grey">
                <v-icon>mdi-account</v-icon>
            </v-avatar>
        </template>

        <v-list-item-title class="my-1 mt-2">
            <div class="d-flex justify-space-between align-center">
                <span>Innocent Peros</span>
                <v-chip v-if="complain.type == 'level-conflict'" color="red"> colision </v-chip>
                <v-chip v-else-if="complain.type == 'other-conflict'" color="amber"> other </v-chip>
            </div>
        </v-list-item-title>

        <v-list-item-subtitle>
            <div class="d-flex flex-column">
                <span>{{ complain.heading.message }}</span>

                <span class="my-2 d-flex">
                    <v-tooltip v-if="slot_course">
                        <template #activator="{ props: _props }">
                            <v-chip v-bind="_props" @click="highlight(slot_course)">
                                {{ slot_course.course.code }}
                            </v-chip>
                        </template>
                        Highlight course in timetable
                    </v-tooltip>
                    <div class="ml-1"></div>
                    <v-tooltip v-if="related_slot_course">
                        <template #activator="{ props: _props }">
                            <v-chip v-bind="_props" @click="highlight(related_slot_course)">
                                {{ related_slot_course.course.code }}
                            </v-chip>
                        </template>
                        Highlight course in timetable
                    </v-tooltip>
                </span>
                <lazy-ui-is-authenticated user-type="admin">
                    <v-btn-group class="d-flex my-4 ml-auto" density="compact">
                        <v-btn color="teal">Resloved</v-btn>
                        <v-btn color="red">Delete</v-btn>
                    </v-btn-group>
                </lazy-ui-is-authenticated>
            </div>
        </v-list-item-subtitle>
    </v-list-item>
    <v-divider></v-divider>
</template>

<script setup lang="ts">
import type { SlotCourse, TableComlain } from "~/typing/timetable"

const props = defineProps<{
    complain: TableComlain
}>()
const {
    data: slot_course,
    pending: loadingSlotCourse,
    refresh,
} = useSlotCourseStore().load(props.complain.slot_course)
onMounted(() => {
    if (!slot_course.value) {
        refresh()
    }
})

const {
    data: related_slot_course,
    pending: loading_related_SlotCourse,
    refresh: reloadRelatedSlotCourse,
} = useSlotCourseStore().load(props.complain.related_slot_course ?? 0)
onMounted(() => {
    if (!slot_course.value) {
        refresh()
    }
})

function highlight(slot_course: SlotCourse) {
    useNavigation().setQuery(slot_course.course.code)
}
</script>
