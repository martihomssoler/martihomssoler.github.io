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
      colors: {
        'c00': "rgb(var(--c00))",
        'c01': "rgb(var(--c01))",
        'c02': "rgb(var(--c02))",
        'c03': "rgb(var(--c03))",
        'c04': "rgb(var(--c04))",
        'c05': "rgb(var(--c05))",
        'c06': "rgb(var(--c06))",
        'c07': "rgb(var(--c07))",
        'c08': "rgb(var(--c08))",
        'c09': "rgb(var(--c09))",
        'c0a': "rgb(var(--c0a))",
        'c0b': "rgb(var(--c0b))",
        'c0c': "rgb(var(--c0c))",
        'c0d': "rgb(var(--c0d))",
        'c0e': "rgb(var(--c0e))",
        'c0f': "rgb(var(--c0f))",
      },
    },
  }, 
  plugins: [],
}

