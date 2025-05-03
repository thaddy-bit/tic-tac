export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "token", // ou ce que tu utilises
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};