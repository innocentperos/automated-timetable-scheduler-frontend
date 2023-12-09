<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" lg="3">
                <v-card height="100%" class="pa-4">
                    <div class="d-flex flex-column align-center justify-center h-100">
                        <div class="d-flex justify-space-between align-center w-100">
                            <span class="text-h6 text-uppercase mr-auto">Venues Categories</span>

                            <v-tooltip text="Create a new venue category" right>
                                <template #activator="{ props }">
                                    <v-btn
                                        icon="mdi-plus"
                                        variant="text"
                                        color="primary"
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
                        <v-list v-else color="primary" variant="outlined" class="mb-auto w-100">
                            <v-list-item
                                v-for="category in categories"
                                :key="category.pk"
                                :value="category.pk"
                                color="primary"
                                nav
                                :title="category.title"
                                :subtitle="`${category.venue_count} Venues`"
                            >
                                <!-- <v-list-item-title>{{ category.title }}</v-list-item-title> -->
                                <template #append>
                                    <v-checkbox
                                        hide-details
                                        indeterminate
                                        color="primary"
                                        v-model="_selectedCategories"
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
                    :items="_venues"
                    :loading="pendingDepartments"
                    show-select
                    v-model="selectedVenues"
                    item-value="pk"
                >
                    <template #top>
                        <v-row justify="center">
                            <v-col><span class="text-h5 text-uppercase">Venues</span></v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="auto"
                                ><v-dialog v-model="addVenueModel" persistent max-width="500">
                                    <template #activator="{ props }">
                                        <v-btn color="primary" dark v-bind="props">
                                            Add Venue
                                        </v-btn>
                                    </template>

                                    <dialogs-add-venue @add="onSave" @close="addVenueModel = false">
                                    </dialogs-add-venue> </v-dialog
                            ></v-col>
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
        <v-row>
            <v-col cols="auto">
                <v-layout row justify-center>
                    <v-dialog v-model="deleteModel" persistent max-width="400">
                        <template #activator="{ props }">
                            <v-btn
                                size="large"
                                color="red"
                                v-bind="props"
                                v-if="selectedVenues.length > 0"
                                >DELETE</v-btn
                            >
                        </template>
                        <v-card>
                            <v-card-title class="headline"
                                >Delete {{ selectedVenues.length }} Venues</v-card-title
                            >
                            <v-card-text
                                >Are you sure you want to delete the selected venues</v-card-text
                            >
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" flat @click.native="deleteModel = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    size="large"
                                    color="red"
                                    v-if="selectedVenues.length > 0"
                                    :loading="deleting"
                                    @click="onDelete"
                                    >DELETE</v-btn
                                >
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-layout>
            </v-col>
            <v-spacer></v-spacer>
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
const addVenueModel = ref(false)

const selectedVenues = ref<Array<number>>([])

const _selectedCategories = ref<number[]>([])
const _venues = computed(() => {
    if (_selectedCategories.value.length == 0) {
        return venues.value
    }
    return venues.value.filter((venue) => _selectedCategories.value.includes(venue.category.pk))
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
    addVenueModel.value = false
    useNotification().add({
        title: "Venue added",
        text: `${venue.title} was added to venues`,
        icon: "mdi-plus",
        action(closeCallback) {
            closeCallback()
        },
    })
}

const deleteModel = ref(false)
const deleting = ref(false)

async function onDelete() {
    if (selectedVenues.value.length < 1) return

    try {
        deleting.value = true
        await $fetch("/venues/multiple_delete/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            body: selectedVenues.value,
        })

        venues.value = venues.value.filter((department) => {
            return !selectedVenues.value.includes(department.pk)
        })
        useNotification().add({
            text: `Successfully deleted ${selectedVenues.value.length} venues`,
            icon: "mdi-delete",
            color: "teal",
            action: (event) => event(),
        })
        selectedVenues.value = []
    } catch (error) {
        console.log({ error })
    } finally {
        deleting.value = false
        deleteModel.value = false
    }
}
</script>
