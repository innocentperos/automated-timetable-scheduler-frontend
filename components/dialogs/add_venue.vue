<template>
    <v-form @submit.prevent v-model="formValid" :disabled="loading">
        <v-card>
            <v-card-title primary-title> Add new venue </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="8">
                        <v-text-field
                            name="title"
                            label="Title"
                            id="title"
                            v-model="title"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="4">
                        <v-text-field
                            name="code"
                            label="Code"
                            id="Code"
                            v-model="code"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-select
                            :items="departments"
                            v-model="category"
                            label="Venue Category"
                            :rules="[useRuleRequired]"
                            :loading="loadingCategories"
                            item-value="pk"
                        ></v-select>
                    </v-col>

                    <v-col cols="12">
                        <v-text-field
                            name="capactiy"
                            label="Venue Capacity"
                            id="student_count"
                            v-model="capacity"
                            :rules="[useRuleRequired, useRuleNumber]"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn class="ml-4" type="submit" color="primary" @click="onSave" :loading="loading"
                    >Save Venue</v-btn
                >
                <v-btn color="error" @click="onClose">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>
<script setup lang="ts">
import type { FetchError, Venue, VenueCategory } from "~/types"
const config = useRuntimeConfig()

const title = ref("")
const code = ref("")
const capacity = ref()
const category = ref()
const loading = ref(false)

const venueStore = useVenueStore()

const { data: departments, pending: loadingCategories } = useFetch<VenueCategory[]>(
    "/venues/categories/",
    {
        baseURL: config.public.baseURL,
        headers: useFetchHeader([]),
        default: () => [],
    }
)

const emits = defineEmits<{
    (event: "close"): void
    (event: "add", venue: Venue): void
}>()

const formValid = ref(false)

async function onSave() {
    if (!formValid.value) return

    const form = new FormData()
    form.append("title", title.value)
    form.append("code", code.value)
    form.append("capacity", capacity.value)
    form.append("category", category.value)

    try {
        loading.value = true

        const venue = await $fetch<Venue>("/venues/", {
            baseURL: config.public.baseURL,
            method: "post",
            headers: useFetchHeader([]),
            body: form,
        })

        emits("add", venue)
        venueStore.insert(venue)

        onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_error: any) {
        const error = _error as FetchError<string>
        useLogger().error("Add Venue Dialog", "Unable to add Venue", error as Error)
        if (error.statusCode) {
            switch (error.statusCode) {
                case 400:
                    // Invalid form
                    useNotification().add({
                        title: "Form error",
                        text: "The values you provided in the form was invalid",
                        icon: "mdi-page-layout-header",
                        action(closeCallback) {
                            closeCallback()
                        },
                    })
                    break
                default:
                    // Error on server
                    useNotification().add({
                        title: "Oops",
                        text: "Something wrong happened on the server, try again later",
                        icon: "mdi-server-network-off",
                        action(closeCallback) {
                            closeCallback()
                        },
                    })

                    break
            }
        } else {
            // Network Issue
            useNotification().add({
                title: "Oops",
                text: "Make sure you have a stable internet connection and try again",
                icon: "mdi-wifi-strength-alert-outline",
                action(closeCallback) {
                    closeCallback()
                },
            })
        }
    } finally {
        loading.value = false
    }
}
function onClose() {
    title.value = ""
    code.value = ""
    category.value = null
    capacity.value = []
    loading.value = false
    emits("close")
}
</script>
