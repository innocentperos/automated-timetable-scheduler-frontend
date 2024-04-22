// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineNuxtRouteMiddleware((context) => {
    if (!context.path.startsWith("/auth/") && !useUser().isAuthenticated.value) {
        useRouter().replace({
            path: "/auth/login",
            params: {
                to: context.path,
            },
        })
    } else {
        useNavigation().clear()
        useSecondaryNavigation().clear()
        // useNotification().clear()
        useNavigation().setTitle("Timetable Management")
    }
})
