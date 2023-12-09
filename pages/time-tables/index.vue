<template>
    <v-container>
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
                <NuxtLink>
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
                        </v-card-text>
                    </v-card>
                </NuxtLink>
            </v-col>
            <v-col cols="4" lg="3">
                <v-card class="aspect-square cursor-pointer" color="teal">
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
import type { Timetable } from "~/types"
const configs = useRuntimeConfig()
const { data: timetables, pending: pendingTimetables } = useFetch<Timetable[]>("/timetables/", {
    default: () => [],
    baseURL: configs.public.baseURL,
})
</script>
