<template>
    <v-container fluid>
        <v-row justify="center" no-gutters>
            <v-col cols="1">
                <v-dialog draggable v-model="addition.model" persistent max-width="500">
                    <dialogs-add-venue @add="onSave" @close="addition.model = false">
                    </dialogs-add-venue>
                </v-dialog>

                <v-dialog v-model="deletion.model" location="top center" persistent max-width="400">
                    <v-card>
                        <v-card-title class="headline"
                            >Delete {{ selections.venues.length }} Venues</v-card-title
                        >
                        <v-card-text
                            >Are you sure you want to delete the selected venues</v-card-text
                        >
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" flat @click.native="deletion.model = false"
                                >Cancel</v-btn
                            >
                            <v-btn
                                size="large"
                                color="red"
                                v-if="selections.venues.length > 0"
                                :loading="deletion.pending"
                                @click="onDelete"
                                >DELETE</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" lg="3">
                <v-card class="pa-4" color="teal" density="compact">
                    <div class="d-flex flex-column align-center justify-center h-100">
                        <div class="d-flex justify-space-between align-center w-100">
                            <span class="text-h6 text-uppercase mr-auto">Venues Categories</span>

                            <v-tooltip text="Create a new venue category" right>
                                <template #activator="{ props }">
                                    <v-btn
                                        icon="mdi-plus"
                                        variant="text"
                                        color="white"
                                        v-bind="props"
                                    ></v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                        <v-progress-circular
                            :value="20"
                            indeterminate
                            color="primary"
                            class="my-auto"
                            v-if="pendingCategories"
                        ></v-progress-circular>
                        <v-list v-else class="mb-auto w-100 transparent" bg-color="transparent">
                            <v-list-item
                                v-for="category in categories"
                                :key="category.pk"
                                :value="category.pk"
                                color="trn"
                                class="transparent"
                                nav
                                :title="category.title"
                                :subtitle="`${category.venue_count} Venues`"
                            >
                                <!-- <v-list-item-title>{{ category.title }}</v-list-item-title> -->
                                <template #append>
                                    <v-checkbox
                                        hide-details
                                        indeterminate
                                        color="white"
                                        v-model="selections.categories"
                                        :value="category.pk"
                                    ></v-checkbox>
                                </template>
                            </v-list-item>
                        </v-list>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" lg="9">
                <v-data-table
                    :headers="HEADERS"
                    :items="filteredVenues"
                    :loading="pendingDepartments"
                    show-select
                    v-model="selections.venues"
                    item-value="pk"
                >
                    <template #top>
                        <v-row justify="center">
                            <v-col><span class="text-h5 text-uppercase">Venues</span></v-col>
                            <v-spacer></v-spacer>
                        </v-row>
                    </template>

                    <template #item.departments="{ value }">
                        <v-chip
                            v-for="department in value"
                            :key="department.pk"
                            class="ml-1"
                            color="teal"
                        >
                            {{ department.code }}
                        </v-chip>
                    </template>

                    <template #loading>
                        <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import type { Venue, VenueCategory } from "~/types"

const HEADERS = [
    { title: "Title", key: "title", value: "title" },
    { title: "Code", key: "code", value: "code" },
    {
        title: "Capacity",
        key: "capacity",
        value: "capacity",
    },
    {
        title: "category",
        key: "category.pk",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (category: any) => (category as Venue).category.title,
    },
]

const configs = useRuntimeConfig()
const { addAction, removeActions } = useNavigation()

const selections = ref<{ venues: Array<number>; categories: Array<number> }>({
    venues: [],
    categories: [],
})

const deletion = ref({
    model: false,
    pending: false,
})
const addition = ref({
    model: false,
})

const headerActions: symbol[] = []
onMounted(() => {
    headerActions.push(
        addAction({
            title: "New Venue",
            description: "Add a new venue to the list of venues",
            icon: "mdi-plus",
            color: "primary",
            action() {
                addition.value.model = true
            },
        })
    )

    headerActions.push(
        addAction({
            title: "delete",
            description: computed(
                () => `delete the ${selections.value.venues.length} selected venues`
            ),
            icon: "mdi-delete",
            color: "error",
            hidden: computed(() => selections.value.venues.length < 1),
            loading: computed(() => deletion.value.model),
            action() {
                deletion.value.model = true
            },
        })
    )
})
onUnmounted(() => {
    removeActions(headerActions)
})

const filteredVenues = computed(() => {
    if (selections.value.categories.length == 0) {
        return venues.value
    }
    return venues.value.filter((venue) => selections.value.categories.includes(venue.category.pk))
})
const { data: venues, pending: pendingDepartments } = useFetch<Array<Venue>>("/venues/", {
    baseURL: configs.public.baseURL,
    default() {
        return []
    },
})

const { data: categories, pending: pendingCategories } = useFetch<Array<VenueCategory>>(
    "/venues/categories/",
    {
        baseURL: configs.public.baseURL,
        default() {
            return []
        },
    }
)

function onSave(venue: Venue) {
    venues.value.push(venue)
    addition.value.model = false
    useNotification().add({
        title: "Venue added",
        text: `${venue.title} was added to venues`,
        icon: "mdi-plus",
        color: "teal",
        action(closeCallback) {
            closeCallback()
        },
    })
}

async function onDelete() {
    if (selections.value.venues.length < 1) return

    try {
        deletion.value.pending = true
        await $fetch("/venues/multiple_delete/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            body: selections.value.venues,
        })

        venues.value = venues.value.filter((department) => {
            return !selections.value.venues.includes(department.pk)
        })
        useNotification().add({
            text: `Successfully deleted ${selections.value.venues.length} venues`,
            icon: "mdi-delete",
            color: "teal",
            action: (event) => event(),
        })
        selections.value.venues = []
    } catch (error) {
        console.log({ error })
    } finally {
        deletion.value = {
            pending: false,
            model: false,
        }
    }
}
</script>
