<template>
    <v-navigation-drawer
        :model-value="sidNavigationStatus"
        @update:model-value="toggleSideNavigation"
        color="primary"
        expand-on-hover
    >
        <v-list>
            <v-list-item>
                <v-list-item-title> Side Navigation</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item subtitle="Actions"></v-list-item>
            <nuxt-link to="/">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-home"></v-icon>
                    </template>
                    <v-list-item-title> Home</v-list-item-title>
                </v-list-item>
            </nuxt-link>

            <ui-is-authenticated user-type="admin">
                <nuxt-link to="/departments">
                    <v-list-item link>
                        <template #prepend>
                            <v-icon icon="mdi-menu"></v-icon>
                        </template>
                        <v-list-item-title> Departments</v-list-item-title>
                    </v-list-item>
                </nuxt-link>
            </ui-is-authenticated>

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

            <ui-is-authenticated user-type="admin">
                <nuxt-link to="/staffs">
                    <v-list-item link>
                        <template #prepend>
                            <v-icon icon="mdi-account-multiple"></v-icon>
                        </template>
                        <v-list-item-title> Staff</v-list-item-title>
                    </v-list-item>
                </nuxt-link>
            </ui-is-authenticated>

            <NuxtLink to="/time-tables">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-table"></v-icon>
                    </template>
                    <v-list-item-title> Timetables</v-list-item-title>
                </v-list-item>
            </NuxtLink>

            <ui-is-authenticated user-type="admin">
                <v-list-item link>
                    <template #prepend>
                        <v-icon icon="mdi-message"></v-icon>
                    </template>
                    <v-list-item-title> Complains</v-list-item-title>
                </v-list-item>
            </ui-is-authenticated>
        </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer
        location="right"
        :model-value="secondaryModel"
        expand-on-hover
        v-if="secondaryActions.length > 0"
    >
        <v-list class="h-100">
            <v-list-item
                v-for="action in secondaryActions"
                :key="action.key"
                link
                @click="action.action"
            >
                <template #prepend>
                    <v-icon :icon="action.icon"></v-icon>
                </template>
                <v-list-item-title> {{ action.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>
<script setup lang="ts">
const { sidNavigationStatus, toggleSideNavigation } = useNavigation()
const secondaryDrawer = useSecondaryNavigation()
const secondaryActions = secondaryDrawer.actions

const secondaryModel = ref(true)
</script>
