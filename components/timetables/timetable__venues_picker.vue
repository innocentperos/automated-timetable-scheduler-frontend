<!-- eslint-disable vue/no-template-shadow -->
<template>
    <v-container fluid>
        <v-row>
            <v-col lg="3" cols="12" color="primary">
                <v-card>
                    <v-card-text class="pa-0">
                        <v-list bg-color="primary">
                            <v-list-item>
                                <span class="text-uppercase">Categories</span>
                                <template #append>
                                    <v-tooltip location="top center">
                                        <span v-if="selectedCategories.length < categories.length"
                                            >Select all categories</span
                                        >
                                        <span v-else>unselect all categories</span>

                                        <template #activator="{ props }">
                                            <v-checkbox-btn
                                                v-bind="props"
                                                :model-value="
                                                    selectedCategories.length == categories.length
                                                "
                                                @update:model-value="
                                                    toggleSelectedCategories($event)
                                                "
                                            ></v-checkbox-btn>
                                        </template>
                                    </v-tooltip>
                                </template>
                            </v-list-item>
                            <v-divider></v-divider>
                            <div v-if="loadingCategoryies" class="d-flex flex-column">
                                <v-skeleton-loader
                                    color="primary"
                                    type="list-item"
                                    elevation="0"
                                    v-for="i in 3"
                                    :key="i"
                                ></v-skeleton-loader>
                            </div>
                            <v-list-item v-else v-for="category in categories" :key="category.pk">
                                {{ category.title }}
                                <template #append>
                                    <v-checkbox-btn
                                        :model-value="categoryIsSelected(category)"
                                        @update:model-value="selectCategory(category, $event)"
                                    ></v-checkbox-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="9">
                <div class="d-block mx-4 mt-4 mb-2">
                    Selected Venues {{ selectedVenues.length }}
                </div>
                <v-slide-x-transition group>
                    <v-chip class="ma-1" @click="removeAllVenues" color="error" variant="elevated">
                        <div class="d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                size="16"
                                width="2"
                                class="mr-2"
                                v-show="removinggMultipe"
                            ></v-progress-circular>
                            <span>Remove All Venue</span>
                        </div>
                    </v-chip>
                    <div
                        class="d-inline-block ma-1"
                        v-for="venue in selectedVenues"
                        :key="venue.pk"
                    >
                        <v-tooltip location="top center">
                            <div>
                                {{ venue.category.title }}, with a maximum capacity of
                                {{ venue.capacity }}
                            </div>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    color="primary"
                                    class="ma-1"
                                    variant="flat"
                                    @click="removeVenue(venue)"
                                    >{{ venue.title }} ({{ venue.code }}) - {{ venue.capacity }}
                                    <template #append>
                                        <v-progress-circular
                                            v-if="pendingStatus[venue.pk]"
                                            size="x-small"
                                            class="ml-2"
                                            indeterminate
                                        ></v-progress-circular>
                                        <v-icon
                                            v-else-if="timetable?.venues.includes(venue.pk)"
                                            class="ml-2"
                                            >mdi-check-all</v-icon
                                        >
                                    </template>
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>
                </v-slide-x-transition>

                <div class="d-block ma-4 mb-1">Venue Pool {{ availableVenuePool.length }}</div>
                <v-slide-x-transition group>
                    <v-chip class="ma-1" @click="addAllVenues" color="error" variant="elevated">
                        <div class="d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                size="16"
                                width="2"
                                class="mr-2"
                                v-show="addingMultipe"
                            ></v-progress-circular>
                            <span>Add All Venues</span>
                        </div>
                    </v-chip>
                    <div
                        class="d-inline-block ma-1"
                        v-for="venue in availableVenuePool"
                        :key="venue.pk"
                    >
                        <v-tooltip location="top center">
                            <div>
                                {{ venue.category.title }}, with a maximum capacity of
                                {{ venue.capacity }}
                            </div>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    class="ma-1"
                                    variant="flat"
                                    @click="addVenue(venue)"
                                    >{{ venue.title }} ({{ venue.code }}) - {{ venue.capacity }}
                                    <template #append>
                                        <v-progress-circular
                                            v-if="pendingStatus[venue.pk]"
                                            size="x-small"
                                            class="ml-2"
                                            indeterminate
                                        ></v-progress-circular>
                                    </template>
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>

                    <div class="d-block ma-1" key="add-course">
                        <v-tooltip location="top center">
                            <template #default>
                                <div>Add a new venue</div>
                            </template>
                            <template #activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    color="teal"
                                    class="ma-1"
                                    variant="flat"
                                    @click="addVenueModel = true"
                                    >new venue
                                    <template #append>
                                        <v-icon class="ml-2">mdi-plus</v-icon>
                                    </template>
                                </v-chip>

                                <v-dialog persistent max-width="560" v-model="addVenueModel">
                                    <dialogs-add-venue
                                        @add="onVenueAdded"
                                        @close="addVenueModel = false"
                                    ></dialogs-add-venue>
                                </v-dialog>
                            </template>
                        </v-tooltip>
                    </div>
                </v-slide-x-transition>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import type { FetchError, Venue, VenueCategory } from "~/types"

const configs = useRuntimeConfig()
const props = defineProps<{ tablePk: number }>()

const timetable = useTimetableStore().retrieve(props.tablePk)

const { data: categories, pending: loadingCategoryies } = useFetch<VenueCategory[]>(
    "/venues/categories/",
    {
        baseURL: configs.public.baseURL,
        headers: useFetchHeader([]),
        default() {
            return []
        },
    }
)
watch([categories], () => {
    if (categories.value.length > 0 && selectedCategories.value.length <= 0) {
        selectedCategories.value = categories.value.map((category) => category.pk)
    }
})
const selectedCategories = ref<number[]>([])
function selectCategory(category: VenueCategory, value: boolean) {
    if (value == false) {
        selectedCategories.value = selectedCategories.value.filter((pk) => pk != category.pk)
    } else {
        selectedCategories.value.push(category.pk)
    }
}
function categoryIsSelected(category: VenueCategory) {
    return selectedCategories.value.includes(category.pk)
}
function toggleSelectedCategories(value: boolean) {
    if (value) {
        selectedCategories.value = categories.value.map((category) => category.pk)
    } else {
        selectedCategories.value = []
    }
}

const { data: _venues } = useFetch<Venue[]>("/venues/", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    default() {
        return []
    },
})
const venues = computed(() => {
    if (selectedCategories.value.length == 0) {
        return _venues.value
    }

    return _venues.value.filter((venue) => {
        if (venue.category) {
            return selectedCategories.value.includes(venue.category.pk)
        }
        return false
    })
})
const selectedVenues = computed(() => {
    return _venues.value.filter((venue) => timetable.value?.venues.includes(venue.pk))
})
const availableVenuePool = computed(() => {
    if (!timetable) return venues.value
    return venues.value.filter((venue) => !timetable.value!.venues.includes(venue.pk))
})

const pendingStatus = ref<{ [pk: number]: boolean }>({})

async function removeVenue(venue: Venue) {
    try {
        pendingStatus.value[venue.pk] = true
        await $fetch(`/timetables/${timetable.value!.pk}/venues/`, {
            method: "DELETE",
            baseURL: configs.public.baseURL,
            headers: useFetchHeader([]),
            body: [venue.pk],
        })
        if (timetable.value) {
            timetable.value.venues = timetable.value.venues.filter((pk) => pk != venue.pk)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        pendingStatus.value[venue.pk] = false
    }
}

async function addVenue(venue: Venue) {
    try {
        pendingStatus.value[venue.pk] = true

        await $fetch(`/timetables/${timetable.value!.pk}/venues/`, {
            method: "POST",
            baseURL: configs.public.baseURL,
            headers: useFetchHeader([]),
            body: [venue.pk],
        })
        timetable.value!.venues.push(venue.pk)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error)

        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        pendingStatus.value[venue.pk] = false
    }
}

const addVenueModel = ref(false)
function onVenueAdded(venue: Venue) {
    _venues.value.push(venue)

    useNotification().add({
        text: `${venue.title} added to venues`,
        icon: "mdi-check-all",
        color: "teal",
        closable: true,
    })
}

const removinggMultipe = ref(false)
async function removeAllVenues() {
    const ids = selectedVenues.value.map((venue) => venue.pk)

    try {
        removinggMultipe.value = true
        await $fetch(`/timetables/${timetable.value?.pk}/venues/`, {
            method: "DELETE",
            baseURL: configs.public.baseURL,
            body: ids,
            headers: useFetchHeader([]),
        })

        if (timetable.value) {
            timetable.value.venues = timetable.value.venues.filter((id) => !ids.includes(id))
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        removinggMultipe.value = false
    }
}

const addingMultipe = ref(false)
async function addAllVenues() {
    const ids = availableVenuePool.value.map((venue) => venue.pk)

    try {
        addingMultipe.value = true
        await $fetch(`/timetables/${timetable.value?.pk}/venues/`, {
            method: "POST",
            baseURL: configs.public.baseURL,
            body: ids,
            headers: useFetchHeader([]),
        })

        if (timetable.value) {
            timetable.value.venues = [...timetable.value.venues, ...ids]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().add({
                text: "Oops, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: true,
            })
        } else {
            switch (_error.statusCode) {
                case 404:
                    useRouter().push("/time-tables")
                    break
                default:
                    useNotification().add({
                        text: "Oops, something went wrong on the server and try again.",
                        icon: "mdi-server-remove",
                        closable: true,
                    })
            }
        }
    } finally {
        addingMultipe.value = false
    }
}
</script>
