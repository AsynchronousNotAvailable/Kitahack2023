/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./index.html",
        "./node_modules/tw-elements-react/dist/js/**/*.js",
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ["poppins", "sans-serif"],
            },
            colors: {
                primary: "#f4fffa",
                secondary: "#61BBBF",
            },
            fontWeight: {
                special: "700",
            },
        },
    },
    darkMode: "class",
    plugins: [require("tw-elements-react/dist/plugin.cjs")],
};