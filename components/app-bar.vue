<template>
    <v-app-bar elevation="0">
        <template #prepend>
            <v-app-bar-nav-icon @click="toggleSideNavigation" />
        </template>
        <v-toolbar-title>Timetable</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
            name="query"
            id="query"
            hide-details
            density="compact"
            variant="outlined"
            placeholder="Search"
            :model-value="query"
            @update:model-value="setQuery"
        ></v-text-field>
        <v-btn color="primary" @click="notify = true">Notification</v-btn>
        <v-dialog
            v-model="notify"
            scrollable
            persistent
            :overlay="false"
            max-width="500px"
            max-height="700px"
            transition="dialog-transition"
        >
            <LazyNotificationTester @close="notify = false"></LazyNotificationTester>
        </v-dialog>
    </v-app-bar>
</template>
<script setup lang="ts">
const notify = ref(false)
const { toggleSideNavigation, query, setQuery } = useNavigation()
</script>
