<template>
    <v-container>
        <v-row>
            <v-col v-for="link in LINKS" :key="link.link">
                <NuxtLink :to="link.link">
                    <v-card class="aspect-square">
                        <v-card-text>
                            {{ link.title }}
                        </v-card-text>
                    </v-card>
                </NuxtLink>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
const LINKS = [
    { title: "Departments", link: "/departments/" },
    { title: "Courses", link: "/courses/" },
    { title: "Venues", link: "/venues/" },
]
</script>
