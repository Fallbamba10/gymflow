# Checklist lancement GymFlow

## Technique

- [x] Executer `supabase/schema.sql`
- [x] Executer `supabase/team-management.sql`
- [x] Executer `supabase/public-pages.sql`
- [x] Executer `supabase/walk-in-sessions.sql`
- [x] Executer `supabase/intech.sql`
- [x] Configurer `NEXT_PUBLIC_SUPABASE_URL` dans Vercel
- [x] Configurer `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Vercel
- [x] Configurer `NEXT_PUBLIC_SITE_URL` dans Vercel (https://gymflow-ten-tan.vercel.app)
- [x] Configurer `INTECH_API_KEY` dans Vercel
- [x] Configurer Supabase Auth Site URL → https://gymflow-ten-tan.vercel.app
- [x] Configurer Supabase Auth Redirect URLs → https://gymflow-ten-tan.vercel.app/**
- [x] Verifier `npm run typecheck`
- [x] Verifier `npm run lint`
- [x] Verifier `npm run build`

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
- [ ] Tester un renouvellement cash
- [ ] Tester un renouvellement Wave via Intech
- [ ] Tester un renouvellement Orange Money via Intech
- [ ] Tester un paiement manuel
- [ ] Ouvrir et imprimer un recu
- [ ] Exporter les membres CSV
- [ ] Exporter la caisse CSV
- [ ] Exporter la sauvegarde JSON
- [ ] Ouvrir la vitrine `/g/[id]`
- [ ] Tester un cours collectif : creer, planifier une seance, inscrire un membre, pointer

## Roles

- [ ] Le compte admin voit Parametres, Equipe et Abonnements
- [ ] Le compte operateur ne voit pas Parametres, Equipe et Abonnements
- [ ] Le compte operateur voit seulement Dashboard et Pointage dans le menu
- [ ] Le compte operateur arrive sur l'espace employe simplifie
- [ ] Le compte operateur peut pointer un membre et encaisser une seance simple

## Avant client

- [ ] Remplacer l'URL Vercel par le domaine final (ou garder gymflow-ten-tan.vercel.app)
- [ ] Verifier favicon et logo
- [ ] Verifier les textes de la page publique `/site`
- [ ] Verifier le lien public `/g/[id]`
- [ ] Verifier les boutons principaux sur mobile (Chrome DevTools iPhone 14)
- [ ] Faire une sauvegarde JSON apres configuration
