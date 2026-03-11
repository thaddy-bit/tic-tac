import { mkdir, rename } from "fs/promises";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const formidable = (await import("formidable")).default;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    await mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024,
      filter: (part) => !!(part.mimetype && part.mimetype.startsWith("image/")),
    });

    const [, files] = await form.parse(req);
    const file = files?.logo?.[0] ?? files?.file?.[0];

    if (!file?.filepath) {
      return res.status(400).json({ message: "Aucun fichier image envoyé ou type non autorisé (PNG, JPG, etc.)." });
    }

    const ext = path.extname(file.originalFilename || "") || ".png";
    const safeName = `logo_${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, safeName);

    await rename(file.filepath, destPath);

    return res.status(200).json({ url: `/uploads/logos/${safeName}` });
  } catch (err) {
    console.error("Erreur upload logo:", err);
    return res.status(500).json({ message: err.message || "Erreur lors de l'upload." });
  }
}
