export const getPanier = () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('panier') || '[]');
    }
    return [];
  };
  
  export const addToPanier = (produit) => {
    const panier = getPanier();
    const exist = panier.find((p) => p.id === produit.id);
    if (exist) {
      exist.quantite += 1;
    } else {
      panier.push({ ...produit, quantite: 1 });
    }
    localStorage.setItem('panier', JSON.stringify(panier));
  };
  
  export const clearPanier = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('panier');
    }
  }; 
  
  export const getPanierCount = () => {
    if (typeof window !== 'undefined') {
      const panier = JSON.parse(localStorage.getItem('panier') || '[]');
      return panier.reduce((acc, item) => acc + item.quantite, 0);
    }
    return 0;
  };
  