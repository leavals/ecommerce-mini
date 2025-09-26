/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",
          500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81"
        },
        accent: { 500:"#f43f5e", 600:"#e11d48" }
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(99,102,241,0.25)"
      }
    }
  },
  plugins: []
};
