-- Désactive les contraintes FK le temps du DROP
SET FOREIGN_KEY_CHECKS = 0;

-- Supprime toutes les tables (ordre adapté aux FK)
DROP TABLE IF EXISTS commande_details;
DROP TABLE IF EXISTS commandes;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS code_validation;
DROP TABLE IF EXISTS medicaments;
DROP TABLE IF EXISTS produits;
DROP TABLE IF EXISTS agences;
DROP TABLE IF EXISTS pharmacies;
DROP TABLE IF EXISTS automobile;
DROP TABLE IF EXISTS chauffeur;
DROP TABLE IF EXISTS villes;
DROP TABLE IF EXISTS pays;

-- Réactive les contraintes
SET FOREIGN_KEY_CHECKS = 1;
