import type { FetchError, AuthUser, UserType, User } from "~/types"

let localUser = localStorage.getItem("__user__")
const __user = ref<AuthUser | undefined>(localUser ? JSON.parse(localUser) : undefined)
//     {
//     name: "Innocent Peros",
//     token: "12345",
//     userType: "admin",
//     level: 200,
//     department: 1,
// }

function changeUserType(userType: UserType) {
    if (__user.value) __user.value.userType = userType
}

async function __login(
    userId: ComputedRef<string>,
    password: ComputedRef<string>,
    error: Ref<FetchError<string> | undefined>,
    loading: Ref<boolean>,
    onSuccess?: (user: User) => void
) {
    try {
        loading.value = true
        error.value = undefined
        const response = await $fetch<{
            account: {
                name: string
                email: string
                department: number
                level: 100 | 200 | 300 | 400 | 500
                pk: 1
                user: 1
                user_type: UserType
            }
            token: string
        }>("/accounts/login/", {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "POST",
            body: {
                email: userId.value,
                password: password.value,
            },
            retry: 5,
            retryDelay: 300,
        })
        __user.value = {
            name: response.account.name,
            email: response.account.email,
            token: response.token,
            userType: response.account.user_type,
            department: response.account.department,
            level: response.account.level,
        }
        localStorage.setItem("__user__", JSON.stringify(__user.value))
        if (onSuccess) onSuccess(__user.value)
    } catch (_error) {
        error.value = _error as FetchError<string>
    } finally {
        loading.value = false
    }
}

function login(
    userId: ComputedRef<string>,
    password: ComputedRef<string>,
    auto = true,
    onSuccess?: (user: User) => void
) {
    const loading = ref(false)
    const error = ref<FetchError<string>>()
    if (auto) __login(userId, password, error, loading, onSuccess)

    return {
        loading,
        error,
        retry: () => __login(userId, password, error, loading, onSuccess),
        // execute: (email: string, password: string) => __login(email, password, error, loading),
    }
}
export const useUser = () => {
    return {
        isAuthenticated: computed(() => {
            return __user.value != undefined
        }),
        login,
        currentUser: computed(() => __user.value),
        changeUserType,
        setCurrentUser,
        isAdmin: computed(() => {
            if (!__user.value) return false
            return __user.value.userType == "admin"
        }),
        isStaff: computed(() => {
            if (!__user.value) return false
            return __user.value.userType == "staff"
        }),
        isStudent: computed(() => {
            if (!__user.value) return false
            return __user.value.userType == "student"
        }),
        logout: function () {
            __user.value = undefined
            localStorage.removeItem("__user__")
            localUser = null
        },
    }
}

function setCurrentUser(user: AuthUser) {
    __user.value = user
}
