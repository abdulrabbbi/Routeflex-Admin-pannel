
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      screens: {
        xs: "320px",
        sm: "480px",
        md: "768px",
        lg: "976px",
        xl: "1440px",
        xxl: "1700px",
      },

      colors: {
        TWSiteBackground: '#fff',
        TWTextGrayColor: '#919191',
        TWPrimaryColor: '#FF8238',
        TWDarkBlue: '#3C3C43'
      },

      animation: {
        'spin-slow': "spin 3s linear infinite",
      },

      boxShadow: {
        'cardShadow': '0px 4px 32px 0px rgba(0, 0, 0, 0.1)',  

      },

      fontFamily: {

        PoppinsRegular: ['Poppins-Regular', 'sans-serif'],
        PoppinsMedium: ['Poppins-Medium', 'sans-serif'],
        PoppinsSemiBold: ['Poppins-SemiBold', 'sans-serif'],
        PoppinsBold: ['Poppins-Bold', 'sans-serif'],
      },

      fontWeight: {
        thin: "100",
        light: "300",
        regular: "400",
        medium: "500",
        bold: "700",
        extrabold: "800",
        black: "900",
      },


    },
  },
  plugins: [],
};
