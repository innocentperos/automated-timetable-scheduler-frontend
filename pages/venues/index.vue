<template>
    <v-container fluid>
        <v-dialog draggable v-model="addition.model" persistent max-width="500">
            <dialogs-add-venue @add="onSave" @close="addition.model = false"> </dialogs-add-venue>
        </v-dialog>

        <v-dialog v-model="deletion.model" location="top center" persistent max-width="400">
            <v-card>
                <v-card-title class="headline"
                    >Delete {{ selections.venues.length }} Venues</v-card-title
                >
                <v-card-text>Are you sure you want to delete the selected venues</v-card-text>
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

        <v-dialog v-model="addition.category" location="top center" persistent max-width="400">
            <lazy-dialogs-add-venue-category
                @close="addition.category = false"
                @add="onCategoryAdd"
            ></lazy-dialogs-add-venue-category>
        </v-dialog>
        <v-row>
            <v-col cols="12" lg="3">
                <v-card class="py-4" color="teal" density="compact" :max-height="height">
                    <v-card-title>
                        <div class="d-flex justify-space-between align-center w-100">
                            <span class="text-h6 text-uppercase mr-auto">Venues Categories</span>

                            <lazy-ui-is-authenticated user-type="admin">
                                <v-tooltip text="Create a new venue category" right>
                                    <template #activator="{ props }">
                                        <v-btn
                                            icon="mdi-plus"
                                            variant="text"
                                            color="white"
                                            v-bind="props"
                                            @click="addition.category = true"
                                        ></v-btn>
                                    </template>
                                </v-tooltip>
                            </lazy-ui-is-authenticated>
                        </div>
                    </v-card-title>
                    <v-card-text class="px-0">
                        <div class="h-100 overflow">
                            <v-list
                                class="w-100 transparent mx-0 px-0"
                                :max-height="height - 100"
                                bg-color="transparent"
                            >
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
                                    <template #prepend>
                                        <v-dialog
                                            :overlay="false"
                                            max-width="600px"
                                            transition="dialog-transition"
                                        >
                                            <template #activator="{ props: _props }">
                                                <v-btn
                                                    icon="mdi-delete"
                                                    size="small"
                                                    variant="text"
                                                    class="mr-2"
                                                    v-bind="_props"
                                                ></v-btn>
                                            </template>

                                            <v-card>
                                                <v-card-title primary-title>
                                                    Are you sure?
                                                </v-card-title>
                                                <v-card-text>
                                                    Delete the category {{ category.title }}
                                                    <div class="">
                                                        <v-checkbox
                                                            class="w-100"
                                                            label="Delete all venues under category"
                                                            hide-details
                                                            v-model="deleteWithVenues"
                                                        >
                                                        </v-checkbox>
                                                    </div>
                                                </v-card-text>
                                                <v-card-actions
                                                    class="px-4 d-flex justify-space-between"
                                                >
                                                    <v-btn
                                                        @click="onDeleteCategory(category)"
                                                        color="error"
                                                        variant="elevated"
                                                    >
                                                        Yes Delete
                                                    </v-btn>
                                                    <span>
                                                        <v-icon>mdi-information</v-icon> click
                                                        outside to close</span
                                                    >
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                    </template>
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
                        <div class="">
                            <v-progress-circular
                                :value="20"
                                indeterminate
                                color="primary"
                                class="my-auto"
                                v-if="pendingCategories"
                            ></v-progress-circular>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="9">
                <v-data-table
                    :headers="HEADERS"
                    :items="filteredVenues"
                    :loading="pendingDepartments"
                    :show-select="authService.isAdmin.value"
                    v-model="selections.venues"
                    item-value="pk"
                    :height="height - 120"
                    fixed-header
                >
                    <template #top>
                        <v-row justify="center" class="pa-4">
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
import { useDisplay } from "vuetify/lib/framework.mjs"
import type { FetchError, Venue, VenueCategory } from "~/types"

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
        value: (venue: any) => ((venue as Venue).category ? (venue as Venue).category.title : ""),
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
    category: false,
})

const headerActions: symbol[] = []

const authService = useUser()
onMounted(() => {
    headerActions.push(
        addAction({
            title: "New Venue",
            description: "Add a new venue to the list of venues",
            icon: "mdi-plus",
            color: "primary",
            hidden: computed(() => !authService.isAdmin.value),
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
    return venues.value.filter((venue) =>
        venue.category ? selections.value.categories.includes(venue.category.pk) : false
    )
})
const { data: venues, pending: pendingDepartments } = useFetch<Array<Venue>>("/venues/", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),
    default() {
        return []
    },
})

const {
    data: categories,
    pending: pendingCategories,
    refresh: refreshCategories,
} = useFetch<Array<VenueCategory>>("/venues/categories/", {
    baseURL: configs.public.baseURL,
    headers: useFetchHeader([]),

    default() {
        return []
    },
})

function onSave(venue: Venue) {
    venues.value.push(venue)
    addition.value.model = false

    refreshCategories()

    useNotification().add({
        title: "Venue added",
        text: `${venue.title} was added to venues`,
        icon: "mdi-plus",
        color: "teal",
        duration: 10000,
        action(closeCallback) {
            closeCallback()
        },
    })
}

function onCategoryAdd(category: VenueCategory) {
    categories.value.push(category)
    useNotification().add({
        title: "Venue Category added",
        text: `${category.title} was added to venue categories`,
        icon: "mdi-plus",
        color: "teal",
        action(closeCallback) {
            closeCallback()
        },
    })
}

const deleteWithVenues = ref(false)
async function onDeleteCategory(category: VenueCategory) {
    try {
        await $fetch("/venues/categories/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            headers: useFetchHeader([]),
            body: [category.pk],
            params: {
                "with-venues": deleteWithVenues.value,
            },
        })
        useNotification().add({
            title: "Category Deleted",
            text: `${category.title} was deleted Successfully`,
            closable: true,
        })
        categories.value = categories.value.filter((cat) => cat.pk != category.pk)
    } catch (error) {
        useLogger().error("Deleting Category", "Error deleting venue category", error as Error)

        const _error = error as FetchError<string>
        if (!_error.statusCode) {
            useNotification().postNetowrkIssue()
            return
        }
        switch (_error.statusCode) {
            case 401:
                useNotification().add({
                    title: "Error deleting category",
                    text: `Only admin user can delete venues and venues categories`,
                    closable: true,
                    color: "error",
                    icon: "mdi-alert-circle",
                })
                break
            case 500:
                useNotification().postServerIssue()
                break
            default:
                useNotification().add({
                    title: "Error deleting category",
                    text: `An error occured will attempting to delete ${category.title} category`,
                    closable: true,
                    color: "error",
                    icon: "mdi-alert-circle",
                })
        }
    }
}

async function onDelete() {
    if (selections.value.venues.length < 1) return

    try {
        deletion.value.pending = true
        await $fetch("/venues/multiple_delete/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            body: selections.value.venues,
            headers: useFetchHeader([]),
        })

        venues.value = venues.value.filter((department) => {
            return !selections.value.venues.includes(department.pk)
        })
        refreshCategories()
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

const screen = useDisplay()
const height = computed(() => {
    return screen.height.value - 96
})
</script>
