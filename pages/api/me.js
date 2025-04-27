import { withSessionRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

async function handler(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Non connecté" });
  }

  res.status(200).json({ user: req.session.user });
}

export default withSessionRoute(handler); // ✅
