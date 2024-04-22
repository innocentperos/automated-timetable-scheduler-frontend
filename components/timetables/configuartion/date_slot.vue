<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-title>
                <template #default="{ expanded }">
                    <v-row align="center">
                        <v-col cols="auto">
                            <v-responsive :aspect-ratio="1 / 1">
                                <v-icon :color="expanded ? 'primary' : undefined"
                                    >mdi-slot-machine</v-icon
                                >
                            </v-responsive>
                        </v-col>
                        <v-col cols="4" class="d-flex flex-column justify-start">
                            <span class="text-button">Slots per day and Weekdays</span>
                            <v-fade-transition leave-absolute>
                                <span v-if="!expanded" class="text-grey text-subtitle-2"
                                    >Click to reveal settings</span
                                >
                                <span v-else class="text-primary text-subtitle-2"
                                    >Click to hide section's settings</span
                                >
                            </v-fade-transition>
                        </v-col>
                        <v-col cols="auto" class="text-grey text-button">
                            <v-fade-transition leave-absolute>
                                <span v-if="expanded" key="0">
                                    Select slots per day and weekdays to exclude
                                </span>
                                <span v-else key="1">
                                    {{ slotsPerDay }} Slots per day, Exclude
                                    {{
                                        excludedWeekdays.map((i) => WEEKDAYS[i].short).join(", ")
                                    }}</span
                                >
                            </v-fade-transition>
                        </v-col>
                    </v-row>
                </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-row>
                    <v-col class="pa-8">
                        <span class="text-h6 text-button">Slot per day</span>
                        <span class="d-block"
                            >Use the slider below to select how many slot is in a day
                        </span>
                        <v-slider
                            density="compact"
                            max="8"
                            :min="1"
                            :step="1"
                            color="primary"
                            :show-ticks="true"
                            :hint="'Hint'"
                            :ticks="[1, 2, 3, 4, 5, 6, 7, 8]"
                            class="mt-8"
                            v-model="slotsPerDay"
                        ></v-slider>
                    </v-col>
                    <v-divider></v-divider>
                    <v-col :cols="12" class="pa-8 pt-2">
                        <span class="text-h6 text-button">Exclude</span>
                        <span class="d-block mb-8"
                            >Select week days that examinations will not take place on (example on
                            sundays)
                        </span>

                        <v-row no-gutters class="relative">
                            <v-col cols="3" v-for="day in WEEKDAYS" :key="day.value"
                                ><v-checkbox
                                    :value="day.value"
                                    v-model="excludedWeekdays"
                                    :label="day.title"
                                    color="red"
                                    base-color="teal"
                                    true-icon="mdi-close"
                                    false-icon="mdi-check"
                                    :hint="`Exclude ${day.title} from timetable days`"
                                ></v-checkbox
                            ></v-col>
                            <div
                                v-if="loadingDate"
                                class="absolute center h-100 w-100 d-flex align-center justify-center opacity-70 rounded-md"
                            >
                                <v-progress-circular indeterminate></v-progress-circular>
                            </div>
                        </v-row>
                    </v-col>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-title>
                <template #default="{ expanded }">
                    <v-row align="center">
                        <v-col cols="auto">
                            <v-responsive :aspect-ratio="1 / 1">
                                <v-icon :color="expanded ? 'primary' : undefined"
                                    >mdi-calendar</v-icon
                                >
                            </v-responsive>
                        </v-col>
                        <v-col cols="4" class="d-flex flex-column justify-start text-button">
                            <span class="text-button">Starting and Ending Date</span>
                            <v-fade-transition leave-absolute>
                                <span v-if="!expanded" class="text-grey text-subtitle-2"
                                    >Click to reveal settings</span
                                >
                                <span v-else class="text-primary text-subtitle-2"
                                    >Click to hide section's settings</span
                                >
                            </v-fade-transition>
                        </v-col>

                        <v-col cols="auto" class="text-grey text-button">
                            <v-fade-transition leave-absolute>
                                <span v-if="expanded" key="0">
                                    Select slots per day and weekdays to exclude
                                </span>
                                <span v-else key="1">
                                    from {{ parseDate(startDate) }} to {{ parseDate(endDate) }}
                                </span>
                            </v-fade-transition>
                        </v-col>
                    </v-row>
                </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-row>
                    <v-col cols="12" class="pa-8">
                        <span class="text-h6 text-button"
                            >Examination Starting and Ending Date</span
                        >
                        <span class="d-block"
                            >Select The first day of the examinations and last day of the
                            examination using the two calender below
                        </span>
                    </v-col>
                    <v-col :cols="12" :lg="6">
                        <v-date-picker
                            title="Select Start Date"
                            :landscape="true"
                            :reactive="true"
                            :show-week="true"
                            :show-adjacent-months="true"
                            v-model="startDate"
                            min-width="100%"
                            :allowed-dates="(date: Date) => excludeCalendarDay(date, 0)"
                        ></v-date-picker>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col :cols="12" :lg="6">
                        <v-date-picker
                            title="Select End Date"
                            :landscape="true"
                            :reactive="true"
                            :show-week="true"
                            :show-adjacent-months="true"
                            v-model="endDate"
                            min-width="100%"
                            :allowed-dates="(date: Date) => excludeCalendarDay(date, 1)"
                        ></v-date-picker>
                    </v-col>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-title>
                <template #default="{ expanded }">
                    <v-row align="center">
                        <v-col cols="auto">
                            <v-responsive :aspect-ratio="1 / 1">
                                <v-icon :color="expanded ? 'primary' : undefined"
                                    >mdi-close-box-multiple</v-icon
                                >
                            </v-responsive>
                        </v-col>
                        <v-col cols="4" class="d-flex flex-column justify-start text-button">
                            <span class="text-button">Specific dates to exclude</span>
                            <v-fade-transition leave-absolute>
                                <span v-if="!expanded" class="text-grey text-subtitle-2"
                                    >Click to reveal settings</span
                                >
                                <span v-else class="text-primary text-subtitle-2"
                                    >Click to hide section's settings</span
                                >
                            </v-fade-transition>
                        </v-col>
                        <v-col cols="auto" class="text-grey text-button">
                            <v-fade-transition leave-absolute>
                                <span v-if="expanded" key="0">
                                    Select specific days to exclude
                                </span>
                                <span v-else key="1">
                                    {{ excludedDays.length }} Days excluded
                                </span>
                            </v-fade-transition>
                        </v-col>
                    </v-row>
                </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-row>
                    <v-col :cols="12" :lg="7" class="px-8 pt-6">
                        <span class="text-h6">Select days to exclude</span>
                        <span class="d-block text-subtitle-2"
                            >Select dates from the calendar below, that examinations will not be
                            fixed on those days</span
                        >

                        <v-col :cols="12" class="">
                            <v-date-picker
                                title="Exclude Days"
                                min-width="100%"
                                color="red"
                                :landscape="true"
                                :multiple="true"
                                :reactive="true"
                                :show-week="true"
                                :show-adjacent-months="true"
                                v-model="excludedDays"
                                :allowed-dates="(date: Date) => excludeCalendarDay(date, 2)"
                            ></v-date-picker>
                        </v-col>
                    </v-col>

                    <v-divider vertical></v-divider>
                    <v-col :cols="12" :lg="5">
                        <v-list>
                            <v-list-item>
                                <span class="text-button">Excluded dates</span>
                                <span class="d-block text-subtitle-2">
                                    List of specific days examination will not be taking place on
                                </span>
                            </v-list-item>
                            <v-slide-y-reverse-transition group>
                                <div v-for="(date, index) in excludedDays" :key="date.toString()">
                                    <v-divider v-if="index > 0"></v-divider>
                                    <v-list-item class="py-4">
                                        {{ parseDate(date) }}
                                        <template #append>
                                            <v-tooltip bottom>
                                                Remove date
                                                <template #activator="{ props: props }">
                                                    <v-icon v-bind="props" @click="removeDate(date)"
                                                        >mdi-close</v-icon
                                                    >
                                                </template>
                                            </v-tooltip>
                                        </template>
                                    </v-list-item>
                                </div>
                            </v-slide-y-reverse-transition>
                            <v-list-item> </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
    <div class="pa-8">
        <v-row>
            <v-col :cols="12" :lg="4" class="d-flex flex-column">
                <span class="text-button">Examination days</span>

                <span class="text-h3"> {{ config.allowed }} Days </span>
                <span
                    >The number of days the examination will occupy within the selected start and
                    end date
                </span>
            </v-col>

            <v-col :cols="12" :lg="4" class="d-flex flex-column">
                <span class="text-button">Excluded days</span>
                <span class="text-h3"> {{ config.excluded }} Days </span>
                <span
                    >The number of days the examination will skip from the selected start and end
                    date
                </span>
            </v-col>
            <v-col :cols="12" :lg="4" class="d-flex flex-column">
                <span class="text-button">Total Slots</span>
                <span class="text-h3"> {{ config.allowed * slotsPerDay }} Slots </span>
            </v-col>
        </v-row>
        <v-row class="mt-8">
            <v-spacer></v-spacer>
            <v-col cols="12" :lg="4" class="pl-4 pt-auto d-flex flex-column">
                <div class="mt-auto flex"></div>
                <v-btn
                    color="red"
                    size="large"
                    block
                    prepend-icon="mdi-delete"
                    class="ml-auto mb-4"
                    :disabled="saving"
                    >Discard</v-btn
                >
                <v-btn
                    color="primary"
                    size="large"
                    block
                    prepend-icon="mdi-content-save"
                    @click="saveConfiguration"
                    :loading="saving"
                    >Save</v-btn
                >
            </v-col>
        </v-row>
    </div>
</template>
<style scoped>
.flex {
    height: 100%;
}
.relative {
    position: relative;
}
.absolute {
    position: absolute;
}
.center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
.opacity-70 {
    background-color: rgb(36, 36, 36);
    opacity: 0.7;
}
.rounded-md {
    border-radius: 16px;
}
</style>
<script setup lang="ts">
import {
    WEEKDAYS,
    parseDate,
    parseTimetableDays,
    type Timetable,
    type FetchError,
    parseToServerDate,
} from "~/types"

const mainProps = defineProps<{ timetablePk: number }>()
const timetableStore = useTimetableStore()

const timetable = timetableStore.retrieve(
    mainProps.timetablePk
) as unknown as ComputedRef<Timetable>

const slotsPerDay = ref(timetable.value.slot_per_day)
const startDate = ref<Date>(timetable.value.start_date)
const endDate = ref<Date>(timetable.value.end_date)
const excludedWeekdays = ref<number[]>(timetable.value.excluded_week_days)
const excludedDays = ref<Date[]>(timetable.value.excluded_days)

const loadingDate = ref(false)
let timer: string | number | NodeJS.Timeout | undefined

onMounted(() => {
    useNavigationDrawer().hide()
})
function excludeCalendarDay(date: Date, index: number) {
    loadingDate.value = true

    if (timer) {
        clearTimeout(timer)
    }
    timer = setTimeout(() => {
        loadingDate.value = false
    }, 500)
    const weekDay = date.getDay()

    if (excludedWeekdays.value.includes(weekDay)) {
        return false
    }

    const excludebeginning = date.getTime() < startDate.value.getTime()
    if ([1, 2].includes(index) && excludebeginning) {
        // For end Date
        return false
    }

    const excludeEnding = date.getTime() > endDate.value.getTime()
    if ([0, 2].includes(index) && excludeEnding) {
        return false
    }

    return true
}

function removeDate(date: Date) {
    excludedDays.value = excludedDays.value.filter((e) => e != date)
}

const config = computed(() => {
    return parseTimetableDays(
        startDate.value,
        endDate.value,
        excludedWeekdays.value,
        excludedDays.value
    )
})

const runtimeConfig = useRuntimeConfig().public
const saving = ref(false)
async function saveConfiguration() {
    try {
        saving.value = true
        const response = await $fetch<Timetable>(
            `/timetables/${mainProps.timetablePk}/configuration/`,
            {
                baseURL: runtimeConfig.baseURL,
                method: "POST",
                headers: useFetchHeader([]),
                body: {
                    slot_per_day: slotsPerDay.value,
                    start_date: parseToServerDate(startDate.value),
                    end_date: parseToServerDate(endDate.value),
                    excluded_days: excludedDays.value.map((date) => parseToServerDate(date)),
                    excluded_week_days: excludedWeekdays.value,
                },
            }
        )
        timetableStore.insert(response)
        useNotification().add({
            title: "Saved",
            text: "Configuration as saved successfully",
            icon: "mdi-check",
            color: "teal",
            closable: true,
            duration: 10000,
        })
    } catch (_error) {
        const error = _error as unknown as FetchError<string>

        if (!error.status) {
            useNotification().add({
                title: "Oops",
                text: "Could not connect to our server, please make sure you have a stable internet connection and type again",
                icon: "mdi-network-off",
                color: "red",
                closable: true,
                duration: 10000,
            })

            return
        } else {
            switch (error.status) {
                case 400:
                    useNotification().add({
                        title: "Missing fields",
                        text: "Make sure you provided the start and end date, and week days to exclude from the examination days",
                        icon: "mdi-form-textbox",
                        color: "red",
                        closable: true,
                        duration: 10000,
                    })
                    break
                case 404:
                    useNotification().add({
                        title: "Timetable deleted",
                        text: "Could not find this timetable, it may have been deleted",
                        icon: "mdi-delete-empty",
                        color: "red",
                        closable: true,
                        duration: 10000,
                    })
                    break
                default:
                    useNotification().add({
                        title: "Oops",
                        text: "Something went wrong on our server, please try again later",
                        icon: "mdi-alert-circle-outline",
                        color: "red",
                        closable: true,
                        duration: 10000,
                    })
            }
        }
    } finally {
        saving.value = false
    }
}
</script>
