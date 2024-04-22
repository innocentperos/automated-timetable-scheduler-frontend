<template>
    <v-app :theme="light ? 'light' : 'dark'">
        <v-main>
            <v-container style="height: 100vh">
                <v-row align-content="center" style="height: 100%">
                    <v-col :cols="6" :offset="3" offset-lg="0" :lg="6">
                        <v-card class="pa-5 d-flex flex-column w-100">
                            <span class="text-h3 py-4">Welcome !</span>
                            <span class="text-h6"> Let get you logged in </span>
                        </v-card>
                    </v-col>
                    <v-col :cols="6" :offset="3" offset-lg="0" :lg="6" align-self="stretch">
                        <v-form>
                            <v-row>
                                <v-col :cols="12">
                                    <span class="text-h4">LOGIN</span>
                                </v-col>
                                <v-col :cols="12">
                                    <v-text-field
                                        v-model="email"
                                        label="Email Address"
                                        type="email"
                                    ></v-text-field>
                                </v-col>
                                <v-col :cols="12">
                                    <v-text-field
                                        v-model="password"
                                        label="Password"
                                        :type="passwordReveal ? 'text' : 'password'"
                                    >
                                        <template #append-inner>
                                            <v-icon @click="passwordReveal = !passwordReveal">
                                                {{
                                                    passwordReveal
                                                        ? "mdi-eye-off-outline"
                                                        : "mdi-eye-outline"
                                                }}
                                            </v-icon>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col :cols="12">
                                    <v-btn
                                        block
                                        color="primary"
                                        size="large"
                                        @click="retry"
                                        :loading="logging"
                                        >Login</v-btn
                                    >
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                    <v-col :cols="6" :offset="3" :offset-lg="6" :lg="6">
                        <v-slide-x-transition>
                            <v-alert
                                v-if="error"
                                dropzone="move"
                                class="my-4"
                                type="error"
                                v-show="showError"
                                @click="hideError"
                            >
                                An error occured
                            </v-alert>
                        </v-slide-x-transition>
                    </v-col>
                </v-row>
            </v-container>
            <v-banner position="absolute" location="bottom center">
                <div class="d-flex justify-space-between w-100 px-10">
                    <span class="text-subtitle-1"
                        >If you dont have an account, you can register for one
                    </span>
                    <v-btn color="primary" variant="outlined" @click="register">Register</v-btn>
                </div>
            </v-banner>
        </v-main>
    </v-app>
</template>
<style scoped>
.fullscreen {
    width: 100vw;
    height: 100vh;
}
</style>
<script setup lang="ts">
import type { User } from "~/types"

setPageLayout("not-authenticated")

const passwordReveal = ref(false)
const email = ref(useRoute().query["email"] as string)
const password = ref("")
const light = ref(false)

const showError = ref(true)

function hideError() {
    showError.value = false
}

const {
    loading: logging,
    error,
    retry,
} = useUser().login(
    computed(() => email.value),
    computed(() => password.value),
    false,
    (user: User) => {
        useLogger().info("Login", "Login successfully", user)
        useRouter().replace("/time-tables")
    }
)

watch([error.value], () => {
    if (error.value) {
        showError.value = true
    }
})

function register() {
    console.log(useRouter().currentRoute.value.name)

    useRouter().replace({
        name: "auth-register",
    })
}
</script>
