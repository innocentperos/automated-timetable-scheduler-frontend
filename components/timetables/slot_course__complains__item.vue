<template>
    <v-expansion-panel>
        <template #title>
            <div class="d-flex w-100 align-center px-4 py-1">
                <v-chip>
                    Innocent Peros
                    <template #append>
                        <v-avatar class="ml-2" icon="mdi-account"></v-avatar>
                    </template>
                </v-chip>
                <v-spacer></v-spacer>
                <lazy-ui-is-authenticated v-if="!complain.resolved" user-type="admin">
                    <v-btn size="small" variant="tonal" color="amber" :disabled="complain.resolved"
                        >resloved</v-btn
                    >
                </lazy-ui-is-authenticated>
                <v-tooltip v-else>
                    <template #activator="{ props: tipProps }">
                        <v-icon v-bind="tipProps">mdi-check-all</v-icon>
                    </template>
                    <span>Issue has been resolved</span>
                </v-tooltip>
            </div>
        </template>

        <v-expansion-panel-text>
            <v-row no-gutters>
                <v-col :cols="12" :lg="4" class="d-flex align-center justify-center pa-6">
                    <v-progress-circular
                        v-if="loadingRelatedSlotCourse"
                        indeterminate
                    ></v-progress-circular>
                    <lazy-timetables-timetable-slot-course-full-view
                        v-else-if="relatedSlotCourse && !loadingRelatedSlotCourse"
                        :slot-course="relatedSlotCourse"
                        full-width
                    ></lazy-timetables-timetable-slot-course-full-view>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col :cols="12" :lg="8">
                    <v-list draggable="true">
                        <template #divider>
                            <v-divider></v-divider>
                        </template>
                        <v-list-item
                            class="pa-0"
                            v-for="(_message, index) in complain.messages"
                            :key="index"
                        >
                            <v-sheet class="d-flex flex-column">
                                <div v-if="_message.user" class="d-flex align-center">
                                    <v-icon v-if="_message.reply_to" class="mx-3">mdi-reply</v-icon>

                                    <v-chip class="mr-auto ma-2"> {{ _message.user.name }} </v-chip>
                                </div>
                                <span class="text-subtitle-2 pa-2 px-3">
                                    {{ _message.message }}
                                </span>
                                <div
                                    class="d-flex flex-row ml-auto ma-3 mt-1 justify-center align-center"
                                >
                                    <v-icon>mdi-check-all</v-icon>
                                    <span class="text-subtitle-2">{{
                                        parseDate(_message.time)
                                    }}</span>
                                </div>
                                <v-divider></v-divider>
                            </v-sheet>
                        </v-list-item>
                    </v-list>
                </v-col>
                <v-col cols="12" lg="8" offset-lg="4">
                    <v-list-item v-if="!complain.resolved" class=" my-2">
                        <div class="d-flex">
                            <v-textarea
                                variant="solo-filled"
                                class=""
                                :rows="3"
                                hide-details
                                label="Write response..."
                                v-model="message"
                            >
                                <template #append-inner>
                                    <v-btn
                                        class="mx-2"
                                        @click="sendResponse"
                                        :color="message ? 'amber' : undefined"
                                        :disabled="!message"
                                        :loading="sending"
                                        icon="mdi-send"
                                    ></v-btn>
                                </template>
                            </v-textarea>
                        </div>
                    </v-list-item>
                </v-col>
            </v-row>
        </v-expansion-panel-text>
    </v-expansion-panel>
</template>
<script setup lang="ts">
import type { FetchError } from "~/types"
import type { Complain, ComplainMessage } from "~/typing/timetable"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _props = defineProps<{ complain: Complain }>()

const message = ref("")
const sending = ref(false)

console.log(_props.complain)

const {
    data: relatedSlotCourse,
    pending: loadingRelatedSlotCourse,
    refresh,
} = useSlotCourseStore().load(
    _props.complain.related_slot_course ? _props.complain.related_slot_course : 0
)
onMounted(() => {
    if (_props.complain.related_slot_course) {
        refresh()
    }
})
function parseDate(time: string) {
    const date = new Date(Date.parse(time))

    return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
}

async function sendResponse() {
    if (!message.value) return
    try {
        sending.value = true
        const complainMessage = await $fetch<ComplainMessage>(
            `/complains/${_props.complain.pk}/message/`,
            {
                method: "post",
                headers: useFetchHeader([]),
                baseURL: useRuntimeConfig().public.baseURL,
                body: {
                    message: message.value,
                },
            }
        )
        useComplainStore().addMessage(complainMessage)
    } catch (error) {
        const _error = error as FetchError<string>

        switch (_error.statusCode) {
            case undefined:
                useNotification().postNetowrkIssue()
                break

            case 400:
                useNotification().add({
                    title: "Form error",
                    text: "Please make sure you typed in message before sending",
                    color: "amber",
                    closable: true,
                })
                break

            default:
                useNotification().postServerIssue()
                break
        }
    } finally {
        sending.value = false
    }
}
</script>
