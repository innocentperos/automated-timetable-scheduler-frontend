<template>
    <v-card>
        <v-card-title>New Venue Category</v-card-title>
        <v-card-text>
            <v-text-field
                name="title"
                label="Title"
                id="title"
                v-model="title"
                :rules="[required, minLen(3)]"
            ></v-text-field>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" @click="onSave" :loading="pending">Add</v-btn>
            <v-btn color="error" @click="close">Close</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import type { FetchError, VenueCategory } from "~/types"

const title = ref("")
const pending = ref(false)
const { minLen, required } = useForm()
const configs = useRuntimeConfig()
const { add: addNotification } = useNotification()
const emits = defineEmits<{
    (event: "close"): void
    (event: "add", category: VenueCategory): void
}>()

function close() {
    title.value = ""
    pending.value = false
    emits("close")
}

async function onSave() {
    try {
        const response = await $fetch<VenueCategory>("/venues/categories/", {
            method: "post",
            baseURL: configs.public.baseURL,
            headers: useFetchHeader([]),
            body: { title: title.value },
        })
        emits("add", response)
        close()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_error: any) {
        const error = _error as FetchError<string>
        useLogger().error(
            "Add Venue Category Dialog",
            "Unable to add venue category",
            error as Error
        )

        if (!error.statusCode) {
            addNotification({
                text: "Oops, please make sure you have a stable internet connection and try again",
                icon: "mdi-wifi-alert",
                closable: true,
                action(closeCallback) {
                    closeCallback()
                },
            })
            return
        }

        switch (error.statusCode) {
            case 400:
                addNotification({
                    text: "Invalid form was provided",
                    icon: "mdi-finbox-full-outline",
                    closable: true,
                    action(closeCallback) {
                        closeCallback()
                    },
                })
                break
            default:
                addNotification({
                    text: "Oops,something wrong happened on the server please try again",
                    icon: "mdi-server",
                    closable: true,
                    action(closeCallback) {
                        closeCallback()
                    },
                })
                break
        }
    } finally {
        pending.value = false
    }
}
</script>
