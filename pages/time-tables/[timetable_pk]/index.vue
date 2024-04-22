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
                            <v-icon>mdi-cog</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2">Configurations</span>
                    </v-tab>
                    <v-tab :value="1">
                        <v-slide-x-transition>
                            <v-icon>mdi-account-group</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2"
                            >Staffs
                            <v-chip class="ml-2">{{ timetable.staffs.length }}</v-chip></span
                        >
                    </v-tab>
                    <v-tab :value="2">
                        <v-slide-x-transition>
                            <v-icon>mdi-book-multiple</v-icon>
                        </v-slide-x-transition>
                        <span class="d-inline-block mx-2"
                            >Courses
                            <v-chip class="ml-2">{{ timetable.courses.length }}</v-chip></span
                        >
                    </v-tab>
                    <v-tab :value="3">
                        <v-slide-x-transition>
                            <v-icon>mdi-home-group</v-icon>
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
                    <v-window-item :value="0">
                        <LazyTimetablesTimetableConfiguration
                            :timetable-pk="timetable.pk"
                        ></LazyTimetablesTimetableConfiguration>
                    </v-window-item>
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

const route = useRoute()

onBeforeMount(() => {
    if (!useUser().isAdmin.value) {
        useRouter().replace({
            name: "time-tables-timetable_pk-view",
            params: {
                timetable_pk: route.params.timetable_pk,
            },
        })
    }
})

const configs = useRuntimeConfig()
const { add: addNotification } = useNotification()

const timetableStore = useTimetableStore()
const currentTab = ref(0)

const {
    data: _timetable,
    pending: pendingTable,
    error,
    refresh,
} = useFetch<ComputedRef<Timetable>>(`/timetables/${route.params.timetable_pk}`, {
    retry: 5,
    retryDelay: 300,
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    server: false,
    lazy: true,
    transform: function (response: unknown) {
        const timetable: Timetable = {
            ...(response as Timetable),
            start_date: new Date((response as Timetable).start_date),
            end_date: new Date((response as Timetable).end_date),
            excluded_days: (response as Timetable).excluded_days.map((date) => new Date(date)),
        }

        timetableStore.insert(timetable)
        return timetableStore.retrieve(timetable.pk) as unknown as ComputedRef<Timetable>
    },
})
const timetable = computed(() => _timetable.value?.value)
const mountedConplete = ref(false)
watch(timetable, () => {
    if (timetable.value && !mountedConplete.value) {
        timetableStore.insert(timetable.value)
        mountedConplete.value = true
        useNavigation().addAction({
            title: "View Table",
            icon: "mdi-calendar",
            action() {
                useRouter().push(`/time-tables/${timetable.value?.pk}/view`)
            },
        })

        useNavigation().setTitle(timetable.value.title)
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
