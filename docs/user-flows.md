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
4. Le gerant peut desactiver une formule sans casser l'historique.
5. Le gerant peut reactiver une formule desactivee.

## 3. Ajout membre

1. L'operateur clique sur ajouter un membre.
2. Il renseigne nom, telephone et optionnellement des notes.
3. Il choisit une formule d'abonnement.
4. GymFlow cree le membre, cree l'abonnement actif et enregistre un paiement.
5. Si un employe PIN est choisi, GymFlow attribue l'encaissement a cet employe.

## 4. Check-in

1. L'operateur recherche un membre par nom, telephone ou numero.
2. GymFlow affiche son statut:
   - actif
   - expire
   - bientot expire
   - seances faibles
3. L'operateur valide l'entree avec ou sans PIN employe.
4. GymFlow enregistre le check-in.
5. Si l'abonnement est a seances, GymFlow decremente `sessions_left`.
6. Un membre peut etre pointe plusieurs fois dans la meme journee, par exemple matin et soir.

## 5. Renouvellement

1. Le gerant ou l'operateur ouvre la fiche membre.
2. Il clique sur renouveler.
3. Il choisit une formule et le mode de paiement.
4. GymFlow archive implicitement l'ancien abonnement comme historique et cree le nouveau.
5. Le paiement peut etre attribue a un employe PIN.

## 6. Dashboard quotidien

1. Le gerant arrive sur le dashboard.
2. Il voit les indicateurs du jour:
   - revenus
   - entrees
   - nouveaux membres
   - abonnements a traiter
3. Il peut ouvrir les alertes pour renouveler rapidement.

## 7. Caisse et recus

1. L'equipe ouvre la caisse.
2. Elle filtre les paiements par periode, moyen ou recherche.
3. Elle ajoute un paiement manuel si besoin.
4. Elle ouvre un recu et l'imprime.
5. Elle exporte la caisse en CSV.

## 8. Equipe et roles

1. L'admin ajoute des comptes connectes par email ou des employes PIN.
2. Il choisit le role admin ou operateur.
3. Les operateurs gardent acces aux flux terrain.
4. Les admins gardent acces aux zones sensibles: equipe, parametres, abonnements.

## 9. Vitrine publique

1. L'admin complete telephone et adresse dans les parametres.
2. Il ouvre le lien `Vitrine salle`.
3. La page publique affiche les formules actives, l'adresse et le telephone.
