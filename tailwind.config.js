/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 ต้องเป็นแบบนี้เป๊ะๆ ครับ เพื่อให้มันหาไฟล์ .jsx เจอ
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}