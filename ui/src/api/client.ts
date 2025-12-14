import axios from 'axios'

export const api = axios.create({
    baseURL: '/api', // proxytud Vite kaudu
    headers: { 'Content-Type': 'application/json' },
})
