<template>
    <v-container fluid class="pa-0 ma-0">
        <v-row align="center" justify="center" v-if="loadingTimetable">
            <v-col cols="auto">
                <v-progress-circular indeterminate></v-progress-circular>
            </v-col>
        </v-row>
        <div v-else-if="timetable != null">
            <v-row
                class="bg-primary my-0"
                style="top: 64px; position: sticky; z-index: 30"
                no-gutters
                v-if="!mobile"
            >
                <v-col v-if="!fullView" class="text-center border py-4" :cols="!fullView ? 2 : 12">
                    Days
                </v-col>
                <v-col :cols="!fullView ? 10 : 12">
                    <v-row no-gutters>
                        <v-col
                            class="text-center border py-4 flex align-center justify-center h-100"
                            v-for="h in timetable.slot_per_day"
                            :key="h"
                            >Slot {{ h }}
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <client-only>
                <lazy-timetables-timetable-day-view
                    :timetable="timetable"
                    :day="day"
                    :date="timetableDates[day - 1]"
                    v-for="day in timetable.days_count"
                    :key="day"
                    :full-view="fullView"
                ></lazy-timetables-timetable-day-view>
            </client-only>
        </div>

        <v-btn
            icon
            size="large"
            :color="hideNavigator ? 'primary' : 'error'"
            location="bottom right"
            position="fixed"
            class="ma-6 on-top"
            @click.native.stop="hideNavigator = !hideNavigator"
        >
            <v-icon v-if="hideNavigator"> mdi-menu</v-icon>
            <v-icon v-else> mdi-close</v-icon>
        </v-btn>
    </v-container>
    <lazy-global-shared-make-complain></lazy-global-shared-make-complain>
    <v-slide-x-transition>
        <lazy-timetables-view-navigation-bar
            v-if="timetable && !hideNavigator"
            :timetable="timetable"
        ></lazy-timetables-view-navigation-bar>
    </v-slide-x-transition>
</template>
<style scoped>
.on-top {
    z-index: 10000;
}
</style>
<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs"
import type { Timetable } from "~/types"

const route = useRoute()

const timetablePk = route.params["timetable_pk"] as string

const { data: timetable, pending: loadingTimetable } = useFetch<Timetable>(
    `/timetables/${timetablePk}`,
    {
        baseURL: useRuntimeConfig().public.baseURL,
        headers: useFetchHeader([]),
        transform(table) {
            return table
        },
    }
)

const { data: timetableDates, pending: loadingDates } = useFetch<string[]>(
    `/timetables/${timetablePk}/dates`,
    {
        baseURL: useRuntimeConfig().public.baseURL,
        headers: useFetchHeader([]),
        transform(table) {
            return table
        },
        default() {
            return []
        },
    }
)

provide(useTimetableView().currentTimetableInjectSymbol, timetable)

const fullView = ref(false)
const hideNavigator = ref(true)
const togglingFullView = ref(false)
const { setQuery, addActions, removeActions } = useNavigation()

let actions: symbol[] = []
onUnmounted(() => {
    removeActions(actions)
})
onMounted(() => {
    actions = addActions([
        {
            title: computed(() => {
                if (fullView.value) {
                    return "Minimal View"
                }
                return "Full View"
            }),
            loading: computed(() => togglingFullView.value),
            action() {
                togglingFullView.value = true
                setTimeout(() => {
                    fullView.value = !fullView.value
                    togglingFullView.value = false
                }, 1000)
            },
        },
        {
            title: "Export",
            icon: "mdi-file-excel",
            color: "yellow",
            action() {},
        },
    ])
    setQuery("")
})

const { mobile } = useDisplay()
</script>
