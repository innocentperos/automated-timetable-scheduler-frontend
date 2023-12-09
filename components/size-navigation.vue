<template>
    <v-navigation-drawer
        :model-value="sidNavigationStatus"
        @update:model-value="toggleSideNavigation"
        color="primary"
        expand-on-hover
    >
        <v-list>
            <nuxt-link to="/">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-home"></v-icon>
                    </template>
                    <v-list-item-title> Home</v-list-item-title>
                </v-list-item>
            </nuxt-link>

            <nuxt-link to="/departments">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-menu"></v-icon>
                    </template>
                    <v-list-item-title> Departments</v-list-item-title>
                </v-list-item>
            </nuxt-link>

            <nuxt-link to="/courses/">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-book"></v-icon>
                    </template>
                    <v-list-item-title> Courses</v-list-item-title>
                </v-list-item>
            </nuxt-link>

            <nuxt-link to="/venues">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-navigation"></v-icon>
                    </template>
                    <v-list-item-title> Venues</v-list-item-title>
                </v-list-item>
            </nuxt-link>

            <NuxtLink to="/time-tables">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-table"></v-icon>
                    </template>
                    <v-list-item-title> Timetables</v-list-item-title>
                </v-list-item>
            </NuxtLink>

            <v-list-item link>
                <template #prepend>
                    <v-icon icon="mdi-message"></v-icon>
                </template>
                <v-list-item-title> Complains</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>
<script setup lang="ts">
const { sidNavigationStatus, toggleSideNavigation } = useNavigation()
</script>
