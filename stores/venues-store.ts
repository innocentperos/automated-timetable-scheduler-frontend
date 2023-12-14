import type { Venue } from "~/types"

export const useVenueStore = defineStore("venue-store", () => {
    const _venues = ref<{ [pk: number]: Venue }>({})
    const configs = useRuntimeConfig()

    function insert(venue: Venue) {
        _venues.value[venue.pk] = venue
    }

    async function $insert(venue: Omit<Venue, "pk" | "category"> & { category: number }) {
        const v = await $fetch<Venue>("/venues/", {
            baseURL: configs.public.baseURL,
            method: "POST",
            body: {
                title: venue.title,
                code: venue.code,
                capacity: venue.capacity,
                category: venue.capacity,
            },
        })
        insert(v)
        return computed(() => _venues.value[v.pk])
    }

    function retrieve(pk: number): ComputedRef<Venue | null> {
        return computed(() => _venues.value[pk])
    }

    async function $retrieve(pk: number) {
        const v = await $fetch<Venue>(`/venues/${pk}/`, {
            baseURL: configs.public.baseURL,
            method: "POST",
        })
        insert(v)
        return computed(() => _venues.value[v.pk])
    }

    return {
        insert,
        $insert,
        retrieve,
        $retrieve,
    }
})
