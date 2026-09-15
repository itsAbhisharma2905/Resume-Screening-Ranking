export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080a0c",
        graphite: "#11161a",
        elevated: "#171d22",
        glass: "rgba(20, 26, 31, 0.72)",
        mist: "#eef3f5",
        line: "rgba(255, 255, 255, 0.10)",
        muted: "#71808f",
        teal: "#69ebe4",
        cyan: "#69ebe4",
        success: "#69e3a7",
        amber: "#f2b36f",
        warning: "#f2b36f",
        coral: "#ef7185",
        error: "#ef7185"
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter var", "Inter", "DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.035)",
        ambient: "0 16px 42px rgba(0, 0, 0, 0.18)",
        glow: "0 0 32px rgba(105, 235, 228, 0.16)"
      }
    }
  },
  plugins: []
};
