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

function postNetowrkIssue() {
    add({
        title: "No Internet",
        text: "Please make sure you have a stable internet connection, and try again",
        icon: "mdi-wifi-alert",
        closable: true,
        color: "amber",
    })
}

function postServerIssue() {
    add({
        title: "Oops",
        text: "Something went wrong on the server, please try again later",
        icon: "mdi-server-off",
        closable: true,
        color: "amber",
    })
}

const add = (notification: _Notification) => {
    const id = randomId()
    notifications.value = [{ id: id, ...notification }, ...notifications.value]

    if (notification.duration) {
        setTimeout(() => removeNotification(id), notification.duration)
    } else if (notification.closable) {
        setTimeout(() => removeNotification(id), 10000)
    }
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
        add,
        postNetowrkIssue,
        postServerIssue,
    }
}
