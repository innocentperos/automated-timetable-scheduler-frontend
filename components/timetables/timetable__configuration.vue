<template>
    <v-navigation-drawer permanent fixed location="right" width="300">
        <v-toolbar flat color="transparent">
            <v-list>
                <v-list-item>
                    <v-list-item-title class="title"> Primary Actions </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-toolbar>
        <v-divider></v-divider>
        <v-list class="pt-0">
            <v-list-item
                link
                :active="activeTab == index"
                color="primary"
                v-for="(item, index) in actions"
                :key="item.title"
                @click="item.action"
                :disabled="generating == true"
            >
                <template #prepend>
                    <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item link disabled v-show="generating">
                <template #prepend>
                    <v-icon>
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </v-icon>
                </template>
                <v-list-item-title>Generating</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <v-container>
        <v-row>
            <v-spacer></v-spacer>
            <v-col cols="auto" class="d-flex flex-column items-center justify-center align-center">
                <span class="text-h6 text-uppercase">Timetable Configuration</span>

                <v-alert type="info" :value="true">
                    <span>Click on the (<v-icon>mdi-menu-down</v-icon>) icon to view section</span>
                </v-alert>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12">
                <v-card>
                    <v-card-text class="pa-0">
                        <v-row>
                            <v-col cols="12" class="">
                                <v-window v-model="activeTab">
                                    <v-window-item :value="0">
                                        <Suspense>
                                            <timetables-configuartion-date-slot
                                                :timetable-pk="props.timetablePk"
                                            ></timetables-configuartion-date-slot>
                                            <template #fallback>
                                                <v-progress-circular
                                                    indeterminate
                                                ></v-progress-circular>
                                            </template>
                                        </Suspense>
                                    </v-window-item>
                                </v-window>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-overlay
            v-show="overlay"
            v-model="overlay"
            :close-on-content-click="false"
            origin="overlap"
            class="overlay"
        >
            <div class="fullscreen d-flex flex-column justify-center align-center">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
                <span class="text-subtitle-1 d-block my-2 text-white">Generating table ...</span>
            </div>
        </v-overlay>
    </v-container>
</template>
<style scoped>
.fullscreen {
    width: 100vw;
    height: 100vh;
}
</style>
<style scoped></style>
<script setup lang="ts">
import type { FetchError } from "~/types"
const props = defineProps<{ timetablePk: number }>()
const activeTab = ref(0)
const generating = ref(false)
const overlay = computed(() => {
    return generating.value
})

// const secondaryDrawer = useSecondaryNavigation()

const actions = [
    {
        title: "Date and Slots",
        icon: "mdi-calendar",
        action() {
            activeTab.value = 0
        },
    },
    // {
    //     title: "Constraints",
    //     icon: "mdi-lock",
    //     action() {
    //         activeTab.value = 1
    //     },
    // },
    {
        title: "Generate Timetable",
        icon: "mdi-run-fast",
        action() {
            onGenerateTable()
        },
    },
]

const configs = useRuntimeConfig()
const notifications = useNotification()
async function onGenerateTable() {
    try {
        generating.value = true
        await $fetch(`/timetables/${props.timetablePk}/generate/`, {
            baseURL: configs.public.baseURL,
            headers: useFetchHeader([]),
        })

        notifications.add({
            color: "teal",
            title: "Timetable generated",
            text: "The timetable was successfully generated, click on ViewTable above to view it",
            icon: "mdi-check-all",
            closable: false,
            action(closeCallback) {
                closeCallback()
            },
        })
        useRouter().push({
            name: "time-tables-timetable_pk-view",
            params: {
                timetable_pk: props.timetablePk,
            },
        })
    } catch (error: unknown) {
        const _error = error as FetchError<string>
        if (!_error.status) {
            notifications.add({
                title: "Oops, generating table failed",
                text: "Could not connect to the server, make sure you have a stable internet connection and try again.",
                icon: "mdi-wifi-remove",
                closable: false,
                duration: 10000,
                color: "red",
                action(closeCallback) {
                    closeCallback()
                },
            })
        }
    } finally {
        generating.value = false
    }
}
</script>
