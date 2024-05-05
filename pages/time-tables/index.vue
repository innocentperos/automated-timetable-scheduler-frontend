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
                                <v-select
                                    :items="SEMESTERS"
                                    v-model="newTimetableDialog.semester"
                                    label="Semester"
                                    item-title="title"
                                    item-value="value"
                                    :rules="[required]"
                                ></v-select>
                                <v-text-field
                                    name="session"
                                    label="Session"
                                    v-model="newTimetableDialog.session"
                                    :rules="[required, minLen(4)]"
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
            <v-spacer></v-spacer>
            <ui-is-authenticated user-type="admin">
                <v-col cols="auto" class="d-flex">
                    <v-btn-toggle mandatory multiple color="primary">
                        <v-btn
                            @click="selectMode = !selectMode"
                            :color="selectMode ? 'primary' : ''"
                            >Select
                        </v-btn>
                        <v-btn v-if="selectMode" @click="selectMode = !selectMode">All </v-btn>
                    </v-btn-toggle>
                </v-col>
            </ui-is-authenticated>
        </v-row>
        <v-row>
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
                <v-card
                    class="aspect-square relative"
                    :color="
                        !selectMode
                            ? timetable.is_current
                                ? 'indigo'
                                : ''
                            : isSelected(timetable.pk)
                              ? 'error'
                              : ''
                    "
                    @click="viewTable($event, timetable)"
                >
                    <v-card-text class="w-100 h-100 d-flex flex-column">
                        <v-slide-y-transition>
                            <span v-if="isSelected(timetable.pk) && selectMode">selected</span>
                        </v-slide-y-transition>
                        <div class="d-flex justify-space-between align-center w-100">
                            <span class="text-subtitle-1 text-uppercase">{{
                                timetable.title
                            }}</span>
                            <v-spacer></v-spacer>
                            <v-avatar
                                v-if="!selectMode"
                                :color="timetable.is_current ? 'white' : 'transparent'"
                            >
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
                        <lazy-ui-is-authenticated user-type="admin">
                            <v-tooltip location="bottom">
                                <template #activator="{ props: _props }">
                                    <v-btn
                                        v-bind="_props"
                                        v-if="!timetable.is_current"
                                        variant="tonal"
                                        class="mt-2"
                                        prepend-icon="mdi-check"
                                        @click.stop="markCurrent(timetable)"
                                        :disabled="settingCurrent > 0"
                                        :loading="settingCurrent == timetable.pk"
                                        >mark current</v-btn
                                    >
                                </template>
                                This will be the timetable that students will be able to access and
                                view
                            </v-tooltip>
                        </lazy-ui-is-authenticated>
                    </v-card-text>
                </v-card>
            </v-col>
            <lazy-ui-is-authenticated user-type="admin">
                <v-col cols="4" lg="3">
                    <v-card
                        class="aspect-square cursor-pointer"
                        color="teal"
                        @click="newTimetableDialog.model = true"
                    >
                        <v-card-text
                            class="h-100 w-100 d-flex flex-column align-center justify-center"
                        >
                            <span>New Table</span>
                            <v-icon size="42">mdi-plus</v-icon>
                        </v-card-text>
                    </v-card>
                </v-col>
            </lazy-ui-is-authenticated>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import type { FetchError, Timetable } from "~/types"
import { SEMESTERS } from "~/types"

setPageLayout("default")

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
            hidden: computed(() => !useUser().isAdmin.value),
            action() {
                newTimetableDialog.value.model = true
            },
        })
    )

    actions.push(
        addAction({
            title: "Delete selected",
            icon: "mdi-delete",
            color: "error",
            hidden: computed(() => selectedTimetables.value.length <= 0),
            loading: computed(() => deletingTables.value),
            action() {
                deleteSelectedTables()
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
    headers: useFetchHeader([]),
})
watch(timetables, () => {
    timetableStore.bulkInsert(timetables.value)
})

const newTimetableDialog = ref({
    model: false,
    title: "",
    semester: 1,
    session: "2023/2024",
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
            headers: useFetchHeader([]),
            body: {
                title: newTimetableDialog.value.title,
                session: newTimetableDialog.value.session,
                semester: newTimetableDialog.value.semester,
            },
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
function viewTable(event: Event, table: Timetable) {
    if (selectMode.value) {
        event.preventDefault()
        event.stopPropagation()
        select(table.pk)
    } else {
        if (useUser().isAdmin.value) {
            useRouter().push("/time-tables/" + table.pk)
        } else {
            useRouter().push({
                name: "time-tables-timetable_pk-view",
                params: {
                    timetable_pk: table.pk,
                },
            })
        }
    }
}
const selectedTimetables = ref<number[]>([])
const selectMode = ref(false)

function select(id: number) {
    if (isSelected(id)) {
        selectedTimetables.value = selectedTimetables.value.filter((_id) => _id != id)
    } else {
        selectedTimetables.value.push(id)
    }
}

function isSelected(id: number) {
    return selectedTimetables.value.includes(id)
}

const settingCurrent = ref<number>(0)
async function markCurrent(table: Timetable) {
    try {
        settingCurrent.value = table.pk

        await $fetch(`/timetables/${table.pk}/set_current/`, {
            baseURL: useRuntimeConfig().public.baseURL,
            headers: useFetchHeader([]),
        })

        timetables.value = timetables.value.map((timetable) => {
            if (timetable.is_current) {
                timetable.is_current = false
            }

            if (timetable.pk == settingCurrent.value) {
                timetable.is_current = true
            }
            return timetable
        })
    } catch (error) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().postNetowrkIssue()
        } else {
            switch (_error.statusCode) {
                case 404:
                    useNotification().add({
                        title: "Not found",
                        text: "The timetable you tried to set as the default could not be found",
                        color: "warning",
                        closable: true,
                        action(closeCallback) {
                            closeCallback()
                        },
                    })
                    break
                default:
                    useNotification().postServerIssue()
            }
        }
    } finally {
        settingCurrent.value = 0
    }
}

const deletingTables = ref(false)
async function deleteSelectedTables() {
    try {
        deletingTables.value = true
        await $fetch("/timetables/multiple/", {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "DELETE",
            body: selectedTimetables.value,
            headers: useFetchHeader([]),
        })

        timetables.value = timetables.value.filter(
            (table) => !selectedTimetables.value.includes(table.pk)
        )

        useNotification().add({
            title: "Deleted",
            text: `${selectedTimetables.value.length} timetable ${
                selectedTimetables.value.length <= 1 ? "was" : "were"
            } deleted successfully`,
            color: "success",
            closable: true,
            action(closeCallback) {
                closeCallback()
            },
        })

        selectedTimetables.value = []
    } catch (error) {
        const _error = error as FetchError<string>

        if (!_error.statusCode) {
            useNotification().postNetowrkIssue()
        } else {
            switch (_error.statusCode) {
                default:
                    useNotification().postServerIssue()
            }
        }
    } finally {
        deletingTables.value = false
    }
}
</script>
