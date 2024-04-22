const authService = useUser()
export const useFetchHeader = (headers: [string, string][]) => {
    if (authService.isAuthenticated.value) {
        const __headers: [string, string][] = [
            ...headers,
            ["Authorization", `TOKEN ${authService.currentUser.value!.token}`],
        ]
        return __headers
    }
    return headers
}
