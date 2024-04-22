<template>
    <slot v-if="isAuthenticated && isUserType"></slot>
    <div v-else-if="!userType && isAuthenticated" class="ui">
        <slot></slot>
        <div class="overlay">
            <v-btn size="small">Login</v-btn>
        </div>
    </div>
</template>
<style scoped>
.ui {
    position: relative;
}
.overlay {
    z-index: 5;
    background-color: rgba(0, 0, 0, 0.577);
    width: 100%;
    height: 100%;
    position: absolute;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
</style>
<script setup lang="ts">
import type { UserType } from "~/types"

const { isAuthenticated, currentUser } = useUser()

const isUserType = computed(() => {
    if (!isAuthenticated) return false
    if (!props.userType) return true

    if (Array.isArray(props.userType)) {
        return props.userType.includes(currentUser.value?.userType)
    }
    return currentUser.value?.userType == props.userType
})

const props = defineProps<{
    userType?: UserType | UserType[]
}>()
</script>
