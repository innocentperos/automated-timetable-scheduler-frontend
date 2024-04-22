<template>
    <v-tooltip class="text-primary" key="course-tip">
        {{ slotCourse.course.title }}
        <template #activator="{ props: chipProps }">
            <v-chip v-bind="chipProps" :color="color">
                {{ slotCourse.course.code }}
                <template #prepend>
                    <v-progress-circular
                        indeterminate
                        :color="color"
                        :size="22"
                        class="mr-2"
                        v-show="processing"
                    ></v-progress-circular>
                </template>
                <template #append>
                    <v-badge v-if="slotCourse.complain_count > 0" class="ml-2" dot>
                        <v-icon>mdi-message</v-icon>
                    </v-badge>
                </template>
            </v-chip>
        </template>
    </v-tooltip>
</template>

<script setup lang="ts">
import type { SlotCourse } from "~/typing/timetable"

defineProps<{
    slotCourse: SlotCourse
    processing: boolean
    color?: string
}>()
</script>
