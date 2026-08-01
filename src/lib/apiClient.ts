import { client } from "@ntq/sdk"

client.setConfig({
    baseURL: import.meta.env.VITE_API_URL,
})  