<template>
    <v-form @submit.prevent v-model="formValid" :disabled="loading">
        <v-card>
            <v-card-title primary-title class="px-6 pt-6"> Update staff </v-card-title>
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
                <v-slide-x-transition group>
                    <v-btn
                        class="ml-4"
                        type="submit"
                        color="primary"
                        @click="confirmEmail"
                        :loading="checkingEmail"
                        v-if="isUser"
                        >Validated Email</v-btn
                    >
                    <v-btn
                        class="ml-4"
                        type="submit"
                        color="primary"
                        @click="onSave"
                        :loading="loading"
                        :disabled="!allowSaving"
                        >Save Staff</v-btn
                    >
                </v-slide-x-transition>
                <v-btn color="error" @click="onClose">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>
<script setup lang="ts">
import type { Department, FetchError, Staff } from "~/types"
const config = useRuntimeConfig()

const props = defineProps<{ staff: Staff }>()

const name = ref(props.staff.name)
const staff_id = ref(props.staff.staff_id)
const department = ref(props.staff.department.pk)
const supervisor = ref(props.staff.can_supervise)
const invigilator = ref(props.staff.can_invigilate)

const loading = ref(false)

const { data: departments, pending: loadingDepartments } = useFetch<Department[]>("/departments/", {
    baseURL: config.public.baseURL,
    default: () => [],
})

const emits = defineEmits<{
    (event: "close"): void
    (event: "update", staff: Staff): void
}>()

const formValid = ref(false)

async function onSave() {
    if (!formValid.value) return

    const form = new FormData()
    form.append("name", name.value)
    form.append("staff_id", staff_id.value)
    form.append("department", department.value.toString())
    form.append("can_invigilate", invigilator.value ? "true" : "false")
    form.append("can_supervise", supervisor.value ? "true" : "false")
    form.append("email", email.value)

    try {
        loading.value = true

        const staff = await $fetch<Staff>(`/staffs/${props.staff.pk}/`, {
            baseURL: config.public.baseURL,
            method: "PUT",
            headers: useFetchHeader([]),

            body: form,
        })

        emits("update", staff)
        onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_error: any) {
        const error = _error as FetchError<string>
        useLogger().error("Update Staff Dialog", "Unable to update staff", error as Error)
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
                case 409:
                    // Invalid form
                    useNotification().add({
                        title: "Staff Id Conflict",
                        text: "Seems there is another staff with thesame staff id",
                        icon: "mdi-page-layout-header",
                        color: "error",
                        action(closeCallback) {
                            closeCallback()
                        },
                    })
                    break
                default:
                    // Error on server
                    useNotification().postServerIssue()

                    break
            }
        } else {
            // Network Issue
            useNotification().postNetowrkIssue()
        }
    } finally {
        loading.value = false
    }
}
function onClose() {
    name.value = ""
    staff_id.value = ""
    department.value = 0
    loading.value = false
    emits("close")
}

const isUser = ref(false)
const email = ref("")
const checkingEmail = ref(false)
const validatedEmail = ref(false)

const allowSaving = computed(() => {
    if (isUser.value == false) return true

    if (validatedEmail.value) return true

    return false
})
async function confirmEmail() {
    try {
        checkingEmail.value = true
    } catch (error) {
        useLogger().error("ConfirmEmail", "COuld not confrim staff email", error as Error)
    } finally {
        checkingEmail.value = false
    }
}
</script>
