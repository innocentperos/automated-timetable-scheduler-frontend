<template>
    <v-card>
        <v-card-text>
            <v-row no-gutters>
                <v-col cols="12">
                    <v-text-field v-model="title"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field textarea v-model="text"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-btn-toggle v-model="icon" color="primary">
                        <v-btn value="mdi-ethernet">
                            <v-icon icon="mdi-ethernet"></v-icon>
                        </v-btn>
                        <v-btn value="mdi-calendar-question">
                            <v-icon icon="mdi-calendar-question"></v-icon>
                        </v-btn>
                        <v-btn value="mdi-account-cog">
                            <v-icon icon="mdi-account-cog"></v-icon>
                        </v-btn>
                        <v-btn value="mdi-message">
                            <v-icon icon="mdi-message"></v-icon>
                        </v-btn>
                        <v-btn value="mdi-alert">
                            <v-icon icon="mdi-alert"></v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </v-col>
                <v-col cols="12" class="mt-2 mb-4">
                    <v-color-picker width="100%" v-model="color"></v-color-picker>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-row>
                <v-col cols="auto">
                    <v-checkbox label="action" v-model="action"></v-checkbox>
                </v-col>
                <v-col cols="auto" class="ml-2">
                    <v-btn @click="addNotification">Push notification</v-btn>
                </v-col>
                <v-col cols="auto" class="ml-2">
                    <v-btn @click="close">Close</v-btn>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
const title = ref("Simple title")
const text = ref("This is a demo of how the alert body will be")
const icon = ref("mdi-ethernet")
const color = ref("")
const action = ref(false)
const count = ref(1)
const emits = defineEmits<{
    (event: "close"): void
}>()

function close() {
    emits("close")
}

function addNotification() {
    add({
        title: `${title.value} ${count.value}`,
        text: text.value,
        icon: icon.value,
        color: color.value,
        action: action.value
            ? (callback: () => void) => {
                  console.log("clicked notification")

                  callback()
              }
            : undefined,
    })
    count.value = count.value + 1
}
const { add } = useNotification()
</script>
