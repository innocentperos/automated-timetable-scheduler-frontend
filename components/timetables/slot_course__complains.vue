<template>
    <v-list-item class="py-2" @click="dialogModel = true" :disabled="loadingComplains">
        <template #title> Complains </template>
        <template #subtitle>
            {{ complains.length }} complain{{ complains.length > 1 ? "s" : "" }}</template
        >

        <template #append>
            <v-badge color="amber" :content="slotCourse.complain_count">
                <v-icon>mdi-message</v-icon>
            </v-badge>
        </template>
    </v-list-item>
    <v-dialog
        v-show="!loadingComplains"
        v-model="dialogModel"
        scrollable
        width="100%"
        height="100%"
    >
        <v-card>
            <v-card-title class="bg-amber py-4 d-flex align-center justify-space-between">
                <span>All Complains</span>
                <v-btn
                    :loading="loadingComplains"
                    icon="mdi-refresh"
                    @click="refreshComplains"
                ></v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text style="height: 100%" class="pa-0">
                <v-expansion-panels class="ma-0" variant="accordion">
                    <lazy-timetables-slot-course-complains-item
                        v-for="complain in complains"
                        :key="complain.pk"
                        :complain="complain"
                    ></lazy-timetables-slot-course-complains-item>
                </v-expansion-panels>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn color="blue darken-1" flat @click.native="dialogModel = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped></style>
<script setup lang="ts">
import type { SlotCourse } from "~/typing/timetable"

const props = defineProps<{
    slotCourse: SlotCourse
}>()

const {
    data: complains,
    pending: loadingComplains,
    refresh: refreshComplains,
} = useComplainStore().loadSlot(props.slotCourse.pk!)

const dialogModel = ref(false)
</script>
