// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"
// eslint-disable-next-line no-undef
export default defineNuxtConfig({
    devtools: { enabled: true },
    runtimeConfig: {
        public: {
            baseURL: "http://localhost:8000/api",
        },
    },
    build: {
        transpile: ["vuetify"],
    },
    modules: [
        // "@nuxtjs/eslint-module",
        (_options, nuxt) => {
            nuxt.hooks.hook("vite:extendConfig", (config) => {
                // @ts-expect-error the re is
                config.plugins.push(vuetify({ autoImport: true }))
            })
        },
        //...
    ],
    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
    },
    css: ["~/assets/css/main.css"],
})
