import type { _NavigationAction } from "~/types"
import type { ComputedRef } from "vue"

const navigation = ref(false)
const searchQuery = ref("")

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
            __actions.value = _visibleActions.value.filter((item) => item.key != key)
        },
        removeActions: (keys: symbol[]) => {
            __actions.value = _visibleActions.value.filter((item) => !keys.includes(item.key))
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
    }
}
