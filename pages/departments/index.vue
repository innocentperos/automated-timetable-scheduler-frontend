<template>
    <v-container>
        <v-row>
            <v-col cols="1">
                <v-dialog v-model="addition.model" location="top center" persistent max-width="500">
                    <dialogs-add-department @add="onSave" @close="addition.model = false">
                    </dialogs-add-department>
                </v-dialog>
            </v-col>
            <v-col>
                <v-dialog v-model="deletion.model" location="top center" persistent max-width="400">
                    <v-card>
                        <v-card-title class="headline"
                            >Delete {{ selectedDepartments.length }} Departments</v-card-title
                        >
                        <v-card-text
                            >Are you sure you want to delete the selected departments</v-card-text
                        >
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" flat @click.native="deletion.model = false"
                                >Cancel</v-btn
                            >
                            <v-btn
                                size="large"
                                color="red"
                                v-if="selectedDepartments.length > 0"
                                :loading="deletion.pending"
                                @click="onDelete"
                                >DELETE</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-data-table
                    :headers="HEADERS"
                    :items="departments"
                    :loading="pendingDepartments"
                    show-select
                    v-model="selectedDepartments"
                    item-value="pk"
                >
                    <template #top>
                        <v-row justify="center">
                            <v-col><span class="text-h5 text-uppercase">Departments</span></v-col>
                        </v-row>
                    </template>

                    <template #item.departments="{ value }">
                        <v-chip
                            v-for="department in value"
                            :key="department.pk"
                            class="ml-1"
                            color="teal"
                        >
                            {{ department.code }}
                        </v-chip>
                    </template>

                    <template #loading>
                        <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import type { Department } from "~/types"

const HEADERS = [
    { title: "Title", key: "title", value: "title" },
    { title: "Code", key: "code", value: "code" },
    {
        title: "Staff Count",
        key: "staff_count",
        value: "staff_count",
    },
    {
        title: "Courses Count",
        key: "course_count",
        value: "course_count",
    },
]

const configs = useRuntimeConfig()
const { add: addNotification } = useNotification()
const { addAction, removeActions } = useNavigation()
const addition = ref({ model: false })
const headingActions: symbol[] = []

onMounted(() => {
    headingActions.push(
        addAction({
            title: "New Department",
            description: "Add an new department",
            icon: "mdi-plus",
            color: "primary",
            action() {
                addition.value.model = true
            },
        })
    )
    headingActions.push(
        addAction({
            title: "Delete",
            description: computed(
                () => `delete the ${selectedDepartments.value.length} departments`
            ),
            icon: "mdi-delete",
            color: "error",
            hidden: computed(() => selectedDepartments.value.length < 1),
            action() {
                deletion.value.model = true
            },
        })
    )
})

onUnmounted(() => {
    try {
        removeActions(headingActions)
    } catch (error) {
        console.log("Error rmoving actions")
        console.log(error)
    }
})

const selectedDepartments = ref<Array<number>>([])
const { data: departments, pending: pendingDepartments } = useFetch<Array<Department>>(
    "/departments/",
    {
        baseURL: configs.public.baseURL,
        default() {
            return []
        },
    }
)

function onSave(department: Department) {
    departments.value.push(department)
    addition.value.model = false
    addNotification({
        text: `${department.title} was added Successfully`,
        icon: "mdi-check-all",
        color: "teal",
        closable: true,
        action(closeCallback) {
            closeCallback()
        },
    })
}

const deletion = ref({ model: false, pending: false })

async function onDelete() {
    if (selectedDepartments.value.length < 1) return

    try {
        deletion.value.pending = true
        await $fetch("/courses/multiple_delete/", {
            baseURL: configs.public.baseURL,
            method: "DELETE",
            body: selectedDepartments.value,
        })

        departments.value = departments.value.filter((department) => {
            return !selectedDepartments.value.includes(department.pk)
        })
        useNotification().add({
            text: `Successfully deleted ${selectedDepartments.value.length} departments`,
            icon: "mdi-delete",
            color: "teal",
            action: (event) => event(),
        })
        selectedDepartments.value = []
    } catch (error) {
        console.log({ error })
    } finally {
        deletion.value.pending = false
        deletion.value.model = false
    }
}
</script>
