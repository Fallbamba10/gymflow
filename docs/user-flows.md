# Parcours utilisateur MVP

## 1. Onboarding gerant

1. Le gerant cree un compte.
2. Il renseigne le nom de la salle, la devise et le telephone.
3. GymFlow cree automatiquement son role `admin`.
4. Il arrive sur le dashboard vide avec une action principale: creer une formule d'abonnement.

## 2. Creation des formules

1. Le gerant ouvre les parametres d'abonnements.
2. Il cree une formule, par exemple:
   - Mensuel illimite: 30 jours, prix 15000 F CFA
   - 10 seances: 60 jours, 10 seances, prix 12000 F CFA
3. Ces formules deviennent disponibles lors de l'ajout ou du renouvellement d'un membre.

## 3. Ajout membre

1. L'operateur clique sur ajouter un membre.
2. Il renseigne nom, telephone et optionnellement des notes.
3. Il choisit une formule d'abonnement.
4. GymFlow cree le membre, cree l'abonnement actif et enregistre un paiement.

## 4. Check-in

1. L'operateur recherche un membre par nom, telephone ou numero.
2. GymFlow affiche son statut:
   - actif
   - expire
   - bientot expire
   - seances faibles
3. L'operateur valide l'entree.
4. GymFlow enregistre le check-in.
5. Si l'abonnement est a seances, GymFlow decremente `sessions_left`.

## 5. Renouvellement

1. Le gerant ouvre la fiche membre.
2. Il clique sur renouveler.
3. Il choisit une formule, une date de debut et le mode de paiement.
4. GymFlow archive implicitement l'ancien abonnement comme historique et cree le nouveau.

## 6. Dashboard quotidien

1. Le gerant arrive sur le dashboard.
2. Il voit les indicateurs du jour:
   - revenus
   - entrees
   - nouveaux membres
   - abonnements a traiter
3. Il peut ouvrir les alertes pour renouveler rapidement.

