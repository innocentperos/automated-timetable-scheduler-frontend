<template>
    <v-row>
        <v-col>
            <v-data-table
                :headers="HEADERS"
                :items="staffs"
                show-select
                v-model="selectedStaffs"
                item-value="pk"
                :loading="pending"
            >
                <template #top>
                    <div class="d-flex pa-8">
                        <span class="text-h6 text-uppercase">Department Staff</span>
                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-refresh" color="primary" @click="refresh"></v-btn>
                    </div>
                </template>

                <!-- <template #item.departments="{ value }">
                        <v-chip v-for="staff in value" :key="staff.pk" class="ml-1" color="teal">
                            {{ staff.staff_id }}
                        </v-chip>
                    </template> -->

                <template #loading>
                    <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                </template>
            </v-data-table>

            <v-dialog v-model="deleteDialog" max-width="500px" transition="dialog-transition">
                <v-card>
                    <v-card-title primary-title class="pa-4"> Are you sure? </v-card-title>
                    <v-card-text>
                        You are about to delete the {{ selectedCourses.length }} selected staffs
                    </v-card-text>
                    <v-card-actions class="pa-4">
                        <v-btn @click="onDelete" color="error" variant="elevated">
                            Yes, delete
                        </v-btn>
                        <v-btn class="ml-2" @click="deleteDialog = false">No, Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Staff } from "~/types"

const HEADERS = [
    { title: "Name", key: "name", value: "name" },
    { title: "Staff Id", key: "staff_id", value: "staff_id" },
    {
        title: "Supervisor",
        key: "can_supervise",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (staff: any) => ((staff as Staff).can_supervise ? "Yes" : "No"),
    },
    {
        title: "Invigilator",
        key: "can_invigilate",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (staff: any) => ((staff as Staff).can_invigilate ? "Yes" : "No"),
    },
]

const props = defineProps<{ departmentPk: number; active: boolean }>()
const selectedStaffs = ref<Array<number>>([])
const {
    data: staffs,
    pending,
    refresh,
} = useFetch<Staff[]>(`/departments/${props.departmentPk}/staffs/`, {
    baseURL: useRuntimeConfig().public.baseURL,
    headers: useFetchHeader([]),
    retry: 5,
    retryDelay: 300,
    default() {
        return []
    },
})

let actions: symbol[] = []
onMounted(() => {
    actions = useNavigation().addActions([
        {
            title: "Delete",
            icon: "mdi-delete",
            color: "error",
            action() {},
            hidden: computed(() => {
                if (!useUser().isAdmin.value) return true
                return !props.active || selectedStaffs.value.length < 1
            }),
        },
    ])
})
onUnmounted(() => {
    actions.forEach(useNotification().remove)
})

const deleteDialog = ref(false)
const deleting = ref(false)
async function onDelete() {
    if (selectedStaffs.value.length < 1) return

    try {
        deleting.value = true
        await $fetch("/stafffs/multiple_delete/", {
            baseURL: useRuntimeConfig().public.baseURL,
            method: "DELETE",
            body: selectedStaffs.value,
            headers: useFetchHeader([]),
        })

        staffs.value = staffs.value.filter((staff) => {
            return !selectedStaffs.value.includes(staff.pk)
        })

        useNotification().add({
            text: `Successfully deleted ${selectedStaffs.value.length} courses`,
            icon: "mdi-delete",
            color: "teal",
            action: (event) => event(),
        })

        selectedStaffs.value = []
    } catch (error) {
        console.log({ error })
    } finally {
        deleting.value = false
        deleteDialog.value = false
    }
}
</script>
