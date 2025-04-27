// lib/session.js
export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "monapp_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};