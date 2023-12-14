<template>
    <v-container fluid>
        <v-row v-if="timetable && !pendingTable" align="center">
            <v-col cols="auto" class="px-4 d-inline-block">
                <span class="text-subtitle-1">{{ timetable.title }}</span>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
                <v-tabs v-model="currentTab" color="primary" align-tabs="center">
                    <v-tab :value="0">
                        <v-slide-x-transition>
                            <v-icon v-show="currentTab == 0">mdi-comment-processing-outline</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2">Configurations</span>
                    </v-tab>
                    <v-tab :value="1">
                        <v-slide-x-transition>
                            <v-icon v-show="currentTab == 1">mdi-account-group</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2"
                            >Staffs
                            <v-chip class="ml-2">{{ timetable.staffs.length }}</v-chip></span
                        >
                    </v-tab>
                    <v-tab :value="2">
                        <v-slide-x-transition>
                            <v-icon v-show="currentTab == 2">mdi-book-multiple</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2"
                            >Courses
                            <v-chip class="ml-2">{{ timetable.courses.length }}</v-chip></span
                        >
                    </v-tab>
                    <v-tab :value="3">
                        <v-slide-x-transition>
                            <v-icon v-show="currentTab == 3">mdi-home-group</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2"
                            >Venues
                            <v-chip class="ml-2">{{ timetable.venues.length }}</v-chip></span
                        >
                    </v-tab>
                </v-tabs>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
        <v-row v-if="timetable && !pendingTable">
            <v-col cols="12">
                <v-window v-model="currentTab">
                    <v-window-item :value="1">
                        <LazyTimetablesTimetableStaffsPicker :table-pk="timetable.pk">
                        </LazyTimetablesTimetableStaffsPicker>
                    </v-window-item>
                    <v-window-item :value="2">
                        <LazyTimetablesTimetableCoursesPicker
                            :table-pk="timetable.pk"
                        ></LazyTimetablesTimetableCoursesPicker>
                    </v-window-item>
                    <v-window-item :value="3">
                        <LazyTimetablesTimetableVenuesPicker
                            :table-pk="timetable.pk"
                        ></LazyTimetablesTimetableVenuesPicker>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>
        <v-row v-else-if="pendingTable" justify="center">
            <v-col cols="auto">
                <v-progress-circular indeterminate></v-progress-circular>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import type { Timetable } from "~/types"
definePageMeta({
    validate: async (route) => {
        // Check if the id is made up of digits
        return /^\d+$/.test(route.params.timetable_pk as unknown as string)
    },
})

const configs = useRuntimeConfig()
const { add: addNotification } = useNotification()
const route = useRoute()

const timetableStore = useTimetableStore()
const currentTab = ref(2)

const {
    data: timetable,
    pending: pendingTable,
    error,
    refresh,
} = useFetch<Timetable>(`/timetables/${route.params.timetable_pk}`, {
    retry: 5,
    retryDelay: 300,
    baseURL: configs.public.baseURL,
    server: false,
    lazy: true,
})

watch(timetable, () => {
    console.log({
        title: "Got table",
        table: timetable.value,
    })

    if (timetable.value) {
        timetableStore.insert(timetable.value)
    }
})

watch(error, () => {
    if (error.value) {
        addNotification({
            text: "Could not get the time able",
            action(closeCallback) {
                refresh()
                closeCallback()
            },
        })
    }
})
</script>
