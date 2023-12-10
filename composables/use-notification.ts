import type { _Notification } from "~/types"

const randomId = () => {
    return Math.random().toString()
}
const notifications = ref<(_Notification & { id: symbol | string })[]>([])

const removeNotification = (sym: symbol | string) => {
    setTimeout(() => {
        notifications.value = notifications.value.filter((item) => item.id != sym)
    }, 100)
}

export const useNotification = () => {
    return {
        notifications: computed(() => notifications.value),
        heads: computed(() => notifications.value.slice(0, 5)),
        count: computed(() => notifications.value.length),
        hidden: computed(() => {
            if (notifications.value.length <= 5) return 0
            return notifications.value.length - 5
        }),
        remove: removeNotification,
        add: (notification: _Notification) => {
            const id = randomId()
            notifications.value = [{ id: id, ...notification }, ...notifications.value]

            if (notification.duration) {
                setTimeout(() => removeNotification(id), notification.duration)
            }
        },
    }
}
