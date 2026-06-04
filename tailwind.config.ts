import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#F7F7F2",
        line: "#D8D8CF",
        mint: "#1E8A6A",
        amber: "#D7932F",
        danger: "#C43B35",
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 23, 23, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

