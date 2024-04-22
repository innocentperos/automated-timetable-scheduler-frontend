<template>
    <v-app-bar elevation="0">
        <template #prepend>
            <v-app-bar-nav-icon @click="toggleSideNavigation" />
        </template>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
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
        </v-row>
        <v-text-field
            name="query"
            id="query"
            hide-details
            density="compact"
            variant="solo-filled"
            :elevation="0"
            placeholder="Search"
            :model-value="query"
            @update:model-value="setQuery"
            append-inner-icon="mdi-filter"
            @click:append-inner="onAppendInner"
            prepend-inner-icon="mdi-magnify"
        ></v-text-field>
        <div class="mx-2"></div>
        <v-btn color="primary" @click="notify = true" icon="mdi-bell"> </v-btn>
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
        <v-btn
            :theme="isDark ? 'light' : 'dark'"
            :icon="isDark ? 'mdi-weather-sunny-alert' : 'mdi-weather-night'"
            @click="toggleTheme"
        ></v-btn>
        <v-menu v-if="isAuthenticated && currentUser" :close-on-content-click="false">
            <template #activator="{ props: _props }">
                <v-avatar color="grey" size="28" v-bind="_props" class="mx-3">
                    <!-- {{ currentUser.userType[0] }}{{ currentUser.userType[1] }} -->
                    <v-icon>mdi-account</v-icon>
                </v-avatar>
            </template>
            <v-card width="300">
                <v-card-title class="px-0">
                    <v-list-item>
                        <template #title> {{ currentUser.name }}</template>
                        <template #subtitle>
                            <div class="d-flex flex-column">
                                <span>{{ currentUser.email }}</span>
                            </div>
                        </template>
                        <template #append>
                            <v-chip color="white" class="mr-auto">
                                {{ currentUser.userType }}
                            </v-chip>
                        </template>
                    </v-list-item>
                </v-card-title>
                <v-card-text class="pa-0 my-0">
                    <v-divider class="ma-0"></v-divider>
                    <v-list class="py-0 my-0">
                        <v-list-item @click="onChangeUserType">
                            <template #title> Change User </template>
                            <template #append>
                                <v-icon>mdi-account-convert-outline</v-icon>
                            </template>
                        </v-list-item>
                        <v-list-item @click="onLogoutClicked">
                            <template #title> Logout </template>
                            <template #append>
                                <v-icon>mdi-logout</v-icon>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-menu>
        <NuxtLink v-else to="/auth/login">
            <v-btn> login </v-btn>
        </NuxtLink>
    </v-app-bar>
</template>

<script setup lang="ts">
const notify = ref(false)
const { toggleSideNavigation, query, setQuery, headActions, footActions, title } = useNavigation()
const { isDark, toggleTheme } = useTheme()

const { isAuthenticated, currentUser, changeUserType } = useUser()

function onChangeUserType() {
    if (!currentUser.value) return

    if (currentUser.value.userType == "admin") {
        changeUserType("staff")
    } else if (currentUser.value.userType == "staff") {
        changeUserType("student")
    } else {
        changeUserType("admin")
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onAppendInner(_event: Event) {}

function onLogoutClicked() {
    useUser().logout()
    useRouter().replace({
        path: "/auth/login",
        params: {
            to: useRoute().fullPath,
        },
    })
}
</script>
