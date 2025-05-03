import cookieSession from 'cookie-session';

const sessionMiddleware = cookieSession({
  name: 'session',
  keys: ['votre-cle-secrete-a-remplacer'],
  maxAge: 5 * 60 * 1000,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, sessionMiddleware);

    // Lire l'état de validation
    const isValidated = req.session.validated || false;

    return res.status(200).json({ validated: isValidated });
  } catch (error) {
    console.error("Erreur dans /api/me :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}