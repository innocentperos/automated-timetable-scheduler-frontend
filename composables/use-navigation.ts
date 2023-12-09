const navigation = ref(false)
const searchQuery = ref("")

export const useNavigation = () => {
    return {
        query: computed(() => searchQuery.value),
        setQuery: (value: string) => {
            searchQuery.value = value
        },

        sidNavigationStatus: computed(() => navigation.value),
        openSideNavigation: () => {
            navigation.value = true
        },
        closeSideNavigation: () => {
            navigation.value = false
        },
        toggleSideNavigation: () => {
            if (navigation.value) {
                navigation.value = false
            } else {
                navigation.value = true
            }
        },
    }
}
