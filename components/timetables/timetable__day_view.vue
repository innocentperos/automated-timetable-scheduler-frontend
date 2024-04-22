<template>
    <v-row class="my-0" no-gutters>
        <v-col
            class="border d-block pa-2 flex-column d-flex align-center justify-center"
            :class="{ sticky: true }"
            :lg="!fullView ? 2 : 12"
            :sm="12"
        >
            <!-- <v-btn  v-if="!fullView && !mobile" icon="mdi-arrow-up"> </v-btn> -->
            <div class="d-flex justify-space-between">
                <div class="d-flex flex-column justify-center justify-center">
                    <span class="pa-2 text-center">Day {{ props.day }}</span>
                    <span>{{ date.toString().split("-").reverse().join("/") }}</span>
                </div>
                <v-progress-circular indeterminate v-show="loadingSlots"></v-progress-circular>
            </div>
            <v-chip color="red" class="ma-1" v-show="errorLoadingSlots">
                <v-avatar>
                    <v-icon>mdi-network-off</v-icon>
                </v-avatar>
                Error
            </v-chip>
            <!-- <v-btn v-if="!fullView && !mobile" icon="mdi-arrow-down"> </v-btn> -->
        </v-col>
        <v-col :lg="!fullView ? 10 : 12" :cols="12">
            <v-row no-gutters justify="space-evenly" align="stretch" class="h-100">
                <v-col
                    class="border pa-1 flex-1"
                    v-for="slot in timetable.slot_per_day"
                    :key="slot"
                >
                    <TimetablesTimetableSlotView
                        :timetable="timetable"
                        :day-slot="getSlot(slot - 1)"
                        :full-view="fullView"
                        :pending="loadingSlots"
                    ></TimetablesTimetableSlotView>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Timetable } from "~/types"
import type { TimetableSlot } from "~/typing/timetable"

const props = defineProps<{
    timetable: Timetable
    day: string | number
    fullView: boolean
    date: string | Date
}>()

const {
    data: slots,
    pending: loadingSlots,
    error: errorLoadingSlots,
    refresh,
} = useFetch<TimetableSlot[]>(`/timetables/${props.timetable.pk}/day_slots/?day=${props.day}`, {
    baseURL: useRuntimeConfig().public.baseURL,
    headers: useFetchHeader([]),
    retry: 5,
    retryDelay: 1000,
    cache: "default",
    default() {
        return []
    },
})

provide("refres-day-slots", refresh)

function getSlot(index: number) {
    if (slots.value.length < index) {
        return undefined
    }
    return slots.value[index]
}
</script>
