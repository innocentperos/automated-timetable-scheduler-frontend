<template>
    <v-app-bar elevation="0">
        <template #prepend>
            <v-app-bar-nav-icon @click="toggleSideNavigation" />
        </template>
        <v-toolbar-title>Timetable</v-toolbar-title>
        <v-row no-gutters justify="end">
            <v-col class="d-flex">
                <v-slide-x-transition class="py-0 d-flex" group tag="v-list">
                    <div v-for="action in headActions" :key="action.key">
                        <v-tooltip
                            v-if="action.description"
                            location="bottom center"
                            :text="action.description"
                        >
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    @click="action.action"
                                    :color="action.color ?? 'primary'"
                                    :loading="action.loading"
                                    :prepend-icon="action.icon"
                                >
                                    {{ action.title }}
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <v-btn
                            v-else
                            @click="action.action"
                            :color="action.color ?? 'primary'"
                            :loading="action.loading"
                            :prepend-icon="action.icon"
                        >
                            {{ action.title }}
                        </v-btn>
                    </div>
                </v-slide-x-transition>
                <v-menu offset-y v-if="footActions.length > 0">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" append-icon="mdi-menu-down">
                            <span>More</span>
                            <v-chip class="ml-2" color="primary" size="x-small"
                                >{{ footActions.length }}+</v-chip
                            >
                        </v-btn>
                    </template>
                    <v-list density="comfortable">
                        <v-list-item
                            v-for="(action, index) in footActions"
                            :key="action.key"
                            @click="action.action"
                            class="py-2"
                            :border="index != 0 && index != footActions.length - 1"
                        >
                            <v-list-item-title>{{ action.title }}</v-list-item-title>
                            <v-list-item-subtitle>{{ action.description }}</v-list-item-subtitle>

                            <template #append>
                                <v-icon>{{ action.icon }}</v-icon>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
            <v-col cols="4" class="d-none d-md-inline-block">
                <v-text-field
                    name="query"
                    id="query"
                    hide-details
                    density="compact"
                    variant="filled"
                    elevation="0"
                    placeholder="Search"
                    :model-value="query"
                    @update:model-value="setQuery"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-btn color="primary" @click="notify = true">
            <v-icon>mdi-bell</v-icon>
        </v-btn>
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
<style>
.list-enter-active {
}
</style>
<script setup lang="ts">
const notify = ref(false)
const { toggleSideNavigation, query, setQuery, headActions, footActions } = useNavigation()
</script>
