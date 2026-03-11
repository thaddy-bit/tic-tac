import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    await prisma.automobile.delete({
      where: { id: idNum },
    });
    res.status(200).json({ message: 'Automobile deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Automobile non trouvée' });
    console.error('Error deleting automobile:', error);
    res.status(500).json({ message: 'Error deleting automobile' });
  }
}
