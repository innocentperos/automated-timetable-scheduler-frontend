<template>
    <v-app>
        <size-navigation></size-navigation>
        <app-bar></app-bar>
        <v-main>
            <slot></slot>

            <div class="notifications-container">
                <div class="wrapper">
                    <v-alert
                        v-for="notification in notifications"
                        :key="notification.id"
                        type="error"
                        class="mb-1"
                        :class="{ 'cursor-pointer': notification.action }"
                        border
                        :title="notification.title"
                        :text="notification.text || ''"
                        :icon="notification.icon"
                        :color="notification.color"
                        @click="closeNotification(notification)"
                    >
                        <template #append>
                            <v-btn
                                @click="removeNotification(notification.id)"
                                icon="mdi-close"
                                variant="text"
                                size="small"
                            ></v-btn>
                        </template>
                    </v-alert>
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
    max-width: calc(100vw / 2.5);
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

@media screen and (min-width: 780px) {
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

const {
    heads: notifications,
    hidden: remainingNotification,
    remove: removeNotification,
} = useNotification()
</script>
