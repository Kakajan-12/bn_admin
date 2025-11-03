import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: false,
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["light"],
    },
}

export default config
