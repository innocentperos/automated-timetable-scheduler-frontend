<template>
    <v-form @submit.prevent v-model="formValid" :disabled="loading">
        <v-card>
            <v-card-title primary-title> Add new staff </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="8">
                        <v-text-field
                            name="Name"
                            label="Name"
                            id="name"
                            v-model="name"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="4">
                        <v-text-field
                            name="staff-id"
                            label="Staff Id"
                            id="staff-id"
                            v-model="staff_id"
                            :rules="[useRuleRequired, useRuleMinLength(3)]"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-select
                            :items="departments"
                            v-model="department"
                            label="Department"
                            :rules="[useRuleRequired]"
                            :loading="loadingDepartments"
                            item-value="pk"
                        ></v-select>
                    </v-col>

                    <v-col cols="6">
                        <v-checkbox v-model="supervisor" label="Can Supervise"></v-checkbox>
                    </v-col>
                    <v-col cols="6">
                        <v-checkbox v-model="invigilator" label="Can Invigilate"></v-checkbox>
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
import type { FetchError, Staff, VenueCategory } from "~/types"
const config = useRuntimeConfig()

const name = ref("")
const staff_id = ref("")
const department = ref()
const supervisor = ref(false)
const invigilator = ref(true)

const loading = ref(false)

const { data: departments, pending: loadingDepartments } = useFetch<VenueCategory[]>(
    "/departments/",
    {
        baseURL: config.public.baseURL,
        default: () => [],
    }
)

const emits = defineEmits<{
    (event: "close"): void
    (event: "add", staff: Staff): void
}>()

const formValid = ref(false)

async function onSave() {
    if (!formValid.value) return

    const form = new FormData()
    form.append("name", name.value)
    form.append("staff_id", staff_id.value)
    form.append("department", department.value)
    form.append("can_invigilate", invigilator.value ? "yes" : "no")
    form.append("can_supervise", supervisor.value ? "yes" : "no")

    try {
        loading.value = true

        const staff = await $fetch<Staff>("/staffs/", {
            baseURL: config.public.baseURL,
            method: "post",
            body: form,
        })

        emits("add", staff)
        onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.data) {
            switch ((error as FetchError<string>).response!.status) {
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
    name.value = ""
    staff_id.value = ""
    department.value = null
    loading.value = false
    emits("close")
}
</script>
