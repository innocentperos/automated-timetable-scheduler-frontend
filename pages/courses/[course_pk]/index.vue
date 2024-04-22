<template>
    <v-overlay v-model="loadingCourse" class="d-flex justify-center align-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    <v-container v-if="course">
        <v-row>
            <v-col class="d-flex flex-column">
                <span class="text-h4">{{ course.title }}</span>
                <span class="ma-4">{{ course.code }}</span>
            </v-col>
            <v-divider></v-divider>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
const currentRoute = router.currentRoute

onBeforeMount(() => {
    try {
        const pk = parseInt(currentRoute.value.params["course_pk"] as string)
        if (!pk) {
            useRouter().replace({
                name: "courses",
            })
        }
        return true
    } catch (errr) {
        useRouter().replace({
            name: "courses",
        })
    }
})

const coursePk = computed<number>(() =>
    Number.parseInt(currentRoute.value.params["course_pk"] as string)
)
const courseStore = useCourseStore()
const { pending: loadingCourse, data: course } = courseStore.get(coursePk.value)
</script>
