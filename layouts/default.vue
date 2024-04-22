<template>
    <v-app :theme="isDark ? 'dark' : 'light'">
        <size-navigation></size-navigation>

        <app-bar></app-bar>

        <v-main>
            <slot></slot>

            <div class="notifications-container">
                <div class="wrapper">
                    <v-slide-x-transition group>
                        <v-alert
                            v-for="notification in notifications"
                            :key="notification.id"
                            type="error"
                            class="mb-1"
                            :class="{ 'cursor-pointer': notification.action }"
                            border
                            :title="notification.title"
                            :icon="notification.icon"
                            :color="notification.color"
                            @click="closeNotification(notification)"
                            elevation="2"
                        >
                            <template #text>
                                <div>
                                    <span>
                                        {{ notification.text || "" }}
                                    </span>
                                    <div>
                                        <v-tooltip
                                            v-for="(action, i) in notification.secondaryActions"
                                            :key="i"
                                            :text="action.tooltip"
                                            bottom
                                        >
                                            <template #activator="{ props: _props }">
                                                <v-btn
                                                    v-bind="_props"
                                                    class="ml-2 mt-2"
                                                    slim
                                                    variant="tonal"
                                                    @click="
                                                        action.action(() =>
                                                            removeNotification(notification.id)
                                                        )
                                                    "
                                                    :text="
                                                        action.type == 'text' ||
                                                        action.type == 'both'
                                                            ? action.text
                                                            : undefined
                                                    "
                                                    :icon="
                                                        action.type == 'icon'
                                                            ? action.icon
                                                            : undefined
                                                    "
                                                    :prepend-icon="
                                                        action.type == 'both'
                                                            ? action.icon
                                                            : undefined
                                                    "
                                                >
                                                </v-btn>
                                            </template>
                                        </v-tooltip>
                                    </div>
                                </div>
                            </template>
                            <template #append>
                                <v-btn
                                    @click="removeNotification(notification.id)"
                                    icon="mdi-close"
                                    variant="text"
                                    size="small"
                                ></v-btn>
                            </template>
                        </v-alert>
                    </v-slide-x-transition>
                </div>
                <div class="item-center">
                    <v-chip color="primary" variant="flat" v-if="remainingNotification > 0"
                        >+{{ remainingNotification }} More</v-chip
                    >
                </div>
            </div>
        </v-main>
    </v-app>
</template>
<style>
.notifications-container {
    position: fixed;
    top: 56px;
    right: 0;
    max-width: calc(100vw / 2);
    padding: 0 8px;
    /* max-height: calc(100vh - 18px);
    overflow-y: auto; */
    z-index: 10000;
}
.notifications-container > .wrapper {
    position: relative;
}
/* .notifications-container > .wrapper > * {
    transform: rotateY(4deg) translateY(10px) translateX(10px) scale(1);
    position: absolute !important;
    top: 0;
    left: 0;
    z-index: -1;
} */
.notifications-container > .wrapper > :nth-child(1) {
    position: relative;
    transform: scale(1);
}

.item-center {
    display: flex;
    justify-content: center;
    align-items: center;
}
.cursor-pointer {
    cursor: pointer;
}

@media screen and (min-width: 1280px) {
    .notifications-container {
        max-width: calc(100vw / 3.4);
    }
}
</style>
<script setup lang="ts">
import type { _Notification } from "~/types"

function closeNotification(notification: _Notification & { id: string | symbol }) {
    if (notification.action) {
        notification.action(() => removeNotification(notification.id))
    }
}

const { isDark } = useTheme()

const {
    heads: notifications,
    hidden: remainingNotification,
    remove: removeNotification,
} = useNotification()
</script>
