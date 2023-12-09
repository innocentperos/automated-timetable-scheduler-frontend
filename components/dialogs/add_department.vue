<template>
    <v-form v-model="formValid" @submit.prevent>
        <v-card>
            <v-banner
                stick="top"
                v-show="last_error_message && show_last_error"
                lines="one"
                :icon="last_error_icon"
            >
                <template #text>
                    {{ last_error_message }}
                </template>

                <template #actions>
                    <v-btn color="error" @click="show_last_error = false"> close </v-btn>
                </template>
            </v-banner>
            <v-card-text>
                <v-card-title primary-title> Adding Department </v-card-title>

                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            name="title"
                            label="Department title"
                            v-model="title"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            name="code"
                            label="Department code"
                            v-model="code"
                            :counter="10"
                            :rules="[useRuleRequired, useRuleMaxLength(10)]"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="pb-4">
                <v-btn
                    color="primary"
                    variant="outlined"
                    class="ml-4"
                    @click="saveDepartment"
                    :loading="pending"
                    type="submit"
                    :disabled="!formValid"
                    >Add Department</v-btn
                >
                <v-btn color="red" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>
<script setup lang="ts">
import type { Department, FetchError } from "~/types"

const emits = defineEmits<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: "error", error: any): void
    (event: "close"): void
    (event: "saved", department: Department): void
}>()

const title = ref("")
const code = ref("")
const formValid = ref(false)
const pending = ref(false)

const last_error_message = ref("")
const last_error_icon = ref("")
const show_last_error = ref(false)

function setLastError(text: string, icon: string = "") {
    last_error_message.value = text
    last_error_icon.value = icon
    show_last_error.value = true
}
const configs = useRuntimeConfig()
async function saveDepartment() {
    if (!formValid.value) return
    try {
        pending.value = true
        const response = await $fetch<Department>("/departments/", {
            baseURL: configs.public.baseURL,
            method: "post",
            body: {
                title: title.value,
                code: code.value,
            },
        })
        useNotification().add({
            text: `Added a new department ${response.title}`,
            icon: "mdi-plus",
            color: "teal",
            action: (event) => {
                event()
            },
        })
        emits("saved", response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        emits("error", error)
        if (error.data) {
            const _error = error as FetchError
            switch (_error.response.status) {
                case 400:
                    setLastError(
                        "The details you provided was invalid",
                        "mdi-information-variant-circle"
                    )
                    break
                default:
                    setLastError(
                        "Something went wrong on the server, try again later",
                        "mdi-server-network-off"
                    )
                    break
            }
        } else {
            setLastError(
                "Oops, could not connect to the server make sure you have a stable internect connecttion",
                "mdi-wifi-strength-alert-outline"
            )
        }
    } finally {
        pending.value = false
    }
}

function close() {
    title.value = ""
    code.value == ""
    show_last_error.value = false
    last_error_message.value = ""
    last_error_icon.value = ""

    emits("close")
}
</script>
