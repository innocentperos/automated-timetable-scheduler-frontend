<template>
    <v-app :theme="light ? 'light' : 'dark'">
        <v-main>
            <v-container style="height: 100vh">
                <v-row align-content="center" justify="center" class="w-100 h-100">
                    <v-col lg="4" md="10" :cols="12" class="d-flex align-start w-100">
                        <v-card class="pa-5 d-flex flex-column w-100">
                            <span class="text-h3 py-4">Welcome user</span>
                            <span class="text-h6"> Let get you started with a new account </span>
                        </v-card>
                    </v-col>

                    <v-col :cols="12" md="10" lg="8">
                        <v-stepper class="mb-2">
                            <v-stepper-header v-model="currentStep">
                                <v-stepper-item value="email" :complete="emailChecked">
                                    Check Email
                                </v-stepper-item>
                                <v-stepper-item
                                    value="user-type"
                                    color="primary"
                                    :complete="currentStep == 'user-type'"
                                >
                                    Account Type
                                </v-stepper-item>
                                <v-stepper-item
                                    value="personal"
                                    color="primary"
                                    :complete="currentStep == 'personal'"
                                >
                                    Personal Info
                                </v-stepper-item>
                            </v-stepper-header>
                        </v-stepper>
                        <v-form v-model="formValid" @submit.prevent>
                            <v-sheet class="pa-4" :max-height="600" style="overflow-y: auto">
                                <v-window v-model="currentStep">
                                    <v-window-item value="email">
                                        <v-row>
                                            <v-col cols="12" v-if="!emailChecked">
                                                <span
                                                    >Let confirm that your email address has not
                                                    been used by another user</span
                                                >
                                            </v-col>
                                            <v-col cols="12">
                                                <v-text-field
                                                    label="Email Address"
                                                    v-model="email"
                                                    :rules="[formRules.required]"
                                                    :error-messages="emailCheckError"
                                                    :error="emailCheckError != ''"
                                                    :loading="checkEmailAddressLoading"
                                                    required
                                                    @update:model-value="emailChecked = false"
                                                    @keypress.enter="onCheckEmailAddress"
                                                    messages="Provide your email address"
                                                >
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-btn
                                                    @click="onCheckEmailAddress"
                                                    :disabled="!email"
                                                    :loading="checkEmailAddressLoading"
                                                    size="large"
                                                    color="primary"
                                                    block
                                                    >CHECK EMAIL</v-btn
                                                >
                                            </v-col>
                                        </v-row>
                                    </v-window-item>
                                    <v-window-item value="user-type">
                                        <v-row>
                                            <v-col cols="12" v-show="emailChecked">
                                                <v-select
                                                    :items="['staff', 'student']"
                                                    v-model="userType"
                                                    label="Account Type"
                                                    :rules="[formRules.required]"
                                                    messages="Are you a student or staff?"
                                                ></v-select>
                                            </v-col>
                                            <v-col
                                                v-show="emailChecked"
                                                :cols="userType == 'student' ? 8 : 12"
                                            >
                                                <v-select
                                                    :items="departments"
                                                    v-model="department"
                                                    label="Department"
                                                    item-title="title"
                                                    item-value="pk"
                                                    :rules="[formRules.required]"
                                                    messages="Which department are you in?"
                                                ></v-select>
                                            </v-col>

                                            <v-col
                                                v-show="emailChecked"
                                                v-if="userType == 'student'"
                                                :cols="userType == 'student' ? 4 : 12"
                                            >
                                                <v-select
                                                    :items="LEVELS"
                                                    v-model="level"
                                                    label="Level"
                                                    item-title="title"
                                                    item-value="value"
                                                    :rules="[formRules.required]"
                                                    messages="Which level are you currently in ?"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-btn
                                                    @click="currentStep = 'personal'"
                                                    :disabled="!userTypeFormValid"
                                                    size="large"
                                                    block
                                                    color="primary"
                                                    >Continue</v-btn
                                                >
                                            </v-col>
                                        </v-row>
                                    </v-window-item>
                                    <v-window-item value="personal">
                                        <v-row>
                                            <v-col cols="12" v-show="emailChecked">
                                                <v-text-field
                                                    label="First name"
                                                    v-model="firstName"
                                                    :rules="[formRules.required]"
                                                    required
                                                    messages="Your first name"
                                                >
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" v-show="emailChecked">
                                                <v-text-field
                                                    label="Last name"
                                                    v-model="lastName"
                                                    :rules="[formRules.required]"
                                                    required
                                                    messages="Your last name"
                                                >
                                                </v-text-field>
                                            </v-col>

                                            <v-col cols="12" v-show="emailChecked">
                                                <v-text-field
                                                    label="Password"
                                                    v-model="password"
                                                    :rules="[
                                                        formRules.required,
                                                        formRules.minLen(4),
                                                    ]"
                                                    required
                                                    messages="Enter a preferred password"
                                                    :type="passwordReveal ? 'text' : 'password'"
                                                    :append-inner-icon="
                                                        passwordReveal ? 'mdi-eye-off' : 'mdi-eye'
                                                    "
                                                    @click:append-inner="
                                                        passwordReveal = !passwordReveal
                                                    "
                                                >
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-btn
                                                    @click="onRegisterClicked"
                                                    :disabled="!personalFormValid"
                                                    block
                                                    size="large"
                                                    color="primary"
                                                >
                                                    Complete Registration
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-window-item>
                                </v-window>
                            </v-sheet>
                        </v-form>
                    </v-col>

                    <v-col :cols="12" md="8" lg="6"> </v-col>
                </v-row>
            </v-container>
            <v-dialog v-model="dialog" persistent max-width="600" transition="dialog-transition">
                <v-card color="teal">
                    <v-card-title class="px-8 mt-4 d-flex">
                        <v-icon>mdi-check</v-icon>
                        <div class="pl-4">Registration Successful</div>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row justify="end">
                                <v-col :cols="12">
                                    Your {{ userType == "staff" ? "Staff" : "Student" }} account has
                                    been created use the email {{ email }} and the password you
                                    provided to login
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-col cols="auto">
                                    <v-btn color="primary" @click="login">Login</v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <v-banner position="absolute" location="bottom center">
                <div class="d-flex justify-space-between w-100 px-10">
                    <span class="text-subtitle-1"
                        >If you already have an account, you can login
                    </span>
                    <v-btn color="primary" variant="outlined" @click="login">Login</v-btn>
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
import type { FetchError, UserType } from "~/types"
import { LEVELS } from "~/types"

setPageLayout("not-authenticated")

const dialog = ref(false)
const passwordReveal = ref(false)
const email = ref("")
const password = ref("")
const firstName = ref("")
const lastName = ref("")

const userType = ref<UserType>("student")
const department = ref()
const level = ref()
const light = ref(false)
const formValid = ref(false)

const formRules = useForm()
const departments = useDepartmentStore().all()

const emailChecked = ref(false)
const emailCheckError = ref("")
const checkEmailAddressLoading = ref(false)
async function onCheckEmailAddress() {
    try {
        checkEmailAddressLoading.value = true

        await $fetch("/accounts/check_email/", {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "post",
            body: {
                email: email.value,
            },
        })

        emailCheckError.value = "Email already used"
    } catch (error) {
        console.log(error)
        const _error = error as FetchError<string>
        if (!_error.statusCode) {
            return
        }
        switch (_error.statusCode) {
            case 400:
                emailCheckError.value = "Please provide your email address"

                break
            case 404:
                emailChecked.value = true
                emailCheckError.value = ""
                currentStep.value = "user-type"
        }
    } finally {
        checkEmailAddressLoading.value = false
    }
}
const registrationLoading = ref(false)
async function onRegisterClicked() {
    if (!formValid.value) return

    const form = {
        level: level.value,
        department: department.value,
        email: email.value,
        password: password.value,
        user_type: userType.value,
        first_name: firstName.value,
        last_name: lastName.value,
    }
    useLogger().info("Form data", "Registration form data", form)

    try {
        registrationLoading.value = true
        await $fetch<{
            token: string
            account: {
                name: string
                department: number
                user_type: UserType
                level: number
                email: string
            }
        }>("/accounts/register/", {
            baseURL: useRuntimeConfig().public.baseURL,
            body: form,
            method: "post",
        })

        dialog.value = true
    } catch (error) {
        useLogger().error("Registration Failed", "Error registering user", error as Error)
    } finally {
        registrationLoading.value = false
    }
}

function login() {
    useRouter().replace({
        name: "auth-login",
        query: {
            email: email.value,
        },
    })
}

const currentStep = ref<"email" | "user-type" | "personal" | "password">("email")

const userTypeFormValid = computed(() => {
    if (!["student", "staff"].includes(userType.value)) {
        return false
    }

    if (!department.value) {
        return false
    }

    if (userType.value == "student" && !level.value) {
        return false
    }
    return true
})
const personalFormValid = computed(() => {
    if (!firstName.value || !lastName.value || !password.value) return false
    return true
})
</script>
