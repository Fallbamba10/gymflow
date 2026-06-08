# Checklist lancement GymFlow

## Technique

- [ ] Executer `supabase/schema.sql`
- [ ] Executer `supabase/team-management.sql`
- [ ] Executer `supabase/public-pages.sql`
- [ ] Executer `supabase/walk-in-sessions.sql`
- [ ] Configurer `NEXT_PUBLIC_SUPABASE_URL` dans Vercel
- [ ] Configurer `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Vercel
- [ ] Configurer `NEXT_PUBLIC_SITE_URL` dans Vercel
- [ ] Configurer Supabase Auth Site URL
- [ ] Configurer Supabase Auth Redirect URLs
- [ ] Verifier `npm run typecheck`
- [ ] Verifier `npm run lint`
- [ ] Verifier `npm run build`

## Test terrain

- [ ] Creer une salle
- [ ] Completer telephone et adresse
- [ ] Creer 2 ou 3 formules
- [ ] Creer 5 membres reels ou tests
- [ ] Creer un employe connecte avec le role `operator`
- [ ] Tester l'espace employe simplifie
- [ ] Tester un pointage membre
- [ ] Tester deux pointages le meme jour pour le meme membre
- [ ] Tester une seance simple sans abonnement
- [ ] Verifier que la seance simple apparait dans le journal du jour
- [ ] Verifier que la seance simple apparait dans la caisse
- [ ] Tester un renouvellement
- [ ] Tester un paiement manuel
- [ ] Ouvrir et imprimer un recu
- [ ] Exporter les membres CSV
- [ ] Exporter la caisse CSV
- [ ] Exporter la sauvegarde JSON
- [ ] Ouvrir la vitrine `/g/[id]`

## Roles

- [ ] Le compte admin voit Parametres, Equipe et Abonnements
- [ ] Le compte operateur ne voit pas Parametres, Equipe et Abonnements
- [ ] Le compte operateur voit seulement Dashboard et Pointage dans le menu
- [ ] Le compte operateur arrive sur l'espace employe simplifie
- [ ] Le compte operateur peut pointer un membre et encaisser une seance simple

## Avant client

- [ ] Remplacer l'URL Vercel par le domaine final
- [ ] Verifier favicon et logo
- [ ] Verifier les textes de la page publique
- [ ] Verifier le lien public `/g/[id]`
- [ ] Verifier les boutons principaux sur mobile
- [ ] Faire une sauvegarde JSON apres configuration
