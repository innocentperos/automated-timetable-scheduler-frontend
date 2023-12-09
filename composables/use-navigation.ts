import type { NavigationAction } from "~/types"

const navigation = ref(false)
const searchQuery = ref("")

const _actions = ref<Array<NavigationAction & { key: symbol }>>([])

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

        addAction: (action: NavigationAction) => {
            const sym = Symbol()
            _actions.value.push({ key: sym, ...action })
            return sym
        },
        addActions: (actions: Array<NavigationAction>) => {
            const symbs: Array<symbol> = []

            actions.forEach((action) => {
                const sym = Symbol()
                _actions.value.push({ key: sym, ...action })
                symbs.push(sym)
            })

            return symbs
        },
        removeAction: (key: symbol) => {
            _actions.value = _actions.value.filter((item) => item.key != key)
        },
        removeActions: (keys: symbol[]) => {
            _actions.value = _actions.value.filter((item) => !keys.includes(item.key))
        },
        actions: computed(() => _actions.value),
        headActions: computed(() => {
            if (_actions.value.length < 3) {
                return _actions.value
            }
            return _actions.value.slice(0, 2)
        }),
        footActions: computed(() => {
            if (_actions.value.length < 3) {
                return []
            }
            return _actions.value.slice(2)
        }),
    }
}
