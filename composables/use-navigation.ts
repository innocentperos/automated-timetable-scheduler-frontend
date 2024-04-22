import type { _NavigationAction } from "~/types"
import type { ComputedRef } from "vue"

const navigation = ref(false)
const searchQuery = ref("")
const darkTheme = ref(true)
const _title = ref("Timetable Management")

export const useTheme = () => {
    return {
        isDark: computed(() => darkTheme.value),
        toggleTheme: () => (darkTheme.value = !darkTheme.value),
    }
}

export const useNavigationDrawer = () => {
    return {
        hide: () => {
            navigation.value = false
        },
        show: () => {
            navigation.value = true
        },
        setQuery: (value: string) => (searchQuery.value = value),
        query: computed(() => searchQuery.value),
        model: computed(() => navigation.value),
    }
}

const __actions = ref<
    Array<
        _NavigationAction & {
            key: symbol
            disabled?: ComputedRef
            hidden?: ComputedRef
            loading?: ComputedRef
        }
    >
>([])

const _visibleActions = computed(() => __actions.value.filter((action) => !action.hidden))
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

        addAction: (action: _NavigationAction) => {
            const sym = Symbol()
            __actions.value.push({ key: sym, ...action })
            return sym
        },
        addActions: (actions: Array<_NavigationAction>) => {
            const symbs: Array<symbol> = []

            actions.forEach((action) => {
                const sym = Symbol()
                __actions.value.push({ ...action, key: sym })
                symbs.push(sym)
            })

            return symbs
        },
        removeAction: (key: symbol) => {
            __actions.value = __actions.value.filter((item) => item.key != key)
        },
        removeActions: (keys: symbol[]) => {
            __actions.value = __actions.value.filter((item) => !keys.includes(item.key))
        },
        clear: () => {
            __actions.value = []
        },
        actions: computed(() => _visibleActions.value),
        headActions: computed(() => {
            if (_visibleActions.value.length < 3) {
                return _visibleActions.value
            }
            return _visibleActions.value.slice(0, 2)
        }),
        footActions: computed(() => {
            if (_visibleActions.value.length < 3) {
                return []
            }
            return _visibleActions.value.slice(2)
        }),
        title: computed(() => _title.value),
        setTitle: (title: string) => {
            _title.value = title
        },
    }
}

const __secondary_actions = ref<
    Array<
        _NavigationAction & {
            key: symbol
            disabled?: ComputedRef
            hidden?: ComputedRef
            loading?: ComputedRef
            group?: string
        }
    >
>([])

export const useSecondaryNavigation = () => {
    function addAction(action: _NavigationAction & { group?: string }) {
        const symbol = Symbol()
        __secondary_actions.value.push({ ...action, key: symbol })
        return symbol
    }

    function removeAction(key: symbol) {
        __secondary_actions.value = __secondary_actions.value.filter((action) => action.key != key)
    }

    return {
        addAction,
        removeAction,
        addActions: (actions: Array<_NavigationAction>, group?: string) => {
            return actions.map((e) => addAction({ ...e, group: group }))
        },
        removeActions: (keys: Array<symbol>) => {
            keys.forEach(removeAction)
        },
        removeActionsOfGroup: (group: string) => {
            __secondary_actions.value = __secondary_actions.value.filter(
                (action) => action.group != group
            )
        },
        clear: () => {
            __secondary_actions.value = []
        },
        actions: computed(() => __secondary_actions.value),
    }
}
