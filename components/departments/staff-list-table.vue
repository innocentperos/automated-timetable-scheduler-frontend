<template>
    <v-row>
        <v-col>
            <v-data-table
                :headers="HEADERS"
                :items="departmentStaff"
                show-select
                v-model="selectedStaffs"
                item-value="pk"
            >
                <template #top>
                    <v-row justify="center">
                        <v-col><span class="text-h6 text-uppercase">Department Staff</span></v-col>
                    </v-row>
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

const props = defineProps<{ departmentPk: number }>()

const departmentStore = useDepartmentStore()
const department = departmentStore.retrieve(props.departmentPk)

const selectedStaffs = ref<Array<number>>([])
const staffStore = useStaffStore()
const staffs = staffStore.all()
const departmentStaffsPk = departmentStore.staffs(department.value.pk)
const departmentStaff = computed(() => {
    return staffs.value.filter((staff) => departmentStaffsPk.value.includes(staff.pk))
})
</script>
