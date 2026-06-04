# Perimetre MVP GymFlow

## Objectif

Permettre a une salle de sport de remplacer son cahier papier par GymFlow en moins d'une journee d'utilisation.

Le MVP doit etre rapide, fiable et utilisable sur telephone, tablette et ordinateur.

## Utilisateurs

### Gerant

Le gerant configure la salle, cree les formules, ajoute les membres, vend ou renouvelle les abonnements, consulte les revenus et supervise l'activite.

### Operateur

L'operateur gere le pointage quotidien, recherche les membres, ajoute rapidement un nouveau membre et encaisse les abonnements.

## Inclus dans la V1

- Authentification email/mot de passe avec Supabase Auth
- Creation d'une salle lors du premier onboarding
- Roles `admin` et `operator`
- Liste des membres
- Creation, modification et archivage d'un membre
- Recherche par nom, telephone ou numero membre
- Types d'abonnement configurables:
  - duree en jours
  - nombre de seances optionnel
  - prix
- Attribution d'un abonnement a un membre
- Renouvellement rapide depuis la fiche membre
- Check-in manuel par recherche
- Validation automatique de l'abonnement actif
- Decompte automatique des seances restantes
- Blocage visuel si abonnement expire
- Alerte visuelle si 1 ou 2 seances restantes
- Journal des entrees du jour
- Dashboard simple:
  - revenus du jour
  - entrees du jour
  - membres actifs
  - abonnements expires ou bientot expires

## Hors MVP

- Paiement SaaS Stripe
- Boutique produits
- QR code
- SMS et WhatsApp
- Import CSV
- Rapports PDF
- Exports Excel
- Mode offline
- Multi-salles avance
- Abonnements famille
- Gel d'abonnement

## Definition de fini

Le MVP est considere comme fini quand un gerant peut:

1. creer son compte;
2. creer sa salle;
3. creer ses formules d'abonnement;
4. enregistrer ses membres;
5. attribuer ou renouveler un abonnement;
6. pointer les arrivees chaque jour;
7. voir les revenus et alertes essentiels.

