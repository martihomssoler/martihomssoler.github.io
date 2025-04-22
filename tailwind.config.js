const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./templates/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", ...fontFamily.sans],
        firaCode: ["FiraCode", ...fontFamily.mono],
      },
    },
    colors: {
      'c00': "rgba(var(--c00))",
      'c01': "rgba(var(--c01))",
      'c02': "rgba(var(--c02))",
      'c03': "rgba(var(--c03))",
      'c04': "rgba(var(--c04))",
      'c05': "rgba(var(--c05))",
      'c06': "rgba(var(--c06))",
      'c07': "rgba(var(--c07))",
      'c08': "rgba(var(--c08))",
      'c09': "rgba(var(--c09))",
      'c0a': "rgba(var(--c0a))",
      'c0b': "rgba(var(--c0b))",
      'c0c': "rgba(var(--c0c))",
      'c0d': "rgba(var(--c0d))",
      'c0e': "rgba(var(--c0e))",
      'c0f': "rgba(var(--c0f))",
    },
  }, 
  plugins: [],
}

