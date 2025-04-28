import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { pool } from "@/lib/db"; // <-- adapte avec ta connexion MySQL

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    // Comparer le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }    

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    };

    res.setHeader("Set-Cookie", serialize("token", token, cookieOptions));

    return res.status(200).json({ message: "Connexion réussie" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}