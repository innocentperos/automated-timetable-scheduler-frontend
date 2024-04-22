<template>
    <v-container>
        <v-row>
            <lazy-ui-is-authenticated>
                <v-col :cols="4">
                    <NuxtLink to="/time-tables">
                        <v-card class="aspect-square">
                            <v-card-text> Timetables </v-card-text>
                        </v-card>
                    </NuxtLink>
                </v-col>
            </lazy-ui-is-authenticated>
            <lazy-ui-is-authenticated user-type="admin">
                <v-col :cols="4">
                    <NuxtLink to="/departments">
                        <v-card class="aspect-square">
                            <v-card-text> Departments </v-card-text>
                        </v-card>
                    </NuxtLink>
                </v-col>
            </lazy-ui-is-authenticated>

            <lazy-ui-is-authenticated>
                <v-col :cols="4">
                    <NuxtLink to="/courses">
                        <v-card class="aspect-square">
                            <v-card-text> Courses </v-card-text>
                        </v-card>
                    </NuxtLink>
                </v-col>
            </lazy-ui-is-authenticated>

            <lazy-ui-is-authenticated>
                <v-col :cols="4">
                    <NuxtLink to="/venues">
                        <v-card class="aspect-square">
                            <v-card-text> Venues </v-card-text>
                        </v-card>
                    </NuxtLink>
                </v-col>
            </lazy-ui-is-authenticated>
        </v-row>
    </v-container>
</template>
<script setup lang="ts"></script>
