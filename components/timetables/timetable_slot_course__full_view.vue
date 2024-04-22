<template>
    <v-badge
        :color="slotCourse.complain_count > 0 ? 'amber' : 'transparent'"
        :class="{ fullWidth: fullWidth }"
    >
        <v-card
            :key="slotCourse.pk"
            :color="errorColor"
            class="border border-primary rounded-md pa-2 mb-auto course-card"
            
        >
            <span class="d-flex flex-column pa-1 text-subtitle-1">
                <div class="d-flex">
                    <v-tooltip>
                        <template #activator="{ props: _courseprops }">
                            <span v-bind="_courseprops">{{ slotCourse.course.code }} </span>
                        </template>
                        {{ slotCourse.course.title }}
                    </v-tooltip>
                </div>
                <lazy-ui-is-authenticated :user-type="['admin', 'staff']"
                    ><span class="text-subtitle-2">
                        {{ slotCourse.course.student_count }} Students
                    </span>
                    <v-tooltip text="supervisor" class="mr-auto">
                        <template #activator="{ props: supervisorProps }">
                            <v-chip
                                v-bind="supervisorProps"
                                variant="tonal"
                                size="small"
                                class="ma-1 ml-0 mr-auto"
                            >
                                <template #prepend>
                                    <v-avatar class="mr-2" color="white">
                                        <v-icon>mdi-account</v-icon>
                                    </v-avatar>
                                </template>
                                {{ slotCourse.supervisor.name }}
                            </v-chip>
                        </template>
                    </v-tooltip>
                </lazy-ui-is-authenticated>
            </span>

            <v-divider></v-divider>
            <span class="d-block pa-2 text-subtitle-2">venues</span>
            <v-tooltip :key="venue.pk" v-for="venue in venues" :text="venue.title">
                <template #activator="{ props: toolProps }">
                    <v-chip
                        v-bind="toolProps"
                        close-icon="mdi-chat"
                        variant="tonal"
                        size="small"
                        class="ma-1 ml-0"
                    >
                        {{ venue.code }}
                    </v-chip>
                </template>
            </v-tooltip>
            <v-chip
                v-if="slotCourse.venues.length > 2 && !fullVenue"
                variant="tonal"
                class="ma-1 ml-0"
                @click="fullVenue = true"
            >
                +{{ slotCourse.venues.length - 2 }}
                More
            </v-chip>

            <lazy-ui-is-authenticated :user-type="['admin', 'staff']">
                <v-divider class="mt-2"></v-divider>

                <span class="d-block pa-2 text-subtitle-2">invigilators</span>
                <v-tooltip :key="invigilator.pk" v-for="invigilator in invigilators">
                    Invigilator ({{ invigilator.department.title }})
                    <template #activator="{ props: _props2 }">
                        <v-chip
                            v-bind="_props2"
                            close-icon="mdi-chat"
                            variant="tonal"
                            class="ma-1 ml-0"
                            size="small"
                        >
                            <template #prepend>
                                <v-avatar class="mr-2" color="white">
                                    <v-icon>mdi-account</v-icon>
                                </v-avatar>
                            </template>
                            {{ invigilator.name }}
                        </v-chip>
                    </template>
                </v-tooltip>
                <v-chip
                    v-if="slotCourse.invigilators.length > 2 && !fullInvigilator"
                    close-icon="mdi-chat"
                    variant="tonal"
                    size="small"
                    class="ma-1 ml-0"
                    @click="fullInvigilator = true"
                >
                    +{{ slotCourse.venues.length - 2 }}
                    More
                </v-chip>
            </lazy-ui-is-authenticated>
        </v-card>
    </v-badge>
</template>

<style scoped>
.course-card {
    background: rgb(12, 4, 45);
    border-radius: 8px;
    color: white;
}
.course-card.report {
    background: rgb(2, 41, 18);
}

.course-card.report.deselected {
    background: rgba(35, 35, 35, 0.986);
}

.error {
    background: rgb(37, 8, 0) !important;
}

.warning {
    background: rgb(115, 69, 1) !important;
}
.fullWidth {
    width: 100%;
}
.relative {
    position: relative;
}
</style>

<script setup lang="ts">
import type { SlotCourse } from "~/typing/timetable"

const props = defineProps<{
    slotCourse: SlotCourse
    errorColor?: string
    fullWidth?: boolean
}>()

const fullVenue = ref(false)
const fullInvigilator = ref(false)

const invigilators = computed(() => {
    if (fullInvigilator.value == true) {
        return props.slotCourse.invigilators
    } else if (props.slotCourse.invigilators.length > 2) {
        return props.slotCourse.invigilators.slice(0, 2)
    }
    return props.slotCourse.invigilators
})

const venues = computed(() => {
    if (fullInvigilator.value == true) {
        return props.slotCourse.venues
    } else if (props.slotCourse.venues.length > 2) {
        return props.slotCourse.venues.slice(0, 2)
    }
    return props.slotCourse.venues
})
</script>
