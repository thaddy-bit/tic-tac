import { serialize } from "cookie";

export default function handler(req, res) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: -1 // ⚡ Expire immédiatement
  };

  res.setHeader("Set-Cookie", serialize("token", "", cookieOptions));
  res.status(200).json({ message: "Déconnecté avec succès" });
}