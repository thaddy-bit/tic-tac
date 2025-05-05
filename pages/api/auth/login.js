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
      { expiresIn: "1d" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 jours
    };

    res.setHeader("Set-Cookie", serialize("token", token, cookieOptions));

     // 5. Réponse avec les infos nécessaires
     return res.status(200).json({
      message: "Connexion réussie",
      role: user.role, // Renvoyé au frontend
      user: {
        id: user.id,
        email: user.email
      }
    });


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}