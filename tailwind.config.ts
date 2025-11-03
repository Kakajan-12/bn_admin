import type { Config } from "tailwindcss"
import daisyui from "daisyui"

interface DaisyConfig extends Config {
    daisyui?: {
        themes?: string[] | false
        darkTheme?: string
    }
}

const config: DaisyConfig = {
    darkMode: false,
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [daisyui],
    daisyui: {
        themes: ["light"], // ✅ только светлая тема
    },
}

export default config
