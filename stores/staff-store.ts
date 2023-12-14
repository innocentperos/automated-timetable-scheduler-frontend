import type { Staff } from "~/types"

export const useStaffStore = defineStore("staff-store", () => {
    const _staffs = ref<{ [pk: number]: Staff }>({})

    function insert(staffs: Staff[]) {
        staffs.forEach((staff) => (_staffs.value[staff.pk] = staff))
    }

    function remove(staffs: number[]) {
        staffs.forEach((staff) => {
            if (staff in _staffs.value) {
                delete _staffs.value[staff]
            }
        })
    }

    function all() {
        return computed(() => Object.values<Staff>(_staffs.value))
    }

    return {
        insert,
        remove,
        all,
    }
})
