<template>
    <v-container>
        <v-row>
            <v-col>
                <v-dialog
                    v-model="newTimetableDialog.model"
                    location="center center"
                    max-width="400"
                    persistent
                >
                    <v-form v-model="newTimetableDialog.form" @submit.prevent>
                        <v-card>
                            <v-card-title> Create New Timetable </v-card-title>
                            <v-card-text>
                                <v-text-field
                                    name="title"
                                    label="Title"
                                    id="title"
                                    v-model="newTimetableDialog.title"
                                    :rules="[required, minLen(3)]"
                                ></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn
                                    type="submit"
                                    @click="onNew"
                                    color="primary"
                                    :loading="newTimetableDialog.pending"
                                    >Create</v-btn
                                >
                                <v-btn @click="newTimetableDialog.model = false" color="error"
                                    >Close</v-btn
                                >
                            </v-card-actions>
                        </v-card>
                    </v-form>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col> Timetables </v-col>
            <v-col
                v-if="pendingTimetables"
                cols="12"
                class="d-flex pa-5 justify-center align-center"
            >
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </v-col>
        </v-row>
        <v-row v-if="!pendingTimetables">
            <v-col cols="4" lg="3" v-for="timetable in timetables" :key="timetable.pk">
                <NuxtLink :to="`/time-tables/${timetable.pk}/`">
                    <v-card class="aspect-square" color="indigo">
                        <v-card-text class="w-100 h-100 d-flex flex-column">
                            <div class="d-flex justify-space-between align-center w-100">
                                <span class="text-subtitle-1 text-uppercase">{{
                                    timetable.title
                                }}</span>
                                <v-avatar :color="timetable.is_current ? 'white' : 'transparent'">
                                    <v-icon :color="timetable.is_current ? 'indigo' : 'transparent'"
                                        >mdi-check</v-icon
                                    >
                                </v-avatar>
                            </div>
                            <div class="d-flex flex-column mt-auto">
                                <span class="text-subtitle-2"
                                    >{{ timetable.courses.length }} Courses</span
                                >

                                <span>{{ new Date(timetable.created_on) }}</span>
                            </div>
                            <v-btn
                                v-if="!timetable.is_current"
                                color="white"
                                variant="tonal"
                                class="mt-2"
                                prepend-icon="mdi-check"
                                >mark current</v-btn
                            >
                        </v-card-text>
                    </v-card>
                </NuxtLink>
            </v-col>
            <v-col cols="4" lg="3">
                <v-card
                    class="aspect-square cursor-pointer"
                    color="teal"
                    @click="newTimetableDialog.model = true"
                >
                    <v-card-text class="h-100 w-100 d-flex flex-column align-center justify-center">
                        <span>New Table</span>
                        <v-icon size="42">mdi-plus</v-icon>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import type { FetchError, Timetable } from "~/types"
const configs = useRuntimeConfig()
const { addAction, removeActions } = useNavigation()
const { add: addNotification } = useNotification()
const { minLen, required } = useForm()
const actions: symbol[] = []
onMounted(() => {
    actions.push(
        addAction({
            title: "New Table",
            icon: "mdi-plus",
            action() {
                newTimetableDialog.value.model = true
            },
        })
    )
})
onUnmounted(() => {
    removeActions(actions)
})
const timetableStore = useTimetableStore()
const { data: timetables, pending: pendingTimetables } = useFetch<Timetable[]>("/timetables/", {
    default: () => [],
    baseURL: configs.public.baseURL,
})
watch(timetables, () => {
    timetableStore.bulkInsert(timetables.value)
})

const newTimetableDialog = ref({
    model: false,
    title: "",
    pending: false,
    form: false,
})

async function onNew() {
    if (!newTimetableDialog.value.form) {
        return
    }
    try {
        newTimetableDialog.value.pending = true

        const table = await $fetch<Timetable>("/timetables/", {
            method: "post",
            baseURL: configs.public.baseURL,
            body: { title: newTimetableDialog.value.title },
            retryDelay: 300,
            retry: 5,
        })
        timetables.value.push(table)
        addNotification({
            text: `Timetable \`${table.title}\` was created`,
            icon: "mdi-check-all",
            color: "teal",
        })
        newTimetableDialog.value.model = false
        newTimetableDialog.value.title = ""
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_error: any) {
        const error = _error as FetchError<string>

        if (!error.response) {
            addNotification({
                text: "Oops, make sure you have an internet connection and try again",
                icon: "mdi-wifi-alert",
                color: "error",
            })
            return
        }

        switch (error.response.status) {
            case 400:
                addNotification({
                    text: "Oops,the information you provided is not valid",
                    color: "error",
                    icon: "mdi-finbox-full",
                })
                break
            default:
                addNotification({
                    text: "Oops,something wrong happened on the server, please try again",
                    color: "error",
                    icon: "mdi-server",
                })
                break
        }
    } finally {
        newTimetableDialog.value.pending = false
    }
}
</script>
