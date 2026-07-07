import React, { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import {
  Home, Search, Plus, MessageCircle, User, Heart, ChevronLeft, ShieldCheck,
  Truck, Star, MapPin, Camera, BadgeCheck, Send, Bell, SlidersHorizontal,
  Wallet, X, Check, Banknote, Package, Globe, Sparkles, Loader2, Store, Zap,
  Video, HeartHandshake, QrCode, Phone, Navigation, Lock, AlertTriangle,
  CheckCircle2, ArrowLeft, Timer, Share2, Smartphone, CreditCard, Clock
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* BALI v3 — le souk dans ta poche.                                    */
/* Annonce IA réelle · Points hanout · Score acheteur · Mode Sadaqa    */
/* ------------------------------------------------------------------ */

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@500;700;800&family=Noto+Sans+Tifinagh&display=swap');
    .font-display { font-family: 'Unbounded', 'Tajawal', 'Noto Sans Tifinagh', system-ui, sans-serif; }
    .font-app { font-family: 'Plus Jakarta Sans', 'Tajawal', 'Noto Sans Tifinagh', system-ui, sans-serif; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes scanmove { 0% { top: 10%; } 50% { top: 86%; } 100% { top: 10%; } }
    .scanline { animation: scanmove 2.2s ease-in-out infinite; }

    /* ===== Design System v1 — moteur global ===== */
    * { -webkit-tap-highlight-color: transparent; }
    body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }

    /* Motion : transitions cohérentes partout, discrètes (150ms ease-out) */
    button, a { transition: transform .15s ease-out, background-color .15s ease-out, color .15s ease-out, opacity .15s ease-out, border-color .15s ease-out; }

    /* Accessibilité : focus clavier visible (WCAG) */
    button:focus-visible, a:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; border-radius: 12px; }
    input:focus-visible, textarea:focus-visible { outline: none; }

    /* Feuilles du bas : glissement doux · voiles : fondu */
    @keyframes baliUp { from { transform: translateY(24px); opacity: .6; } to { transform: translateY(0); opacity: 1; } }
    @keyframes baliFade { from { opacity: 0; } to { opacity: 1; } }
    div[class*="rounded-t-3xl"] { animation: baliUp .22s ease-out; }
    div[class*="fixed"][class*="bg-black/"] { animation: baliFade .18s ease-out; }

    /* Respect des préférences de mouvement réduit (WCAG) */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
    }
  `}</style>
);

const Star8 = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0l2.3 6.1 6.1-2.5-2.5 6.1L24 12l-6.1 2.3 2.5 6.1-6.1-2.5L12 24l-2.3-6.1-6.1 2.5 2.5-6.1L0 12l6.1-2.3-2.5-6.1 6.1 2.5L12 0z" />
  </svg>
);

/* QR dynamique — régénéré côté serveur toutes les 60 s en production */
const QRCodeSVG = ({ seed, size = 172 }) => {
  const N = 25;
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 131 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  const finderDark = (r, c) => {
    const fr = r >= N - 7 ? r - (N - 7) : r;
    const fc = c >= N - 7 ? c - (N - 7) : c;
    return fr === 0 || fr === 6 || fc === 0 || fc === 6 || (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4);
  };
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const dark = inFinder(r, c) ? finderDark(r, c) : rnd() < 0.45;
      if (dark) cells.push(r + "-" + c);
    }
  }
  return (
    <svg viewBox={"0 0 " + N + " " + N} width={size} height={size} shapeRendering="crispEdges">
      <rect width={N} height={N} fill="white" />
      {cells.map((k) => {
        const [r, c] = k.split("-").map(Number);
        return <rect key={k} x={c} y={r} width={1} height={1} fill="#1c1917" />;
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* LANGUES                                                             */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  { flag: "🇲🇦", code: "+212", name: "Maroc", len: 9, ph: "6 12 34 56 78" },
  { flag: "🇫🇷", code: "+33", name: "France", len: 9, ph: "6 12 34 56 78" },
  { flag: "🇪🇸", code: "+34", name: "Espagne", len: 9, ph: "612 34 56 78" },
  { flag: "🇧🇪", code: "+32", name: "Belgique", len: 9, ph: "470 12 34 56" },
  { flag: "🇮🇹", code: "+39", name: "Italie", len: 10, ph: "312 345 6789" },
  { flag: "🇳🇱", code: "+31", name: "Pays-Bas", len: 9, ph: "6 12345678" },
  { flag: "🇩🇪", code: "+49", name: "Allemagne", len: 11, ph: "1512 3456789" },
  { flag: "🇬🇧", code: "+44", name: "Royaume-Uni", len: 10, ph: "7400 123456" },
  { flag: "🇺🇸", code: "+1", name: "USA / Canada", len: 10, ph: "555 123 4567" },
  { flag: "🇦🇪", code: "+971", name: "Émirats", len: 9, ph: "50 123 4567" },
];

const LANGS = [
  { id: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { id: "dar", name: "الدارجة المغربية", flag: "🇲🇦", dir: "rtl" },
  { id: "ar", name: "العربية", flag: "ع", dir: "rtl" },
  { id: "zgh", name: "ⵜⴰⵎⴰⵣⵉⵖⵜ", flag: "ⵣ", dir: "ltr", beta: true },
  { id: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { id: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
];

const T = {
  fr: {
    nav_home: "Accueil", nav_explore: "Explorer", nav_sell: "Vendre", nav_msg: "Messages", nav_profile: "Profil",
    search_ph: "Caftan, iPhone, Air Force…", banner1: "Vide ton armoire, remplis ton portefeuille",
    banner2: "0% commission vendeur · Retrait au hanout du quartier 🇲🇦", selection: "Sélection du jour",
    f_all: "Tout", f_sneakers: "Sneakers", f_tech: "Tech", f_femmes: "Femmes", f_hommes: "Hommes", f_trad: "Traditionnel",
    explore: "Explorer", search_on: "Rechercher sur bali…", trends: "TENDANCES 🔥", categories: "CATÉGORIES",
    cat_femmes: "Femmes", cat_hommes: "Hommes", cat_enfants: "Enfants", cat_sneakers: "Sneakers",
    cat_tech: "Tech", cat_maison: "Maison", cat_trad: "Traditionnel", cat_sport: "Sport",
    sell_title: "Vendre un article", sell_sub: "Gratuit. Tu reçois 100% du prix de vente.",
    add_photo: "Ajouter", title_ph: "Titre — ex : Sneakers Adidas Samba 41",
    desc_ph: "Description — état, taille, détails…",
    cat_label: "CATÉGORIE", cond_label: "ÉTAT", price_label: "PRIX",
    conds: ["Neuf avec étiquette", "Comme neuf", "Très bon état", "Bon état"],
    scats: ["Femmes", "Hommes", "Enfants", "Tech", "Maison", "Traditionnel"],
    you_receive: "Tu reçois", buyer_pays: "L'acheteur paie {x} DH (protection bali incluse)", publish: "Publier l'article",
    messages: "Messages", write_msg: "Écris un message…",
    offer_label: "Offre de prix", accept: "Accepter", counter: "Contre-offre", accepted: "Offre acceptée",
    waiting: "En attente de réponse…", buy: "Acheter", make_offer: "Faire une offre",
    negotiate: "Négocie le prix 🤝", listed: "Prix affiché", your_price: "Ton prix", send_offer: "Envoyer l'offre",
    cod: "Paiement à la livraison", protection: "Protection bali",
    how_title: "Comment ça marche",
    how_text: "Tu commandes → le vendeur expédie sous 3 jours → tu paies à la livraison ou en ligne → bali libère l'argent au vendeur une fois l'article conforme. Zéro arnaque.",
    wach: "Wach mazal ? 👀", with_prot: "avec protection", prot_incl: "protection incluse", sales_w: "ventes",
    member: "Membre depuis 2026", wallet: "PORTEFEUILLE BALI", transfer: "Virer vers ma banque",
    dressing: "Mon dressing", sell_new: "Vendre un nouvel article",
    s_sales: "Ventes", s_followers: "Abonnés", s_favs: "Favoris",
    language: "Langue", choose_lang: "Choisis ta langue", beta: "bêta", logout: "Se déconnecter", logout_done: "Déconnecté ✅",
    msgs_none: "Aucune conversation — fais une offre sur un article !", parcourir: "Parcourir", wallet_soon: "🔜 Virement bancaire — arrive avec le paiement réel", link_copied: "🔗 Lien copié !", nf_sale: "💰 Nouvelle vente ! Dépose « {t} » au point bali", nf_pickup: "📦 « {t} » — colis en chemin vers ton point bali", nf_msg: "💬 Conversation avec {n}", my_favs: "Mes favoris", seller_empty: "Ce vendeur n'a plus d'article en ligne", login_first: "Connecte-toi pour suivre", cant_follow_self: "Tu ne peux pas te suivre toi-même 😄", t_unfollowed: "Tu ne suis plus {n}", following_btn: "Abonné", follow_demo: "Vendeur de démonstration", followers_w: "abonnés", relay_title: "Point bali", relay_verified: "Point vérifié", relay_reliable: "fiabilité", relay_dist: "Distance", relay_map_soon: "Carte interactive bientôt", relay_call: "Appeler le point", relay_note: "Inspecte ton colis sur place avant de valider le retrait", relay_see: "Voir la fiche du point", no_notifs: "Aucune notification pour l'instant", nf_new_listing: "🆕 {n} a mis un article en vente", nf_offer: "💰 Nouvelle offre : {x} DH", nf_new_msg: "💬 Nouveau message", nf_dropped: "📦 Ton colis est en route vers le point bali", nf_handed: "✅ Colis remis — transaction terminée", nf_paid_seller: "🎉 Vendu et payé ! Ton colis a été remis", remove_photo: "Supprimer la photo", cam_start: "Activer la caméra", cam_stop: "Arrêter", cam_hint: "Vise le QR code du client", cam_denied: "Autorisation caméra refusée", cam_error: "Impossible d'ouvrir la caméra", qr_detected: "✅ QR détecté !", back: "Retour", pg_real_gains: "MES GAINS RÉELS", pg_delivered: "colis remis", pg_handled: "colis gérés", pg_real_note: "4 DH par colis remis · calculé sur tes vraies remises", pg_demo_zone: "aperçu démo — sera branché au réel", badge_inspect: "Inspection au point bali avant de payer le vendeur", g_mode: "Mode & vêtements", g_chauss: "Chaussures", g_beaute: "Beauté & parfums", g_tech: "High-tech", g_enfants: "Enfants & jouets", g_maison: "Maison", g_sport: "Sport", g_loisirs: "Loisirs", g_autres: "Autres marques", g_lettres: "Tailles vêtements", g_tailles_num: "Tailles pantalons", g_pointures: "Pointures", g_ages: "Âges enfants", brand_search: "Rechercher une marque", badge_refund: "Remboursé à 100% si non conforme", ai_flow: "📸 Photo → ✍️ Titre rédigé → 💰 Prix estimé", fiab_note: "Calculé sur tes retraits validés au point bali", r_item: "Article", r_deliv: "Livraison", voir_tout: "Voir tout", cat_livres: "Livres & médias", cat_loisirs: "Loisirs & collections", empty_cat: "Aucun article ici pour l'instant", empty_cat_cta: "Sois le premier à vendre ici", own_item: "C'est ton annonce", delete_item: "Supprimer l'annonce", deleted_ok: "Annonce supprimée ✅",
    real_order_title: "Commande confirmée 🎉", real_pin_note: "Ton code retrait — note-le bien, il ne sera plus affiché en clair.",
    filters_title: "Filtres", filter_cat: "Catégorie", filter_brand: "Marque", filter_size: "Taille",
    filter_cond: "État", filter_price: "Prix (DH)", filter_sort: "Trier par",
    sort_recent: "Plus récent", sort_price_asc: "Prix croissant", sort_price_desc: "Prix décroissant", sort_popular: "Plus populaire",
    filter_reset: "Réinitialiser", filter_apply: "Voir les {n} articles",
    price_min_ph: "Min", price_max_ph: "Max", sum_all: "Tous", chip_sort: "Trier",
    real_order_ok: "J'ai noté mon code ✓", my_orders: "Mes commandes", no_orders: "Aucune commande pour le moment", admin_panel: "Admin bali", adm_stats: "Chiffres", adm_mod: "Modération",
    adm_users: "Membres", adm_items: "Annonces", adm_active: "Actives", adm_orders: "Commandes", adm_gmv: "Volume total", adm_rev: "Revenu protection", adm_held: "Sous séquestre", adm_done: "Terminées", adm_remove: "Retirer", adm_recent_orders: "Dernières commandes",
    tab_buys: "Mes achats", tab_sells: "Mes ventes", no_buys: "Aucun achat pour le moment", no_sells: "Aucune vente pour le moment",
    role_buy: "Achat", role_sell: "Vente", other_buyer: "Acheteur", other_seller: "Vendeur",
    st_paid: "Payée · à déposer", st_dropped: "Déposée au point bali", st_transit: "En chemin", st_ready: "À retirer", st_done: "Terminée", st_sold: "Vendu",
    deposit_cta: "Déposer au point bali", deposit_done: "Colis déposé ✅ — l'acheteur est prévenu",
    hverif_title: "Remettre un colis", hverif_sub: "Saisis le code commande + le code PIN du client",
    hverif_code: "Code commande (BAL-...)", hverif_pin: "Code PIN du client (4 chiffres)",
    hverif_btn: "Vérifier et remettre", hverif_ok: "✅ Code correct — colis remis au client !",
    hverif_bad: "❌ Code PIN incorrect — ne remets pas le colis", hverif_notfound: "Commande introuvable ou déjà remise",
    hverif_wrongstatus: "Ce colis n'est pas encore prêt à être remis", real_parcels: "Colis réels de bali", p_to_receive: "À réceptionner (dépôt vendeur)", p_to_handover: "À remettre au client", p_demo: "démo", p_none: "Aucun colis réel en circulation pour l'instant",
    sale_new_banner: "🎉 Nouvelle vente ! Dépose le colis au point bali", to_deposit: "à déposer",
    order_pin_hidden: "Code masqué pour ta sécurité",
    t_msg_sent: "Message envoyé à {n}", t_offer_sent: "Sahiti ! Offre de {x} DH envoyée ✅",
    t_accepted: "Offre acceptée — safi, c'est vendu ! 🎉", t_published: "Sahiti ! « {t} » est en ligne 🎉",
    t_order: "Commande simulée — paiement à la livraison ✅", t_need: "Ajoute un titre et un prix 🙂",
    ai_cta1: "Annonce IA", ai_cta2: "Prends une photo — l'IA écrit l'annonce et estime le prix du marché",
    ai_btn: "Créer avec l'IA", ai_loading: "L'IA analyse ta photo…",
    ai_sub_loading: "Détection de l'article · estimation du prix marché marocain",
    ai_done: "Annonce générée ✨ Vérifie et ajuste", ai_error: "L'IA n'a pas pu analyser la photo — réessaie ou remplis à la main",
    ai_invalid: "Photo non reconnue comme un article vendable — essaie un autre angle",
    ai_sugg: "Prix suggéré par l'IA", ai_range: "Fourchette marché",
    delivery_label: "LIVRAISON", d_point: "Point bali · Hanout Al Amal (650 m)",
    d_home: "Domicile · Amana", d_express: "Express · Cathedis",
    sadaqa: "Mode Sadaqa 🤲", sadaqa_sub: "Le montant de la vente est reversé à une association",
    sadaqa_on: "Tu donnes {x} DH à l'association partenaire 🤲",
    b_score: "Fiabilité acheteur", b_refus: "0 colis refusé",
    b_trust: "Les vendeurs te font confiance — tes offres passent en priorité",
    video_b: "Emballage filmé", total_w: "Total",
    ticket_title: "Ticket de retrait", my_order: "Ma commande",
    order_ready: "Ton colis est arrivé au point relais 🎉",
    order_confirm_prompt: "Colis retiré — confirme la réception 👇",
    view_ticket: "Voir mon ticket", show_pin: "Afficher le PIN", hide_pin: "Masquer le PIN",
    pin_warn: "Ne partage jamais ce code. Seul le hanoutier te le demandera, en main propre au moment de la remise.",
    cod_pay: "À payer au retrait", qr_regen: "Nouveau QR dans {s} s", single_use: "usage unique",
    point_relay: "Point relais", route: "Itinéraire", call_w: "Appeler",
    tl_ordered: "Commandée", tl_dropped: "Déposée par le vendeur", tl_transit: "En transit",
    tl_arrived: "Arrivée au point relais", tl_picked: "Retirée",
    pickup_by: "À retirer avant le {d} — sinon retour au vendeur",
    secu_line: "Remise sécurisée : QR dynamique · code PIN · scan géolocalisé",
    try_partner: "Tester côté hanoutier (démo)",
    confirm_q: "Article conforme ?", confirm_ok: "Oui — libérer le paiement", confirm_ko: "Signaler un problème",
    funds_ok: "Paiement libéré au vendeur ✅ Merci !",
    funds_frozen: "Fonds gelés. Notre équipe te contacte sous 24 h.",
    check_title: "bali Check ✅", check_l1: "IMEI vérifié auprès des opérateurs", check_l2: "Non déclaré volé · facture contrôlée",
    imei_label: "IMEI (vérification anti-vol automatique)", imei_ph: "Tape *#06# sur le téléphone",
    inspect_title: "Inspecte avant de confirmer", insp_1: "L'article correspond aux photos",
    insp_2: "Il fonctionne / bon état général", insp_3: "Taille et modèle corrects",
    inspect_hint: "Fais-le au hanout avant de partir — le paiement n'est libéré qu'après ta confirmation.",
    discreet: "Mode Discret 🔒", discreet_sub: "Nom et photo masqués. Contact uniquement via la messagerie bali.",
    discreet_badge: "Profil discret",
    pay_title: "bali Pay", recharge: "Recharger en espèces",
    cashin_txt: "Recharge chez plus de 4 000 agents partenaires (Cash Plus, Wafacash, Barid Cash) ou par carte — crédité instantanément. Sans compte bancaire.",
    cote_line: "Cote bali · basée sur {n} ventes similaires au Maroc",
    share_toast: "Lien de l'annonce copié — partage-le sur WhatsApp 📲",
    trust_title: "Garanties & aide humaine",
    trust_help_sub: "Réponse en moins de 2 h · darija, français, arabe · 7 j/7",
    trust_agent: "Amina · Support bali · en ligne",
    trust_whatsapp: "Continuer sur WhatsApp",
    trust_toast: "Ouverture de WhatsApp 📲 (démo)",
    g1: "Un humain te répond en moins de 2 h — jamais de robot en boucle.",
    g2: "Litige tranché en 72 h max, sur preuves : vidéo d'emballage + inspection au retrait.",
    g3: "Vendeur ET acheteur protégés — la chaîne de responsabilité désigne le maillon fautif.",
    g4: "Zéro frais caché : tout est affiché avant de payer.",
    g5: "Aucun compte bloqué sans examen humain et droit de réponse.",
    results_w: "{n} résultats", no_results: "Aucun résultat pour « {q} »",
    try_else: "Essaie un autre mot-clé ou explore les catégories 👇",
    follow: "Suivre", t_followed: "Tu suis {n} ✅", items_w: "articles",
    ob_continue: "Continuer", ob_skip: "Passer",
    ob_title2: "Le souk dans ta poche",
    ob_v1: "0% commission vendeur — tu gardes 100% du prix",
    ob_v2: "Paiement 100% sécurisé · retrait au hanout du quartier",
    ob_v3: "Acheteur et vendeur protégés — un humain répond en 2 h",
    ob_phone: "Ton numéro de téléphone", ob_send: "Recevoir le code SMS",
    ob_code: "Entre le code reçu par SMS", ob_hint: "Démo : n'importe quel code à 4 chiffres",
    ob_done: "Marhba bik f bali ! 🎉",
    notifs_title: "Notifications",
    n1: "💰 Salma.R propose 800 DH pour le caftan · il y a 5 min",
    n2: "📦 Ta commande BAL-7F2K9 est arrivée au point relais · il y a 2 h",
    n3: "❤️ L'iPhone 12 que tu suis a baissé à 3 800 DH · il y a 6 h",
    n4: "👤 Imane_Tng suit ton dressing · hier",
    checkout_title: "Confirmer la commande", pay_method: "PAIEMENT",
    pm_card: "Carte bancaire · CMI", pm_wallet: "Solde bali Pay · 340 DH",
    insufficient: "Solde insuffisant", confirm_order: "Confirmer la commande ✅",
    t_paid: "Paiement accepté — commande confirmée ✅",
    pm_pickup: "Paie au retrait · dans l'app, après inspection",
    tsbiq: "Acompte de réservation",
    tsbiq_waived: "0 DH — ton score fiabilité 98% t'en dispense",
    tsbiq_new: "Les nouveaux comptes réservent avec 20% d'acompte",
    reserve_note: "Le vendeur n'expédie qu'après ta réservation. Pas venu sous 7 jours ? Retour gratuit pour lui, indemnisé par l'acompte — et ton score baisse.",
    no_cash_hanout: "Le hanoutier ne touche jamais d'argent : tout passe par l'app.",
    pay_release: "Payer {x} DH — libérer le vendeur ✅",
    seller_guar_t: "Garantie vendeur",
    seller_guar: "Si l'acheteur ne vient pas retirer : retour gratuit + indemnité prélevée sur son acompte. Tu ne perds jamais un dirham.",
    t_reserved: "Réservation confirmée ✅ Le vendeur peut expédier 📦",
    gift_title: "Cadeau de bienvenue", gift_claim: "J'en profite 🎉",
    synopsis_title: "Comment ça marche",
    syn_buy: "🛒 Pour acheter", syn_sell: "💰 Pour vendre",
    syn_b1: "Trouve un article et paie en sécurité", syn_b2: "Récupère-le au hanout de ton quartier", syn_b3: "Inspecte-le : payé au vendeur que si tout est bon",
    syn_s1: "Photographie ton article, l'IA écrit l'annonce", syn_s2: "Vendu ? Dépose le colis au hanout", syn_s3: "Reçois ton argent, 0% commission",
    syn_start: "C'est parti ! 🎉",
    gift_text: "−20 DH sur ta première commande, appliqués automatiquement au paiement.",
    gift_applied: "Code MARHBA20 activé — −20 DH sur ta 1ère commande ✅",
    deals_title: "⚡ Deals du jour", ends_in: "Se termine dans {t}",
    viewers_line: "{n} personnes regardent cet article en ce moment",
    hot_badge: "Très demandé",
    s1: "Commande", s2: "Retire au hanout", s3: "Inspecte & récupère",
    become_point: "Devenir point bali 🏪", become_sub: "Gagne 4 à 5 DH par colis · zéro espèces à gérer",
    paid_t: "Déjà payé", paid_sub: "Ton argent est sécurisé chez bali. Le vendeur n'est payé qu'après ton inspection au retrait.",
    no_card: "Pas de carte bancaire ?",
    opt_cash: "Recharger en espèces chez un agent (Cash Plus, Wafacash…) — article réservé 48 h",
    opt_khel: "Khellesli — un proche paie pour toi, par lien WhatsApp",
    khel_toast: "Lien de paiement envoyé sur WhatsApp 📲 (démo)",
    d_amana_point: "Amana (Poste) → ton point bali · inspection au retrait",
    d_amana_home: "Amana (Poste) → domicile",
    d_express_far: "Express Cathedis → domicile",
    reco: "Recommandé",
    smart_route: "Trajet optimisé automatiquement · {a} ↔ {b}",
    far_protect: "Longue distance : colis assuré — vendeur remboursé à 100% si perte du transporteur.",
    eta_tmw: "demain", eta_12: "1-2 j", eta_today: "aujourd'hui", eta_24: "2-4 j", eta_2448: "24-48 h",
    sale_card_todo: "Vendu ! Dépose ton colis 📦", sale_card_done: "Colis déposé — en route 🚚",
    deposit_title: "Dépôt du colis",
    dep_status_todo: "À déposer", dep_status_ok: "Déposé ✅",
    dep_show: "Montre ce QR au hanoutier — il scanne et prend la garde du colis.",
    dep_before: "Dépose avant le {d} — sinon la vente est annulée et l'acheteur remboursé",
    dep_tip1: "Emballe bien (sachet + scotch)", dep_tip2: "Filme l'emballage 🎥 — ta preuve en cas de litige",
    dep_tip3: "Écris le code {c} sur le colis",
    dep_btn: "Simuler le dépôt au hanout (démo)",
    dep_done_note: "Garde transférée au hanout ✅ En route vers {n}",
    after_insp: "versés sur ton solde après l'inspection de l'acheteur · 0% commission",
    tl_sold: "Vendu 🎉", tl_paid2: "Argent versé",
  },
  dar: {
    nav_home: "الرئيسية", nav_explore: "قلّب", nav_sell: "بيع", nav_msg: "الميساجات", nav_profile: "البروفيل",
    search_ph: "قفطان، آيفون، سبرديلة…", banner1: "خوّي الخزانة ديالك وعمّر الجيب",
    banner2: "0% كوميسيون على البائع · جيب السلعة من حانوت الحي 🇲🇦", selection: "اختيارات اليوم",
    f_all: "كلشي", f_sneakers: "سبرديلات", f_tech: "تيك", f_femmes: "نساء", f_hommes: "رجال", f_trad: "تقليدي",
    explore: "قلّب", search_on: "قلّب ف bali…", trends: "اللي طالع 🔥", categories: "الفئات",
    cat_femmes: "نساء", cat_hommes: "رجال", cat_enfants: "دراري", cat_sneakers: "سبرديلات",
    cat_tech: "تيك", cat_maison: "دار", cat_trad: "تقليدي", cat_sport: "سبور",
    sell_title: "بيع شي حاجة", sell_sub: "فابور. كتاخد 100% ديال الثمن.",
    add_photo: "زيد", title_ph: "العنوان — مثلا: سبرديلة أديداس 41",
    desc_ph: "الوصف — الحالة، القياس، التفاصيل…",
    cat_label: "الفئة", cond_label: "الحالة", price_label: "الثمن",
    conds: ["جديدة بالتيكي", "بحال جديدة", "مزيانة بزاف", "مزيانة"],
    scats: ["نساء", "رجال", "دراري", "تيك", "دار", "تقليدي"],
    you_receive: "كتاخد", buyer_pays: "الشاري كيخلص {x} درهم (الحماية ديال bali داخلة)", publish: "نشر",
    messages: "الميساجات", write_msg: "كتب ميساج…",
    offer_label: "عرض ديال الثمن", accept: "قبل", counter: "عرض آخر", accepted: "تقبل العرض",
    waiting: "كنتسناو الجواب…", buy: "شري", make_offer: "دير عرض",
    negotiate: "تفاوض على الثمن 🤝", listed: "الثمن المعروض", your_price: "الثمن ديالك", send_offer: "صيفط العرض",
    cod: "الخلاص عند التسليم", protection: "حماية bali",
    how_title: "كيفاش خدامة",
    how_text: "كتكوموندي ← البائع كيصيفط ف 3 أيام ← كتخلص عند التسليم ولا أونلاين ← bali كيحوّل الفلوس للبائع ملي توصلك السلعة مزيانة. والو نصب.",
    wach: "واش مازال؟ 👀", with_prot: "مع الحماية", prot_incl: "الحماية داخلة", sales_w: "بيعات",
    member: "عضو من 2026", wallet: "البزطام ديال BALI", transfer: "حوّل للبانكة",
    dressing: "الدريسينڭ ديالي", sell_new: "بيع حاجة جديدة",
    s_sales: "بيعات", s_followers: "متابعين", s_favs: "مفضلات",
    language: "اللغة", choose_lang: "ختار اللغة ديالك", beta: "بيطا", logout: "خرج من الكونط", logout_done: "تخرجتي ✅",
    msgs_none: "ما كاين حتى محادثة — دير عرض على شي سلعة!", parcourir: "تصفح", wallet_soon: "🔜 التحويل البنكي — جاي مع الخلاص الحقيقي", link_copied: "🔗 تنسخ الرابط!", nf_sale: "💰 بيعة جديدة! سيفط « {t} » للنقطة", nf_pickup: "📦 « {t} » — الكولية فالطريق للنقطة ديالك", nf_msg: "💬 محادثة مع {n}", my_favs: "المفضلات ديالي", seller_empty: "هاد البائع ما بقا عندو حتى سلعة", login_first: "دخل باش تتبع", cant_follow_self: "ما تقدرش تتبع راسك 😄", t_unfollowed: "ما بقيتيش كتتبع {n}", following_btn: "متابَع", follow_demo: "بائع ديمو", followers_w: "متابعين", relay_title: "نقطة بالي", relay_verified: "نقطة موثّقة", relay_reliable: "موثوقية", relay_dist: "المسافة", relay_map_soon: "خريطة تفاعلية قريباً", relay_call: "اتصل بالنقطة", relay_note: "افحص طردك قبل تأكيد الاستلام", relay_see: "عرض بطاقة النقطة", relay_title: "نقطة بالي", relay_verified: "نقطة متحقّقة", relay_reliable: "الثقة", relay_dist: "البُعد", relay_map_soon: "الخريطة قريباً", relay_call: "عيّط للنقطة", relay_note: "عاين الكولية قبل ما تأكد التسلم", relay_see: "شوف بطاقة النقطة", no_notifs: "ما كاين حتى إشعار دابا", nf_new_listing: "🆕 {n} زاد سلعة", nf_offer: "💰 عرض جديد: {x} درهم", nf_new_msg: "💬 رسالة جديدة", nf_dropped: "📦 الكولية ديالك فالطريق للنقطة", nf_handed: "✅ تسلمات الكولية — سالات العملية", nf_paid_seller: "🎉 تباعت وتخلصتي! الكولية تسلمات", remove_photo: "حيد التصويرة", cam_start: "شعل الكاميرا", cam_stop: "وقف", cam_hint: "صوّب على الكود ديال الكليان", cam_denied: "ما سمحتيش للكاميرا", cam_error: "ما قدرناش نحلو الكاميرا", qr_detected: "✅ تلقا الكود!", back: "رجوع", pg_real_gains: "أرباحي الحقيقية", pg_delivered: "طرود سُلّمت", pg_handled: "طرود متداولة", pg_real_note: "4 درهم لكل طرد · محسوب على تسليماتك الحقيقية", pg_demo_zone: "معاينة تجريبية — ستُربط بالبيانات الحقيقية", pg_real_gains: "المداخيل الحقيقية ديالي", pg_delivered: "كوليات تسلمو", pg_handled: "كوليات تدبرو", pg_real_note: "4 درهم لكل كولية · محسوب على التسليمات الحقيقية", pg_demo_zone: "عرض تجريبي — غادي يتربط بالحقيقي", badge_inspect: "عاين السلعة فالحانوت قبل ما يتخلص البائع", g_mode: "الموضة والحوايج", g_chauss: "السبابط", g_beaute: "الجمال والعطور", g_tech: "التكنولوجيا", g_enfants: "الأطفال والألعاب", g_maison: "الدار", g_sport: "الرياضة", g_loisirs: "الهوايات", g_autres: "ماركات أخرى", g_lettres: "قياسات الحوايج", g_tailles_num: "قياسات السراويل", g_pointures: "البوانتير", g_ages: "أعمار الأطفال", brand_search: "قلب على ماركة", badge_refund: "كترجع ليك الفلوس 100% إلا ما كانتش مطابقة", ai_flow: "📸 تصويرة → ✍️ عنوان مكتوب → 💰 ثمن مقترح", fiab_note: "محسوب على التسليمات اللي داز مزيان فالحانوت", r_item: "السلعة", r_deliv: "التوصيل", voir_tout: "شوف كلشي", cat_livres: "كتب وميديا", cat_loisirs: "هوايات ومجموعات", empty_cat: "ما كاين والو هنا دابا", empty_cat_cta: "كون الأول اللي يبيع هنا", own_item: "هادي الإعلان ديالك", delete_item: "حيد الإعلان", deleted_ok: "تحيد الإعلان ✅",
    real_order_title: "تأكدات الطلبية 🎉", real_pin_note: "الكود ديالك ديال التسلم — كتبو مزيان، ما غاديش يبان مرة أخرى.",
    filters_title: "الفلاتر", filter_cat: "الصنف", filter_brand: "الماركة", filter_size: "المقاس",
    filter_cond: "الحالة", filter_price: "الثمن (درهم)", filter_sort: "رتب حسب",
    sort_recent: "الجداد", sort_price_asc: "الثمن : من قل لكبر", sort_price_desc: "الثمن : من كبر لقل", sort_popular: "الأكثر طلب",
    filter_reset: "صيفط", filter_apply: "شوف {n} ديال السلع",
    price_min_ph: "أدنى", price_max_ph: "أقصى", sum_all: "الكل", chip_sort: "رتب",
    real_order_ok: "كتبتو ✓", my_orders: "الطلبيات ديالي", no_orders: "ما كاين حتى طلبية", admin_panel: "أدمين بالي", adm_stats: "الأرقام", adm_mod: "المراقبة",
    adm_users: "الأعضاء", adm_items: "الإعلانات", adm_active: "نشيطة", adm_orders: "الطلبيات", adm_gmv: "المجموع", adm_rev: "مدخول الحماية", adm_held: "محجوز", adm_done: "سالات", adm_remove: "حيد", adm_recent_orders: "آخر الطلبيات",
    tab_buys: "مشترياتي", tab_sells: "مبيعاتي", no_buys: "ما كاين حتى شراء", no_sells: "ما كاين حتى بيعة",
    role_buy: "شراء", role_sell: "بيعة", other_buyer: "الشاري", other_seller: "البائع",
    st_paid: "تخلصات · خاصك تسيفط", st_dropped: "تسيفطات للنقطة", st_transit: "فالطريق", st_ready: "وجدة للتسلم", st_done: "سالات", st_sold: "تباعت",
    deposit_cta: "سيفط الكولية للنقطة", deposit_done: "الكولية تسيفطات ✅ — الشاري تنبه",
    hverif_title: "سلّم كولية", hverif_sub: "دخل كود الطلبية + كود PIN ديال الكليان",
    hverif_code: "كود الطلبية (BAL-...)", hverif_pin: "كود PIN ديال الكليان (4 أرقام)",
    hverif_btn: "تحقق وسلّم", hverif_ok: "✅ الكود صحيح — الكولية تسلّمات للكليان!",
    hverif_bad: "❌ كود PIN غالط — ما تسلّمش الكولية", hverif_notfound: "الطلبية ما لقيناهاش ولا تسلّمات",
    hverif_wrongstatus: "هاد الكولية مازال ماشي وجدة للتسليم", real_parcels: "الكوليات الحقيقية ديال بالي", p_to_receive: "خاصك تستقبل (من البائع)", p_to_handover: "خاصك تسلم للكليان", p_demo: "ديمو", p_none: "ما كاين حتى كولية حقيقية دابا",
    sale_new_banner: "🎉 بيعة جديدة! سيفط الكولية للنقطة", to_deposit: "خاصها تسيفط",
    order_pin_hidden: "الكود مخبي للأمان ديالك",
    t_msg_sent: "تصيفط الميساج ل {n}", t_offer_sent: "صحيتي! تصيفط العرض ديال {x} درهم ✅",
    t_accepted: "تقبل العرض — صافي، تباعت! 🎉", t_published: "صحيتي! « {t} » ولات أونلاين 🎉",
    t_order: "كوموند تجريبية — الخلاص عند التسليم ✅", t_need: "زيد العنوان والثمن 🙂",
    ai_cta1: "إعلان بالـ IA", ai_cta2: "صوّر السلعة — الـ IA يكتب الإعلان ويقدّر ثمن السوق",
    ai_btn: "صاوب بالـ IA", ai_loading: "الـ IA كيحلل التصويرة…",
    ai_sub_loading: "كشف السلعة · تقدير ثمن السوق المغربي",
    ai_done: "تصاوب الإعلان ✨ تأكد وعدّل", ai_error: "الـ IA ماقدرش يحلل التصويرة — عاود ولا عمّر بيدك",
    ai_invalid: "التصويرة ماشي ديال سلعة للبيع — جرب زاوية أخرى",
    ai_sugg: "الثمن اللي اقترح الـ IA", ai_range: "فورشيطة السوق",
    delivery_label: "التوصيل", d_point: "نقطة bali · حانوت الأمل (650 م)",
    d_home: "للدار · أمانة", d_express: "إكسبريس · كاتيديس",
    sadaqa: "وضع الصدقة 🤲", sadaqa_sub: "فلوس البيعة كيمشيو لجمعية خيرية",
    sadaqa_on: "غادي تعطي {x} درهم للجمعية 🤲",
    b_score: "موثوقية الشاري", b_refus: "0 كوليات مرفوضة",
    b_trust: "الباعة كيتيقو فيك — العروض ديالك كتدوز الأولى",
    video_b: "التغليف مصوّر", total_w: "المجموع",
    ticket_title: "تيكي ديال الاستلام", my_order: "الطلبية ديالي",
    order_ready: "الكولية ديالك وصلات لنقطة bali 🎉",
    order_confirm_prompt: "خديتي الكولية — أكّد الاستلام 👇",
    view_ticket: "شوف التيكي", show_pin: "بيّن الكود", hide_pin: "خبّي الكود",
    pin_warn: "ما تعطي هاد الكود لحتى واحد. غير مول الحانوت اللي غادي يطلبو منك وجها لوجه فاش تاخد الكولية.",
    cod_pay: "تخلص فاش تاخد", qr_regen: "QR جديد ف {s} ثانية", single_use: "استعمال واحد",
    point_relay: "نقطة الاستلام", route: "الطريق", call_w: "عيّط",
    tl_ordered: "تطلبات", tl_dropped: "حطّها البائع", tl_transit: "ف الطريق",
    tl_arrived: "وصلات للنقطة", tl_picked: "تخدات",
    pickup_by: "خودها قبل {d} — ولا غادي ترجع للبائع",
    secu_line: "تسليم مأمّن: QR متجدد · كود PIN · سكان بالموقع",
    try_partner: "جرّب الجيهة ديال مول الحانوت (ديمو)",
    confirm_q: "السلعة مزيانة؟", confirm_ok: "آه — سرّح الفلوس", confirm_ko: "بلّغ على مشكل",
    funds_ok: "تسرّحو الفلوس للبائع ✅ شكرا!",
    funds_frozen: "الفلوس محبوسة. الفريق غادي يتواصل معاك ف 24 ساعة.",
    check_title: "bali Check ✅", check_l1: "IMEI متأكد منو عند الأوبيراتورات", check_l2: "ماشي مسروق · الفاكتورة متأكدة",
    imei_label: "IMEI (تأكد أوتوماتيكي ضد السرقة)", imei_ph: "دير *#06# ف التيليفون",
    inspect_title: "عاين قبل ما تأكد", insp_1: "السلعة بحال التصاور",
    insp_2: "خدامة / حالة مزيانة", insp_3: "القياس والموديل صحاح",
    inspect_hint: "دير هادشي ف الحانوت قبل ما تخرج — الفلوس ما كيتسرحو غير من بعد التأكيد ديالك.",
    discreet: "الوضع الخفي 🔒", discreet_sub: "السمية والتصويرة مخبيين. التواصل غير عبر ميساجات bali.",
    discreet_badge: "بروفيل خفي",
    pay_title: "bali Pay", recharge: "عمّر بالفلوس",
    cashin_txt: "عمّر عند أكثر من 4000 وكيل شريك (كاش بلوس، وفاكاش، بريد كاش) ولا بالكارطة — كيتعمر دغيا. بلا حساب بنكي.",
    cote_line: "كوط bali · مبنية على {n} بيعة بحالها ف المغرب",
    share_toast: "تكوبيا الرابط — شاركو ف الواتساب 📲",
    trust_title: "الضمانات والمساعدة الآدمية",
    trust_help_sub: "الجواب ف أقل من ساعتين · بالدارجة والفرنسية والعربية · 7/7",
    trust_agent: "أمينة · دعم bali · متصلة",
    trust_whatsapp: "كمّل ف الواتساب",
    trust_toast: "الواتساب كيتحل 📲 (ديمو)",
    g1: "بنادم حقيقي كيجاوبك ف أقل من ساعتين — ماشي روبو كيعاود نفس الهضرة.",
    g2: "النزاع كيتفصل ف 72 ساعة على الأكثر، بالحجة: فيديو التغليف + المعاينة فاش كتاخد.",
    g3: "البائع والشاري بجوج محميين — سلسلة المسؤولية كتبين شكون غلط.",
    g4: "والو مصاريف مخبية: كلشي مبين قبل ما تخلص.",
    g5: "حتى كونط ما كيتبلوكا بلا مراجعة آدمية وحق الجواب.",
    results_w: "{n} نتيجة", no_results: "ما لقينا والو على « {q} »",
    try_else: "جرب كلمة أخرى ولا قلب ف الفئات 👇",
    follow: "تابع", t_followed: "راك كتبع {n} ✅", items_w: "سلعة",
    ob_continue: "كمل", ob_skip: "دوز",
    ob_title2: "السوق ف جيبك",
    ob_v1: "0% كوميسيون على البائع — كتاخد 100% ديال الثمن",
    ob_v2: "الخلاص مأمن 100% · جيب السلعة من حانوت الحي",
    ob_v3: "الشاري والبائع محميين — بنادم كيجاوب ف ساعتين",
    ob_phone: "رقم التيليفون ديالك", ob_send: "توصل بكود SMS",
    ob_code: "دخل الكود اللي وصلك", ob_hint: "ديمو: أي كود ب 4 أرقام",
    ob_done: "مرحبا بيك ف bali! 🎉",
    notifs_title: "الإشعارات",
    n1: "💰 Salma.R عرضات 800 درهم على القفطان · هادي 5 دقايق",
    n2: "📦 الطلبية BAL-7F2K9 وصلات لنقطة الاستلام · هادي ساعتين",
    n3: "❤️ الآيفون 12 اللي كتبع نقص ل 3800 درهم · هادي 6 سوايع",
    n4: "👤 Imane_Tng ولات كتبع الدريسينڭ ديالك · البارح",
    checkout_title: "أكد الطلبية", pay_method: "الخلاص",
    pm_card: "الكارطة البنكية · CMI", pm_wallet: "رصيد bali Pay · 340 درهم",
    insufficient: "الرصيد ما كافيش", confirm_order: "أكد الطلبية ✅",
    t_paid: "تقبل الخلاص — تأكدات الطلبية ✅",
    pm_pickup: "خلص فاش تاخد · ف الأبليكاسيون، من بعد المعاينة",
    tsbiq: "التسبيق ديال الحجز",
    tsbiq_waived: "0 درهم — السكور ديالك 98% كيعفيك منو",
    tsbiq_new: "الكونطات الجداد كيحجزو ب 20% تسبيق",
    reserve_note: "البائع ما كيصيفطش حتى تأكد الحجز ديالك. ما جيتيش ف 7 أيام؟ الرجوع فابور ليه، معوض من التسبيق — والسكور ديالك كينقص.",
    no_cash_hanout: "مول الحانوت عمرو ما كيشد الفلوس: كلشي كيدوز من الأبليكاسيون.",
    pay_release: "خلص {x} درهم — سرح البائع ✅",
    seller_guar_t: "ضمانة البائع",
    seller_guar: "إلا ما جاش الشاري ياخد السلعة: الرجوع فابور + تعويض من التسبيق ديالو. عمرك ما كتخسر درهم.",
    t_reserved: "تأكد الحجز ✅ البائع يقدر يصيفط 📦",
    gift_title: "هدية الترحيب", gift_claim: "نستافد 🎉",
    synopsis_title: "كيفاش خدامة",
    syn_buy: "🛒 باش تشري", syn_sell: "💰 باش تبيع",
    syn_b1: "لقا السلعة وخلص بأمان", syn_b2: "خودها من حانوت الحي ديالك", syn_b3: "عاينها: البائع كيتخلص غير إلا كلشي مزيان",
    syn_s1: "صوّر السلعة، الـ IA كيكتب الإعلان", syn_s2: "تباعت؟ حط الكولية ف الحانوت", syn_s3: "خود فلوسك، 0% كوميسيون",
    syn_start: "يالله نبداو! 🎉",
    gift_text: "−20 درهم على أول طلبية ديالك، كيتحسبو أوتوماتيكيا فاش كتخلص.",
    gift_applied: "تفعّل الكود MARHBA20 — ناقص 20 درهم على أول طلبية ✅",
    deals_title: "⚡ ديلات اليوم", ends_in: "كيسالي ف {t}",
    viewers_line: "{n} ديال الناس كيشوفو هاد السلعة دابا",
    hot_badge: "مطلوبة بزاف",
    s1: "كوموندي", s2: "خود من الحانوت", s3: "عاين وخود",
    become_point: "ولي نقطة bali 🏪", become_sub: "ربح 4-5 دراهم على كل كولية · بلا ما تشد الفلوس",
    paid_t: "خالص", paid_sub: "الفلوس ديالك محفوظين عند bali. البائع ما كيتخلصش حتى تعاين السلعة فاش تاخدها.",
    no_card: "ما عندكش الكارطة البنكية؟",
    opt_cash: "عمّر بالفلوس عند وكيل (كاش بلوس، وفاكاش…) — السلعة محجوزة 48 ساعة",
    opt_khel: "خلّصلي — شي قريب يخلص عليك، برابط واتساب",
    khel_toast: "تصيفط رابط الخلاص ف الواتساب 📲 (ديمو)",
    d_amana_point: "أمانة (البوسطة) → نقطة bali ديالك · المعاينة فاش تاخد",
    d_amana_home: "أمانة (البوسطة) → للدار",
    d_express_far: "إكسبريس كاتيديس → للدار",
    reco: "اللي ننصحو بيه",
    smart_route: "الطريق تختار أوتوماتيكيا · {a} ↔ {b}",
    far_protect: "مسافة بعيدة: الكولية مأمنة — البائع كيتعوض 100% إلا ضاعت عند الناقل.",
    eta_tmw: "غدا", eta_12: "1-2 أيام", eta_today: "اليوم", eta_24: "2-4 أيام", eta_2448: "24-48 ساعة",
    sale_card_todo: "تباعت! حط الكولية 📦", sale_card_done: "الكولية تحطات — ف الطريق 🚚",
    deposit_title: "إيداع الكولية",
    dep_status_todo: "خاصها تتحط", dep_status_ok: "تحطات ✅",
    dep_show: "ورّي هاد الـ QR لمول الحانوت — كيسكاني وكياخد الكولية ف عهدتو.",
    dep_before: "حطها قبل {d} — ولا البيعة كتلغى والشاري كيتعوض",
    dep_tip1: "غلّفها مزيان (ميكة + سكوتش)", dep_tip2: "صوّر التغليف 🎥 — الحجة ديالك إلا وقع مشكل",
    dep_tip3: "كتب الكود {c} على الكولية",
    dep_btn: "جرّب الإيداع ف الحانوت (ديمو)",
    dep_done_note: "العهدة تحولات للحانوت ✅ ف الطريق ل {n}",
    after_insp: "كيتحطو ف الرصيد ديالك من بعد معاينة الشاري · 0% كوميسيون",
    tl_sold: "تباعت 🎉", tl_paid2: "الفلوس توصلو",
  },
  ar: {
    relay_title: "نقطة بالي", relay_verified: "نقطة موثّقة", relay_reliable: "موثوقية", relay_dist: "المسافة", relay_map_soon: "خريطة تفاعلية قريباً", relay_call: "اتصل بالنقطة", relay_note: "افحص طردك قبل تأكيد الاستلام", relay_see: "عرض بطاقة النقطة",
    pg_real_gains: "أرباحي الحقيقية", pg_delivered: "طرود سُلّمت", pg_handled: "طرود متداولة", pg_real_note: "4 درهم لكل طرد · محسوب على تسليماتك الحقيقية", pg_demo_zone: "معاينة تجريبية — ستُربط بالحقيقي",
    nav_home: "الرئيسية", nav_explore: "استكشف", nav_sell: "بيع", nav_msg: "الرسائل", nav_profile: "حسابي",
    search_ph: "قفطان، آيفون، حذاء رياضي…", banner1: "أفرغ خزانتك واملأ محفظتك",
    banner2: "0% عمولة على البائع · الاستلام من حانوت الحي 🇲🇦", selection: "اختيارات اليوم",
    f_all: "الكل", f_sneakers: "أحذية", f_tech: "إلكترونيات", f_femmes: "نساء", f_hommes: "رجال", f_trad: "تقليدي",
    explore: "استكشف", search_on: "ابحث في bali…", trends: "الرائج 🔥", categories: "الفئات",
    cat_femmes: "نساء", cat_hommes: "رجال", cat_enfants: "أطفال", cat_sneakers: "أحذية رياضية",
    cat_tech: "إلكترونيات", cat_maison: "منزل", cat_trad: "تقليدي", cat_sport: "رياضة",
    sell_title: "بيع منتج", sell_sub: "مجاني. تحصل على 100% من سعر البيع.",
    add_photo: "أضف", title_ph: "العنوان — مثال: حذاء أديداس مقاس 41",
    desc_ph: "الوصف — الحالة، المقاس، التفاصيل…",
    cat_label: "الفئة", cond_label: "الحالة", price_label: "السعر",
    conds: ["جديد بالملصق", "كالجديد", "حالة جيدة جدا", "حالة جيدة"],
    scats: ["نساء", "رجال", "أطفال", "إلكترونيات", "منزل", "تقليدي"],
    you_receive: "تحصل على", buyer_pays: "يدفع المشتري {x} درهم (شاملة حماية bali)", publish: "انشر المنتج",
    messages: "الرسائل", write_msg: "اكتب رسالة…",
    offer_label: "عرض سعر", accept: "قبول", counter: "عرض مضاد", accepted: "تم قبول العرض",
    waiting: "في انتظار الرد…", buy: "اشتر", make_offer: "قدّم عرضا",
    negotiate: "فاوض على السعر 🤝", listed: "السعر المعروض", your_price: "سعرك", send_offer: "أرسل العرض",
    cod: "الدفع عند الاستلام", protection: "حماية bali",
    how_title: "كيف يعمل",
    how_text: "تطلب ← يشحن البائع خلال 3 أيام ← تدفع عند الاستلام أو عبر الإنترنت ← يحوّل bali المال للبائع بعد التأكد من مطابقة المنتج. صفر احتيال.",
    wach: "هل مازال متوفرا؟ 👀", with_prot: "مع الحماية", prot_incl: "شاملة الحماية", sales_w: "مبيعات",
    member: "عضو منذ 2026", wallet: "محفظة BALI", transfer: "تحويل إلى حسابي البنكي",
    dressing: "خزانتي", sell_new: "بيع منتج جديد",
    s_sales: "مبيعات", s_followers: "متابعون", s_favs: "مفضلات",
    language: "اللغة", choose_lang: "اختر لغتك", beta: "تجريبي", logout: "تسجيل الخروج", logout_done: "تم تسجيل الخروج ✅",
    msgs_none: "لا محادثات بعد — قدّم عرضاً على منتج!", parcourir: "تصفّح", wallet_soon: "🔜 التحويل البنكي — قادم مع الدفع الحقيقي", link_copied: "🔗 تم نسخ الرابط!", nf_sale: "💰 عملية بيع! أودع « {t} » في النقطة", nf_pickup: "📦 « {t} » — الطرد في الطريق إلى نقطتك", nf_msg: "💬 محادثة مع {n}", my_favs: "مفضلاتي", seller_empty: "لا توجد منتجات لهذا البائع", login_first: "سجّل الدخول للمتابعة", cant_follow_self: "لا يمكنك متابعة نفسك 😄", t_unfollowed: "لم تعد تتابع {n}", following_btn: "متابَع", follow_demo: "بائع تجريبي", followers_w: "متابعين", no_notifs: "لا إشعارات بعد", nf_new_listing: "🆕 {n} أضاف منتجاً", nf_offer: "💰 عرض جديد: {x} درهم", nf_new_msg: "💬 رسالة جديدة", nf_dropped: "📦 طردك في الطريق إلى النقطة", nf_handed: "✅ تم تسليم الطرد — انتهت العملية", nf_paid_seller: "🎉 بيع ودفع! تم تسليم طردك", remove_photo: "حذف الصورة", cam_start: "تشغيل الكاميرا", cam_stop: "إيقاف", cam_hint: "وجّه نحو رمز العميل", cam_denied: "رُفض إذن الكاميرا", cam_error: "تعذّر فتح الكاميرا", qr_detected: "✅ تم اكتشاف الرمز!", back: "رجوع", badge_inspect: "افحص المنتج في المحل قبل دفع المال للبائع", g_mode: "الموضة والملابس", g_chauss: "الأحذية", g_beaute: "الجمال والعطور", g_tech: "التقنية", g_enfants: "الأطفال والألعاب", g_maison: "المنزل", g_sport: "الرياضة", g_loisirs: "الهوايات", g_autres: "ماركات أخرى", g_lettres: "مقاسات الملابس", g_tailles_num: "مقاسات السراويل", g_pointures: "مقاسات الأحذية", g_ages: "أعمار الأطفال", brand_search: "ابحث عن ماركة", badge_refund: "استرداد 100% إذا لم يكن مطابقاً", ai_flow: "📸 صورة → ✍️ عنوان مكتوب → 💰 سعر مقترح", fiab_note: "يُحسب على عمليات الاستلام الناجحة", r_item: "المنتج", r_deliv: "التوصيل", voir_tout: "عرض الكل", cat_livres: "كتب ووسائط", cat_loisirs: "هوايات ومقتنيات", empty_cat: "لا توجد منتجات هنا بعد", empty_cat_cta: "كن أول من يبيع هنا", own_item: "هذا إعلانك", delete_item: "حذف الإعلان", deleted_ok: "حُذف الإعلان ✅",
    real_order_title: "تأكيد الطلب 🎉", real_pin_note: "رمز الاستلام الخاص بك — احفظه جيداً، لن يظهر مرة أخرى بوضوح.",
    filters_title: "الفلاتر", filter_cat: "الفئة", filter_brand: "الماركة", filter_size: "المقاس",
    filter_cond: "الحالة", filter_price: "السعر (درهم)", filter_sort: "الترتيب حسب",
    sort_recent: "الأحدث", sort_price_asc: "السعر تصاعدياً", sort_price_desc: "السعر تنازلياً", sort_popular: "الأكثر رواجاً",
    filter_reset: "إعادة تعيين", filter_apply: "عرض {n} منتجات",
    price_min_ph: "الأدنى", price_max_ph: "الأقصى", sum_all: "الكل", chip_sort: "ترتيب",
    real_order_ok: "حفظته ✓", my_orders: "طلباتي", no_orders: "لا يوجد طلبات بعد", admin_panel: "إدارة بالي", adm_stats: "الأرقام", adm_mod: "الإشراف",
    adm_users: "الأعضاء", adm_items: "الإعلانات", adm_active: "نشطة", adm_orders: "الطلبات", adm_gmv: "الحجم الإجمالي", adm_rev: "دخل الحماية", adm_held: "في الضمان", adm_done: "منتهية", adm_remove: "إزالة", adm_recent_orders: "أحدث الطلبات",
    tab_buys: "مشترياتي", tab_sells: "مبيعاتي", no_buys: "لا مشتريات بعد", no_sells: "لا مبيعات بعد",
    role_buy: "شراء", role_sell: "بيع", other_buyer: "المشتري", other_seller: "البائع",
    st_paid: "مدفوعة · للإيداع", st_dropped: "أُودعت في النقطة", st_transit: "في الطريق", st_ready: "جاهزة للاستلام", st_done: "منتهية", st_sold: "مُباع",
    deposit_cta: "أودع الطرد في نقطة بالي", deposit_done: "تم إيداع الطرد ✅ — أُبلغ المشتري",
    hverif_title: "تسليم طرد", hverif_sub: "أدخل رمز الطلب + رمز PIN الخاص بالعميل",
    hverif_code: "رمز الطلب (BAL-...)", hverif_pin: "رمز PIN للعميل (4 أرقام)",
    hverif_btn: "تحقق وسلّم", hverif_ok: "✅ الرمز صحيح — تم تسليم الطرد!",
    hverif_bad: "❌ رمز PIN خاطئ — لا تسلّم الطرد", hverif_notfound: "الطلب غير موجود أو سُلّم مسبقاً",
    hverif_wrongstatus: "هذا الطرد ليس جاهزاً للتسليم بعد", real_parcels: "طرود بالي الحقيقية", p_to_receive: "للاستلام (من البائع)", p_to_handover: "للتسليم للعميل", p_demo: "تجريبي", p_none: "لا توجد طرود حقيقية حالياً",
    sale_new_banner: "🎉 عملية بيع جديدة! أودع الطرد في النقطة", to_deposit: "للإيداع",
    order_pin_hidden: "الرمز مخفي لأمانك",
    t_msg_sent: "تم إرسال الرسالة إلى {n}", t_offer_sent: "تم إرسال عرض {x} درهم ✅",
    t_accepted: "تم قبول العرض — مبروك، تم البيع! 🎉", t_published: "« {t} » أصبح متاحا الآن 🎉",
    t_order: "طلب تجريبي — الدفع عند الاستلام ✅", t_need: "أضف عنوانا وسعرا 🙂",
    ai_cta1: "إعلان بالذكاء الاصطناعي", ai_cta2: "صوّر المنتج — الذكاء الاصطناعي يكتب الإعلان ويقدّر السعر",
    ai_btn: "أنشئ بالذكاء الاصطناعي", ai_loading: "جارٍ تحليل الصورة…",
    ai_sub_loading: "التعرف على المنتج · تقدير سعر السوق المغربي",
    ai_done: "تم إنشاء الإعلان ✨ راجع وعدّل", ai_error: "تعذر تحليل الصورة — أعد المحاولة أو املأ يدويا",
    ai_invalid: "الصورة ليست لمنتج قابل للبيع — جرب زاوية أخرى",
    ai_sugg: "السعر المقترح", ai_range: "نطاق السوق",
    delivery_label: "التوصيل", d_point: "نقطة bali · حانوت الأمل (650 م)",
    d_home: "إلى المنزل · أمانة", d_express: "سريع · كاتيديس",
    sadaqa: "وضع الصدقة 🤲", sadaqa_sub: "يُحوَّل مبلغ البيع إلى جمعية خيرية",
    sadaqa_on: "ستتبرع بـ {x} درهم للجمعية 🤲",
    b_score: "موثوقية المشتري", b_refus: "0 طرود مرفوضة",
    b_trust: "البائعون يثقون بك — عروضك لها الأولوية",
    video_b: "تغليف موثق بالفيديو", total_w: "المجموع",
    ticket_title: "تذكرة الاستلام", my_order: "طلبي",
    order_ready: "وصل طردك إلى نقطة bali 🎉",
    order_confirm_prompt: "تم استلام الطرد — أكّد الاستلام 👇",
    view_ticket: "عرض التذكرة", show_pin: "إظهار الرمز", hide_pin: "إخفاء الرمز",
    pin_warn: "لا تشارك هذا الرمز أبداً. صاحب المحل وحده سيطلبه منك وجهاً لوجه عند التسليم.",
    cod_pay: "الدفع عند الاستلام", qr_regen: "رمز QR جديد خلال {s} ث", single_use: "استخدام واحد",
    point_relay: "نقطة الاستلام", route: "الاتجاهات", call_w: "اتصال",
    tl_ordered: "تم الطلب", tl_dropped: "أودعها البائع", tl_transit: "في الطريق",
    tl_arrived: "وصلت إلى النقطة", tl_picked: "تم الاستلام",
    pickup_by: "استلمها قبل {d} — وإلا تُعاد إلى البائع",
    secu_line: "تسليم آمن: QR متجدد · رمز PIN · مسح بالموقع الجغرافي",
    try_partner: "جرّب واجهة صاحب المحل (تجريبي)",
    confirm_q: "هل المنتج مطابق؟", confirm_ok: "نعم — حرّر الدفع", confirm_ko: "الإبلاغ عن مشكلة",
    funds_ok: "تم تحويل المال إلى البائع ✅ شكراً!",
    funds_frozen: "الأموال مجمّدة. سيتواصل معك فريقنا خلال 24 ساعة.",
    check_title: "bali Check ✅", check_l1: "تم التحقق من IMEI لدى المشغلين", check_l2: "غير مبلّغ عنه كمسروق · فاتورة موثقة",
    imei_label: "IMEI (تحقق تلقائي ضد السرقة)", imei_ph: "اطلب *#06# على الهاتف",
    inspect_title: "افحص قبل التأكيد", insp_1: "المنتج مطابق للصور",
    insp_2: "يعمل / حالة جيدة", insp_3: "المقاس والموديل صحيحان",
    inspect_hint: "افعل ذلك في المحل قبل المغادرة — لا يُحوَّل المال إلا بعد تأكيدك.",
    discreet: "الوضع الخاص 🔒", discreet_sub: "الاسم والصورة مخفيان. التواصل عبر رسائل bali فقط.",
    discreet_badge: "ملف خاص",
    pay_title: "bali Pay", recharge: "شحن نقداً",
    cashin_txt: "اشحن لدى أكثر من 4000 وكيل شريك (كاش بلوس، وفاكاش، بريد كاش) أو بالبطاقة — يُقيَّد فوراً. بدون حساب بنكي.",
    cote_line: "مؤشر bali · مبني على {n} عملية بيع مماثلة في المغرب",
    share_toast: "تم نسخ رابط الإعلان — شاركه على واتساب 📲",
    trust_title: "الضمانات والدعم البشري",
    trust_help_sub: "رد خلال أقل من ساعتين · بالدارجة والفرنسية والعربية · 7/7",
    trust_agent: "أمينة · دعم bali · متصلة",
    trust_whatsapp: "المتابعة عبر واتساب",
    trust_toast: "فتح واتساب 📲 (تجريبي)",
    g1: "إنسان حقيقي يرد عليك خلال أقل من ساعتين — لا روبوتات تكرر نفس الرسالة.",
    g2: "يُحسم النزاع خلال 72 ساعة كحد أقصى، بالأدلة: فيديو التغليف + الفحص عند الاستلام.",
    g3: "البائع والمشتري محميان معاً — سلسلة المسؤولية تحدد الطرف المخطئ.",
    g4: "لا رسوم خفية: كل شيء معروض قبل الدفع.",
    g5: "لا يُحظر أي حساب دون مراجعة بشرية وحق الرد.",
    results_w: "{n} نتيجة", no_results: "لا نتائج لـ « {q} »",
    try_else: "جرّب كلمة أخرى أو استكشف الفئات 👇",
    follow: "متابعة", t_followed: "أنت تتابع {n} ✅", items_w: "منتجات",
    ob_continue: "متابعة", ob_skip: "تخطي",
    ob_title2: "السوق في جيبك",
    ob_v1: "0% عمولة على البائع — تحتفظ بـ 100% من السعر",
    ob_v2: "دفع آمن 100% · الاستلام من حانوت الحي",
    ob_v3: "المشتري والبائع محميان — إنسان يرد خلال ساعتين",
    ob_phone: "رقم هاتفك", ob_send: "استلام رمز SMS",
    ob_code: "أدخل الرمز المستلم", ob_hint: "تجريبي: أي رمز من 4 أرقام",
    ob_done: "مرحباً بك في bali! 🎉",
    notifs_title: "الإشعارات",
    n1: "💰 عرضت Salma.R مبلغ 800 درهم للقفطان · قبل 5 دقائق",
    n2: "📦 وصل طلبك BAL-7F2K9 إلى نقطة الاستلام · قبل ساعتين",
    n3: "❤️ انخفض سعر آيفون 12 الذي تتابعه إلى 3800 درهم · قبل 6 ساعات",
    n4: "👤 Imane_Tng تتابع خزانتك · أمس",
    checkout_title: "تأكيد الطلب", pay_method: "الدفع",
    pm_card: "بطاقة بنكية · CMI", pm_wallet: "رصيد bali Pay · 340 درهم",
    insufficient: "رصيد غير كافٍ", confirm_order: "تأكيد الطلب ✅",
    t_paid: "تم قبول الدفع — تأكد الطلب ✅",
    pm_pickup: "ادفع عند الاستلام · في التطبيق، بعد الفحص",
    tsbiq: "عربون الحجز",
    tsbiq_waived: "0 درهم — درجة موثوقيتك 98% تعفيك منه",
    tsbiq_new: "الحسابات الجديدة تحجز بعربون 20%",
    reserve_note: "لا يشحن البائع إلا بعد تأكيد حجزك. لم تأتِ خلال 7 أيام؟ إرجاع مجاني له، يُعوَّض من العربون — وتنخفض درجتك.",
    no_cash_hanout: "صاحب المحل لا يلمس المال أبداً: كل شيء يمر عبر التطبيق.",
    pay_release: "ادفع {x} درهم — حرّر البائع ✅",
    seller_guar_t: "ضمان البائع",
    seller_guar: "إذا لم يأتِ المشتري للاستلام: إرجاع مجاني + تعويض من عربونه. لن تخسر درهماً أبداً.",
    t_reserved: "تأكد الحجز ✅ يمكن للبائع الشحن 📦",
    gift_title: "هدية الترحيب", gift_claim: "أستفيد 🎉",
    synopsis_title: "كيف يعمل",
    syn_buy: "🛒 للشراء", syn_sell: "💰 للبيع",
    syn_b1: "اعثر على منتج وادفع بأمان", syn_b2: "استلمه من محل حيّك", syn_b3: "افحصه: لا يُدفع للبائع إلا إذا كان كل شيء جيداً",
    syn_s1: "صوّر منتجك، الذكاء الاصطناعي يكتب الإعلان", syn_s2: "بيع؟ أودع الطرد في المحل", syn_s3: "استلم مالك، 0% عمولة",
    syn_start: "لنبدأ! 🎉",
    gift_text: "خصم 20 درهماً على طلبك الأول، يُطبَّق تلقائياً عند الدفع.",
    gift_applied: "تم تفعيل رمز MARHBA20 — خصم 20 درهماً على طلبك الأول ✅",
    deals_title: "⚡ عروض اليوم", ends_in: "ينتهي خلال {t}",
    viewers_line: "{n} أشخاص يشاهدون هذا المنتج الآن",
    hot_badge: "مطلوب جداً",
    s1: "اطلب", s2: "استلم من المحل", s3: "افحص واستلم",
    become_point: "كن نقطة bali 🏪", become_sub: "اربح 4-5 دراهم لكل طرد · دون لمس النقود",
    paid_t: "مدفوع", paid_sub: "أموالك محفوظة لدى bali. لا يُدفع للبائع إلا بعد فحصك عند الاستلام.",
    no_card: "لا تملك بطاقة بنكية؟",
    opt_cash: "اشحن نقداً لدى وكيل (كاش بلوس، وفاكاش…) — المنتج محجوز 48 ساعة",
    opt_khel: "خلّصلي — قريب يدفع عنك عبر رابط واتساب",
    khel_toast: "تم إرسال رابط الدفع عبر واتساب 📲 (تجريبي)",
    d_amana_point: "أمانة (البريد) → نقطة bali الخاصة بك · فحص عند الاستلام",
    d_amana_home: "أمانة (البريد) → المنزل",
    d_express_far: "إكسبريس كاتيديس → المنزل",
    reco: "موصى به",
    smart_route: "مسار محدد تلقائياً · {a} ↔ {b}",
    far_protect: "مسافة طويلة: الطرد مؤمَّن — يُعوَّض البائع 100% إن فُقد لدى الناقل.",
    eta_tmw: "غداً", eta_12: "1-2 أيام", eta_today: "اليوم", eta_24: "2-4 أيام", eta_2448: "24-48 ساعة",
    sale_card_todo: "بيع! أودع طردك 📦", sale_card_done: "أُودع الطرد — في الطريق 🚚",
    deposit_title: "إيداع الطرد",
    dep_status_todo: "بانتظار الإيداع", dep_status_ok: "تم الإيداع ✅",
    dep_show: "أرِ هذا الرمز لصاحب المحل — يمسحه ويتسلم الطرد في عهدته.",
    dep_before: "أودعه قبل {d} — وإلا تُلغى البيعة ويُعوَّض المشتري",
    dep_tip1: "غلّفه جيداً (كيس + شريط لاصق)", dep_tip2: "صوّر التغليف 🎥 — دليلك عند أي نزاع",
    dep_tip3: "اكتب الرمز {c} على الطرد",
    dep_btn: "محاكاة الإيداع في المحل (تجريبي)",
    dep_done_note: "انتقلت العهدة إلى المحل ✅ في الطريق إلى {n}",
    after_insp: "تُضاف إلى رصيدك بعد فحص المشتري · 0% عمولة",
    tl_sold: "بيع 🎉", tl_paid2: "تم تحويل المال",
  },
  zgh: {
    b_refus: "ⵉⴳⵉ ⵏ ⵜⵓⴳⴳⴰ", b_score: "ⵜⴰⴼⵍⵙⵜ ⵏ ⵓⵎⵙⴰⵖ", b_trust: "ⴰⵎⵙⴰⵖ ⵢⵓⵎⵏ", r_item: "ⴰⴼⵕⴹⵉⵚ", r_deliv: "ⴰⵙⴰⵡⴰⴹ",
    nav_msg: "ⵜⵉⴱⵔⴰⵜⵉⵏ", search_ph: "ⵇⴰⴼⵟⴰⵏ, iPhone, Air Force…", banner1: "ⵙⵎⵣ ⴰⴷⵍⴰⵙ ⵏⵏⴽ, ⵛⴰⵔ ⵜⴰⵎⵙⵙⴰⵔⵜ", banner2: "0% ⴽⵓⵎⵉⵙⵢⵓⵏ ⵉ ⵓⵎⵣⵣⵏⵣⴰ · ⴰⵙⴰⴳⵎ ⴳ ⵍⵃⴰⵏⵓⵜ", f_all: "ⴽⵓⵍⵛⵉ", f_sneakers: "ⵙⴱⴰⴱⴰⵟ", f_tech: "ⵜⵉⵇⵏⵉⵢⵜ", f_femmes: "ⵜⵉⵎⵖⴰⵔⵉⵏ", f_hommes: "ⵉⵔⴳⴰⵣⵏ", f_trad: "ⴰⵏⵚⵍⵉ", search_on: "ⴰⵔⵣⵣⵓ ⴳ bali…", trends: "ⵉⵎⵢⵢⴰⵔⵏ 🔥", cat_femmes: "ⵜⵉⵎⵖⴰⵔⵉⵏ", cat_hommes: "ⵉⵔⴳⴰⵣⵏ", cat_enfants: "ⵉⵎⵥⵥⵢⴰⵏⵏ", cat_sneakers: "ⵙⴱⴰⴱⴰⵟ", cat_tech: "ⵜⵉⵇⵏⵉⵢⵜ", cat_maison: "ⴰⵅⵅⴰⵎ", cat_trad: "ⴰⵏⵚⵍⵉ", cat_sport: "ⴰⴷⴷⴰⵍ", cat_livres: "ⵉⴷⵍⵉⵙⵏ", cat_loisirs: "ⴰⵏⴰⵔⵓⵣ", member: "ⴰⵎⴰⵙⵍⴰⴹ", sales_w: "ⵜⵉⵣⵣⵏⵣⵉⵏ", items_w: "ⵉⴼⵕⴹⵉⵚⵏ", follow: "ⴹⴼⵕ", make_offer: "ⴰⵣⵏ ⴰⵙⵓⵎⵔ", buyer_pays: "ⴰⵎⵙⴰⵖ ⵉⵜⵜⵅⵍⵍⴰⵚ", protection: "ⴰⵎⵣⵣⵓ", with_prot: "ⵙ ⵓⵎⵣⵣⵓ", prot_incl: "ⴰⵎⵣⵣⵓ ⵉⵍⵍⴰ", your_price: "ⴰⵜⵉⴳ ⵏⵏⴽ", offer_label: "ⴰⵙⵓⵎⵔ", negotiate: "ⵎⵙⴰⵡⴰⵍ", counter: "ⴰⵔⵔ ⴰⵙⵓⵎⵔ", waiting: "ⴰⵔ ⵜⵜⵔⴰⵊⵓ…", accepted: "ⵉⵜⵜⵡⴰⵇⴱⵍ", add_photo: "ⵔⵏⵓ ⵜⴰⵡⵍⴰⴼⵜ", remove_photo: "ⴽⴽⵙ ⵜⴰⵡⵍⴰⴼⵜ", title_ph: "ⴰⵣⵡⵍ ⵏ ⵓⴼⵕⴹⵉⵚ", desc_ph: "ⴰⴳⵍⴰⵎ…", sell_sub: "ⴰⵡⵉ ⵜⴰⵡⵍⴰⴼⵜ, ⵜⴰⵎⵢⴰⵡⴰⵙⵜ ⴰⴷ ⵜⴰⵔⵓ", ai_btn: "ⴰⵡⵉ ⵜⴰⵡⵍⴰⴼⵜ", ai_cta1: "ⵜⴰⵎⵢⴰⵡⴰⵙⵜ ⵜ ⵜⴰⵔⵓ ⵜⴰⵎⵍⵉⵍⵜ", ai_cta2: "ⵜⴰⵡⵍⴰⴼⵜ, ⴰⵣⵡⵍ, ⴰⵜⵉⴳ ⵙ ⵢⴰⵏ ⵓⵙⴽⴽⵉⵍ", ai_flow: "📸 ⵜⴰⵡⵍⴰⴼⵜ → ✍️ ⴰⵣⵡⵍ → 💰 ⴰⵜⵉⴳ", ai_loading: "ⴰⵔ ⵜⵜⵎⵏⴰⴷ ⵜⴰⵡⵍⴰⴼⵜ…", ai_sub_loading: "ⵛⵡⵢⵢⴰ…", ai_done: "ⵜⴼⵓⴽⴽⴰ ⵜⴰⵎⵢⴰⵡⴰⵙⵜ", ai_error: "ⵜⵍⵍⴰ ⵜⵣⴳⴰⵍⵜ, ⵄⴰⵡⴷ", ai_invalid: "ⵜⴰⵡⵍⴰⴼⵜ ⵓⵔ ⵜⵜⵡⴰⵙⵙⴰⵏ", ai_range: "ⴰⵜⵉⴳ ⵏ ⵜⵙⵓⵇⵜ", ai_sugg: "ⴰⵙⵓⵎⵔ ⵏ ⵜⵎⵢⴰⵡⴰⵙⵜ", publish: "ⵙⵙⵓⴼⵖ", cat_label: "ⵜⴰⴳⴳⴰⵢⵜ", cond_label: "ⴰⴷⴷⴰⴷ", delivery_label: "ⴰⵙⴰⵡⴰⴹ", scats: "ⵜⵉⴳⴳⴰⵢⵉⵏ", conds: ["ⴰⵎⴰⵢⵏⵓ ⵙ ⵜⴱⴰⵟⵟⵉⵜ", "ⵣⵓⵏ ⴷ ⴰⵎⴰⵢⵏⵓ", "ⴱⴰⵀⵔⴰ ⵉⵎⵎⵓ", "ⵉⵎⵎⵓ"], sadaqa: "ⵚⴰⴷⴰⵇⴰ", sadaqa_on: "ⵜⵜⵓⵙⵎⴰⵔ", sadaqa_sub: "ⵄⴹⵓ ⴰⵜⵉⴳ ⵉ ⵢⴰⵏ ⵓⵎⵙⴰⵖ", search_on2: "ⴰⵔⵣⵣⵓ", results_w: "{n} ⵏ ⵜⵢⴰⴼⵓⵜⵉⵏ", no_results: "ⵓⵔ ⵜⵍⵍⵉ ⵜⵢⴰⴼⵓⵜ ⵉ « {q} »", try_else: "ⵄⴰⵡⴷ ⵙ ⵢⴰⵏ ⵓⵔⵣⵣⵓ ⵢⴰⴹⵏ", chip_sort: "ⵙⵎⵣⵣⵉ", filters_title: "ⵉⵎⵣⵣⵉⵜⵏ", filter_cat: "ⵜⴰⴳⴳⴰⵢⵜ", filter_brand: "ⵜⴰⵎⴰⵜⴰⵔⵜ", filter_size: "ⵜⵉⴷⴷⵉ", filter_cond: "ⴰⴷⴷⴰⴷ", filter_price: "ⴰⵜⵉⴳ (DH)", filter_sort: "ⵙⵎⵣⵣⵉ ⵙ", sort_recent: "ⴰⵎⴰⵢⵏⵓ", sort_price_asc: "ⴰⵜⵉⴳ: ⵙ ⵓⴼⵍⵍⴰ", sort_price_desc: "ⴰⵜⵉⴳ: ⵙ ⵡⴰⴷⴷⴰⵢ", sort_popular: "ⴰⵎⵢⵢⴰⵔ", filter_reset: "ⵄⴰⵡⴷ", filter_apply: "ⵥⵕ {n} ⵏ ⵉⴼⵕⴹⵉⵚⵏ", price_min_ph: "ⴰⴷⴷⴰⵢ", price_max_ph: "ⴰⴼⵍⵍⴰ", brand_search: "ⴰⵔⵣⵣⵓ ⵅⴼ ⵜⵎⴰⵜⴰⵔⵜ", g_mode: "ⵍⵎⵓⴹⴰ", g_chauss: "ⵙⴱⴰⴱⴰⵟ", g_beaute: "ⵜⴰⵥⵓⵕⵉ", g_tech: "ⵜⵉⵇⵏⵉⵢⵜ", g_enfants: "ⵉⵎⵥⵥⵢⴰⵏⵏ", g_maison: "ⴰⵅⵅⴰⵎ", g_sport: "ⴰⴷⴷⴰⵍ", g_loisirs: "ⴰⵏⴰⵔⵓⵣ", g_autres: "ⵜⵉⵎⴰⵜⴰⵔⵉⵏ ⵢⴰⴹⵏ", g_lettres: "ⵜⵉⴷⴷⵉ ⵏ ⵍⵃⵡⴰⵢⵊ", g_tailles_num: "ⵜⵉⴷⴷⵉ ⵏ ⵙⵔⴰⵡⵍ", g_pointures: "ⵜⵉⴷⴷⵉ ⵏ ⵙⴱⴰⴱⴰⵟ", g_ages: "ⵍⵄⵎⵔ ⵏ ⵉⵎⵥⵥⵢⴰⵏⵏ", parcourir: "ⴰⵔⵣⵣⵓ", voir_tout: "ⵥⵕ ⴽⵓⵍⵛⵉ", empty_cat: "ⵓⵔ ⵉⵍⵍⵉ ⴽⵔⴰ ⴷⴰ", empty_cat_cta: "ⵉⵍⵉ ⴰⵎⵣⵡⴰⵔⵓ ⵜⵣⵣⵏⵣⴷ ⴷⴰ", checkout_title: "ⴰⵅⵍⵍⴰⵚ", pay_title: "ⴰⵅⵍⵍⴰⵚ", pay_method: "ⴰⴱⵔⵉⴷ ⵏ ⵓⵅⵍⵍⴰⵚ", pm_card: "ⵜⴰⴽⴰⵕⴹⴰ", pm_wallet: "ⵜⴰⴱⵓⵔⵙⵜ bali", recharge: "ⵛⴰⵔ", transfer: "ⵙⵉⴼⴹ", wallet: "ⵜⴰⴱⵓⵔⵙⵜ", wallet_soon: "🔜 ⴰⵙⵉⴼⴹ ⴰⴱⴰⵏⴽⵉ — ⵢⵓⵛⴽⴰⴷ", confirm_order: "ⵙⵏⵜⵎ ⵜⴰⵟⵍⴰⴱⵜ", confirm_q: "ⵜⵔⵉⴷ ⴰⴷ ⵜⵙⵏⵜⵎⴷ?", confirm_ok: "ⵢⴰⵀ", confirm_ko: "ⵓⵀⵓ", reco: "ⵉⵜⵜⵡⴰⵙⵓⵎⵔ", no_card: "ⵓⵔ ⵜⵍⵍⵉ ⵜⴽⴰⵕⴹⴰ?", opt_cash: "ⵅⵍⵍⵚ ⵙ ⵜⴰⵏⴰⵇⵇⵉⴹⵜ", opt_khel: "ⴰⴷ ⵉⵅⵍⵍⵚ ⵢⴰⵏ ⵓⵎⴷⴷⴰⴽⴽⵍ (Khellesli)", cashin_txt: "ⵛⴰⵔ ⵙ ⵜⵏⴰⵇⵇⵉⴹⵜ", khel_toast: "ⵜⵜⵓⵏⵖⵍ ⵓⵥⴹⴰⵕ Khellesli", insufficient: "ⵜⴰⴱⵓⵔⵙⵜ ⵓⵔ ⵜⵛⵛⵓⵔ", paid_t: "ⵢⵜⵜⵡⴰⵅⵍⵍⵚ!", paid_sub: "ⴰⵅⵍⵍⴰⵚ ⵏⵏⴽ ⵉⵜⵜⵡⴰⵎⵣⵣⵓ", smart_route: "ⴰⵙⴰⵡⴰⴹ ⴰⵎⵓⵥⵓⵏ", reco2: "ⵉⵜⵜⵡⴰⵙⵓⵎⵔ", far_protect: "ⴰⴽⵓⵍⵉ ⵉⵜⵜⵡⴰⵎⵣⵣⵓ — ⵜⵜⵓⵔⴰⵔ 100%", route: "ⴰⴱⵔⵉⴷ", secu_line: "ⴰⵅⵍⵍⴰⵚ ⵉⵜⵜⵡⴰⵎⵣⵣⵓ ⴰⵔ ⴰⵙⴰⴳⵎ", order_ready: "ⵜⴰⵟⵍⴰⴱⵜ ⵜⵡⵊⴷ", order_confirm_prompt: "ⵙⵏⵜⵎ ⵜⴰⵟⵍⴰⴱⵜ", ticket_title: "ⴰⵜⵉⴽⵉ ⵏ ⵓⵙⴰⴳⵎ", view_ticket: "ⵥⵕ ⴰⵜⵉⴽⵉ", show_pin: "ⵥⵕ PIN", hide_pin: "ⴼⴼⵔ PIN", single_use: "ⴰⵙⵎⵔⵙ ⵢⴰⵏ ⵓⴱⵔⵉⴷ", pin_warn: "ⵀⴰⵜ PIN ⵏⵏⴽ, ⵓⵔ ⵜ ⵙⵎⵓⵏ", qr_regen: "ⵄⴰⵡⴷ QR", pickup_by: "ⴰⵙⴰⴳⵎ ⵇⴱⵍ", how_title: "ⵎⴰⵎⵏⴽ ⵜⵜⵡⴰⵅⴷⴰⵎ", banner_deals: "ⵉⵙⵎⵓⵜⵜⵏ ⵏ ⵡⴰⵙⵙ", deals_title: "ⵉⵙⵎⵓⵜⵜⵏ ⵏ ⵡⴰⵙⵙ", ends_in: "ⵉⴼⵓⴽⴽⴰ ⴳ", tl_picked: "ⵉⵜⵜⵡⴰⵙⵢ", tl_arrived: "ⵢⵓⵛⴽⴰⴷ", after_insp: "ⵢⵜⵜⵡⴰⵅⵍⵍⵚ ⵓⵎⵣⵣⵏⵣⴰ ⴰⵡⴰⵔ ⵓⵙⴽⴰⵏ", cote_line: "ⴰⵜⵉⴳ ⵏ ⵜⵙⵓⵇⵜ", seller_empty: "ⵓⵔ ⵉⵍⵍⵉ ⴽⵔⴰ ⵖⵓⵔ ⵓⵎⵣⵣⵏⵣⴰ", login_first: "ⴽⵛⵎ ⴱⴰⵛ ⴰⴷ ⵜⴹⴼⵕⴷ", cant_follow_self: "ⵓⵔ ⵜⵣⵎⵎⵔⴷ ⴰⴷ ⵜⴹⴼⵕⴷ ⵉⵅⴼ ⵏⵏⴽ 😄", t_unfollowed: "ⵓⵔ ⵜⴹⴼⵕⴷ {n}", following_btn: "ⵜⴹⴼⵕⴷ", follow_demo: "ⴰⵎⵣⵣⵏⵣⴰ ⴷⵉⵎⵓ", followers_w: "ⵉⵎⴹⴼⴰⵕⵏ", relay_title: "ⵜⴰⵏⵇⵇⵉⴹⵜ bali", relay_verified: "ⵜⴰⵏⵇⵇⵉⴹⵜ ⵜⵜⵓⵙⵏⵜⵎⵜ", relay_reliable: "ⵜⴰⴼⵍⵙⵜ", relay_dist: "ⴰⵎⵣⵣⴰⵢ", relay_map_soon: "ⵜⴰⴽⴰⵕⴹⴰ ⵢⵓⵛⴽⴰⴷ", relay_call: "ⵖⵕ ⵜⴰⵏⵇⵇⵉⴹⵜ", relay_note: "ⵙⴽⵏ ⴰⴽⵓⵍⵉ ⵇⴱⵍ ⵓⵙⴰⴳⵎ", relay_see: "ⵥⵕ ⵜⴰⴽⴰⵕⴹⴰ", no_notifs: "ⵓⵔ ⵉⵍⵍⵉ ⵓⵍⵖⵓ", nf_new_listing: "🆕 {n} ⵉⵔⵏⴰ ⴰⴼⵕⴹⵉⵚ", nf_offer: "💰 ⴰⵙⵓⵎⵔ ⴰⵎⴰⵢⵏⵓ: {x} DH", nf_new_msg: "💬 ⵜⴰⴱⵔⴰⵜ ⵜⴰⵎⴰⵢⵏⵓⵜ", nf_dropped: "📦 ⴰⴽⵓⵍⵉ ⵏⵏⴽ ⴳ ⵓⴱⵔⵉⴷ", nf_handed: "✅ ⴰⴽⵓⵍⵉ ⵉⵜⵜⵡⴰⴼⴽⴰ", nf_paid_seller: "🎉 ⵉⵜⵜⵡⴰⵣⵣⵏⵣ ⵜⵜⵓⵅⵍⵍⵚ!", discreet: "ⴰⴷⴷⴰⴷ ⴰⵀⵔⵡⴰⵏ", discreet_badge: "ⴰⵀⵔⵡⴰⵏ", discreet_sub: "ⵉⵙⵎ ⵏⵏⴽ ⵉⵜⵜⵡⴰⴼⴼⵔ", become_point: "ⵉⵍⵉ ⴷ ⵜⴰⵏⵇⵇⵉⴹⵜ bali 🏪", become_sub: "ⵔⴱⵃ 4-5 DH ⵉ ⵓⴽⵓⵍⵉ · ⵓⵔ ⵜⵍⵍⵉ ⵜⵏⴰⵇⵇⵉⴹⵜ", trust_title: "ⵎⴰⵅ ⴰⴷ ⵜⴰⵎⵏⴷ bali", trust_help_sub: "ⵢⴰⵜ ⵜⵔⴰⴱⴱⵓⵜ ⵜⴰⵏⴰⴼⴳⴰⵏⵜ ⴰⴷ ⴽ ⵜⵔⴰⵔ", trust_agent: "ⴰⵙⴽⴰⵏ ⵇⴱⵍ ⵓⵅⵍⵍⴰⵚ", trust_whatsapp: "ⵜⴰⵡⵉⵙⵉ ⵙ WhatsApp", trust_toast: "bali ⴰⴷ ⴽ ⵉⵃⴹⵓ", seller_guar: "ⵜⵉⵎⵍⵍⴰ ⴷ ⵜⵡⵉⵙⵉ", seller_guar_t: "ⵜⵜⵓⵃⴹⵓⴷ", funds_frozen: "ⵉⴷⵔⵉⵎⵏ ⵜⵜⵓⵎⵣⵏ", funds_ok: "ⵉⴷⵔⵉⵎⵏ ⵜⵜⵓⵣⵏ ⵉ ⵓⵎⵣⵣⵏⵣⴰ", inspect_title: "ⵙⴽⵏ ⴰⵢⵏⵏⴰ ⵜⵙⵖⵉⴷ", inspect_hint: "ⵕⵥⵎ ⵜⵥⵕⴷ ⵇⴱⵍ ⴰⴷ ⵜⵇⴱⵍⴷ", check_title: "ⴰⵙⴽⴰⵏ ⴳ ⵜⵏⵇⵇⵉⴹⵜ bali", check_l1: "ⵙⴽⵏ ⴰⴼⵕⴹⵉⵚ ⵇⴱⵍ ⵓⵅⵍⵍⴰⵚ", check_l2: "ⴰⵎⵣⵣⵏⵣⴰ ⵉⵜⵜⵡⴰⵅⵍⵍⵚ ⵖⴰⵙ ⵎⴽ ⴽⵓⵍⵛⵉ ⵉⵎⵎⵓ", imei_label: "IMEI (ⵎⴽ ⵜⵔⵉⴷ)", imei_ph: "ⵙⴽⵛⵎ IMEI", cashin_txt2: "ⵛⴰⵔ ⵙ ⵜⵏⴰⵇⵇⵉⴹⵜ", gift_title: "ⵜⴰⵡⵙⵉⵜ ⵏ ⵓⵏⵙⵓⴼ", gift_text: "20 DH ⴰⴷⵔⴰⵔ ⴳ ⵜⵉⵔⵎⵜ ⵏⵏⴽ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ", gift_claim: "ⴰⴷ ⵙⵜⵜⴼⴷⵖ 🎉", gift_applied: "ⵜⴰⵡⵙⵉⵜ ⵜⵜⵓⵙⵎⵔⵙ ✅", synopsis_title: "ⵎⴰⵎⵏⴽ ⵜⵜⵡⴰⵅⴷⴰⵎ", syn_buy: "🛒 ⴰⴷ ⵜⵙⵖⴷ", syn_sell: "💰 ⴰⴷ ⵜⵣⵣⵏⵣⴷ", syn_start: "ⵢⴰⵍⵍⴰⵀ! 🎉", s1: "ⴰⴼ ⴰⴼⵕⴹⵉⵚ", s2: "ⴰⵙⵢ ⵜ ⴳ ⵍⵃⴰⵏⵓⵜ", s3: "ⵙⴽⵏ ⵜ ⵜⵙⵏⵜⵎⴷ", ob_phone: "ⵓⵟⵟⵓⵏ ⵏ ⵜⵉⵍⵉⴼⵓⵏ?", ob_send: "ⴰⵡⵉ ⴽⵓⴷ SMS", ob_code: "ⵙⴽⵛⵎ ⴽⵓⴷ", ob_continue: "ⴽⵎⵎⵍ", ob_skip: "ⵣⴳⵍ", ob_title2: "ⵜⴰⴼⵍⵙⵜ ⴳ ⵜⵊⵉⴱⵜ ⵏⵏⴽ", ob_v1: "ⵙⵖ ⵜⵣⵣⵏⵣⴷ ⵙ ⵜⴼⵍⵙⵜ", ob_v2: "ⴰⵙⴰⴳⵎ ⴳ ⵍⵃⴰⵏⵓⵜ ⵏ ⵜⵎⵏⴰⴹⵜ", ob_v3: "ⴰⵅⵍⵍⴰⵚ ⵉⵜⵜⵡⴰⵎⵣⵣⵓ", notifs_title: "ⵉⵍⵖⴰⵏ", my_orders: "ⵜⵉⵟⵍⴰⴱⵉⵏ ⵏⵏⵓ", no_orders: "ⵓⵔ ⵜⵍⵍⵉ ⵜⵟⵍⴰⴱⵜ", tab_buys: "ⵜⵉⵙⵖⵉⵏ ⵏⵏⵓ", tab_sells: "ⵜⵉⵣⵣⵏⵣⵉⵏ ⵏⵏⵓ", no_buys: "ⵓⵔ ⵜⵍⵍⵉ ⵜⵙⵖⵉ", no_sells: "ⵓⵔ ⵜⵍⵍⵉ ⵜⵣⵣⵏⵣⵉ", role_buy: "ⵜⴰⵙⵖⵉ", role_sell: "ⵜⴰⵣⵣⵏⵣⵉ", other_buyer: "ⴰⵎⵙⴰⵖ", other_seller: "ⴰⵎⵣⵣⵏⵣⴰ", deposit_cta: "ⵙⵔⵙ ⴰⴽⵓⵍⵉ ⴳ bali", deposit_done: "ⴰⴽⵓⵍⵉ ⵉⵜⵜⵡⴰⵙⵔⵙ ✅", sale_new_banner: "🎉 ⵜⴰⵣⵣⵏⵣⵉ! ⵙⵔⵙ ⴰⴽⵓⵍⵉ ⴳ bali", to_deposit: "ⴰⴷ ⵜⵙⵔⵙⴷ", real_order_title: "ⵜⴰⵟⵍⴰⴱⵜ ⵜⵜⵓⵙⵏⵜⵎ 🎉", real_pin_note: "ⴽⵓⴷ ⵏ ⵓⵙⴰⴳⵎ — ⴰⵔⵓ ⵜ", real_order_ok: "ⵓⵔⵉⵖ ⵜ ✓", order_pin_hidden: "ⴽⵓⴷ ⵉⵜⵜⵡⴰⴼⴼⵔ", own_item: "ⴷ ⴰⴼⵕⴹⵉⵚ ⵏⵏⴽ", delete_item: "ⴽⴽⵙ ⴰⴼⵕⴹⵉⵚ", deleted_ok: "ⴰⴼⵕⴹⵉⵚ ⵉⵜⵜⵡⴰⴽⴽⵙ ✅", msgs_none: "ⵓⵔ ⵜⵍⵍⵉ ⵜⵎⵙⴰⵡⴰⵍⵜ — ⴰⵣⵏ ⴰⵙⵓⵎⵔ!", dressing: "ⴰⴷⵍⴰⵙ ⵏⵏⵓ", sell_new: "ⵣⵣⵏⵣ ⴰⴼⵕⴹⵉⵚ ⴰⵎⴰⵢⵏⵓ", logout: "ⴼⴼⵖ", logout_done: "ⵜⴼⴼⵖⴷ ✅", my_favs: "ⵉⵎⵓⵥⴰⵏ ⵏⵏⵓ", s_sales: "ⵜⵉⵣⵣⵏⵣⵉⵏ", s_followers: "ⵉⵎⴹⴼⴰⵕⵏ", s_favs: "ⵉⵎⵓⵥⴰⵏ", beta: "ⴱⵉⵟⴰ", admin_panel: "ⴰⴷⵎⵉⵏ bali", adm_stats: "ⵉⵎⴹⴰⵏⵏ", adm_mod: "ⴰⵙⵙⵖⴷ", adm_users: "ⵉⵎⵙⵙⵇⴷⴰⵛⵏ", adm_items: "ⵉⴼⵕⴹⵉⵚⵏ", adm_active: "ⵉⵎⵓⵔⴰⵔⵏ", adm_orders: "ⵜⵉⵟⵍⴰⴱⵉⵏ", adm_gmv: "ⴰⵎⴹⴰⵏ ⴰⵎⴰⵜⴰⵢ", adm_rev: "ⵜⴰⵏⴼⴰⵄⵜ", adm_held: "ⵉⵜⵜⵡⴰⵎⵣ", adm_done: "ⵉⴼⵓⴽⴽⴰⵏ", adm_remove: "ⴽⴽⵙ", adm_recent_orders: "ⵜⵉⵟⵍⴰⴱⵉⵏ ⵜⵉⵎⴳⴳⵓⵔⴰ", real_parcels: "ⵉⴽⵓⵍⵉⵏ ⵏ bali", p_to_receive: "ⴰⴷ ⵜⵔⵎⵙⴷ", p_to_handover: "ⴰⴷ ⵜⴼⴽⴷ ⵉ ⵓⵎⵙⴰⵖ", p_demo: "ⴷⵉⵎⵓ", p_none: "ⵓⵔ ⵉⵍⵍⵉ ⴽⵔⴰ ⵏ ⵓⴽⵓⵍⵉ", hverif_title: "ⴼⴽ ⴰⴽⵓⵍⵉ", hverif_sub: "ⵙⴽⵛⵎ ⴽⵓⴷ ⵏ ⵜⵟⵍⴰⴱⵜ + PIN", hverif_code: "ⴽⵓⴷ ⵏ ⵜⵟⵍⴰⴱⵜ (BAL-...)", hverif_pin: "PIN ⵏ ⵓⵎⵙⴰⵖ (4)", hverif_btn: "ⵙⵏⵜⵎ ⵜⴼⴽⴷ", hverif_ok: "✅ ⴽⵓⴷ ⵉⵎⵎⵓ — ⴰⴽⵓⵍⵉ ⵉⵜⵜⵡⴰⴼⴽⴰ!", hverif_bad: "❌ PIN ⵓⵔ ⵉⵎⵎⵓ — ⵓⵔ ⵜⴼⴽ ⴰⴽⵓⵍⵉ", hverif_notfound: "ⵜⴰⵟⵍⴰⴱⵜ ⵓⵔ ⵜⵜⵡⴰⴼ", hverif_wrongstatus: "ⴰⴽⵓⵍⵉ ⵓⵔ ⵢⵓⵊⵉⴷ", cam_start: "ⵙⵙⵔⵖ ⵜⴰⴽⴰⵎⵉⵔⴰ", cam_stop: "ⴱⴷⴷ", cam_hint: "ⵙⵡⵊⴷ QR ⵏ ⵓⵎⵙⴰⵖ", cam_denied: "ⵜⴰⴽⴰⵎⵉⵔⴰ ⵜⵜⵡⴰⴳⴷⵍ", cam_error: "ⵓⵔ ⵏⵥⴹⴰⵕ ⴰⴷ ⵏⵕⵥⵎ ⵜⴰⴽⴰⵎⵉⵔⴰ", qr_detected: "✅ QR ⵉⵜⵜⵡⴰⴼ!", back: "ⴰⵖⵓⵍ", pg_real_gains: "ⵉⵔⴱⵃⵏ ⵏⵏⵓ ⵉⵎⵉⴷⵉⵏ", pg_delivered: "ⵉⴽⵓⵍⵉⵏ ⵜⵜⵓⴼⴽⴰⵏ", pg_handled: "ⵉⴽⵓⵍⵉⵏ ⵜⵜⵓⴷⴱⴰⵔⵏ", pg_real_note: "4 DH ⵉ ⵓⴽⵓⵍⵉ", pg_demo_zone: "ⴰⵙⴽⴰⵏ ⴷⵉⵎⵓ", write_msg: "ⴰⵔⵓ ⵜⴰⴱⵔⴰⵜ…", nf_sale: "💰 ⵜⴰⵣⵣⵏⵣⵉ! ⵙⵔⵙ « {t} » ⴳ bali", nf_pickup: "📦 « {t} » — ⴰⴽⵓⵍⵉ ⴳ ⵓⴱⵔⵉⴷ", nf_msg: "💬 ⵜⴰⵎⵙⴰⵡⴰⵍⵜ ⴰⴽⴷ {n}", link_copied: "🔗 ⵜⵜⵓⵏⵖⵍ ⵓⵥⴹⴰⵕ!", badge_inspect: "ⴰⵙⴽⴰⵏ ⴳ bali ⵇⴱⵍ ⵓⵅⵍⵍⴰⵚ", badge_refund: "ⵜⵜⵓⵔⴰⵔ 100% ⵎⴽ ⵓⵔ ⵉⵎⵎⵓ", fiab_note: "ⵉⵜⵜⵡⴰⵃⵙⴰⴱ ⵅⴼ ⵉⵙⴰⴳⵎⵏ", try_partner: "ⴰⵔⵣⵣⵓ ⵏ bali Partenaire", call_w: "ⵖⵕ", video_b: "ⵚⵓⵕ", listed: "ⵉⵜⵜⵡⴰⵙⵎⵔ", how_l: "ⵎⴰⵎⵏⴽ", sum_all: "ⴰⵎⴹⴰⵏ", you_receive: "ⴰⴷ ⵜⵔⵎⵙⴷ", dep_before: "ⵇⴱⵍ ⴰⴷ ⵜⵙⵔⵙⴷ", dep_btn: "ⵙⵔⵙ ⴰⴽⵓⵍⵉ", dep_show: "ⵙⴽⵏ ⴰⴷ ⴽⵓⴷ ⴳ ⵍⵃⴰⵏⵓⵜ", dep_status_ok: "ⵉⵜⵜⵡⴰⵙⵔⵙ", dep_status_todo: "ⴰⴷ ⵜⵙⵔⵙⴷ", dep_done_note: "ⴰⴽⵓⵍⵉ ⵉⵜⵜⵡⴰⵙⵔⵙ", dep_tip1: "ⵙⵡⵊⴷ ⴰⴼⵕⴹⵉⵚ", dep_tip2: "ⵔⵏⵓ ⴽⵓⴷ ⵏ ⵜⵟⵍⴰⴱⵜ", dep_tip3: "ⵚⵓⵕ ⴰⴽⵓⵍⵉ", deposit_title: "ⴰⵙⵔⵙ ⵏ ⵓⵎⵣⵣⵏⵣⴰ", sale_card_done: "ⵉⵜⵜⵡⴰⵣⵣⵏⵣ", sale_card_todo: "ⴰⴷ ⵜⵙⵔⵙⴷ", share_toast: "ⵜⵜⵓⵏⵖⵍ ⵓⵥⴹⴰⵕ", t_followed: "ⵜⴹⴼⵕⴷ {n}", t_paid: "ⵢⵜⵜⵡⴰⵅⵍⵍⵚ!", t_published: "« {t} » ⵉⵜⵜⵡⴰⵙⵎⵔ ✅", t_need: "ⵔⵏⵓ ⴰⵣⵡⵍ ⴷ ⵓⵜⵉⴳ", t_accepted: "ⴰⵙⵓⵎⵔ ⵉⵜⵜⵡⴰⵇⴱⵍ", t_offer_sent: "ⴰⵙⵓⵎⵔ {x} ⵢⵜⵜⵡⴰⵣⵏ", t_msg_sent: "ⵜⴰⴱⵔⴰⵜ ⵜⵜⵓⵣⵏ ⵉ {n}",
    nav_home: "ⴰⵎⵣⵡⴰⵔⵓ", nav_explore: "ⴰⵔⵣⵣⵓ", nav_sell: "ⵣⵣⵏⵣ", nav_msg: "ⵜⵉⴱⵔⴰⵜⵉⵏ", nav_profile: "ⴰⵎⵉⴹⴰⵏ",
    selection: "ⴰⵙⵜⴰⵢ ⵏ ⵡⴰⵙⵙ", explore: "ⴰⵔⵣⵣⵓ", categories: "ⵜⴰⴳⴳⴰⵢⵉⵏ",
    sell_title: "ⵣⵣⵏⵣ", price_label: "ⴰⵜⵉⴳ", publish: "ⵙⵙⵓⴼⵖ",
    messages: "ⵜⵉⴱⵔⴰⵜⵉⵏ", accept: "ⵇⴱⵍ", buy: "ⵙⵖ", send_offer: "ⴰⵣⵏ ⴰⵙⵓⵎⵔ",
    wach: "ⵉⵙ ⵙⵓⵍ ⵉⵍⵍⴰ? 👀", language: "ⵜⵓⵜⵍⴰⵢⵜ", choose_lang: "ⴼⵔⵏ ⵜⵓⵜⵍⴰⵢⵜ",
  },
  en: {
    nav_home: "Home", nav_explore: "Explore", nav_sell: "Sell", nav_msg: "Messages", nav_profile: "Profile",
    search_ph: "Caftan, iPhone, Air Force…", banner1: "Empty your closet, fill your wallet",
    banner2: "0% seller fees · Pickup at your local hanout 🇲🇦", selection: "Today's picks",
    f_all: "All", f_sneakers: "Sneakers", f_tech: "Tech", f_femmes: "Women", f_hommes: "Men", f_trad: "Traditional",
    explore: "Explore", search_on: "Search on bali…", trends: "TRENDING 🔥", categories: "CATEGORIES",
    cat_femmes: "Women", cat_hommes: "Men", cat_enfants: "Kids", cat_sneakers: "Sneakers",
    cat_tech: "Tech", cat_maison: "Home", cat_trad: "Traditional", cat_sport: "Sports",
    sell_title: "Sell an item", sell_sub: "Free. You keep 100% of the sale price.",
    add_photo: "Add", title_ph: "Title — e.g. Adidas Samba sneakers 41",
    desc_ph: "Description — condition, size, details…",
    cat_label: "CATEGORY", cond_label: "CONDITION", price_label: "PRICE",
    conds: ["New with tags", "Like new", "Very good", "Good"],
    scats: ["Women", "Men", "Kids", "Tech", "Home", "Traditional"],
    you_receive: "You receive", buyer_pays: "Buyer pays {x} DH (bali protection included)", publish: "List item",
    messages: "Messages", write_msg: "Write a message…",
    offer_label: "Price offer", accept: "Accept", counter: "Counter-offer", accepted: "Offer accepted",
    waiting: "Waiting for reply…", buy: "Buy", make_offer: "Make an offer",
    negotiate: "Negotiate the price 🤝", listed: "Listed price", your_price: "Your price", send_offer: "Send offer",
    cod: "Cash on delivery", protection: "bali protection",
    how_title: "How it works",
    how_text: "You order → the seller ships within 3 days → you pay on delivery or online → bali releases the money once the item checks out. Zero scams.",
    wach: "Still available? 👀", with_prot: "with protection", prot_incl: "protection included", sales_w: "sales",
    member: "Member since 2026", wallet: "BALI WALLET", transfer: "Transfer to my bank",
    dressing: "My closet", sell_new: "Sell a new item",
    s_sales: "Sales", s_followers: "Followers", s_favs: "Favorites",
    language: "Language", choose_lang: "Choose your language", beta: "beta", logout: "Log out", logout_done: "Logged out ✅",
    msgs_none: "No conversations yet — make an offer on an item!", parcourir: "Browse", wallet_soon: "🔜 Bank transfer — coming with real payments", link_copied: "🔗 Link copied!", nf_sale: "💰 New sale! Drop « {t} » at the bali point", nf_pickup: "📦 « {t} » — parcel on its way to your bali point", nf_msg: "💬 Chat with {n}", my_favs: "My favorites", seller_empty: "This seller has no items online", login_first: "Sign in to follow", cant_follow_self: "You can't follow yourself 😄", t_unfollowed: "You unfollowed {n}", following_btn: "Following", follow_demo: "Demo seller", followers_w: "followers", relay_title: "bali point", relay_verified: "Verified point", relay_reliable: "reliability", relay_dist: "Distance", relay_map_soon: "Interactive map coming soon", relay_call: "Call the point", relay_note: "Inspect your parcel on site before confirming pickup", relay_see: "See point details", no_notifs: "No notifications yet", nf_new_listing: "🆕 {n} listed a new item", nf_offer: "💰 New offer: {x} DH", nf_new_msg: "💬 New message", nf_dropped: "📦 Your parcel is on its way to the bali point", nf_handed: "✅ Parcel handed over — transaction complete", nf_paid_seller: "🎉 Sold and paid! Your parcel was handed over", remove_photo: "Remove photo", cam_start: "Start camera", cam_stop: "Stop", cam_hint: "Point at the customer QR code", cam_denied: "Camera permission denied", cam_error: "Cannot open camera", qr_detected: "✅ QR detected!", back: "Back", pg_real_gains: "MY REAL EARNINGS", pg_delivered: "parcels delivered", pg_handled: "parcels handled", pg_real_note: "4 DH per delivered parcel · based on your real handovers", pg_demo_zone: "demo preview — will be wired to real data", badge_inspect: "Inspect at the bali point before the seller is paid", g_mode: "Fashion & clothing", g_chauss: "Shoes", g_beaute: "Beauty & fragrance", g_tech: "Tech", g_enfants: "Kids & toys", g_maison: "Home", g_sport: "Sport", g_loisirs: "Hobbies", g_autres: "Other brands", g_lettres: "Clothing sizes", g_tailles_num: "Trouser sizes", g_pointures: "Shoe sizes", g_ages: "Kids ages", brand_search: "Search a brand", badge_refund: "100% refund if not as described", ai_flow: "📸 Photo → ✍️ Title written → 💰 Price estimated", fiab_note: "Based on your validated pickups", r_item: "Item", r_deliv: "Delivery", voir_tout: "See all", cat_livres: "Books & media", cat_loisirs: "Hobbies & collectibles", empty_cat: "Nothing here yet", empty_cat_cta: "Be the first to sell here", own_item: "This is your listing", delete_item: "Delete listing", deleted_ok: "Listing deleted ✅",
    real_order_title: "Order confirmed 🎉", real_pin_note: "Your pickup code — write it down, it won't be shown again in plain text.",
    filters_title: "Filters", filter_cat: "Category", filter_brand: "Brand", filter_size: "Size",
    filter_cond: "Condition", filter_price: "Price (DH)", filter_sort: "Sort by",
    sort_recent: "Most recent", sort_price_asc: "Price: low to high", sort_price_desc: "Price: high to low", sort_popular: "Most popular",
    filter_reset: "Reset", filter_apply: "See {n} items",
    price_min_ph: "Min", price_max_ph: "Max", sum_all: "All", chip_sort: "Sort",
    real_order_ok: "I've noted it ✓", my_orders: "My orders", no_orders: "No orders yet", admin_panel: "bali Admin", adm_stats: "Metrics", adm_mod: "Moderation",
    adm_users: "Members", adm_items: "Listings", adm_active: "Active", adm_orders: "Orders", adm_gmv: "Total volume", adm_rev: "Protection revenue", adm_held: "In escrow", adm_done: "Completed", adm_remove: "Remove", adm_recent_orders: "Recent orders",
    tab_buys: "My purchases", tab_sells: "My sales", no_buys: "No purchases yet", no_sells: "No sales yet",
    role_buy: "Purchase", role_sell: "Sale", other_buyer: "Buyer", other_seller: "Seller",
    st_paid: "Paid · to drop off", st_dropped: "Dropped at bali point", st_transit: "In transit", st_ready: "Ready for pickup", st_done: "Completed", st_sold: "Sold",
    deposit_cta: "Drop off at bali point", deposit_done: "Parcel dropped ✅ — buyer notified",
    hverif_title: "Hand over a parcel", hverif_sub: "Enter the order code + the customer's PIN",
    hverif_code: "Order code (BAL-...)", hverif_pin: "Customer PIN (4 digits)",
    hverif_btn: "Verify and hand over", hverif_ok: "✅ Correct code — parcel handed to the customer!",
    hverif_bad: "❌ Wrong PIN — do not hand over the parcel", hverif_notfound: "Order not found or already handed over",
    hverif_wrongstatus: "This parcel is not ready to be handed over yet", real_parcels: "Real bali parcels", p_to_receive: "To receive (seller drop-off)", p_to_handover: "To hand to customer", p_demo: "demo", p_none: "No real parcels in circulation yet",
    sale_new_banner: "🎉 New sale! Drop the parcel at the bali point", to_deposit: "to drop off",
    order_pin_hidden: "Code hidden for your security",
    t_msg_sent: "Message sent to {n}", t_offer_sent: "Offer of {x} DH sent ✅",
    t_accepted: "Offer accepted — sold! 🎉", t_published: "\u201C{t}\u201D is now live 🎉",
    t_order: "Order simulated — cash on delivery ✅", t_need: "Add a title and a price 🙂",
    ai_cta1: "AI listing", ai_cta2: "Snap a photo — AI writes the listing and prices it for the market",
    ai_btn: "Create with AI", ai_loading: "AI is analyzing your photo…",
    ai_sub_loading: "Detecting the item · estimating Moroccan market price",
    ai_done: "Listing generated ✨ Review and adjust", ai_error: "AI couldn't analyze the photo — retry or fill manually",
    ai_invalid: "Photo not recognized as a sellable item — try another angle",
    ai_sugg: "AI suggested price", ai_range: "Market range",
    delivery_label: "DELIVERY", d_point: "bali point · Hanout Al Amal (650 m)",
    d_home: "Home · Amana", d_express: "Express · Cathedis",
    sadaqa: "Sadaqa mode 🤲", sadaqa_sub: "Sale proceeds go to a charity",
    sadaqa_on: "You donate {x} DH to the partner charity 🤲",
    b_score: "Buyer reliability", b_refus: "0 refused parcels",
    b_trust: "Sellers trust you — your offers get priority",
    video_b: "Packing on video", total_w: "Total",
    ticket_title: "Pickup ticket", my_order: "My order",
    order_ready: "Your parcel arrived at the bali point 🎉",
    order_confirm_prompt: "Parcel picked up — confirm reception 👇",
    view_ticket: "View my ticket", show_pin: "Show PIN", hide_pin: "Hide PIN",
    pin_warn: "Never share this code. Only the shopkeeper will ask for it, in person, at handover.",
    cod_pay: "Pay on pickup", qr_regen: "New QR in {s}s", single_use: "single use",
    point_relay: "Pickup point", route: "Directions", call_w: "Call",
    tl_ordered: "Ordered", tl_dropped: "Dropped by seller", tl_transit: "In transit",
    tl_arrived: "Arrived at point", tl_picked: "Picked up",
    pickup_by: "Pick up before {d} — or it returns to the seller",
    secu_line: "Secure handover: rotating QR · PIN code · geolocated scan",
    try_partner: "Try the shopkeeper side (demo)",
    confirm_q: "Item as described?", confirm_ok: "Yes — release payment", confirm_ko: "Report an issue",
    funds_ok: "Payment released to the seller ✅ Thanks!",
    funds_frozen: "Funds frozen. Our team will contact you within 24h.",
    check_title: "bali Check ✅", check_l1: "IMEI verified with carriers", check_l2: "Not reported stolen · invoice checked",
    imei_label: "IMEI (automatic anti-theft check)", imei_ph: "Dial *#06# on the phone",
    inspect_title: "Inspect before confirming", insp_1: "Item matches the photos",
    insp_2: "Works / good overall condition", insp_3: "Right size and model",
    inspect_hint: "Do it at the hanout before leaving — payment is only released after you confirm.",
    discreet: "Discreet mode 🔒", discreet_sub: "Name and photo hidden. Contact via bali messages only.",
    discreet_badge: "Discreet profile",
    pay_title: "bali Pay", recharge: "Top up with cash",
    cashin_txt: "Top up at 4,000+ partner agents (Cash Plus, Wafacash, Barid Cash) or by card — credited instantly. No bank account needed.",
    cote_line: "bali index · based on {n} similar sales in Morocco",
    share_toast: "Listing link copied — share it on WhatsApp 📲",
    trust_title: "Guarantees & human support",
    trust_help_sub: "Reply in under 2h · Darija, French, Arabic · 7/7",
    trust_agent: "Amina · bali Support · online",
    trust_whatsapp: "Continue on WhatsApp",
    trust_toast: "Opening WhatsApp 📲 (demo)",
    g1: "A real human replies in under 2 hours — never a bot on a loop.",
    g2: "Disputes settled within 72h max, on evidence: packing video + pickup inspection.",
    g3: "Seller AND buyer protected — the custody chain shows who's at fault.",
    g4: "Zero hidden fees: everything is shown before you pay.",
    g5: "No account ever blocked without human review and a right to reply.",
    results_w: "{n} results", no_results: "No results for \u201C{q}\u201D",
    try_else: "Try another keyword or browse categories 👇",
    follow: "Follow", t_followed: "You follow {n} ✅", items_w: "items",
    ob_continue: "Continue", ob_skip: "Skip",
    ob_title2: "The souk in your pocket",
    ob_v1: "0% seller fees — you keep 100% of the price",
    ob_v2: "100% secure payment · pick up at your local hanout",
    ob_v3: "Buyer and seller protected — a human replies in 2h",
    ob_phone: "Your phone number", ob_send: "Get SMS code",
    ob_code: "Enter the code you received", ob_hint: "Demo: any 4-digit code",
    ob_done: "Welcome to bali! 🎉",
    notifs_title: "Notifications",
    n1: "💰 Salma.R offered 800 DH for the caftan · 5 min ago",
    n2: "📦 Your order BAL-7F2K9 arrived at the pickup point · 2h ago",
    n3: "❤️ The iPhone 12 you follow dropped to 3,800 DH · 6h ago",
    n4: "👤 Imane_Tng now follows your closet · yesterday",
    checkout_title: "Confirm order", pay_method: "PAYMENT",
    pm_card: "Bank card · CMI", pm_wallet: "bali Pay balance · 340 DH",
    insufficient: "Insufficient balance", confirm_order: "Confirm order ✅",
    t_paid: "Payment accepted — order confirmed ✅",
    pm_pickup: "Pay at pickup · in-app, after inspection",
    tsbiq: "Reservation deposit",
    tsbiq_waived: "0 DH — your 98% reliability score waives it",
    tsbiq_new: "New accounts reserve with a 20% deposit",
    reserve_note: "The seller only ships once your reservation is confirmed. No-show within 7 days? Free return for them, covered by the deposit — and your score drops.",
    no_cash_hanout: "The shopkeeper never touches money: everything goes through the app.",
    pay_release: "Pay {x} DH — release the seller ✅",
    seller_guar_t: "Seller guarantee",
    seller_guar: "If the buyer never picks up: free return + compensation from their deposit. You never lose a dirham.",
    t_reserved: "Reservation confirmed ✅ The seller can ship 📦",
    gift_title: "Welcome gift", gift_claim: "Claim it 🎉",
    synopsis_title: "How it works",
    syn_buy: "🛒 To buy", syn_sell: "💰 To sell",
    syn_b1: "Find an item and pay securely", syn_b2: "Pick it up at your local hanout", syn_b3: "Inspect it: seller paid only if all is good",
    syn_s1: "Photograph your item, AI writes the listing", syn_s2: "Sold? Drop the parcel at the hanout", syn_s3: "Get your money, 0% commission",
    syn_start: "Let's go! 🎉",
    gift_text: "−20 DH off your first order, applied automatically at checkout.",
    gift_applied: "Code MARHBA20 activated — 20 DH off your first order ✅",
    deals_title: "⚡ Today's deals", ends_in: "Ends in {t}",
    viewers_line: "{n} people are viewing this item right now",
    hot_badge: "In demand",
    s1: "Order", s2: "Pick up at hanout", s3: "Inspect & collect",
    become_point: "Become a bali point 🏪", become_sub: "Earn 4–5 DH per parcel · zero cash to handle",
    paid_t: "Already paid", paid_sub: "Your money is held safely by bali. The seller only gets paid after your inspection at pickup.",
    no_card: "No bank card?",
    opt_cash: "Top up with cash at an agent (Cash Plus, Wafacash…) — item held 48h",
    opt_khel: "Khellesli — a relative pays for you via WhatsApp link",
    khel_toast: "Payment link sent on WhatsApp 📲 (demo)",
    d_amana_point: "Amana (Post) → your bali point · inspection at pickup",
    d_amana_home: "Amana (Post) → home",
    d_express_far: "Cathedis Express → home",
    reco: "Recommended",
    smart_route: "Route optimized automatically · {a} ↔ {b}",
    far_protect: "Long distance: parcel insured — seller refunded 100% if the carrier loses it.",
    eta_tmw: "tomorrow", eta_12: "1-2 d", eta_today: "today", eta_24: "2-4 d", eta_2448: "24-48 h",
    sale_card_todo: "Sold! Drop off your parcel 📦", sale_card_done: "Parcel dropped — on its way 🚚",
    deposit_title: "Parcel drop-off",
    dep_status_todo: "To drop off", dep_status_ok: "Dropped ✅",
    dep_show: "Show this QR to the shopkeeper — they scan it and take custody.",
    dep_before: "Drop off before {d} — or the sale is cancelled and the buyer refunded",
    dep_tip1: "Pack it well (bag + tape)", dep_tip2: "Film the packing 🎥 — your proof in a dispute",
    dep_tip3: "Write the code {c} on the parcel",
    dep_btn: "Simulate the drop-off (demo)",
    dep_done_note: "Custody transferred to the hanout ✅ On its way to {n}",
    after_insp: "credited to your balance after the buyer's inspection · 0% fees",
    tl_sold: "Sold 🎉", tl_paid2: "Money paid out",
  },
  es: {
    after_insp: "Pagado al vendedor tras inspección", become_point: "Conviértete en punto bali 🏪", become_sub: "Gana 4-5 DH por paquete · sin efectivo", cashin_txt: "Recarga en efectivo con un agente", check_l1: "Verifica el artículo antes de pagar", check_l2: "El vendedor cobra solo si todo está bien", check_title: "Inspección en el punto bali", checkout_title: "Finalizar compra", confirm_order: "Confirmar el pedido", cote_line: "Precio de mercado estimado", deals_title: "Ofertas del día", dep_before: "Antes de depositar", dep_btn: "Depositar el paquete", dep_done_note: "Paquete depositado, comprador avisado", dep_show: "Muestra este código en el hanout", dep_status_ok: "Depositado", dep_status_todo: "Por depositar", dep_tip1: "Empaqueta bien el artículo", dep_tip2: "Añade el código de pedido", dep_tip3: "Filma el empaquetado", deposit_title: "Depósito del vendedor", discreet: "Modo discreto", discreet_badge: "Discreto", discreet_sub: "Tu nombre queda oculto", ends_in: "Termina en", far_protect: "Paquete asegurado — reembolso 100%", follow: "Seguir", funds_frozen: "Fondos retenidos en depósito", funds_ok: "Fondos liberados al vendedor", gift_applied: "Regalo aplicado ✅", gift_claim: "Aprovechar 🎉", gift_text: "20 DH de descuento en tu 1ª compra", gift_title: "Regalo de bienvenida", imei_label: "IMEI (opcional)", imei_ph: "Introduce el IMEI", inspect_hint: "Abre y revisa antes de aceptar", inspect_title: "Inspecciona tu compra", insufficient: "Saldo insuficiente", items_w: "artículos", khel_toast: "Enlace Khellesli copiado", no_card: "¿Sin tarjeta?", no_results: "Sin resultados para « {q} »", notifs_title: "Notificaciones", ob_code: "Introduce el código recibido", ob_continue: "Continuar", ob_phone: "¿Tu número de teléfono?", ob_send: "Recibir el código SMS", ob_skip: "Saltar", ob_title2: "La confianza en tu bolsillo", ob_v1: "Compra y vende con seguridad", ob_v2: "Recogida en el hanout del barrio", ob_v3: "Pago protegido hasta la entrega", opt_cash: "Pagar en efectivo", opt_khel: "Que pague un allegado (Khellesli)", paid_sub: "Tu pago está protegido", paid_t: "¡Pago realizado!", pay_method: "Método de pago", pay_title: "Pago", pm_card: "Tarjeta bancaria", pm_wallet: "Monedero bali", recharge: "Recargar", reco: "recomendado", results_w: "{n} resultados", s1: "Encuentra tu artículo", s2: "Recógelo en el hanout", s3: "Inspecciona y valida", sale_card_done: "Vendido", sale_card_todo: "Por depositar", seller_guar: "Garantías y ayuda humana", seller_guar_t: "Estás protegido", share_toast: "Enlace copiado", smart_route: "Entrega inteligente", syn_buy: "🛒 Para comprar", syn_sell: "💰 Para vender", syn_start: "¡Vamos! 🎉", synopsis_title: "Cómo funciona", t_followed: "Sigues a {n}", t_paid: "¡Pago realizado!", trust_agent: "Inspección antes de pagar", trust_help_sub: "Un equipo humano te responde", trust_title: "Por qué confiar en bali", trust_toast: "bali te protege", trust_whatsapp: "Ayuda por WhatsApp", try_else: "Prueba con otra búsqueda",
    nav_home: "Inicio", nav_explore: "Explorar", nav_sell: "Vender", nav_msg: "Mensajes", nav_profile: "Perfil",
    search_ph: "Caftán, iPhone, Air Force…", banner1: "Vacía tu armario, llena tu cartera",
    banner2: "0% comisión al vendedor · Recogida en el hanout del barrio 🇲🇦", selection: "Selección del día",
    f_all: "Todo", f_sneakers: "Zapatillas", f_tech: "Tech", f_femmes: "Mujer", f_hommes: "Hombre", f_trad: "Tradicional",
    explore: "Explorar", search_on: "Buscar en bali…", trends: "TENDENCIAS 🔥", categories: "CATEGORÍAS",
    cat_femmes: "Mujer", cat_hommes: "Hombre", cat_enfants: "Niños", cat_sneakers: "Zapatillas",
    cat_tech: "Tech", cat_maison: "Hogar", cat_trad: "Tradicional", cat_sport: "Deporte",
    sell_title: "Vender un artículo", sell_sub: "Gratis. Recibes el 100% del precio.",
    add_photo: "Añadir", title_ph: "Título — ej.: Adidas Samba 41",
    desc_ph: "Descripción — estado, talla, detalles…",
    cat_label: "CATEGORÍA", cond_label: "ESTADO", price_label: "PRECIO",
    conds: ["Nuevo con etiqueta", "Como nuevo", "Muy buen estado", "Buen estado"],
    scats: ["Mujer", "Hombre", "Niños", "Tech", "Hogar", "Tradicional"],
    you_receive: "Recibes", buyer_pays: "El comprador paga {x} DH (protección bali incluida)", publish: "Publicar",
    messages: "Mensajes", write_msg: "Escribe un mensaje…",
    offer_label: "Oferta de precio", accept: "Aceptar", counter: "Contraoferta", accepted: "Oferta aceptada",
    waiting: "Esperando respuesta…", buy: "Comprar", make_offer: "Hacer una oferta",
    negotiate: "Negocia el precio 🤝", listed: "Precio publicado", your_price: "Tu precio", send_offer: "Enviar oferta",
    cod: "Pago contra entrega", protection: "Protección bali",
    how_title: "Cómo funciona",
    how_text: "Pides → el vendedor envía en 3 días → pagas al recibir o en línea → bali libera el dinero cuando el artículo está conforme. Cero estafas.",
    wach: "¿Sigue disponible? 👀", with_prot: "con protección", prot_incl: "protección incluida", sales_w: "ventas",
    member: "Miembro desde 2026", wallet: "CARTERA BALI", transfer: "Transferir a mi banco",
    dressing: "Mi armario", sell_new: "Vender otro artículo",
    s_sales: "Ventas", s_followers: "Seguidores", s_favs: "Favoritos",
    language: "Idioma", choose_lang: "Elige tu idioma", beta: "beta", logout: "Cerrar sesión", logout_done: "Sesión cerrada ✅",
    msgs_none: "Sin conversaciones — ¡haz una oferta!", parcourir: "Explorar", wallet_soon: "🔜 Transferencia bancaria — llega con el pago real", link_copied: "🔗 ¡Enlace copiado!", nf_sale: "💰 ¡Nueva venta! Deposita « {t} » en el punto bali", nf_pickup: "📦 « {t} » — paquete en camino a tu punto", nf_msg: "💬 Chat con {n}", my_favs: "Mis favoritos", seller_empty: "Este vendedor no tiene artículos", login_first: "Inicia sesión para seguir", cant_follow_self: "No puedes seguirte a ti mismo 😄", t_unfollowed: "Dejaste de seguir a {n}", following_btn: "Siguiendo", follow_demo: "Vendedor de demostración", followers_w: "seguidores", relay_title: "Punto bali", relay_verified: "Punto verificado", relay_reliable: "fiabilidad", relay_dist: "Distancia", relay_map_soon: "Mapa interactivo pronto", relay_call: "Llamar al punto", relay_note: "Inspecciona tu paquete antes de confirmar la recogida", relay_see: "Ver ficha del punto", no_notifs: "Sin notificaciones aún", nf_new_listing: "🆕 {n} publicó un artículo", nf_offer: "💰 Nueva oferta: {x} DH", nf_new_msg: "💬 Nuevo mensaje", nf_dropped: "📦 Tu paquete va camino al punto bali", nf_handed: "✅ Paquete entregado — transacción completa", nf_paid_seller: "🎉 ¡Vendido y pagado! Tu paquete fue entregado", remove_photo: "Quitar foto", cam_start: "Activar cámara", cam_stop: "Detener", cam_hint: "Apunta al QR del cliente", cam_denied: "Permiso de cámara denegado", cam_error: "No se puede abrir la cámara", qr_detected: "✅ ¡QR detectado!", back: "Atrás", pg_real_gains: "MIS GANANCIAS REALES", pg_delivered: "paquetes entregados", pg_handled: "paquetes gestionados", pg_real_note: "4 DH por paquete entregado · según tus entregas reales", pg_demo_zone: "vista demo — se conectará a datos reales", badge_inspect: "Inspecciona en el punto bali antes de pagar al vendedor", g_mode: "Moda y ropa", g_chauss: "Zapatos", g_beaute: "Belleza y perfumes", g_tech: "Tecnología", g_enfants: "Niños y juguetes", g_maison: "Hogar", g_sport: "Deporte", g_loisirs: "Ocio", g_autres: "Otras marcas", g_lettres: "Tallas ropa", g_tailles_num: "Tallas pantalón", g_pointures: "Tallas calzado", g_ages: "Edades niños", brand_search: "Buscar una marca", badge_refund: "Reembolso 100% si no es conforme", ai_flow: "📸 Foto → ✍️ Título redactado → 💰 Precio estimado", fiab_note: "Basado en tus recogidas validadas", r_item: "Artículo", r_deliv: "Envío", voir_tout: "Ver todo", cat_livres: "Libros y media", cat_loisirs: "Ocio y colecciones", empty_cat: "Aún no hay artículos aquí", empty_cat_cta: "Sé el primero en vender aquí", own_item: "Es tu anuncio", delete_item: "Eliminar anuncio", deleted_ok: "Anuncio eliminado ✅",
    real_order_title: "Pedido confirmado 🎉", real_pin_note: "Tu código de recogida — anótalo, no volverá a mostrarse en texto claro.",
    filters_title: "Filtros", filter_cat: "Categoría", filter_brand: "Marca", filter_size: "Talla",
    filter_cond: "Estado", filter_price: "Precio (DH)", filter_sort: "Ordenar por",
    sort_recent: "Más reciente", sort_price_asc: "Precio: menor a mayor", sort_price_desc: "Precio: mayor a menor", sort_popular: "Más popular",
    filter_reset: "Restablecer", filter_apply: "Ver {n} artículos",
    price_min_ph: "Mín", price_max_ph: "Máx", sum_all: "Todos", chip_sort: "Ordenar",
    real_order_ok: "Lo he anotado ✓", my_orders: "Mis pedidos", no_orders: "Aún no hay pedidos", admin_panel: "Admin bali", adm_stats: "Cifras", adm_mod: "Moderación",
    adm_users: "Miembros", adm_items: "Anuncios", adm_active: "Activos", adm_orders: "Pedidos", adm_gmv: "Volumen total", adm_rev: "Ingreso protección", adm_held: "En depósito", adm_done: "Completados", adm_remove: "Quitar", adm_recent_orders: "Pedidos recientes",
    tab_buys: "Mis compras", tab_sells: "Mis ventas", no_buys: "Sin compras aún", no_sells: "Sin ventas aún",
    role_buy: "Compra", role_sell: "Venta", other_buyer: "Comprador", other_seller: "Vendedor",
    st_paid: "Pagada · por depositar", st_dropped: "Depositada en punto bali", st_transit: "En camino", st_ready: "Lista para recoger", st_done: "Completada", st_sold: "Vendido",
    deposit_cta: "Depositar en punto bali", deposit_done: "Paquete depositado ✅ — comprador avisado",
    hverif_title: "Entregar un paquete", hverif_sub: "Introduce el código de pedido + el PIN del cliente",
    hverif_code: "Código de pedido (BAL-...)", hverif_pin: "PIN del cliente (4 dígitos)",
    hverif_btn: "Verificar y entregar", hverif_ok: "✅ Código correcto — ¡paquete entregado al cliente!",
    hverif_bad: "❌ PIN incorrecto — no entregues el paquete", hverif_notfound: "Pedido no encontrado o ya entregado",
    hverif_wrongstatus: "Este paquete aún no está listo para entregar", real_parcels: "Paquetes reales bali", p_to_receive: "Por recibir (depósito vendedor)", p_to_handover: "Por entregar al cliente", p_demo: "demo", p_none: "No hay paquetes reales en circulación aún",
    sale_new_banner: "🎉 ¡Nueva venta! Deposita el paquete en el punto bali", to_deposit: "por depositar",
    order_pin_hidden: "Código oculto por tu seguridad",
    t_msg_sent: "Mensaje enviado a {n}", t_offer_sent: "¡Oferta de {x} DH enviada ✅!",
    t_accepted: "Oferta aceptada — ¡vendido! 🎉", t_published: "«{t}» ya está en línea 🎉",
    t_order: "Pedido simulado — pago contra entrega ✅", t_need: "Añade un título y un precio 🙂",
    ai_cta1: "Anuncio con IA", ai_cta2: "Haz una foto — la IA redacta el anuncio y estima el precio",
    ai_btn: "Crear con IA", ai_loading: "La IA analiza tu foto…",
    ai_sub_loading: "Detectando el artículo · estimando el precio del mercado",
    ai_done: "Anuncio generado ✨ Revisa y ajusta", ai_error: "La IA no pudo analizar la foto — reintenta o rellena a mano",
    ai_invalid: "La foto no parece un artículo en venta — prueba otro ángulo",
    ai_sugg: "Precio sugerido por la IA", ai_range: "Rango de mercado",
    delivery_label: "ENTREGA", d_point: "Punto bali · Hanout Al Amal (650 m)",
    d_home: "Domicilio · Amana", d_express: "Exprés · Cathedis",
    sadaqa: "Modo Sadaqa 🤲", sadaqa_sub: "El importe se dona a una asociación",
    sadaqa_on: "Donas {x} DH a la asociación 🤲",
    b_score: "Fiabilidad del comprador", b_refus: "0 paquetes rechazados",
    b_trust: "Los vendedores confían en ti — tus ofertas tienen prioridad",
    video_b: "Embalaje en vídeo", total_w: "Total",
    ticket_title: "Ticket de recogida", my_order: "Mi pedido",
    order_ready: "Tu paquete llegó al punto bali 🎉",
    order_confirm_prompt: "Paquete recogido — confirma la recepción 👇",
    view_ticket: "Ver mi ticket", show_pin: "Mostrar PIN", hide_pin: "Ocultar PIN",
    pin_warn: "Nunca compartas este código. Solo el tendero te lo pedirá, en persona, en la entrega.",
    cod_pay: "Pagar al recoger", qr_regen: "Nuevo QR en {s}s", single_use: "uso único",
    point_relay: "Punto de recogida", route: "Cómo llegar", call_w: "Llamar",
    tl_ordered: "Pedido", tl_dropped: "Depositado por el vendedor", tl_transit: "En camino",
    tl_arrived: "Llegó al punto", tl_picked: "Recogido",
    pickup_by: "Recógelo antes del {d} — o vuelve al vendedor",
    secu_line: "Entrega segura: QR rotativo · código PIN · escaneo geolocalizado",
    try_partner: "Probar el lado del tendero (demo)",
    confirm_q: "¿Artículo conforme?", confirm_ok: "Sí — liberar el pago", confirm_ko: "Reportar un problema",
    funds_ok: "Pago liberado al vendedor ✅ ¡Gracias!",
    funds_frozen: "Fondos congelados. Te contactamos en 24h.",
    check_title: "bali Check ✅", check_l1: "IMEI verificado con los operadores", check_l2: "No denunciado robado · factura comprobada",
    imei_label: "IMEI (verificación antirrobo automática)", imei_ph: "Marca *#06# en el teléfono",
    inspect_title: "Inspecciona antes de confirmar", insp_1: "El artículo coincide con las fotos",
    insp_2: "Funciona / buen estado", insp_3: "Talla y modelo correctos",
    inspect_hint: "Hazlo en el hanout antes de salir — el pago solo se libera tras tu confirmación.",
    discreet: "Modo discreto 🔒", discreet_sub: "Nombre y foto ocultos. Contacto solo por mensajes bali.",
    discreet_badge: "Perfil discreto",
    pay_title: "bali Pay", recharge: "Recargar en efectivo",
    cashin_txt: "Recarga en más de 4.000 agentes (Cash Plus, Wafacash, Barid Cash) o con tarjeta — al instante. Sin cuenta bancaria.",
    cote_line: "Índice bali · basado en {n} ventas similares en Marruecos",
    share_toast: "Enlace copiado — compártelo en WhatsApp 📲",
    trust_title: "Garantías y soporte humano",
    trust_help_sub: "Respuesta en menos de 2h · dariya, francés, árabe · 7/7",
    trust_agent: "Amina · Soporte bali · en línea",
    trust_whatsapp: "Continuar en WhatsApp",
    trust_toast: "Abriendo WhatsApp 📲 (demo)",
    g1: "Un humano real te responde en menos de 2 horas — nunca un bot en bucle.",
    g2: "Disputas resueltas en máx. 72h, con pruebas: vídeo de embalaje + inspección al recoger.",
    g3: "Vendedor Y comprador protegidos — la cadena de custodia señala al responsable.",
    g4: "Cero comisiones ocultas: todo se muestra antes de pagar.",
    g5: "Ninguna cuenta bloqueada sin revisión humana y derecho a réplica.",
    results_w: "{n} resultados", no_results: "Sin resultados para «{q}»",
    try_else: "Prueba otra palabra o explora las categorías 👇",
    follow: "Seguir", t_followed: "Sigues a {n} ✅", items_w: "artículos",
    ob_continue: "Continuar", ob_skip: "Saltar",
    ob_title2: "El zoco en tu bolsillo",
    ob_v1: "0% comisión al vendedor — te quedas el 100% del precio",
    ob_v2: "Pago 100% seguro · recogida en el hanout del barrio",
    ob_v3: "Comprador y vendedor protegidos — un humano responde en 2h",
    ob_phone: "Tu número de teléfono", ob_send: "Recibir código SMS",
    ob_code: "Introduce el código recibido", ob_hint: "Demo: cualquier código de 4 cifras",
    ob_done: "¡Bienvenido a bali! 🎉",
    notifs_title: "Notificaciones",
    n1: "💰 Salma.R ofrece 800 DH por el caftán · hace 5 min",
    n2: "📦 Tu pedido BAL-7F2K9 llegó al punto de recogida · hace 2h",
    n3: "❤️ El iPhone 12 que sigues bajó a 3.800 DH · hace 6h",
    n4: "👤 Imane_Tng sigue tu armario · ayer",
    checkout_title: "Confirmar pedido", pay_method: "PAGO",
    pm_card: "Tarjeta bancaria · CMI", pm_wallet: "Saldo bali Pay · 340 DH",
    insufficient: "Saldo insuficiente", confirm_order: "Confirmar pedido ✅",
    t_paid: "Pago aceptado — pedido confirmado ✅",
    pm_pickup: "Paga al recoger · en la app, tras la inspección",
    tsbiq: "Depósito de reserva",
    tsbiq_waived: "0 DH — tu fiabilidad del 98% te exime",
    tsbiq_new: "Las cuentas nuevas reservan con un 20% de depósito",
    reserve_note: "El vendedor solo envía tras confirmar tu reserva. ¿No vienes en 7 días? Devolución gratis para él, cubierta por el depósito — y tu puntuación baja.",
    no_cash_hanout: "El tendero nunca toca el dinero: todo pasa por la app.",
    pay_release: "Paga {x} DH — libera al vendedor ✅",
    seller_guar_t: "Garantía del vendedor",
    seller_guar: "Si el comprador no recoge: devolución gratis + compensación de su depósito. Nunca pierdes un dírham.",
    t_reserved: "Reserva confirmada ✅ El vendedor puede enviar 📦",
    gift_title: "Regalo de bienvenida", gift_claim: "Lo aprovecho 🎉",
    synopsis_title: "Cómo funciona",
    syn_buy: "🛒 Para comprar", syn_sell: "💰 Para vender",
    syn_b1: "Encuentra un artículo y paga seguro", syn_b2: "Recógelo en el hanout de tu barrio", syn_b3: "Inspecciónalo: se paga al vendedor solo si todo está bien",
    syn_s1: "Fotografía tu artículo, la IA redacta el anuncio", syn_s2: "¿Vendido? Deja el paquete en el hanout", syn_s3: "Recibe tu dinero, 0% comisión",
    syn_start: "¡Vamos! 🎉",
    gift_text: "−20 DH en tu primer pedido, aplicados automáticamente al pagar.",
    gift_applied: "Código MARHBA20 activado — 20 DH menos en tu primer pedido ✅",
    deals_title: "⚡ Ofertas del día", ends_in: "Termina en {t}",
    viewers_line: "{n} personas están viendo este artículo ahora",
    hot_badge: "Muy solicitado",
    s1: "Pide", s2: "Recoge en el hanout", s3: "Inspecciona y recoge",
    become_point: "Conviértete en punto bali 🏪", become_sub: "Gana 4–5 DH por paquete · sin manejar efectivo",
    paid_t: "Ya pagado", paid_sub: "Tu dinero está protegido por bali. El vendedor solo cobra tras tu inspección al recoger.",
    no_card: "¿Sin tarjeta bancaria?",
    opt_cash: "Recarga en efectivo en un agente (Cash Plus, Wafacash…) — artículo reservado 48h",
    opt_khel: "Khellesli — un allegado paga por ti, por enlace WhatsApp",
    khel_toast: "Enlace de pago enviado por WhatsApp 📲 (demo)",
    d_amana_point: "Amana (Correos) → tu punto bali · inspección al recoger",
    d_amana_home: "Amana (Correos) → domicilio",
    d_express_far: "Cathedis Exprés → domicilio",
    reco: "Recomendado",
    smart_route: "Ruta optimizada automáticamente · {a} ↔ {b}",
    far_protect: "Larga distancia: paquete asegurado — vendedor reembolsado al 100% si el transportista lo pierde.",
    eta_tmw: "mañana", eta_12: "1-2 d", eta_today: "hoy", eta_24: "2-4 d", eta_2448: "24-48 h",
    sale_card_todo: "¡Vendido! Deposita tu paquete 📦", sale_card_done: "Paquete depositado — en camino 🚚",
    deposit_title: "Depósito del paquete",
    dep_status_todo: "Por depositar", dep_status_ok: "Depositado ✅",
    dep_show: "Muestra este QR al tendero — lo escanea y toma la custodia.",
    dep_before: "Deposítalo antes del {d} — o la venta se cancela y se reembolsa al comprador",
    dep_tip1: "Embálalo bien (bolsa + cinta)", dep_tip2: "Graba el embalaje 🎥 — tu prueba ante disputas",
    dep_tip3: "Escribe el código {c} en el paquete",
    dep_btn: "Simular el depósito (demo)",
    dep_done_note: "Custodia transferida al hanout ✅ En camino hacia {n}",
    after_insp: "abonados a tu saldo tras la inspección del comprador · 0% comisión",
    tl_sold: "Vendido 🎉", tl_paid2: "Dinero abonado",
  },
};

/* ------------------------------------------------------------------ */
/* DONNÉES                                                             */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "femmes", emoji: "👗", grad: "from-rose-100 to-pink-200" },
  { id: "hommes", emoji: "🧥", grad: "from-sky-100 to-blue-200" },
  { id: "enfants", emoji: "🧸", grad: "from-amber-100 to-orange-200" },
  { id: "sneakers", emoji: "👟", grad: "from-stone-100 to-stone-300" },
  { id: "tech", emoji: "📱", grad: "from-violet-100 to-indigo-200" },
  { id: "maison", emoji: "🛋️", grad: "from-emerald-100 to-teal-200" },
  { id: "trad", emoji: "🪡", grad: "from-yellow-100 to-amber-200" },
  { id: "sport", emoji: "⚽", grad: "from-lime-100 to-green-200" },
];

/* Catalogue à 3 niveaux — architecture Vinted, adaptée au Maroc */
const CATALOG = [
  { id: "femmes", emoji: "👗", fams: [
    { icon: "👚", label: "Vêtements", subs: ["Robes", "Caftans et takchitas", "Hauts et t-shirts", "Pantalons et leggings", "Jeans", "Jupes", "Manteaux et vestes", "Pulls et sweats", "Lingerie et pyjamas", "Maillots de bain", "Autres"] },
    { icon: "👠", label: "Chaussures", subs: ["Sneakers", "Talons", "Sandales", "Bottes", "Babouches", "Autres"] },
    { icon: "👜", label: "Sacs", subs: ["Sacs à main", "Sacs à dos", "Pochettes", "Autres"] },
    { icon: "💍", label: "Accessoires", subs: ["Bijoux", "Montres", "Foulards et châles", "Ceintures", "Lunettes", "Autres"] },
    { icon: "💄", label: "Beauté", subs: ["Parfums", "Soins", "Maquillage", "Autres"] },
  ]},
  { id: "hommes", emoji: "🧥", fams: [
    { icon: "👕", label: "Vêtements", subs: ["T-shirts et polos", "Chemises", "Pantalons", "Jeans", "Vestes et manteaux", "Pulls et sweats", "Djellabas et gandouras", "Survêtements", "Autres"] },
    { icon: "👟", label: "Chaussures", subs: ["Sneakers", "Chaussures de ville", "Sandales", "Babouches", "Autres"] },
    { icon: "⌚", label: "Accessoires", subs: ["Montres", "Ceintures", "Casquettes", "Sacs", "Lunettes", "Autres"] },
    { icon: "🧴", label: "Soins", subs: ["Parfums", "Rasage et barbe", "Autres"] },
  ]},
  { id: "enfants", emoji: "🧸", fams: [
    { icon: "👧", label: "Vêtements filles", subs: ["Robes", "Hauts", "Pantalons", "Chaussures", "Autres"] },
    { icon: "👦", label: "Vêtements garçons", subs: ["Hauts", "Pantalons", "Chaussures", "Autres"] },
    { icon: "🧩", label: "Jeux et jouets", subs: ["Jouets d'éveil", "Jeux de construction", "Poupées et figurines", "Autres"] },
    { icon: "🍼", label: "Puériculture", subs: ["Poussettes", "Sièges auto", "Bain et change", "Allaitement et repas", "Autres"] },
    { icon: "🛏️", label: "Chambre et déco", subs: ["Meubles", "Linge de lit", "Autres"] },
  ]},
  { id: "maison", emoji: "🛋️", fams: [
    { icon: "🧶", label: "Textiles et tapis", subs: ["Tapis berbères", "Tapis", "Linge de maison", "Coussins", "Rideaux", "Autres"] },
    { icon: "🍽️", label: "Cuisine et table", subs: ["Tajines et couscoussiers", "Théières et plateaux", "Vaisselle", "Petit électroménager", "Autres"] },
    { icon: "🖼️", label: "Décoration", subs: ["Miroirs", "Luminaires", "Objets déco", "Autres"] },
    { icon: "🪑", label: "Meubles", subs: ["Salons marocains", "Tables", "Rangements", "Autres"] },
  ]},
  { id: "tech", emoji: "📱", fams: [
    { icon: "📱", label: "Téléphones", subs: ["iPhone", "Samsung", "Xiaomi", "Autres marques", "Accessoires et coques"] },
    { icon: "💻", label: "Ordinateurs et tablettes", subs: ["Ordinateurs portables", "Tablettes", "Accessoires", "Autres"] },
    { icon: "🎧", label: "Audio", subs: ["Casques et écouteurs", "Enceintes", "Autres"] },
    { icon: "🎮", label: "Consoles et jeux vidéo", subs: ["Consoles", "Jeux", "Manettes", "Autres"] },
    { icon: "📷", label: "TV et photo", subs: ["Téléviseurs", "Appareils photo", "Autres"] },
  ]},
  { id: "trad", emoji: "🪡", fams: [
    { icon: "👘", label: "Caftans et takchitas", subs: ["Caftans", "Takchitas", "Tenues de fête", "Autres"] },
    { icon: "🥻", label: "Djellabas et gandouras", subs: ["Djellabas femme", "Djellabas homme", "Gandouras", "Autres"] },
    { icon: "🥿", label: "Babouches", subs: ["Babouches femme", "Babouches homme", "Autres"] },
    { icon: "🏺", label: "Artisanat et déco", subs: ["Poterie et zellige", "Cuivre et laiton", "Vannerie", "Autres"] },
    { icon: "📿", label: "Bijoux traditionnels", subs: ["Bijoux berbères", "Bijoux en argent", "Autres"] },
  ]},
  { id: "livres", emoji: "📚", fams: [
    { icon: "📖", label: "Livres", subs: ["Romans", "Islam et spiritualité", "Développement personnel", "Autres"] },
    { icon: "🎓", label: "Manuels scolaires", subs: ["Primaire", "Collège et lycée", "Supérieur", "Autres"] },
    { icon: "💿", label: "Musique et vidéo", subs: ["CD et vinyles", "DVD", "Autres"] },
  ]},
  { id: "loisirs", emoji: "🎲", fams: [
    { icon: "🃏", label: "Jeux de société", subs: ["Jeux de plateau", "Cartes", "Puzzles", "Autres"] },
    { icon: "🎸", label: "Instruments de musique", subs: ["Guitares", "Percussions", "Autres"] },
    { icon: "🪙", label: "Collections", subs: ["Pièces et billets", "Timbres", "Autres"] },
  ]},
  { id: "sport", emoji: "⚽", fams: [
    { icon: "👟", label: "Chaussures de sport", subs: ["Running", "Football", "Autres"] },
    { icon: "🎽", label: "Vêtements de sport", subs: ["Maillots", "Survêtements", "Autres"] },
    { icon: "🏋️", label: "Fitness et musculation", subs: ["Haltères et poids", "Tapis et accessoires", "Autres"] },
    { icon: "🚴", label: "Vélos et glisse", subs: ["Vélos", "Trottinettes", "Autres"] },
  ]},
];

/* Référentiel de marques par domaine — jamais mélangées */
const BRANDS_REF = {
  mode: ["Nike", "Adidas", "Zara", "H&M", "Puma", "Lacoste", "Levi's", "Mango", "Bershka", "Pull & Bear", "Shein", "Uniqlo", "Under Armour", "Tommy Hilfiger", "Ralph Lauren", "Louis Vuitton", "Gucci", "Dior", "Prada", "Balenciaga"],
  chaussures: ["Nike", "Adidas", "Jordan", "New Balance", "Puma", "Converse", "Vans", "Reebok", "Asics", "Timberland", "Dr. Martens", "Clarks"],
  beaute: ["Dior", "Chanel", "Yves Saint Laurent", "Guerlain", "Lancôme", "Giorgio Armani", "Versace", "Hugo Boss", "Paco Rabanne", "Jean Paul Gaultier", "Carolina Herrera", "Nivea", "L'Oréal", "Maybelline", "MAC"],
  tech: ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Realme", "Infinix", "Tecno", "Sony", "PlayStation", "Xbox", "Nintendo", "HP", "Dell", "Lenovo", "Asus", "JBL", "Canon", "LG"],
  enfants: ["Lego", "Playmobil", "Fisher-Price", "Chicco", "Barbie", "Hot Wheels", "Zara Kids", "H&M Kids", "Okaïdi", "Petit Bateau"],
  maison: ["Tefal", "Moulinex", "Philips", "Bosch", "SEB", "Kenwood", "Krups", "Ikea", "LG", "Samsung"],
  sport: ["Nike", "Adidas", "Decathlon", "Puma", "Under Armour", "Kipsta", "Domyos", "Kalenji", "Reebok", "Asics"],
  loisirs: ["Yamaha", "Fender", "Casio", "Ravensburger", "Asmodee"],
};

/* Référentiel de tailles par type d'article */
const SIZES_REF = {
  lettres: ["XS", "S", "M", "L", "XL", "XXL", "Taille unique"],
  pantalons: ["34", "36", "38", "40", "42", "44", "46", "48"],
  chaussures: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  enfants: ["3 mois", "6 mois", "12 mois", "18 mois", "2 ans", "4 ans", "6 ans", "8 ans", "10 ans", "12 ans", "14 ans"],
};

const ITEMS = [
  {
    id: 1, title: "Air Force 1 blanches", brand: "Nike", size: "42", cond: 2, video: true, oldPrice: 550,
    price: 450, city: "Casablanca", likes: 23, emoji: "👟", grad: "from-stone-100 to-stone-300",
    cat: "sneakers", seller: { name: "Yassine_Casa", rating: 4.8, sales: 34 },
    desc: "Portées 5-6 fois, aucune trace. Boîte d'origine incluse. Envoi rapide via Amana."
  },
  {
    id: 2, title: "Caftan vert brodé main", brand: "Artisanat Fès", size: "M", cond: 1, video: false, discreet: true,
    price: 900, city: "Rabat", likes: 41, emoji: "✨", grad: "from-emerald-100 to-teal-200",
    cat: "trad", seller: { name: "Salma.R", rating: 5.0, sales: 12 },
    desc: "Porté une seule fois pour un mariage. Broderie sfifa dorée, tissu de qualité."
  },
  {
    id: 3, title: "iPhone 12 128 Go débloqué", brand: "Apple", size: "—", cond: 3, video: true, imei: true,
    price: 3800, city: "Marrakech", likes: 67, emoji: "📱", grad: "from-violet-100 to-indigo-200",
    cat: "tech", seller: { name: "MehdiTech", rating: 4.9, sales: 58 },
    desc: "Batterie 87%. Écran nickel, petite rayure au dos. Facture dispo. Tous opérateurs."
  },
  {
    id: 4, title: "Sac bandoulière neuf", brand: "Zara", size: "—", cond: 0, video: false,
    price: 180, city: "Tanger", likes: 15, emoji: "👜", grad: "from-rose-100 to-pink-200",
    cat: "femmes", seller: { name: "Imane_Tng", rating: 4.7, sales: 21 },
    desc: "Jamais porté, étiquette encore dessus. Cadeau en double."
  },
  {
    id: 5, title: "Manette PS5 DualSense", brand: "Sony", size: "—", cond: 2, video: true, oldPrice: 520,
    price: 420, city: "Casablanca", likes: 29, emoji: "🎮", grad: "from-sky-100 to-blue-200",
    cat: "tech", seller: { name: "GamerAnas", rating: 4.6, sales: 17 },
    desc: "Fonctionne parfaitement, sticks impeccables. Vendue avec câble USB-C."
  },
  {
    id: 6, title: "Djellaba homme laine", brand: "Fait main", size: "L", cond: 2, video: false,
    price: 350, city: "Fès", likes: 18, emoji: "🧥", grad: "from-yellow-100 to-amber-200",
    cat: "trad", seller: { name: "Hamza.Fes", rating: 4.9, sales: 26 },
    desc: "Laine véritable, coupe classique. Parfaite pour l'hiver et les fêtes."
  },
  {
    id: 7, title: "Montre Casio vintage", brand: "Casio", size: "—", cond: 3, video: false,
    price: 250, city: "Agadir", likes: 33, emoji: "⌚", grad: "from-amber-100 to-orange-200",
    cat: "hommes", seller: { name: "Vintage_Agadir", rating: 4.8, sales: 44 },
    desc: "Modèle A168, pile neuve. Quelques micro-rayures, charme vintage garanti."
  },
  {
    id: 8, title: "Haut Tech Fleece", brand: "Nike", size: "M", cond: 2, video: false, oldPrice: 450,
    price: 380, city: "Casablanca", likes: 21, emoji: "🧢", grad: "from-lime-100 to-green-200",
    cat: "hommes", seller: { name: "Yassine_Casa", rating: 4.8, sales: 34 },
    desc: "Authentique, acheté au Morocco Mall. Taille M, coupe normale."
  },
];

/* Protection acheteur : 8% + 10 DH (le vendeur reçoit 100%) */
const fee = (p) => Math.round(p * 0.08) + 10;
const totalBuyer = (p) => p + fee(p);


/* Routage intelligent : hanout si proche, Poste/transporteur si loin */
const USER_CITY = "Casablanca";
const LOCAL_DELIV = [
  { key: "d_point", price: 15, icon: Store, eta: "eta_tmw", reco: true },
  { key: "d_home", price: 25, icon: Truck, eta: "eta_12" },
  { key: "d_express", price: 30, icon: Zap, eta: "eta_today" },
];
const FAR_DELIV = [
  { key: "d_amana_point", price: 25, icon: Store, eta: "eta_24", reco: true },
  { key: "d_amana_home", price: 30, icon: Truck, eta: "eta_24" },
  { key: "d_express_far", price: 45, icon: Zap, eta: "eta_2448" },
];
const delivFor = (i) => (i.city === USER_CITY ? LOCAL_DELIV : FAR_DELIV);

/* Commande de démonstration pour le circuit point relais */
const ORDER = {
  code: "BAL-7F2K9",
  pin: "4382",
  item: { title: "Air Force 1 blanches", emoji: "👟", grad: "from-stone-100 to-stone-300", price: 450 },
  fee: 46, delivery: 15, total: 511, cod: false,
  point: {
    name: "Hanout Al Amal", owner: "Si Mohamed",
    addr: "12 rue Ibn Sina, Maârif — Casablanca",
    dist: "650 m", hours: "7h–23h · 7j/7", slot: "B3",
    phone: "+212600000000", rating: 4.9, ratings_count: 214, reliability: 99,
    lat: 33.5731, lng: -7.5898,
  },
  deadline: "10 juil.",
};

/* Vente de démonstration pour le circuit dépôt vendeur */
const SALE = {
  code: "BAL-8R4W2",
  item: { title: "Haut Tech Fleece", emoji: "🧢", grad: "from-lime-100 to-green-200", price: 380 },
  buyer: "Kenza M.",
  deadline: "jeu. 9 juil.",
};

/* ------------------------------------------------------------------ */
/* FILET DE SÉCURITÉ — si un composant plante, on affiche un écran      */
/* clair au lieu de laisser toute l'app blanche et inaccessible.        */
/* ------------------------------------------------------------------ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("bali crash:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f4", padding: 24, fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: 380, textAlign: "center" }}>
            <p style={{ fontSize: 40 }}>😕</p>
            <p style={{ fontWeight: 800, fontSize: 18, color: "#1c1917", marginTop: 8 }}>Oups, un problème est survenu</p>
            <p style={{ fontSize: 12, color: "#78716c", marginTop: 8, wordBreak: "break-word" }}>{String(this.state.error && this.state.error.message)}</p>
            <button onClick={() => window.location.reload()}
              style={{ marginTop: 16, background: "#4F46E5", color: "#fff", fontWeight: 800, padding: "12px 24px", borderRadius: 16, border: "none" }}>
              Recharger l'app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function BaliAppScreen() {
  const [lang, setLang] = useState("fr");
  const [langOpen, setLangOpen] = useState(false);
  const [tab, setTab] = useState("home");
  const [item, setItem] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fCats, setFCats] = useState([]);
  const [fBrands, setFBrands] = useState([]);
  const [fSizes, setFSizes] = useState([]);
  const [fConds, setFConds] = useState([]);
  const [fPriceMin, setFPriceMin] = useState("");
  const [fPriceMax, setFPriceMax] = useState("");
  const [fSort, setFSort] = useState("recent");
  const [filterView, setFilterView] = useState("hub");
  const [bSearch, setBSearch] = useState("");
  const [liked, setLiked] = useState({});
  const openFilter = (v) => { setFilterView(v); setFiltersOpen(true); };
  const [browseUniv, setBrowseUniv] = useState(null);
  const [browseFam, setBrowseFam] = useState(null);
  const [browseSub, setBrowseSub] = useState(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerValue, setOfferValue] = useState("");
  const [toast, setToast] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [deliveryI, setDeliveryI] = useState(0);
  const [threads, setThreads] = useState([
    {
      id: "t1", name: "Salma.R", itemTitle: "Caftan vert brodé main", emoji: "✨",
      messages: [
        { from: "me", text: "Salam ! Le caftan est toujours disponible ?" },
        { from: "them", text: "Wa alaykoum salam, oui mazal ! 😊" },
        { from: "them", type: "offer", amount: 800, status: "pending", text: "Je peux te le faire à 800 DH si tu prends aujourd'hui." },
      ],
    },
  ]);

  /* Formulaire de vente */
  const [sellTitle, setSellTitle] = useState("");
  const [sellDesc, setSellDesc] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellCondI, setSellCondI] = useState(2);
  const [sellCatI, setSellCatI] = useState(0);
  const [sadaqaOn, setSadaqaOn] = useState(false);

  /* IA */
  const [aiState, setAiState] = useState("idle"); // idle | loading | done | error | invalid
  const [aiResult, setAiResult] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [publishing, setPublishing] = useState(false);

  /* Point relais — deux faces du système */
  const isPartnerUrl = typeof window !== "undefined" && (window.location.search.includes("partenaire") || window.location.search.includes("partner"));
  const [appMode, setAppMode] = useState(isPartnerUrl ? "partner" : "client"); // client | partner
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("ready"); // ready | delivered | confirmed | disputed
  const [pinShown, setPinShown] = useState(false);
  const [qrSeed, setQrSeed] = useState(1);
  const [qrLeft, setQrLeft] = useState(60);
  const [pScreen, setPScreen] = useState("dash"); // dash | scan | verify | locked | collect | done
  const [pinInput, setPinInput] = useState("");
  const [pinTries, setPinTries] = useState(0);
  const [pTab, setPTab] = useState("colis");
  const [acceptOn, setAcceptOn] = useState(true);
  const [pParcel, setPParcel] = useState(null);
  const [hvCode, setHvCode] = useState("");
  const [hvPin, setHvPin] = useState("");
  const [hvMsg, setHvMsg] = useState(null); // { ok, text }
  const [hvLoading, setHvLoading] = useState(false);
  const [pOrders, setPOrders] = useState([]);
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");
  const videoRef = React.useRef(null);
  const camStreamRef = React.useRef(null);

  /* Démarrer la vraie caméra (demande l'autorisation native du navigateur) */
  const startCamera = async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, audio: false,
      });
      camStreamRef.current = stream;
      setCamActive(true);
      /* le <video> est monté juste après via camActive → on attend le prochain tick */
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
        detectLoop();
      }, 100);
    } catch (e) {
      setCamError(e && e.name === "NotAllowedError" ? t("cam_denied") : t("cam_error"));
    }
  };

  const stopCamera = () => {
    if (camStreamRef.current) { camStreamRef.current.getTracks().forEach((tr) => tr.stop()); camStreamRef.current = null; }
    setCamActive(false);
  };

  /* Détection automatique du QR si le navigateur la supporte (BarcodeDetector) */
  const detectLoop = async () => {
    if (!("BarcodeDetector" in window) || !videoRef.current) return;
    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!camStreamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const raw = codes[0].rawValue || "";
            const code = raw.includes("BAL-") ? raw.slice(raw.indexOf("BAL-")).split(/\s/)[0] : raw;
            setHvCode(code.toUpperCase());
            stopCamera();
            setPScreen("dash");
            showToast(t("qr_detected"));
            return;
          }
        } catch (e) { /* frame non lisible, on continue */ }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { /* BarcodeDetector indisponible → saisie manuelle */ }
  };

  /* Charger les vrais colis qui transitent par le point bali */
  const loadPartnerOrders = async () => {
    const { data } = await supabase.from("orders")
      .select("*, items(title, category)")
      .in("status", ["paid", "dropped", "in_transit", "ready"])
      .order("created_at", { ascending: false })
      .limit(50);
    setPOrders(data || []);
  };

  /* Le hanoutier vérifie le PIN et remet le colis (cœur de sécurité A4.3) */
  const verifyAndHandover = async () => {
    setHvMsg(null);
    if (!hvCode.trim() || hvPin.length !== 4) return;
    setHvLoading(true);
    try {
      const { data: order } = await supabase.from("orders").select("*")
        .eq("code", hvCode.trim().toUpperCase()).maybeSingle();
      if (!order) { setHvMsg({ ok: false, text: t("hverif_notfound") }); setHvLoading(false); return; }
      if (order.status === "completed") { setHvMsg({ ok: false, text: t("hverif_notfound") }); setHvLoading(false); return; }
      /* Comparer le PIN saisi au hash stocké — le PIN n'est jamais en clair dans la base */
      const pinHash = await sha256(hvPin);
      if (pinHash !== order.pin_hash) { setHvMsg({ ok: false, text: t("hverif_bad") }); setHvLoading(false); return; }
      /* Code correct → remise + fermeture de la chaîne de responsabilité */
      await supabase.from("orders").update({ status: "completed", escrow_status: "released" }).eq("id", order.id);
      await supabase.from("custody_events").insert({
        order_id: order.id, from_party: "hanout_pickup", to_party: "buyer", note: "PIN vérifié — colis remis à l'acheteur, séquestre libéré",
      });
      /* Prévenir les deux parties : colis remis + vendeur payé */
      if (order.buyer_id) pushNotif(order.buyer_id, "order_step", t("nf_handed"), null, "order", order.id);
      if (order.seller_id) pushNotif(order.seller_id, "sale", t("nf_paid_seller"), null, "order", order.id);
      setHvMsg({ ok: true, text: t("hverif_ok") });
      setHvCode(""); setHvPin("");
      loadPartnerOrders();
    } catch (e) {
      setHvMsg({ ok: false, text: "⚠️ " + (e.message || "Erreur") });
    } finally {
      setHvLoading(false);
    }
  };
  const [pObStep, setPObStep] = useState(-1); // -1 fermé · 0 hanout · 1 adresse · 2 versements · 3 envoyé
  const [pObName, setPObName] = useState("");
  const [pObPhotos, setPObPhotos] = useState([false, false]);
  const [pObRib, setPObRib] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depoChecks, setDepoChecks] = useState([false, false, false]);
  const [depositDone, setDepositDone] = useState(false);
  const [imeiVal, setImeiVal] = useState("");
  const [discreetOn, setDiscreetOn] = useState(false);
  const [inspChecks, setInspChecks] = useState([false, false, false]);
  const [payOpen, setPayOpen] = useState(false);
  const [trustOpen, setTrustOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sellerView, setSellerView] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethodI, setPayMethodI] = useState(0);
  const [obStep, setObStep] = useState(0); // 0 langue · 1 promesse · 2 téléphone · 3 code · 4 cadeau · 5 synopsis · 6 app
  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  /* ---- ABONNEMENTS & NOTIFICATIONS RÉELS ---- */
  const [following, setFollowing] = useState({});   // { sellerId: true }
  const [followerCounts, setFollowerCounts] = useState({}); // { sellerId: n }
  const [dbNotifs, setDbNotifs] = useState([]);

  /* Charger qui JE suis + préparer l'état */
  const loadFollowing = async () => {
    const uid = await getUid();
    if (!uid) { setFollowing({}); return; }
    const { data } = await supabase.from("follows").select("seller_id").eq("follower_id", uid);
    const map = {};
    (data || []).forEach((r) => { map[r.seller_id] = true; });
    setFollowing(map);
  };

  /* Compter les abonnés d'un vendeur (à la demande) */
  const loadFollowerCount = async (sellerId) => {
    if (!sellerId) return;
    const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("seller_id", sellerId);
    setFollowerCounts((c) => ({ ...c, [sellerId]: count || 0 }));
  };

  /* Suivre / ne plus suivre un vendeur */
  const toggleFollow = async (sellerId, sellerName) => {
    const uid = await getUid();
    if (!uid) { showToast("⚠️ " + t("login_first")); return; }
    if (sellerId === uid) { showToast(t("cant_follow_self")); return; }
    if (following[sellerId]) {
      await supabase.from("follows").delete().eq("follower_id", uid).eq("seller_id", sellerId);
      setFollowing((f) => { const n = { ...f }; delete n[sellerId]; return n; });
      setFollowerCounts((c) => ({ ...c, [sellerId]: Math.max(0, (c[sellerId] || 1) - 1) }));
      showToast(tf("t_unfollowed", { n: sellerName || "" }));
    } else {
      await supabase.from("follows").insert({ follower_id: uid, seller_id: sellerId });
      setFollowing((f) => ({ ...f, [sellerId]: true }));
      setFollowerCounts((c) => ({ ...c, [sellerId]: (c[sellerId] || 0) + 1 }));
      showToast(tf("t_followed", { n: sellerName || "" }));
    }
  };

  /* Créer une notification pour un utilisateur (le "cerveau") */
  const pushNotif = async (userId, type, title, body, linkType, linkId) => {
    if (!userId) return;
    try {
      await supabase.from("notifications").insert({ user_id: userId, type, title, body: body || null, link_type: linkType || null, link_id: linkId || null });
    } catch (e) { /* silencieux : une notif ratée ne doit jamais bloquer une action */ }
  };

  /* Notifier tous mes abonnés (ex : je publie un article) */
  const notifyFollowers = async (title, body, linkType, linkId) => {
    const uid = await getUid();
    if (!uid) return;
    const { data } = await supabase.from("follows").select("follower_id").eq("seller_id", uid);
    const rows = (data || []).map((r) => ({ user_id: r.follower_id, type: "new_listing", title, body: body || null, link_type: linkType || null, link_id: linkId || null }));
    if (rows.length) { try { await supabase.from("notifications").insert(rows); } catch (e) {} }
  };

  /* Charger MES notifications */
  const loadNotifs = async () => {
    const uid = await getUid();
    if (!uid) { setDbNotifs([]); return; }
    const { data } = await supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(30);
    setDbNotifs(data || []);
  };

  const markNotifsRead = async () => {
    const uid = await getUid();
    if (!uid) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", uid).eq("is_read", false);
    setDbNotifs((ns) => ns.map((n) => ({ ...n, is_read: true })));
  };

  /* Identité fiable : mémoire d'abord (instantané), repli sur la session locale */
  const getUid = async () => {
    if (authUser && authUser.id) return authUser.id;
    const { data } = await supabase.auth.getSession();
    if (data.session && data.session.user) { setAuthUser(data.session.user); return data.session.user.id; }
    return null;
  };
  const [dbItems, setDbItems] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");

  /* Charger le profil de l'utilisateur connecté */
  const loadProfile = async () => {
    const uid = await getUid();
    if (!uid) { setMyProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setMyProfile(data);
  };

  /* ---- MESSAGERIE RÉELLE ---- */
  const [dbThreads, setDbThreads] = useState([]);
  const [dbThread, setDbThread] = useState(null);
  const [dbMsgs, setDbMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  const loadThreads = async () => {
    const uid = await getUid();
    if (!uid) { setDbThreads([]); return; }
    const { data: ths } = await supabase.from("threads").select("*")
      .or("buyer_id.eq." + uid + ",seller_id.eq." + uid)
      .order("created_at", { ascending: false });
    if (!ths || ths.length === 0) { setDbThreads([]); return; }
    const itemIds = [...new Set(ths.map((t) => t.item_id))];
    const otherIds = [...new Set(ths.map((t) => (t.buyer_id === uid ? t.seller_id : t.buyer_id)))];
    const { data: its } = await supabase.from("items").select("id, title, photos").in("id", itemIds);
    const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", otherIds);
    setDbThreads(ths.map((th) => {
      const it = (its || []).find((x) => x.id === th.item_id);
      const other = (profs || []).find((p) => p.id === (th.buyer_id === uid ? th.seller_id : th.buyer_id));
      return {
        ...th, mine: uid,
        itemTitle: it ? it.title : "Article",
        photo: it && it.photos && it.photos[0] ? it.photos[0] : null,
        otherName: other && other.display_name ? other.display_name : "Membre bali",
        otherId: th.buyer_id === uid ? th.seller_id : th.buyer_id,
      };
    }));
  };

  const loadMsgs = async (threadId) => {
    const { data } = await supabase.from("messages").select("*")
      .eq("thread_id", threadId).order("created_at", { ascending: true });
    setDbMsgs(data || []);
  };

  const openDbThread = (th) => { setDbThread(th); setActiveThread(null); setDbMsgs([]); loadMsgs(th.id); };

  const sendDbMsg = async () => {
    if (!msgInput.trim() || !dbThread || !myProfile) return;
    const body = msgInput.trim();
    setMsgInput("");
    const { error } = await supabase.from("messages").insert({ thread_id: dbThread.id, sender_id: myProfile.id, body });
    if (error) showToast("⚠️ " + error.message);
    else loadMsgs(dbThread.id);
  };

  const startRealThread = async (it, offerAmount) => {
    if (!myProfile) { showToast("⚠️ Connecte-toi d'abord"); return; }
    if (it.seller_id === myProfile.id) { showToast(t("own_item")); return; }
    const itemId = String(it.id).replace("db_", "");
    let th = null;
    const { data: found } = await supabase.from("threads").select("*")
      .eq("item_id", itemId).eq("buyer_id", myProfile.id).maybeSingle();
    if (found) th = found;
    else {
      const { data: created, error } = await supabase.from("threads")
        .insert({ item_id: itemId, buyer_id: myProfile.id, seller_id: it.seller_id })
        .select().single();
      if (error) { showToast("⚠️ " + error.message); return; }
      th = created;
    }
    const msg = offerAmount
      ? { thread_id: th.id, sender_id: myProfile.id, offer_amount_dh: offerAmount, offer_status: "sent" }
      : { thread_id: th.id, sender_id: myProfile.id, body: t("wach") };
    const { error: mErr } = await supabase.from("messages").insert(msg);
    if (mErr) { showToast("⚠️ " + mErr.message); return; }
    /* Prévenir le vendeur : offre reçue ou nouveau message */
    if (it.seller_id) {
      pushNotif(it.seller_id, offerAmount ? "offer" : "message",
        offerAmount ? tf("nf_offer", { x: offerAmount }) : t("nf_new_msg"),
        it.title, "thread", th.id);
    }
    setOfferOpen(false); setOfferValue(""); setItem(null); setTab("msg");
    openDbThread({ ...th, mine: myProfile.id, itemTitle: it.title, photo: it.photo || null, otherName: it.seller && it.seller.name ? it.seller.name : "Vendeur" });
    loadThreads();
    showToast(offerAmount ? tf("t_offer_sent", { x: offerAmount }) : tf("t_msg_sent", { n: it.seller.name }));
  };

  const deleteItem = async (it) => {
    const raw = String(it.id).replace("db_", "");
    const { error } = await supabase.from("items").update({ status: "removed" }).eq("id", raw);
    if (error) showToast("⚠️ " + error.message);
    else { showToast(t("deleted_ok")); setItem(null); loadItems(); }
  };

  /* ---- COMMANDES RÉELLES ---- */
  const [myOrders, setMyOrders] = useState([]);
  const [newOrderTicket, setNewOrderTicket] = useState(null); // affiché une seule fois (PIN en clair)
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [ordersTab, setOrdersTab] = useState("buys");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("stats");
  const [adminStats, setAdminStats] = useState(null);
  const [adminItems, setAdminItems] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);

  const loadAdmin = async () => {
    /* Chiffres clés */
    const [{ count: nUsers }, { count: nItems }, { count: nActive }, ords, itemsList] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("items").select("*", { count: "exact", head: true }),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("orders").select("total_dh, protection_fee_dh, status, escrow_status, code, created_at, items(title)").order("created_at", { ascending: false }),
      supabase.from("items").select("id, title, price_dh, status, category, photos, created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    const orders = ords.data || [];
    const gmv = orders.reduce((s, o) => s + (o.total_dh || 0), 0);
    const revenue = orders.reduce((s, o) => s + (o.protection_fee_dh || 0), 0);
    const held = orders.filter((o) => o.escrow_status === "held").reduce((s, o) => s + (o.total_dh || 0), 0);
    const completed = orders.filter((o) => o.status === "completed").length;
    setAdminStats({ nUsers: nUsers || 0, nItems: nItems || 0, nActive: nActive || 0, nOrders: orders.length, gmv, revenue, held, completed });
    setAdminOrders(orders);
    setAdminItems(itemsList.data || []);
  };

  const adminRemoveItem = async (id) => {
    const { error } = await supabase.from("items").update({ status: "removed" }).eq("id", id);
    if (error) showToast("⚠️ " + error.message);
    else { showToast("Annonce retirée ✅"); loadAdmin(); loadItems(); }
  };
  const [creatingOrder, setCreatingOrder] = useState(false);

  /* Hash simple et sûr, natif au navigateur — aucune dépendance à ajouter */
  const sha256 = async (text) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const genCode = () => "BAL-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  const genPin = () => String(Math.floor(1000 + Math.random() * 9000));

  const createRealOrder = async (it) => {
    const uid = await getUid();
    if (!uid) { showToast("⚠️ Connecte-toi d'abord"); return; }
    if (!myProfile) { await loadProfile(); }
    if (it.seller_id === uid) { showToast(t("own_item")); return; }
    setCreatingOrder(true);
    try {
      const isLocal = it.city === USER_CITY;
      const dTypes = isLocal ? ["point_local", "express_local", "express_local"] : ["amana_point", "amana_home", "express_far"];
      const delivery_type = dTypes[deliveryI] || dTypes[0];
      const price = it.price;
      const protection = fee(price);
      const delivery = delivFor(it)[deliveryI].price;
      const total = totalBuyer(price) + delivery;
      const pin = genPin();
      const pin_hash = await sha256(pin);
      const code = genCode();
      const itemId = String(it.id).replace("db_", "");

      const { data: order, error } = await supabase.from("orders").insert({
        code, item_id: itemId, buyer_id: uid, seller_id: it.seller_id,
        price_dh: price, protection_fee_dh: protection, delivery_fee_dh: delivery,
        discount_dh: 0, total_dh: total, delivery_type,
        payment_method: payMethodI === 0 ? "card" : "wallet",
        payment_status: "paid", escrow_status: "held",
        pin_hash, qr_token: crypto.randomUUID(),
        status: "paid",
        dropoff_deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
        pickup_deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      }).select().single();
      if (error) throw error;

      await supabase.from("items").update({ status: "sold" }).eq("id", itemId);
      await supabase.from("custody_events").insert({
        order_id: order.id, from_party: "bali", to_party: "seller", note: "Commande créée, en attente de dépôt vendeur",
      });

      setNewOrderTicket({ ...order, itemTitle: it.title, itemEmoji: it.emoji, pinPlain: pin });
      setCheckoutOpen(false); setItem(null);
      loadItems(); loadMyOrders();
    } catch (e) {
      showToast("⚠️ " + (e.message || "Erreur de commande"));
    } finally {
      setCreatingOrder(false);
    }
  };

  const loadMyOrders = async () => {
    if (!myProfile) return;
    const { data } = await supabase.from("orders").select("*, items(title)")
      .or("buyer_id.eq." + myProfile.id + ",seller_id.eq." + myProfile.id)
      .order("created_at", { ascending: false });
    if (!data) { setMyOrders([]); return; }
    /* Récupérer les noms de l'autre partie */
    const otherIds = [...new Set(data.map((o) => (o.buyer_id === myProfile.id ? o.seller_id : o.buyer_id)).filter(Boolean))];
    const names = {};
    if (otherIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", otherIds);
      (profs || []).forEach((p) => { names[p.id] = p.display_name; });
    }
    setMyOrders(data.map((o) => {
      const iSell = o.seller_id === myProfile.id;
      const otherId = iSell ? o.buyer_id : o.seller_id;
      return { ...o, iSell, otherName: names[otherId] || "Membre bali" };
    }));
  };

  /* Le vendeur dépose le colis au point bali → événement custody réel */
  const depositParcel = async (o) => {
    const { error } = await supabase.from("orders").update({ status: "dropped" }).eq("id", o.id);
    if (error) { showToast("⚠️ " + error.message); return; }
    await supabase.from("custody_events").insert({
      order_id: o.id, from_party: "seller", to_party: "hanout_pickup", note: "Colis déposé par le vendeur au point bali",
    });
    /* Prévenir l'acheteur que son colis est en route */
    if (o.buyer_id) pushNotif(o.buyer_id, "order_step", t("nf_dropped"), o.items && o.items.title ? o.items.title : null, "order", o.id);
    showToast(t("deposit_done"));
    loadMyOrders();
  };

  /* Enregistrer le nom */
  const saveName = async () => {
    const uid = await getUid();
    if (!uid || !nameInput.trim()) return;
    const { error } = await supabase.from("profiles").update({ display_name: nameInput.trim() }).eq("id", uid);
    if (!error) {
      setNameOpen(false);
      loadProfile();
      showToast("Nom enregistré ✅");
    } else {
      showToast("⚠️ " + error.message);
    }
  };

  /* Charger les vraies annonces depuis la base */
  const loadItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) {
      /* Récupérer les noms des vendeurs (évite le crash sur la fiche article) */
      const sellerIds = [...new Set(data.map((r) => r.seller_id).filter(Boolean))];
      const names = {};
      if (sellerIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", sellerIds);
        (profs || []).forEach((p) => { names[p.id] = p.display_name; });
      }
      const grads = ["from-orange-100 to-rose-200", "from-sky-100 to-indigo-200", "from-lime-100 to-green-200", "from-violet-100 to-purple-200", "from-amber-100 to-yellow-200"];
      const emojis = { femmes: "👗", hommes: "👕", enfants: "🧸", tech: "📱", maison: "🏠", trad: "👘" };
      setDbItems(data.map((r, i) => ({
        seller: { name: names[r.seller_id] || "Membre bali", rating: 5.0, sales: 0, verified: true },
        id: "db_" + r.id, title: r.title, brand: r.brand || "", size: r.size || "—",
        cond: r.condition, price: r.price_dh, oldPrice: r.old_price_dh || null,
        cat: r.category,
        emoji: emojis[r.category] || "🛍️", grad: grads[i % grads.length],
        photo: (r.photos && r.photos[0]) || null, city: r.city || "Casablanca",
        likes: r.likes || 0, video: r.video_packing || false, real: true, seller_id: r.seller_id,
      })));
    }
  };

  /* Au démarrage : si une session existe déjà, on entre directement dans l'app */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthUser(data.session.user);
        setObStep(6);
        setTimeout(loadMyOrders, 500);
      }
      setAuthChecked(true);
    });
    /* Écoute continue : l'identité reste à jour sans réinterroger le serveur à chaque action */
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session ? session.user : null);
      if (session) { loadProfile(); loadMyOrders(); loadFollowing(); loadNotifs(); }
    });
    loadItems();
    loadProfile();
    if (isPartnerUrl) loadPartnerOrders();
    return () => { if (sub && sub.subscription) sub.subscription.unsubscribe(); };
  }, []);

  /* Rafraîchir les conversations à l'ouverture de l'onglet Messages */
  useEffect(() => {
    if (tab === "msg" && obStep >= 6) loadThreads();
  }, [tab, obStep]);

  /* Rafraîchir le chat ouvert toutes les 5 s (quasi temps réel) */
  useEffect(() => {
    if (!dbThread) return;
    const iv = setInterval(() => loadMsgs(dbThread.id), 5000);
    return () => clearInterval(iv);
  }, [dbThread]);
  const [obPhone, setObPhone] = useState("");
  const [obCountryI, setObCountryI] = useState(0);
  const [obCountryOpen, setObCountryOpen] = useState(false);
  const [obLoading, setObLoading] = useState(false);
  const [obError, setObError] = useState("");

  /* Envoi du vrai SMS via Supabase + Twilio */
  const sendSms = async () => {
    setObError("");
    setObLoading(true);
    const fullPhone = COUNTRIES[obCountryI].code + obPhone;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setObLoading(false);
    if (error) { setObError(error.message); return; }
    setObStep(3);
  };

  /* Vérification du code reçu par SMS */
  const verifySms = async () => {
    setObError("");
    setObLoading(true);
    const fullPhone = COUNTRIES[obCountryI].code + obPhone;
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: obCode, type: "sms" });
    setObLoading(false);
    if (error) { setObError(error.message); return; }
    loadProfile();
    loadThreads();
    setTimeout(loadMyOrders, 300);
    setObStep(4);
  };
  const [obCode, setObCode] = useState("");
  const [dealLeft, setDealLeft] = useState(16331); // compte à rebours deals du jour
  const [saleOpen, setSaleOpen] = useState(false);
  const [saleDropped, setSaleDropped] = useState(false);

  const cur = LANGS.find((l) => l.id === lang);
  const t = (k) => (T[lang] && T[lang][k] !== undefined ? T[lang][k] : T.fr[k]);
  const tf = (k, vars) =>
    Object.entries(vars).reduce((s, [key, v]) => s.replace("{" + key + "}", v), t(k));

  /* QR dynamique : régénération toutes les 60 s quand le ticket est affiché */
  useEffect(() => {
    if (!orderOpen || orderStatus !== "ready") return;
    const iv = setInterval(() => {
      setQrLeft((s) => {
        if (s <= 1) {
          setQrSeed((q) => q + 1);
          return 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [orderOpen, orderStatus]);

  /* Compte à rebours deals — actif uniquement sur l'accueil (performance) */
  useEffect(() => {
    if (obStep < 5 || appMode !== "client" || tab !== "home") return;
    const iv = setInterval(() => setDealLeft((s) => (s > 0 ? s - 1 : 86399)), 1000);
    return () => clearInterval(iv);
  }, [tab, appMode, obStep]);

  const fmtT = (s) =>
    String(Math.floor(s / 3600)).padStart(2, "0") + ":" +
    String(Math.floor((s % 3600) / 60)).padStart(2, "0") + ":" +
    String(s % 60).padStart(2, "0");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  /* ---------------------------------------------------------------- */
  /* ANNONCE IA — simulation de démo (infaillible)                      */
  /* En production : remplacer par un appel à un backend qui utilise    */
  /* l'API Claude Vision. Ici on simule pour tester l'expérience.        */
  /* ---------------------------------------------------------------- */

  const AI_ITEMS = [
    {
      titles: { fr: "Sneakers Nike Air Force 1", dar: "سبرديلة نايك بيضاء", ar: "حذاء رياضي أبيض أصلي", en: "White Nike sneakers", es: "Zapatillas Nike blancas" },
      brands: ["Nike", "Adidas", "Puma"], sizes: ["39", "40", "41", "42", "43"], cat: 3,
      prices: { min: 350, sugg: 450, max: 550 },
      descs: {
        fr: "Très bien conservées, portées quelques fois. Boîte d'origine incluse. État impeccable.",
        dar: "مزيانين بزاف، تلبسو غير شي مرات. الصندوق الأصلي معاهم. حالة ممتازة.",
        ar: "بحالة ممتازة، ارتديتها قليلاً فقط. الصندوق الأصلي مرفق. كالجديدة تقريباً.",
        en: "Barely worn, in great shape. Original box included. Impeccable condition.",
        es: "Muy bien conservadas, usadas pocas veces. Caja original incluida.",
      },
    },
    {
      titles: { fr: "Caftan vert brodé main", dar: "قفطان أخضر مطرز باليد", ar: "قفطان أخضر مطرز يدوياً", en: "Green embroidered caftan", es: "Caftán verde bordado a mano" },
      brands: ["Artisanat Fès", "Fait main", "Créateur local"], sizes: ["S", "M", "L", "XL"], cat: 5,
      prices: { min: 750, sugg: 900, max: 1100 },
      descs: {
        fr: "Broderie sfifa dorée magnifique. Porté une seule fois pour un mariage. Tissu premium, excellent état.",
        dar: "تطريز السفيفة ديال الذهب زوين بزاف. تلبس مرة وحدة ف عرس. لقماش ممتاز، حالة زوينة.",
        ar: "تطريز ذهبي رائع. ارتدي مرة واحدة في عرس. قماش فاخر بحالة ممتازة.",
        en: "Beautiful golden sfifa embroidery. Worn once for a wedding. Premium fabric, excellent condition.",
        es: "Precioso bordado sfifa dorado. Usado una sola vez en una boda. Tejido premium.",
      },
    },
    {
      titles: { fr: "iPhone 12 128 Go débloqué", dar: "آيفون 12 128 جيڭا", ar: "آيفون 12 بذاكرة 128", en: "iPhone 12 128GB unlocked", es: "iPhone 12 128GB libre" },
      brands: ["Apple"], sizes: ["—"], cat: 3,
      prices: { min: 3500, sugg: 3800, max: 4200 },
      descs: {
        fr: "Batterie 85%. Écran impeccable. Petite rayure au dos, imperceptible. Tous opérateurs, facture dispo.",
        dar: "لبطري 85%. لكران نقي. شي شرط صغير ف اللور ما كيبانش. كاع الشبكات، لفاكتورة كاينة.",
        ar: "البطارية 85%. الشاشة نظيفة. خدش صغير في الظهر غير ملحوظ. جميع الشبكات، الفاتورة متوفرة.",
        en: "Battery 85%. Flawless screen. Tiny scratch on the back, barely visible. All carriers, receipt available.",
        es: "Batería 85%. Pantalla impecable. Pequeño rasguño atrás, imperceptible. Todos los operadores.",
      },
    },
    {
      titles: { fr: "Montre Casio vintage", dar: "ماڭانة كاسيو قديمة", ar: "ساعة كاسيو كلاسيكية", en: "Casio vintage watch", es: "Reloj Casio vintage" },
      brands: ["Casio", "Citizen", "Timex"], sizes: ["—"], cat: 1,
      prices: { min: 180, sugg: 250, max: 320 },
      descs: {
        fr: "Modèle classique A168. Pile neuve. Quelques micro-rayures, charme vintage garanti.",
        dar: "لموديل الكلاسيكي A168. لبيلة جديدة. شي شروط صغار، الجمال ديال القديم.",
        ar: "الموديل الكلاسيكي A168. بطارية جديدة. خدوش دقيقة، سحر عتيق مضمون.",
        en: "Classic A168 model. New battery. A few micro-scratches, guaranteed vintage charm.",
        es: "Modelo clásico A168. Pila nueva. Algún micro-rasguño, encanto vintage.",
      },
    },
    {
      titles: { fr: "Sac à main Zara neuf", dar: "ساك زارا جديد", ar: "حقيبة يد زارا جديدة", en: "New Zara handbag", es: "Bolso Zara nuevo" },
      brands: ["Zara", "Mango", "H&M"], sizes: ["—"], cat: 0,
      prices: { min: 150, sugg: 180, max: 220 },
      descs: {
        fr: "Jamais porté, étiquette encore dessus. Cadeau en double, parfait état.",
        dar: "عمرو ما تلبس، التيكي مازال فيه. كادو مزدوج، حالة تمام.",
        ar: "لم تُستعمل، الملصق لا يزال عليها. هدية مكررة، حالة مثالية.",
        en: "Never used, tag still on. Duplicate gift, perfect condition.",
        es: "Sin usar, con etiqueta. Regalo duplicado, estado perfecto.",
      },
    },
  ];

  const clearPhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoFile(null);
    setAiState("idle");
    setAiResult(null);
  };

  const analyzePhoto = async (file) => {
    if (!file) return;
    setPhotoFile(file);
    setAiState("loading");
    setAiResult(null);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));

    /* Délai simulé de traitement IA */
    await new Promise((res) => setTimeout(res, 2000));

    const isHighQuality = file.size > 400000; /* grosse photo = meilleur état supposé */
    const it = AI_ITEMS[Math.floor(Math.random() * AI_ITEMS.length)];
    const brand = it.brands[Math.floor(Math.random() * it.brands.length)];
    const size = it.sizes[Math.floor(Math.random() * it.sizes.length)];
    const cond = it.cat === 3 && brand === "Apple" ? 2 : isHighQuality ? 1 : 2;

    setSellTitle((it.titles[lang] || it.titles.fr).slice(0, 60));
    setSellDesc(it.descs[lang] || it.descs.fr);
    setSellPrice(String(it.prices.sugg));
    setSellCatI(it.cat);
    setSellCondI(cond);
    setAiResult({ brand, size, sugg: it.prices.sugg, min: it.prices.min, max: it.prices.max, n: 900 + Math.floor(Math.random() * 1400) });
    setAiState("done");
    showToast(t("ai_done"));
  };

  const [demoMsg, setDemoMsg] = useState("");
  const sendDemoMsg = () => {
    if (!demoMsg.trim() || !thread) return;
    const body = demoMsg.trim();
    setDemoMsg("");
    setThreads((prev) => prev.map((th) => th.id === thread
      ? { ...th, msgs: [...th.msgs, { from: "me", text: body }] } : th));
  };
  const counterOffer = (tId, i) => {
    setThreads((prev) => prev.map((th) => {
      if (th.id !== tId) return th;
      const base = th.msgs[i] && th.msgs[i].amount ? th.msgs[i].amount : 100;
      return { ...th, msgs: [...th.msgs, { from: "me", type: "offer", amount: Math.round(base * 1.1) }] };
    }));
    showToast(tf("t_offer_sent", { x: "" }).replace("  ", " "));
  };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked((l) => ({ ...l, [id]: !l[id] }));
  };

  const openItem = (it) => {
    setDeliveryI(0);
    setCheckoutOpen(false);
    setPayMethodI(0);
    setItem(it);
  };

  const sendQuickMsg = (it) => {
    if (it.real) { startRealThread(it, null); return; }
    const th = {
      id: "t" + Date.now(), name: it.seller.name, itemTitle: it.title, emoji: it.emoji,
      messages: [{ from: "me", text: t("wach") }],
    };
    setThreads((prev) => [th, ...prev]);
    setItem(null);
    setTab("msg");
    setActiveThread(th.id);
    showToast(tf("t_msg_sent", { n: it.seller.name }));
  };

  const sendOffer = (it) => {
    const amount = parseInt(offerValue, 10);
    if (!amount || amount <= 0) return;
    if (it.real) { startRealThread(it, amount); return; }
    const th = {
      id: "t" + Date.now(), name: it.seller.name, itemTitle: it.title, emoji: it.emoji,
      messages: [{ from: "me", type: "offer", amount, status: "sent" }],
    };
    setThreads((prev) => [th, ...prev]);
    setOfferOpen(false);
    setOfferValue("");
    setItem(null);
    showToast(tf("t_offer_sent", { x: amount }));
  };

  const acceptOffer = (threadId, msgIndex) => {
    setThreads((prev) =>
      prev.map((th) =>
        th.id !== threadId ? th : {
          ...th,
          messages: th.messages.map((m, i) => (i === msgIndex ? { ...m, status: "accepted" } : m)),
        }
      )
    );
    showToast(t("t_accepted"));
  };

  const publish = async () => {
    if (!sellTitle || !sellPrice) {
      showToast(t("t_need"));
      return;
    }
    setPublishing(true);
    try {
      const uid = await getUid();
      if (!uid) {
        showToast("⚠️ Reconnecte-toi pour publier (session expirée)");
        setPublishing(false);
        return;
      }

      /* 1. Envoyer la photo dans le casier Storage */
      let photoPublicUrl = null;
      if (photoFile) {
        const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = (uid || "anon") + "/" + Date.now() + "." + ext;
        const { error: upErr } = await supabase.storage.from("items").upload(path, photoFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("items").getPublicUrl(path);
        photoPublicUrl = pub.publicUrl;
      }

      /* 2. Enregistrer l'annonce dans la base */
      const CATS = ["femmes", "hommes", "enfants", "tech", "maison", "trad"];
      const { error: insErr } = await supabase.from("items").insert({
        seller_id: uid,
        title: sellTitle,
        description: sellDesc,
        category: CATS[sellCatI] || "femmes",
        condition: sellCondI,
        price_dh: parseInt(sellPrice, 10),
        photos: photoPublicUrl ? [photoPublicUrl] : [],
        city: "Casablanca",
        sadaqa: sadaqaOn,
        status: "active",
      });
      if (insErr) throw insErr;

      /* Prévenir mes abonnés qu'un nouvel article est en ligne */
      notifyFollowers(tf("nf_new_listing", { n: (myProfile && myProfile.display_name) || "Un vendeur" }), sellTitle, "item", null);

      showToast(tf("t_published", { t: sellTitle }));
      setSellTitle(""); setSellDesc(""); setSellPrice("");
      setSadaqaOn(false); setAiState("idle"); setAiResult(null);
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl(null); setPhotoFile(null);
      loadItems();
      setTab("home");
    } catch (e) {
      showToast("⚠️ " + (e.message || "Erreur de publication"));
    } finally {
      setPublishing(false);
    }
  };

  const allItems = [...dbItems, ...ITEMS];

  /* Options dynamiques construites à partir des articles réellement en ligne */
  const brandOptions = [...new Set(allItems.map((i) => i.brand).filter((b) => b && b !== "—"))].sort();
  const sizeOptions = [...new Set(allItems.map((i) => i.size).filter((s) => s && s !== "—"))].sort();
  const activeFilterCount = fCats.length + fBrands.length + fSizes.length + fConds.length + (fPriceMin ? 1 : 0) + (fPriceMax ? 1 : 0);

  /* Un article correspond-il à un univers du catalogue ? */
  const matchUniv = (it, id) => it.cat === id || ((id === "femmes" || id === "hommes") && it.cat === "sneakers");

  const toggleIn = (arr, setArr, val) => setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const resetFilters = () => { setFCats([]); setFBrands([]); setFSizes([]); setFConds([]); setFPriceMin(""); setFPriceMax(""); setFSort("recent"); };

  /* Filtre + tri partagés entre l'accueil et la recherche (logique Vinted) */
  const applyFilters = (list) => {
    let out = list;
    if (fCats.length) out = out.filter((i) => fCats.some((id) => matchUniv(i, id)));
    if (fBrands.length) out = out.filter((i) => fBrands.includes(i.brand));
    if (fSizes.length) out = out.filter((i) => fSizes.includes(i.size));
    if (fConds.length) out = out.filter((i) => fConds.includes(i.cond));
    if (fPriceMin) out = out.filter((i) => i.price >= parseInt(fPriceMin, 10));
    if (fPriceMax) out = out.filter((i) => i.price <= parseInt(fPriceMax, 10));
    const sorted = [...out];
    if (fSort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (fSort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (fSort === "popular") sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return sorted;
  };

  const filteredItems = applyFilters(allItems);

  /* ---- FILTRES INTELLIGENTS : le contexte décide de ce qu'on montre ---- */
  const filterCtx = () => {
    if (tab === "search" && browseUniv && browseSub !== null) {
      return { univs: [browseUniv.id], fam: browseFam ? browseFam.label : "", sub: browseSub !== "__all__" ? browseSub : "" };
    }
    if (fCats.length) return { univs: fCats, fam: "", sub: "" };
    return { univs: [], fam: "", sub: "" };
  };

  /* Marques proposées, groupées par domaine, selon le contexte */
  const brandGroups = () => {
    const ctx = filterCtx();
    const txt = (ctx.fam + " " + ctx.sub).toLowerCase();
    const u = ctx.univs;
    const groups = [];
    const add = (label, arr) => { if (arr && arr.length) groups.push([label, arr]); };
    const isShoe = /chaussure|sneaker|babouche|talon|sandale|botte|running|football/.test(txt);
    const isBeauty = /beaut|parfum|soin|maquillage|rasage/.test(txt);
    if (isBeauty) add(t("g_beaute"), BRANDS_REF.beaute);
    else if (isShoe) add(t("g_chauss"), BRANDS_REF.chaussures);
    else if (u.length === 0) {
      add(t("g_mode"), BRANDS_REF.mode);
      add(t("g_chauss"), BRANDS_REF.chaussures.filter((b) => BRANDS_REF.mode.indexOf(b) === -1));
      add(t("g_beaute"), BRANDS_REF.beaute);
      add(t("g_tech"), BRANDS_REF.tech);
      add(t("g_enfants"), BRANDS_REF.enfants);
      add(t("g_maison"), BRANDS_REF.maison);
    } else {
      if (u.includes("femmes") || u.includes("hommes") || u.includes("trad")) {
        add(t("g_mode"), BRANDS_REF.mode);
        add(t("g_chauss"), BRANDS_REF.chaussures.filter((b) => BRANDS_REF.mode.indexOf(b) === -1));
        add(t("g_beaute"), BRANDS_REF.beaute);
      }
      if (u.includes("sport")) add(t("g_sport"), BRANDS_REF.sport);
      if (u.includes("tech")) add(t("g_tech"), BRANDS_REF.tech);
      if (u.includes("enfants")) add(t("g_enfants"), BRANDS_REF.enfants);
      if (u.includes("maison")) add(t("g_maison"), BRANDS_REF.maison);
      if (u.includes("loisirs")) add(t("g_loisirs"), BRANDS_REF.loisirs);
    }
    const ctxItems = allItems.filter((i) => u.length === 0 || u.some((id) => matchUniv(i, id)));
    const known = {};
    groups.forEach((g) => g[1].forEach((b) => { known[b] = 1; }));
    const dyn = [...new Set(ctxItems.map((i) => i.brand).filter((b) => b && b !== "—" && !known[b]))].sort();
    add(t("g_autres"), dyn);
    return groups;
  };

  /* Tailles proposées : uniquement quand ça a du sens, du bon type */
  const sizeGroups = () => {
    const ctx = filterCtx();
    const txt = (ctx.fam + " " + ctx.sub).toLowerCase();
    const u = ctx.univs;
    const noSizeUniv = ["tech", "maison", "livres", "loisirs"];
    if (u.length > 0 && u.every((id) => noSizeUniv.indexOf(id) !== -1)) return [];
    if (/parfum|beaut|soin|maquillage|téléphone|ordinateur|console|audio|photo|tv|tablette|livre|manuel|musique|instrument|collection|jeux de société|puzzle|tajine|théière|vaisselle|meuble|déco|miroir|luminaire|tapis|textile|coussin|rideau|poussette|siège|bain|jouets|construction|poupée/.test(txt)) return [];
    if (/chaussure|sneaker|babouche|talon|sandale|botte|running|football/.test(txt)) return [[t("g_pointures"), SIZES_REF.chaussures]];
    if (/pantalon|jean|jupe|short|survêtement|legging/.test(txt)) return [[t("g_tailles_num"), SIZES_REF.pantalons]];
    if (u.length === 1 && u[0] === "enfants") return [[t("g_ages"), SIZES_REF.enfants]];
    if (txt && !/voir|vêtement|caftan|djellaba|gandoura|robe|haut|chemise|pull|manteau|veste|lingerie|maillot|t-shirt|polo|sweat|tenue/.test(txt)) return [];
    const gs = [[t("g_lettres"), SIZES_REF.lettres]];
    if (!txt) {
      gs.push([t("g_tailles_num"), SIZES_REF.pantalons]);
      gs.push([t("g_pointures"), SIZES_REF.chaussures]);
      if (u.length === 0 || u.includes("enfants")) gs.push([t("g_ages"), SIZES_REF.enfants]);
    }
    return gs;
  };

  /* Libellés et résumés du hub de filtres */
  const SORTS = [["recent", t("sort_recent")], ["price_asc", t("sort_price_asc")], ["price_desc", t("sort_price_desc")], ["popular", t("sort_popular")]];
  const sortSummary = (SORTS.find((s) => s[0] === fSort) || SORTS[0])[1];
  const catSummary = fCats.length ? fCats.map((id) => t("cat_" + id)).join(", ") : t("sum_all");
  const condSummary = fConds.length ? fConds.map((i) => t("conds")[i]).join(", ") : t("sum_all");
  const sizeSummary = fSizes.length ? fSizes.join(", ") : t("sum_all");
  const brandSummary = fBrands.length ? fBrands.join(", ") : t("sum_all");
  const priceSummary = fPriceMin && fPriceMax ? fPriceMin + "–" + fPriceMax + " DH" : fPriceMin ? "≥ " + fPriceMin + " DH" : fPriceMax ? "≤ " + fPriceMax + " DH" : t("sum_all");

  /* Rangée de puces façon Vinted — chaque puce ouvre directement sa facette */
  const filterChips = () => (
    <div className="flex gap-2 px-5 mt-4 overflow-x-auto no-scrollbar">
      <button onClick={() => openFilter("hub")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeFilterCount > 0 ? "bg-stone-900 text-white" : "bg-white text-stone-700 shadow-sm"}`}>
        <SlidersHorizontal size={13} /> {t("filters_title")}{activeFilterCount > 0 ? " · " + activeFilterCount : ""}
      </button>
      {[
        ["sort", t("chip_sort"), fSort !== "recent", 0],
        ["cat", t("filter_cat"), fCats.length > 0, fCats.length],
        ["price", t("filter_price"), !!(fPriceMin || fPriceMax), 0],
        ["cond", t("filter_cond"), fConds.length > 0, fConds.length],
        ...(sizeGroups().length > 0 ? [["size", t("filter_size"), fSizes.length > 0, fSizes.length]] : []),
        ...(brandGroups().length > 0 ? [["brand", t("filter_brand"), fBrands.length > 0, fBrands.length]] : []),
      ].map(([v, label, active, count]) => (
        <button key={v} onClick={() => openFilter(v)}
          className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap ${active ? "bg-stone-900 text-white" : "bg-white text-stone-700 shadow-sm"}`}>
          {label}{count > 1 ? " · " + count : ""} ▾
        </button>
      ))}
    </div>
  );
  const thread = threads.find((th) => th.id === activeThread);

  /* ---------------------------------------------------------------- */
  /* Écrans (appelés comme fonctions pour préserver le focus clavier)  */
  /* ---------------------------------------------------------------- */

  const itemCard = (it) => (
    <button key={it.id} onClick={() => openItem(it)} className="text-left bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform">
      <div className={`relative aspect-square bg-gradient-to-br ${it.grad} flex items-center justify-center overflow-hidden`}>
        {it.photo ? (
          <img src={it.photo} alt={it.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">{it.emoji}</span>
        )}
        {!it.real && (
          <span className="absolute top-2 start-2 bg-white/85 text-stone-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full">{t("beta")}</span>
        )}
        {it.video && (
          <span className="absolute bottom-2 left-2 bg-stone-900/80 text-white rounded-full p-1.5">
            <Video size={11} />
          </span>
        )}
        <button onClick={(e) => toggleLike(it.id, e)}
          className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <Heart size={14} className={liked[it.id] ? "text-rose-500 fill-rose-500" : "text-stone-500"} />
          <span className="text-xs font-semibold text-stone-600">{it.likes + (liked[it.id] ? 1 : 0)}</span>
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-stone-900 truncate">{it.title}</p>
        <p className="text-xs text-stone-500 mt-0.5">{it.brand}{it.size !== "—" ? " · " + it.size : ""} · {t("conds")[it.cond]}</p>
        <div className="flex items-baseline justify-between mt-2">
          <p className="text-base font-extrabold text-orange-600">
            {it.price} DH
            {it.oldPrice && <span className="text-[10px] text-stone-400 line-through font-semibold"> {it.oldPrice}</span>}
          </p>
          <p className="text-[10px] text-stone-400 flex items-center gap-0.5">
            <MapPin size={10} /> {it.city}
          </p>
        </div>
        <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
          <ShieldCheck size={11} /> {totalBuyer(it.price)} DH · {t("prot_incl")}
        </p>
      </div>
    </button>
  );

  const dealCard = (it) => (
    <button key={it.id} onClick={() => openItem(it)}
      className="shrink-0 w-36 bg-white rounded-2xl overflow-hidden shadow-sm text-left active:scale-95 transition-transform">
      <div className={`relative h-24 bg-gradient-to-br ${it.grad} flex items-center justify-center`}>
        <span className="text-4xl">{it.emoji}</span>
        <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
          −{Math.round((1 - it.price / it.oldPrice) * 100)}%
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-bold text-stone-900 truncate">{it.title}</p>
        <p className="text-sm font-extrabold text-orange-600">
          {it.price} DH <span className="text-[10px] text-stone-400 line-through font-semibold">{it.oldPrice}</span>
        </p>
      </div>
    </button>
  );

  const homeScreen = () => (
    <div className="pb-28">
      <div className="px-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star8 size={22} className="text-indigo-600" />
          <span className="font-display font-extrabold text-2xl text-stone-900 tracking-tight">bali</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLangOpen(true)}
            className="flex items-center gap-1.5 p-2 px-3 bg-white rounded-full shadow-sm">
            <Globe size={16} className="text-indigo-600" />
            <span className="text-xs font-extrabold text-stone-700 uppercase">{lang === "zgh" ? "ⵣ" : lang === "dar" ? "دا" : lang}</span>
          </button>
          <button onClick={() => { setNotifOpen(true); setNotifRead(true); loadNotifs(); markNotifsRead(); }} className="relative p-2 bg-white rounded-full shadow-sm">
            {(() => { const unread = dbNotifs.filter((n) => !n.is_read).length + realNotifs().length; return unread > 0 && !notifOpen ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[8px] font-extrabold flex items-center justify-center">{unread}</span>
            ) : null; })()}
            <Bell size={18} className="text-stone-700" />
            {!notifRead && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 flex gap-2">
        <button onClick={() => setTab("search")}
          className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm text-left">
          <Search size={17} className="text-stone-400" />
          <span className="text-sm text-stone-400">{t("search_ph")}</span>
        </button>
        <button onClick={() => openFilter("hub")} className="relative bg-white rounded-2xl px-3 shadow-sm">
          <SlidersHorizontal size={17} className="text-stone-600" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Une seule bannière : promesse + cadeau */}
      <div className="mx-5 mt-4 relative overflow-hidden rounded-3xl bg-indigo-600 text-white p-5">
        <Star8 size={90} className="absolute -right-4 -top-5 text-indigo-500 opacity-60" />
        <p className="font-display font-bold text-lg leading-snug relative">{t("banner1")}</p>
        <p className="text-indigo-200 text-xs mt-1.5 font-semibold relative">{t("banner2")}</p>
        <button onClick={() => showToast(t("gift_applied"))}
          className="relative mt-3 inline-flex items-center gap-2 border border-dashed border-amber-300 rounded-full px-3 py-1.5 active:scale-95 transition-transform">
          <span className="text-sm">🎁</span>
          <span className="text-[11px] font-extrabold text-amber-300 tracking-wide">MARHBA20 · −20 DH</span>
        </button>
      </div>

      {/* Le parcours en 3 étapes — compris en 3 secondes */}
      <div className="px-5 mt-3">
        <button onClick={() => setTrustOpen(true)}
          className="w-full bg-white rounded-2xl p-3 shadow-sm flex items-center gap-1">
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-lg">🛒</span>
            <span className="text-[9px] font-extrabold text-stone-600 text-center leading-tight">{t("s1")}</span>
          </div>
          <ChevronLeft size={13} className={`text-stone-300 shrink-0 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-lg">🏪</span>
            <span className="text-[9px] font-extrabold text-stone-600 text-center leading-tight">{t("s2")}</span>
          </div>
          <ChevronLeft size={13} className={`text-stone-300 shrink-0 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-lg">✅</span>
            <span className="text-[9px] font-extrabold text-stone-600 text-center leading-tight">{t("s3")}</span>
          </div>
        </button>
      </div>

      {/* Suivi de commande */}
      {orderStatus !== "confirmed" && orderStatus !== "disputed" && (
        <div className="px-5 mt-3">
          <button onClick={() => setOrderOpen(true)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-95 transition-transform">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">📦</div>
            <div className="flex-1">
              <p className="text-xs font-extrabold text-stone-900">
                {orderStatus === "ready" ? t("order_ready") : t("order_confirm_prompt")}
              </p>
              <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{t("view_ticket")} →</p>
            </div>
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{ORDER.code}</span>
          </button>
        </div>
      )}

      {/* Deals du jour — urgence */}
      <div className="mt-5">
        <div className="px-5 flex items-center justify-between">
          <p className="text-sm font-extrabold text-stone-900">{t("deals_title")}</p>
          <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">
            ⏳ {tf("ends_in", { t: fmtT(dealLeft) })}
          </span>
        </div>
        <div className="flex gap-3 px-5 mt-3 overflow-x-auto no-scrollbar">
          {ITEMS.filter((i) => i.oldPrice).map((it) => dealCard(it))}
        </div>
      </div>

      {filterChips()}

      <p className="px-5 mt-5 mb-3 text-sm font-extrabold text-stone-900">{t("selection")}</p>
      <div className="px-5 grid grid-cols-2 gap-3">
        {filteredItems.map((it) => itemCard(it))}
      </div>
    </div>
  );

  const searchScreen = () => {
    const q = query.trim().toLowerCase();
    const results = q
      ? applyFilters(allItems.filter((i) => (i.title + " " + i.brand + " " + i.city + " " + i.cat).toLowerCase().includes(q)))
      : [];
    const kwOf = (label) => {
      const w = label.toLowerCase().split(" ")[0];
      return w.endsWith("s") ? w.slice(0, -1) : w;
    };
    const univItems = browseUniv ? applyFilters(allItems.filter((i) => matchUniv(i, browseUniv.id))) : [];
    const browseResults = browseSub && browseSub !== "__all__"
      ? univItems.filter((i) => (i.title + " " + i.brand).toLowerCase().includes(kwOf(browseSub)))
      : univItems;

    const backChevron = <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />;
    const rowChevron = <ChevronLeft size={16} className={`text-stone-300 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />;

    /* ---- Niveau 4 : RÉSULTATS d'une catégorie ---- */
    if (browseUniv && browseSub !== null) {
      const title = browseSub !== "__all__" ? browseSub : (browseFam ? browseFam.label : t("cat_" + browseUniv.id));
      const crumb = t("cat_" + browseUniv.id) + (browseFam ? " · " + browseFam.label : "");
      return (
        <div className="pb-28">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setBrowseSub(null) || (!browseFam || !browseFam.subs ? (setBrowseFam(null), 0) : 0)}>{backChevron}</button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-stone-900 truncate">{title}</p>
              {browseSub !== "__all__" && <p className="text-[10px] text-stone-500 font-semibold truncate">{crumb}</p>}
            </div>
            <button onClick={() => openFilter("hub")} className="relative">
              <SlidersHorizontal size={19} className="text-stone-700" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
          <div className="-mt-1">{filterChips()}</div>
          <div className="px-5 mt-4">
            {browseResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">{browseResults.map((it) => itemCard(it))}</div>
            ) : (
              <div className="mt-14 text-center">
                <p className="text-4xl">🛍️</p>
                <p className="text-sm font-extrabold text-stone-900 mt-3">{t("empty_cat")}</p>
                <button onClick={() => setTab("sell")}
                  className="mt-4 bg-indigo-600 text-white text-xs font-extrabold px-5 py-3 rounded-2xl active:scale-95 transition-transform">
                  {t("empty_cat_cta")} →
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ---- Niveau 3 : sous-catégories d'une famille ---- */
    if (browseUniv && browseFam) {
      return (
        <div className="pb-28 px-5">
          <div className="-mx-5 px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setBrowseFam(null)}>{backChevron}</button>
            <p className="flex-1 text-sm font-extrabold text-stone-900 truncate">{browseFam.label}</p>
          </div>
          <div className="mt-4 space-y-2">
            <button onClick={() => setBrowseSub("__all__")}
              className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform">
              <span className="text-xl w-8 text-center">{browseFam.icon}</span>
              <span className="flex-1 text-left text-sm font-extrabold text-stone-900" dir={cur.dir}>{t("voir_tout")}</span>
              {rowChevron}
            </button>
            {browseFam.subs.map((s) => (
              <button key={s} onClick={() => setBrowseSub(s)}
                className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform">
                <span className="flex-1 text-left text-sm font-bold text-stone-700 ps-11" dir={cur.dir}>{s}</span>
                {rowChevron}
              </button>
            ))}
          </div>
        </div>
      );
    }

    /* ---- Niveau 2 : familles d'un univers ---- */
    if (browseUniv) {
      return (
        <div className="pb-28 px-5">
          <div className="-mx-5 px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setBrowseUniv(null)}>{backChevron}</button>
            <p className="flex-1 text-sm font-extrabold text-stone-900">{t("cat_" + browseUniv.id)}</p>
          </div>
          <div className="mt-4 space-y-2">
            <button onClick={() => { setBrowseFam(null); setBrowseSub("__all__"); }}
              className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform">
              <span className="text-xl w-8 text-center">{browseUniv.emoji}</span>
              <span className="flex-1 text-left text-sm font-extrabold text-stone-900" dir={cur.dir}>{t("voir_tout")}</span>
              {rowChevron}
            </button>
            {browseUniv.fams.map((f) => (
              <button key={f.label} onClick={() => setBrowseFam(f)}
                className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform">
                <span className="text-xl w-8 text-center">{f.icon}</span>
                <span className="flex-1 text-left text-sm font-bold text-stone-800" dir={cur.dir}>{f.label}</span>
                {rowChevron}
              </button>
            ))}
          </div>
        </div>
      );
    }

    /* ---- Niveau 1 : PARCOURIR (barre + grille d'univers, calqué Vinted mobile) ---- */
    return (
      <div className="pb-28 px-5 pt-5">
        <p className="font-display font-bold text-xl text-stone-900">{t("parcourir")}</p>
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 shadow-sm mt-4 focus-within:ring-2 focus-within:ring-indigo-400">
          <Search size={17} className="text-stone-400 shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search_on")}
            className="flex-1 py-3 text-sm font-medium outline-none bg-transparent" />
          {query && (
            <button onClick={() => setQuery("")}><X size={16} className="text-stone-400" /></button>
          )}
        </div>

        {q ? (
          <>
            <div className="-mx-5">{filterChips()}</div>
            {results.length > 0 ? (
              <>
                <p className="text-xs font-bold text-stone-500 mt-4 mb-3">{tf("results_w", { n: results.length })}</p>
                <div className="grid grid-cols-2 gap-3">{results.map((it) => itemCard(it))}</div>
              </>
            ) : (
              <div className="mt-12 text-center">
                <p className="text-4xl">🔍</p>
                <p className="text-sm font-extrabold text-stone-900 mt-3">{tf("no_results", { q: query })}</p>
                <p className="text-xs text-stone-500 font-semibold mt-1">{t("try_else")}</p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-5">
            {CATALOG.map((u) => (
              <button key={u.id} onClick={() => { setBrowseUniv(u); setBrowseFam(null); setBrowseSub(null); }}
                className="relative bg-white rounded-2xl p-4 h-28 text-left shadow-sm active:scale-[0.97] transition-transform overflow-hidden">
                <p className="text-[15px] font-bold text-stone-900 leading-tight pe-6" dir={cur.dir}>{t("cat_" + u.id)}</p>
                <span className="absolute bottom-2 end-3 text-4xl">{u.emoji}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sellScreen = () => (
    <div className="pb-28 px-5 pt-5">
      <p className="font-display font-bold text-xl text-stone-900">{t("sell_title")}</p>
      <p className="text-xs text-stone-500 mt-1 font-medium">{t("sell_sub")}</p>

      {/* --- ANNONCE IA --- */}
      <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-5">
        <Star8 size={80} className="absolute -right-4 -top-4 text-white opacity-10" />
        {aiState === "loading" ? (
          <div className="flex items-center gap-4">
            {photoUrl && <img src={photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30" />}
            <div className="flex-1">
              <p className="font-display font-bold text-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> {t("ai_loading")}
              </p>
              <p className="text-[11px] text-indigo-200 mt-1 animate-pulse">{t("ai_sub_loading")}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-display font-bold text-base flex items-center gap-2">
              <Sparkles size={17} /> {t("ai_cta1")}
            </p>
            <p className="text-[11px] text-indigo-200 mt-1 font-semibold leading-relaxed">{t("ai_cta2")}</p>
            <p className="mt-2 inline-flex items-center bg-white/15 border border-white/20 text-[11px] font-bold px-3 py-1.5 rounded-full">{t("ai_flow")}</p>
            <br />
            <label className="mt-3 inline-flex items-center gap-2 bg-white text-indigo-700 text-xs font-extrabold px-4 py-2.5 rounded-full cursor-pointer active:scale-95 transition-transform">
              <Camera size={14} /> {t("ai_btn")}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => analyzePhoto(e.target.files && e.target.files[0])} />
            </label>
            {aiState === "error" && <p className="text-[11px] text-amber-200 font-bold mt-2">⚠️ {t("ai_error")}</p>}
            {aiState === "invalid" && <p className="text-[11px] text-amber-200 font-bold mt-2">⚠️ {t("ai_invalid")}</p>}
          </div>
        )}
      </div>

      {/* Résultat IA : fourchette de prix */}
      {aiState === "done" && aiResult && (
        <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
          <p className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
            <Sparkles size={13} /> {t("ai_sugg")}
          </p>
          <p className="text-[11px] text-stone-500 font-semibold mt-1">
            {aiResult.brand}{aiResult.size !== "—" ? " · " + aiResult.size : ""} · {t("ai_range")} : {aiResult.min}–{aiResult.max} DH
          </p>
          <p className="text-[10px] text-indigo-500 font-bold mt-1">📊 {tf("cote_line", { n: aiResult.n || 1247 })}</p>
          <div className="flex gap-2 mt-3">
            {[aiResult.min, aiResult.sugg, aiResult.max].map((p, i) => (
              <button key={i} onClick={() => setSellPrice(String(p))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold ${
                  sellPrice === String(p)
                    ? "bg-indigo-600 text-white"
                    : i === 1 ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-stone-100 text-stone-600"}`}>
                {p} DH
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {photoUrl ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <img src={photoUrl} alt={t("add_photo")} className="w-full h-full object-cover" />
            <button onClick={clearPhoto} aria-label={t("remove_photo")}
              className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center active:scale-90">
              <X size={13} />
            </button>
          </div>
        ) : (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center gap-1 cursor-pointer overflow-hidden">
            <Camera size={20} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-500">{t("add_photo")}</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => analyzePhoto(e.target.files && e.target.files[0])} />
          </label>
        )}
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square rounded-2xl bg-stone-200/60" />
        ))}
      </div>

      {/* Champs */}
      <div className="mt-5 space-y-3">
        <input value={sellTitle} onChange={(e) => setSellTitle(e.target.value)}
          placeholder={t("title_ph")}
          className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-400" />

        <textarea value={sellDesc} onChange={(e) => setSellDesc(e.target.value)}
          placeholder={t("desc_ph")} rows={3}
          className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />

        <div>
          <p className="text-xs font-bold text-stone-500 mb-2 mt-4">{t("cat_label")}</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {t("scats").map((c, i) => (
              <button key={i} onClick={() => setSellCatI(i)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${
                  sellCatI === i ? "bg-indigo-600 text-white" : "bg-white text-stone-600 shadow-sm"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-stone-500 mb-2 mt-4">{t("cond_label")}</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {t("conds").map((c, i) => (
              <button key={i} onClick={() => setSellCondI(i)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${
                  sellCondI === i ? "bg-indigo-600 text-white" : "bg-white text-stone-600 shadow-sm"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-stone-500 mb-2 mt-4">{t("price_label")}</p>
          <div className="flex items-center bg-white rounded-2xl px-4 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
            <input value={sellPrice} onChange={(e) => setSellPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0" inputMode="numeric"
              className="flex-1 py-3.5 text-sm font-bold outline-none bg-transparent" />
            <span className="text-sm font-extrabold text-stone-400">DH</span>
          </div>
        </div>

        {/* IMEI obligatoire pour la tech — anti-recel */}
        {sellCatI === 3 && (
          <div>
            <p className="text-xs font-bold text-stone-500 mb-2 mt-4 flex items-center gap-1.5">
              <Smartphone size={13} className="text-indigo-600" /> {t("imei_label")}
            </p>
            <input value={imeiVal} onChange={(e) => setImeiVal(e.target.value.replace(/[^0-9]/g, "").slice(0, 15))}
              placeholder={t("imei_ph")} inputMode="numeric"
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-400" />
            {imeiVal.length === 15 && (
              <p className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
                <ShieldCheck size={12} /> {t("check_l1")} ✅
              </p>
            )}
          </div>
        )}

        {/* Options — regroupées, compactes */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-100">
          <button onClick={() => setSadaqaOn(!sadaqaOn)} className="w-full p-3.5 flex items-center gap-3">
            <span className="text-lg">🤲</span>
            <div className="flex-1 text-left">
              <p className="text-xs font-extrabold text-stone-900">{t("sadaqa")}</p>
              <p className="text-[10px] text-stone-500 font-semibold">{t("sadaqa_sub")}</p>
            </div>
            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors shrink-0 ${sadaqaOn ? "bg-emerald-500" : "bg-stone-200"}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${sadaqaOn ? "translate-x-5" : ""}`} />
            </div>
          </button>
          <button onClick={() => setDiscreetOn(!discreetOn)} className="w-full p-3.5 flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <div className="flex-1 text-left">
              <p className="text-xs font-extrabold text-stone-900">{t("discreet")}</p>
              <p className="text-[10px] text-stone-500 font-semibold">{t("discreet_sub")}</p>
            </div>
            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors shrink-0 ${discreetOn ? "bg-indigo-600" : "bg-stone-200"}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${discreetOn ? "translate-x-5" : ""}`} />
            </div>
          </button>
        </div>

        {sellPrice && (
          <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
            sadaqaOn ? "bg-emerald-50 border-emerald-200" : "bg-emerald-50 border-emerald-200"}`}>
            <Banknote size={18} className="text-emerald-600 mt-0.5" />
            <div>
              {sadaqaOn ? (
                <p className="text-sm font-extrabold text-emerald-800">{tf("sadaqa_on", { x: sellPrice })}</p>
              ) : (
                <p className="text-sm font-extrabold text-emerald-800">{t("you_receive")} {sellPrice} DH</p>
              )}
              <p className="text-xs text-emerald-700 mt-0.5">
                {tf("buyer_pays", { x: totalBuyer(parseInt(sellPrice, 10) || 0) })}
              </p>
            </div>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck size={18} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-emerald-800">{t("seller_guar_t")}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 leading-relaxed">{t("seller_guar")}</p>
          </div>
        </div>

        <button onClick={publish} disabled={publishing}
          className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl mt-2 active:scale-95 transition-transform disabled:opacity-60">
          {publishing ? "Publication en cours…" : t("publish")}
        </button>
      </div>
    </div>
  );

  const offerBubble = (m, i, tId) => (
    <div key={i} className={`max-w-[80%] rounded-2xl p-3.5 ${m.from === "me" ? "ml-auto bg-indigo-600 text-white" : "bg-white shadow-sm"}`}>
      <p className={`text-xs font-bold ${m.from === "me" ? "text-indigo-200" : "text-indigo-600"}`}>💰 {t("offer_label")}</p>
      <p className="text-xl font-extrabold mt-1">{m.amount} DH</p>
      {m.text && <p className={`text-xs mt-1 ${m.from === "me" ? "text-indigo-100" : "text-stone-500"}`}>{m.text}</p>}
      {m.status === "accepted" ? (
        <p className="text-xs font-bold mt-2 flex items-center gap-1 text-emerald-600">
          <Check size={13} /> {t("accepted")}
        </p>
      ) : m.from === "them" ? (
        <div className="flex gap-2 mt-3">
          <button onClick={() => acceptOffer(tId, i)}
            className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl">{t("accept")}</button>
          <button onClick={() => counterOffer(tId, i)} className="flex-1 bg-stone-100 text-stone-700 text-xs font-bold py-2 rounded-xl">{t("counter")}</button>
        </div>
      ) : (
        <p className="text-[10px] mt-1.5 text-indigo-200 font-semibold">{t("waiting")}</p>
      )}
    </div>
  );

  const messagesScreen = () => {
    /* Chat RÉEL ouvert */
    if (dbThread) {
      return (
        <div className="pb-28 flex flex-col min-h-full">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setDbThread(null)}>
              <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
            </button>
            <button onClick={() => { if (dbThread.otherName) { setSellerView(dbThread.otherName); if (dbThread.otherId) loadFollowerCount(dbThread.otherId); } }}
              className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-extrabold text-indigo-600 overflow-hidden shrink-0">
                {dbThread.photo ? <img src={dbThread.photo} alt="" className="w-full h-full object-cover" /> : (dbThread.otherName || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1">{dbThread.otherName} <ChevronLeft size={13} className={`text-stone-400 ${cur.dir === "rtl" ? "" : "rotate-180"}`} /></p>
                <p className="text-[10px] text-stone-500 font-semibold truncate">{dbThread.itemTitle}</p>
              </div>
            </button>
          </div>
          <div className="flex-1 px-5 pt-4 space-y-3">
            {dbMsgs.map((m) =>
              m.offer_amount_dh ? (
                <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  m.sender_id === dbThread.mine ? "ml-auto bg-indigo-600 text-white" : "bg-white shadow-sm text-stone-800"}`}>
                  <p className="text-[10px] font-bold opacity-70">💰</p>
                  <p className="font-display font-extrabold text-xl">{m.offer_amount_dh} DH</p>
                </div>
              ) : (
                <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                  m.sender_id === dbThread.mine ? "ml-auto bg-indigo-600 text-white" : "bg-white shadow-sm text-stone-800"}`}>
                  {m.body}
                </div>
              )
            )}
          </div>
          <div className="px-5 mt-4 flex gap-2">
            <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendDbMsg(); }}
              placeholder={t("write_msg")}
              className="flex-1 bg-white rounded-2xl px-4 py-3 text-sm font-medium shadow-sm outline-none" />
            <button onClick={sendDbMsg} className="bg-indigo-600 rounded-2xl px-4 text-white active:scale-95 transition-transform">
              <Send size={17} className={cur.dir === "rtl" ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
      );
    }
    if (thread) {
      return (
        <div className="pb-28 flex flex-col min-h-full">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setActiveThread(null)}><ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} /></button>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-extrabold text-indigo-600">
              {thread.name[0]}
            </div>
            <div>
              <p className="text-sm font-extrabold text-stone-900">{thread.name}</p>
              <p className="text-[10px] text-stone-500 font-semibold">{thread.emoji} {thread.itemTitle}</p>
            </div>
          </div>
          <div className="flex-1 px-5 pt-4 space-y-3">
            {thread.messages.map((m, i) =>
              m.type === "offer" ? offerBubble(m, i, thread.id) : (
                <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                  m.from === "me" ? "ml-auto bg-indigo-600 text-white" : "bg-white shadow-sm text-stone-800"}`}>
                  {m.text}
                </div>
              )
            )}
          </div>
          <div className="px-5 mt-4 flex gap-2">
            <input value={demoMsg} onChange={(e) => setDemoMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendDemoMsg(); }}
              placeholder={t("write_msg")}
              className="flex-1 bg-white rounded-2xl px-4 py-3 text-sm font-medium shadow-sm outline-none" />
            <button onClick={sendDemoMsg} className="bg-indigo-600 rounded-2xl px-4 text-white active:scale-95 transition-transform"><Send size={17} className={cur.dir === "rtl" ? "rotate-180" : ""} /></button>
          </div>
        </div>
      );
    }
    return (
      <div className="pb-28 px-5 pt-5">
        <p className="font-display font-bold text-xl text-stone-900">{t("messages")}</p>
        <div className="mt-4 space-y-2">
          {dbThreads.map((th) => (
            <button key={th.id} onClick={() => openDbThread(th)}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left active:scale-95 transition-transform">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-base font-extrabold text-indigo-600 overflow-hidden shrink-0">
                {th.photo ? <img src={th.photo} alt="" className="w-full h-full object-cover" /> : (th.otherName || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-stone-900">{th.otherName}</p>
                <p className="text-xs text-stone-500 truncate">{th.itemTitle}</p>
              </div>
            </button>
          ))}
          {dbThreads.length === 0 && (
            <p className="text-[11px] text-stone-500 font-semibold text-center py-2">{t("msgs_none")}</p>
          )}
          {threads.map((th) => (
            <button key={th.id} onClick={() => setActiveThread(th.id)}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left active:scale-95 transition-transform">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-base font-extrabold text-indigo-600">
                {th.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                  {th.name}
                  <span className="text-[9px] font-bold bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-full">{t("beta")}</span>
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {th.messages[th.messages.length - 1].type === "offer"
                    ? "💰 " + th.messages[th.messages.length - 1].amount + " DH"
                    : th.messages[th.messages.length - 1].text}
                </p>
              </div>
              <span className="text-2xl">{th.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const pname_initial = (name) => (name && name.trim() ? name.trim()[0].toUpperCase() : "?");

  const profileScreen = () => {
    const pname = myProfile && myProfile.display_name ? myProfile.display_name : "";
    const myItems = dbItems.filter((it) => myProfile && it.real && it.seller_id === myProfile.id);
    return (
    <div className="pb-28 px-5 pt-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-display font-extrabold text-white">
          {pname_initial(pname)}
        </div>
        <div className="flex-1">
          {pname ? (
            <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-1.5">
              {pname} <BadgeCheck size={17} className="text-indigo-600" />
            </p>
          ) : (
            <button onClick={() => { setNameInput(""); setNameOpen(true); }}
              className="font-display font-bold text-base text-indigo-600 flex items-center gap-1.5">
              ✏️ Ajoute ton nom
            </button>
          )}
          <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-amber-500 fill-amber-500" /> {t("member")}
          </p>
          {pname && (
            <button onClick={() => { setNameInput(pname); setNameOpen(true); }}
              className="text-[10px] text-indigo-500 font-bold mt-0.5">Modifier</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        {[[String(myItems.length), t("s_sales")], ["0", t("s_followers")], [String(Object.values(liked).filter(Boolean).length), t("s_favs")]].map(([n, l]) => (
          <div key={l} className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-lg font-extrabold text-stone-900">{n}</p>
            <p className="text-[10px] font-bold text-stone-400">{l}</p>
          </div>
        ))}
      </div>

      {/* Accès admin — réservé au fondateur */}
      {myProfile && myProfile.is_admin && (
        <button onClick={() => { setAdminOpen(true); loadAdmin(); }}
          className="w-full mt-4 bg-stone-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ShieldCheck size={18} className="text-amber-400" />
          </div>
          <p className="flex-1 text-left text-sm font-extrabold text-white">{t("admin_panel")}</p>
          <ChevronLeft size={16} className={`text-white/40 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
        </button>
      )}

      {/* Mes commandes réelles */}
      <button onClick={() => { setOrdersOpen(true); loadMyOrders(); }}
        className="w-full mt-4 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
          <Package size={18} className="text-indigo-600" />
        </div>
        <p className="flex-1 text-left text-sm font-extrabold text-stone-900">{t("my_orders")}</p>
        <span className="text-xs font-bold text-stone-400">{myOrders.length}</span>
        <ChevronLeft size={16} className={`text-stone-400 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
      </button>

      {/* Vente en cours — dépôt du colis */}
      <button onClick={() => setSaleOpen(true)}
        className="w-full mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-95 transition-transform">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${SALE.item.grad} flex items-center justify-center text-xl shrink-0`}>{SALE.item.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-stone-900">{saleDropped ? t("sale_card_done") : t("sale_card_todo")}</p>
          <p className="text-[10px] text-indigo-600 font-bold mt-0.5 truncate">{SALE.item.title} · {SALE.item.price} DH →</p>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full shrink-0 ${saleDropped ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {saleDropped ? t("dep_status_ok") : t("dep_status_todo")}
        </span>
      </button>

      {/* Score de fiabilité acheteur — l'arme anti-refus COD */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <ShieldCheck size={22} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-extrabold text-stone-900">{t("b_score")} · <span className="text-emerald-600">98%</span></p>
          <p className="text-[11px] text-stone-500 font-semibold">{t("b_refus")} ✅ — {t("b_trust")}</p>
          <p className="text-[10px] text-stone-500 font-semibold mt-0.5">ⓘ {t("fiab_note")}</p>
        </div>
      </div>

      {/* Garanties & aide humaine */}
      <button onClick={() => setTrustOpen(true)}
        className="w-full mt-3 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
          <HeartHandshake size={18} className="text-emerald-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-extrabold text-stone-900">{t("trust_title")}</p>
          <p className="text-[11px] text-stone-500 font-semibold">{t("trust_help_sub")}</p>
        </div>
      </button>

      {/* Devenir point bali — redirige vers l'app Partenaire dédiée */}
      <a href="?partenaire"
        className="w-full mt-3 bg-stone-900 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
        <Star8 size={46} className="absolute -right-1 -top-2 text-stone-800" />
        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center relative shrink-0">
          <Store size={18} className="text-stone-900" />
        </div>
        <div className="flex-1 text-left relative">
          <p className="text-sm font-extrabold text-white">{t("become_point")}</p>
          <p className="text-[11px] text-stone-500 font-semibold">{t("become_sub")}</p>
        </div>
      </a>

      <div className="mt-4 bg-indigo-600 rounded-3xl p-5 text-white relative overflow-hidden">
        <Star8 size={70} className="absolute -right-3 -bottom-4 text-indigo-500 opacity-50" />
        <p className="text-xs font-bold text-indigo-200 flex items-center gap-1.5"><Wallet size={14} /> {t("wallet")}</p>
        <p className="font-display font-extrabold text-3xl mt-2">340 DH</p>
        <div className="flex gap-2 mt-3 relative">
          <button onClick={() => setPayOpen(true)}
            className="bg-amber-400 text-stone-900 text-xs font-extrabold px-4 py-2 rounded-full">{t("recharge")}</button>
          <button onClick={() => showToast(t("wallet_soon"))} className="bg-white text-indigo-700 text-xs font-extrabold px-4 py-2 rounded-full">{t("transfer")}</button>
        </div>
      </div>

      <button onClick={() => setLangOpen(true)}
        className="w-full mt-4 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
          <Globe size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-extrabold text-stone-900">{t("language")}</p>
          <p className="text-xs text-stone-500 font-semibold">{cur.name}</p>
        </div>
        <span className="text-lg">{cur.flag}</span>
      </button>

      <p className="text-sm font-extrabold text-stone-900 mt-6 mb-3">{t("dressing")}</p>
      {myItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {myItems.map((it) => itemCard(it))}
        </div>
      ) : (
        <p className="text-xs text-stone-500 font-semibold text-center py-4">Tu n'as pas encore d'annonce. Publie ton premier article !</p>
      )}
      <button onClick={() => setTab("sell")}
        className="w-full mt-4 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2">
        <Plus size={16} /> {t("sell_new")}
      </button>

      {allItems.filter((x) => liked[x.id]).length > 0 && (
        <>
          <p className="text-sm font-extrabold text-stone-900 mt-6 mb-3">❤️ {t("my_favs")}</p>
          <div className="grid grid-cols-2 gap-3">
            {allItems.filter((x) => liked[x.id]).map((x) => itemCard(x))}
          </div>
        </>
      )}

      <button onClick={async () => { await supabase.auth.signOut(); setMyProfile(null); setDbThreads([]); setDbThread(null); showToast(t("logout_done")); setObStep(0); setTab("home"); }}
        className="w-full mt-4 text-stone-500 font-bold text-xs py-3">
        {t("logout")}
      </button>
    </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* Fiche article + feuilles                                          */
  /* ---------------------------------------------------------------- */

  const itemDetail = (it) => (
    <div className="fixed inset-0 z-40 flex justify-center bg-black/40" dir={cur.dir}>
      <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app">
        <div className={`relative aspect-square bg-gradient-to-br ${it.grad} flex items-center justify-center overflow-hidden`}>
          {it.photo ? (
            <img src={it.photo} alt={it.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-9xl">{it.emoji}</span>
          )}
          <button onClick={() => setItem(null)} className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow">
            <ChevronLeft size={20} className={`text-stone-800 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => { try { navigator.clipboard.writeText(window.location.origin + "?article=" + String(it.id).replace("db_", "")); } catch (e) {} showToast(t("link_copied")); }}
            className="absolute top-16 right-4 bg-white/90 p-2 rounded-full shadow">
            <Send size={17} className="text-stone-600" />
          </button>
          <button onClick={(e) => toggleLike(it.id, e)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow">
            <Heart size={20} className={liked[it.id] ? "text-rose-500 fill-rose-500" : "text-stone-600"} />
          </button>
          <button onClick={() => showToast(t("share_toast"))} className="absolute top-16 right-4 bg-white/90 p-2 rounded-full shadow">
            <Share2 size={18} className="text-stone-600" />
          </button>
        </div>

        <div className="p-5 pb-44">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold text-lg text-stone-900 leading-snug">{it.title}</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">{it.brand}{it.size !== "—" ? " · " + it.size : ""} · {t("conds")[it.cond]}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-orange-600">{it.price} DH</p>
              {it.oldPrice && <p className="text-[11px] text-stone-400 line-through font-semibold">{it.oldPrice} DH</p>}
              <p className="text-[10px] text-stone-500 font-semibold">{totalBuyer(it.price)} DH {t("with_prot")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              <ShieldCheck size={12} /> {t("protection")}
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              🏪 {t("badge_inspect")}
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              ↩️ {t("badge_refund")}
            </span>
            {it.video && (
              <span className="flex items-center gap-1 bg-stone-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                <Video size={12} /> {t("video_b")}
              </span>
            )}
          </div>

          <p className="text-sm text-stone-600 leading-relaxed mt-4">{it.desc}</p>

          {/* bali Check — vérification anti-vol et authenticité */}
          {it.imei && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck size={14} /> {t("check_title")}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">✓ {t("check_l1")}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ {t("check_l2")}</p>
            </div>
          )}

          {/* Livraison intelligente : hanout si proche, Poste si loin */}
          <p className="text-xs font-bold text-stone-500 mt-5 mb-2">{t("delivery_label")}</p>
          {it.city !== USER_CITY && (
            <p className="text-[10px] text-indigo-600 font-bold mb-2">🤖 {tf("smart_route", { a: USER_CITY, b: it.city })}</p>
          )}
          <div className="space-y-2">
            {delivFor(it).map((d, i) => {
              const DIcon = d.icon;
              const active = deliveryI === i;
              return (
                <button key={d.key} onClick={() => setDeliveryI(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    active ? "bg-indigo-50 border-indigo-300" : "bg-white border-transparent shadow-sm"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-500"}`}>
                    <DIcon size={16} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-extrabold flex items-center gap-1.5 flex-wrap ${active ? "text-indigo-800" : "text-stone-700"}`}>
                      {t(d.key)}
                      {d.reco && (
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{t("reco")}</span>
                      )}
                    </p>
                    <p className="text-[9px] text-stone-500 font-bold mt-0.5">⏱ {t(d.eta)}</p>
                  </div>
                  <p className={`text-xs font-extrabold shrink-0 ${active ? "text-indigo-700" : "text-stone-500"}`}>{d.price} DH</p>
                </button>
              );
            })}
          </div>
          {it.city !== USER_CITY && (
            <p className="text-[10px] text-emerald-700 font-bold mt-2 flex items-start gap-1.5">
              <ShieldCheck size={12} className="mt-0.5 shrink-0" /> {t("far_protect")}
            </p>
          )}

          <div className="mt-5 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <button onClick={() => { setSellerView(it.seller.name); if (it.seller_id) loadFollowerCount(it.seller_id); setItem(null); }}
              className="flex items-center gap-3 flex-1 text-left">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-base font-extrabold text-indigo-600 shrink-0">
                {it.discreet ? "S" : it.seller.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                  {it.discreet ? "S." : it.seller.name}
                  {it.discreet && (
                    <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={9} /> {t("discreet_badge")}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                  <Star size={11} className="text-amber-500 fill-amber-500" /> {it.seller.rating} · {it.seller.sales} {t("sales_w")} · <MapPin size={10} /> {it.city}
                </p>
              </div>
            </button>
            <button onClick={() => sendQuickMsg(it)}
              className="bg-stone-100 text-stone-800 text-[11px] font-extrabold px-3 py-2 rounded-full whitespace-nowrap">
              {t("wach")}
            </button>
          </div>

          <button onClick={() => setTrustOpen(true)}
            className="w-full mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Package size={16} className="text-indigo-600" />
            </div>
            <p className="flex-1 text-left text-xs font-extrabold text-stone-900">{t("how_title")} · {t("trust_title")}</p>
            <ChevronLeft size={16} className={`text-stone-400 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
          </button>
        </div>

        <div className="fixed bottom-0 inset-x-0 flex justify-center">
          {myProfile && it.real && it.seller_id === myProfile.id ? (
            <div className="w-full max-w-md bg-white border-t border-stone-100 p-4">
              <p className="text-center text-[11px] font-extrabold text-stone-500 mb-2">✋ {t("own_item")}</p>
              <button onClick={() => deleteItem(it)}
                className="w-full border-2 border-rose-300 text-rose-600 font-extrabold text-sm py-3.5 rounded-2xl">
                {t("delete_item")}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md bg-white border-t border-stone-100 p-4 flex gap-3">
              <button onClick={() => { setOfferValue(String(Math.round(it.price * 0.9))); setOfferOpen(true); }}
                className="flex-1 border-2 border-indigo-600 text-indigo-600 font-extrabold text-sm py-3.5 rounded-2xl">
                {t("make_offer")}
              </button>
              <button onClick={() => { setPayMethodI(0); setCheckoutOpen(true); }}
                className="flex-1 bg-indigo-600 text-white font-extrabold text-sm py-3.5 rounded-2xl">
                {t("buy")} · {totalBuyer(it.price) + delivFor(it)[deliveryI].price} DH
              </button>
            </div>
          )}
        </div>
      </div>

      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setOfferOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" dir={cur.dir} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-lg text-stone-900">{t("negotiate")}</p>
              <button onClick={() => setOfferOpen(false)}><X size={20} className="text-stone-400" /></button>
            </div>
            <p className="text-xs text-stone-500 font-semibold mt-1">{t("listed")} : {it.price} DH</p>
            <div className="flex gap-2 mt-4">
              {[0.9, 0.85, 0.8].map((r) => (
                <button key={r} onClick={() => setOfferValue(String(Math.round(it.price * r)))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-extrabold ${
                    offerValue === String(Math.round(it.price * r))
                      ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-700"}`}>
                  {Math.round(it.price * r)} DH
                </button>
              ))}
            </div>
            <div className="flex items-center bg-stone-100 rounded-2xl px-4 mt-3">
              <input value={offerValue} onChange={(e) => setOfferValue(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric" placeholder={t("your_price")}
                className="flex-1 py-3.5 bg-transparent text-sm font-extrabold outline-none" />
              <span className="text-sm font-extrabold text-stone-400">DH</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold mt-3 flex items-center gap-1.5">
              <ShieldCheck size={13} /> {t("b_score")} 98% — {t("b_trust")}
            </p>
            <button onClick={() => sendOffer(it)}
              className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl mt-3 active:scale-95 transition-transform">
              {t("send_offer")}
            </button>
          </div>
        </div>
      )}

      {/* Checkout — choix du paiement */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setCheckoutOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" dir={cur.dir} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-lg text-stone-900">{t("checkout_title")}</p>
              <button onClick={() => setCheckoutOpen(false)}><X size={20} className="text-stone-400" /></button>
            </div>

            <div className="mt-4 bg-stone-50 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.grad} flex items-center justify-center text-2xl`}>{it.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-stone-900 truncate">{it.title}</p>
                <div className="text-[10px] text-stone-500 font-semibold space-y-0.5 mt-0.5">
                  <p className="flex justify-between gap-3"><span>{t("r_item")}</span><span className="font-bold text-stone-700">{it.price} DH</span></p>
                  <p className="flex justify-between gap-3"><span>🛡️ {t("protection")}</span><span className="font-bold text-stone-700">{fee(it.price)} DH</span></p>
                  <p className="flex justify-between gap-3"><span>🏪 {t("r_deliv")}</span><span className="font-bold text-stone-700">{delivFor(it)[deliveryI].price} DH</span></p>
                </div>
                <p className="text-[10px] text-rose-600 font-extrabold mt-0.5">🎁 MARHBA20 · −20 DH</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-stone-400 line-through font-semibold">
                  {totalBuyer(it.price) + delivFor(it)[deliveryI].price} DH
                </p>
                <p className="text-base font-extrabold text-orange-600">
                  {totalBuyer(it.price) + delivFor(it)[deliveryI].price - 20} DH
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-stone-500 mt-4 mb-2">{t("pay_method")}</p>
            <div className="space-y-2">
              {[
                { ic: CreditCard, l: t("pm_card"), off: false },
                { ic: Wallet, l: t("pm_wallet"), off: totalBuyer(it.price) + delivFor(it)[deliveryI].price > 340 },
              ].map((m, idx) => {
                const MIcon = m.ic;
                const active = payMethodI === idx;
                return (
                  <button key={idx} disabled={m.off} onClick={() => setPayMethodI(idx)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                      m.off ? "bg-stone-50 border-stone-100 opacity-50"
                        : active ? "bg-indigo-50 border-indigo-300" : "bg-white border-stone-200"}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active && !m.off ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-500"}`}>
                      <MIcon size={16} />
                    </div>
                    <p className={`flex-1 text-left text-xs font-extrabold ${active && !m.off ? "text-indigo-800" : "text-stone-700"}`}>{m.l}</p>
                    {m.off && <span className="text-[9px] font-extrabold text-rose-500">{t("insufficient")}</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5">
              <p className="text-[11px] text-emerald-800 font-bold leading-relaxed">🛡️ {t("paid_sub")}</p>
            </div>

            <p className="text-[10px] font-extrabold text-stone-400 mt-3">{t("no_card")}</p>
            <div className="mt-1.5 space-y-1.5">
              <button onClick={() => setPayOpen(true)}
                className="w-full text-left bg-stone-50 rounded-xl px-3.5 py-2.5 text-[11px] font-bold text-stone-700 active:bg-stone-100">
                🏪 {t("opt_cash")}
              </button>
              <button onClick={() => showToast(t("khel_toast"))}
                className="w-full text-left bg-stone-50 rounded-xl px-3.5 py-2.5 text-[11px] font-bold text-stone-700 active:bg-stone-100">
                🔗 {t("opt_khel")}
              </button>
            </div>

            <button onClick={() => { if (it.real) createRealOrder(it); else { setCheckoutOpen(false); setItem(null); showToast(t("t_paid")); } }}
              disabled={creatingOrder}
              className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl mt-4 active:scale-95 transition-transform disabled:opacity-60">
              {creatingOrder ? "Confirmation en cours…" : t("confirm_order")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* bali Pay — recharge en espèces au point relais (cash-in) */
  const paySheet = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setPayOpen(false)}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" dir={cur.dir} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-2">
            <Wallet size={18} className="text-indigo-600" /> {t("pay_title")}
          </p>
          <button onClick={() => setPayOpen(false)}><X size={20} className="text-stone-400" /></button>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="p-3 rounded-2xl border-2 border-stone-100">
            <QRCodeSVG seed={"PAY-ABDL-" + qrSeed} size={140} />
          </div>
          <p className="text-[11px] text-stone-500 font-semibold text-center mt-3 leading-relaxed">{t("cashin_txt")}</p>
          <button onClick={() => setRelayView(ORDER.point)} className="w-full mt-3 bg-stone-50 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <Store size={16} className="text-indigo-600 shrink-0" />
            <p className="text-[11px] font-extrabold text-stone-700 flex-1 text-left">{ORDER.point.name} · {ORDER.point.dist} · {ORDER.point.hours}</p>
            <ChevronLeft size={13} className={`text-stone-400 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
          </button>
        </div>
      </div>
    </div>
  );

  /* Garanties bali — la réponse à la faille n°1 de l'industrie : le support */
  const trustSheet = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setTrustOpen(false)}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app max-h-[85vh] overflow-y-auto" dir={cur.dir} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" /> {t("trust_title")}
          </p>
          <button onClick={() => setTrustOpen(false)}><X size={20} className="text-stone-400" /></button>
        </div>

        {/* Agent humain en ligne */}
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold">A</div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-stone-900">{t("trust_agent")}</p>
              <p className="text-[10px] text-emerald-700 font-bold">{t("trust_help_sub")}</p>
            </div>
          </div>
          <button onClick={() => showToast(t("trust_toast"))}
            className="w-full mt-3 bg-emerald-600 text-white text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-2">
            <MessageCircle size={14} /> {t("trust_whatsapp")}
          </button>
        </div>

        {/* Les 5 garanties */}
        <div className="mt-4 space-y-2.5 pb-2">
          {["g1", "g2", "g3", "g4", "g5"].map((k, i) => (
            <div key={k} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-xs text-stone-700 font-semibold leading-relaxed">{t(k)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const langSheet = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setLangOpen(false)}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-2">
            <Globe size={18} className="text-indigo-600" /> {t("choose_lang")}
          </p>
          <button onClick={() => setLangOpen(false)}><X size={20} className="text-stone-400" /></button>
        </div>
        <div className="mt-4 space-y-1">
          {LANGS.map((l) => (
            <button key={l.id}
              onClick={() => { setLang(l.id); setLangOpen(false); showToast(l.flag + " " + l.name); }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                lang === l.id ? "bg-indigo-50" : "active:bg-stone-50"}`}>
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-lg font-extrabold text-indigo-700">
                {l.flag}
              </div>
              <div className="flex-1 text-left" dir={l.dir}>
                <p className={`text-sm font-extrabold ${lang === l.id ? "text-indigo-700" : "text-stone-900"}`}>{l.name}</p>
              </div>
              {l.beta && (
                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">{t("beta")}</span>
              )}
              {lang === l.id && <Check size={18} className="text-indigo-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* PAGE VENDEUR PUBLIQUE                                             */
  /* ---------------------------------------------------------------- */

  const [relayView, setRelayView] = useState(null);
  const relayScreen = (pt) => {
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(pt.addr) + (pt.lat ? "&query=" + pt.lat + "," + pt.lng : "");
    const wazeUrl = pt.lat ? "https://waze.com/ul?ll=" + pt.lat + "," + pt.lng + "&navigate=yes" : "https://waze.com/ul?q=" + encodeURIComponent(pt.addr);
    return (
      <div className="fixed inset-0 z-[60] flex justify-center bg-black/40" dir={cur.dir}>
        <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app pb-10">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setRelayView(null)} aria-label={t("back")}>
              <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
            </button>
            <p className="text-sm font-extrabold text-stone-900">{t("relay_title")}</p>
          </div>

          <div className="px-5 pt-5">
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shrink-0">🏪</div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-1.5">{pt.name} <BadgeCheck size={16} className="text-indigo-600" /></p>
                  <p className="text-[11px] text-stone-500 font-semibold">{pt.owner} · {t("relay_verified")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  <Star size={11} className="fill-amber-500 text-amber-500" /> {pt.rating} ({pt.ratings_count})
                </span>
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  <ShieldCheck size={11} /> {pt.reliability}% {t("relay_reliable")}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm mt-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-800">{pt.addr}</p>
                  <p className="text-[11px] text-stone-500 font-semibold mt-0.5">{t("relay_dist")} : <span className="font-extrabold text-stone-900">{pt.dist}</span></p>
                </div>
              </div>
              <div className="mt-3 h-28 rounded-2xl bg-gradient-to-br from-indigo-50 to-stone-100 border border-stone-100 flex flex-col items-center justify-center gap-1">
                <MapPin size={22} className="text-indigo-400" />
                <p className="text-[10px] font-bold text-stone-400">{t("relay_map_soon")}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-indigo-600 text-white text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95">
                  <MapPin size={14} /> Google Maps
                </a>
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-stone-900 text-white text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95">
                  🧭 Waze
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-stone-400 shrink-0" />
                <p className="text-sm font-bold text-stone-800">{pt.hours}</p>
              </div>
              <a href={"tel:" + pt.phone} className="flex items-center gap-3 active:opacity-70">
                <Phone size={16} className="text-emerald-600 shrink-0" />
                <p className="text-sm font-extrabold text-emerald-700">{t("relay_call")}</p>
              </a>
            </div>

            <p className="text-[10px] text-stone-400 font-semibold text-center mt-4">{t("relay_note")}</p>
          </div>
        </div>
      </div>
    );
  };

  const sellerScreen = (name) => {
    /* Cherche dans TOUTES les annonces (vraies + démo) — plus de crash sur vendeur réel */
    const sItems = allItems.filter((i) => i.seller && i.seller.name === name);
    const s = sItems.length > 0 ? sItems[0].seller : { rating: 5.0, sales: 0 };
    const disc = sItems.some((i) => i.discreet);
    const shown = disc ? "S." : name;
    /* Identité réelle du vendeur (pour suivre) : prise sur ses vraies annonces */
    const realItem = sItems.find((i) => i.seller_id);
    const sellerId = realItem ? realItem.seller_id : null;
    const isFollowed = sellerId ? !!following[sellerId] : false;
    const fCount = sellerId && followerCounts[sellerId] != null ? followerCounts[sellerId] : (s.sales ? 0 : 0);
    return (
      <div className="fixed inset-0 z-[60] flex justify-center bg-black/40" dir={cur.dir}>
        <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app pb-10">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setSellerView(null)} aria-label="Retour">
              <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
            </button>
            <p className="text-sm font-extrabold text-stone-900">{shown}</p>
          </div>

          <div className="px-5 pt-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-display font-extrabold text-white">
                {shown[0]}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-1.5 flex-wrap">
                  {shown}
                  {disc ? (
                    <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={9} /> {t("discreet_badge")}
                    </span>
                  ) : (
                    <BadgeCheck size={17} className="text-indigo-600" />
                  )}
                </p>
                <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-amber-500 fill-amber-500" /> {s.rating} · {s.sales} {t("sales_w")} · {t("member")}
                </p>
                {sellerId && (
                  <p className="text-xs text-stone-500 font-semibold mt-0.5">
                    <span className="font-extrabold text-stone-900">{fCount}</span> {t("followers_w")}
                  </p>
                )}
              </div>
            </div>

            {sellerId ? (
              <button onClick={() => toggleFollow(sellerId, shown)}
                className={`w-full mt-4 text-sm font-extrabold py-3 rounded-2xl active:scale-95 ${isFollowed ? "bg-stone-200 text-stone-700" : "bg-indigo-600 text-white"}`}>
                {isFollowed ? "✓ " + t("following_btn") : "+ " + t("follow")}
              </button>
            ) : (
              <button onClick={() => showToast(t("follow_demo"))}
                className="w-full mt-4 bg-stone-200 text-stone-500 text-sm font-extrabold py-3 rounded-2xl">
                + {t("follow")}
              </button>
            )}

            <p className="text-sm font-extrabold text-stone-900 mt-6 mb-3">
              {sItems.length} {t("items_w")}
            </p>
            {sItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {sItems.map((it) => itemCard(it))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-4xl">🛍️</p>
                <p className="text-sm font-extrabold text-stone-900 mt-3">{t("seller_empty")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* NOTIFICATIONS                                                     */
  /* ---------------------------------------------------------------- */

  /* Notifications RÉELLES : générées à partir des vraies données */
  const realNotifs = () => {
    const out = [];
    myOrders.forEach((o) => {
      const title = o.items && o.items.title ? o.items.title : "Article";
      if (o.iSell && o.status === "paid")
        out.push({ emoji: "💰", bg: "bg-emerald-50", text: tf("nf_sale", { t: title }), go: () => { setOrdersTab("sells"); setOrdersOpen(true); } });
      if (!o.iSell && (o.status === "dropped" || o.status === "in_transit" || o.status === "ready"))
        out.push({ emoji: "📦", bg: "bg-amber-50", text: tf("nf_pickup", { t: title }), go: () => { setOrdersTab("buys"); setOrdersOpen(true); } });
    });
    dbThreads.slice(0, 2).forEach((th) => {
      out.push({ emoji: "💬", bg: "bg-indigo-50", text: tf("nf_msg", { n: th.otherName }), go: () => { setTab("msg"); openDbThread(th); } });
    });
    return out.slice(0, 6);
  };

  const notifSheet = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setNotifOpen(false)}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app max-h-[80vh] overflow-y-auto" dir={cur.dir} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-lg text-stone-900 flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" /> {t("notifs_title")}
          </p>
          <button onClick={() => setNotifOpen(false)}><X size={20} className="text-stone-400" /></button>
        </div>
        <div className="mt-4 space-y-2 pb-2">
          {/* Notifications réelles enregistrées (abonnements, étapes colis, offres) */}
          {dbNotifs.map((nf) => {
            const emo = { new_listing: "🆕", order_step: "📦", offer: "💰", sale: "🎉", message: "💬" }[nf.type] || "🔔";
            const go = () => {
              setNotifOpen(false);
              if (nf.link_type === "order") { setOrdersOpen(true); }
              else if (nf.link_type === "thread") { setTab("msg"); }
            };
            return (
              <button key={nf.id} onClick={go}
                className={`w-full p-3.5 rounded-2xl text-left flex items-center gap-3 ${nf.is_read ? "bg-stone-50" : "bg-indigo-50"}`}>
                <span className="text-xl shrink-0">{emo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800 leading-snug">{nf.title}</p>
                  {nf.body && <p className="text-[11px] text-stone-500 font-semibold truncate">{nf.body}</p>}
                </div>
                {!nf.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
              </button>
            );
          })}

          {/* Notifications dérivées de l'état courant (complément instantané) */}
          {realNotifs().map((nf, i) => (
            <button key={"r" + i} onClick={() => { setNotifOpen(false); nf.go(); }}
              className={`w-full p-3.5 rounded-2xl text-left flex items-center gap-3 ${nf.bg}`}>
              <span className="text-xl shrink-0">{nf.emoji}</span>
              <p className="text-xs font-bold text-stone-800 leading-relaxed flex-1">{nf.text}</p>
              <ChevronLeft size={14} className={`text-stone-400 shrink-0 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
            </button>
          ))}
          {dbNotifs.length === 0 && realNotifs().length === 0 && (
            <div className="text-center py-8">
              <p className="text-3xl">🔔</p>
              <p className="text-xs font-bold text-stone-500 mt-2">{t("no_notifs")}</p>
            </div>
          )}
          {["n1", "n2", "n3", "n4"].map((k, i) => (
            <button key={k}
              onClick={() => {
                setNotifOpen(false);
                if (k === "n1") { setTab("msg"); setActiveThread("t1"); }
                if (k === "n2") setOrderOpen(true);
                if (k === "n3") openItem(ITEMS[2]);
              }}
              className="w-full p-3.5 rounded-2xl text-left bg-stone-50">
              <p className="text-xs font-semibold text-stone-500 leading-relaxed">{t(k)} <span className="text-[9px] font-bold bg-stone-200 text-stone-400 px-1.5 py-0.5 rounded-full ms-1">{t("beta")}</span></p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* ONBOARDING — langue · promesse · téléphone · code SMS             */
  /* ---------------------------------------------------------------- */

  const onboardingScreen = () => (
    <div className="min-h-screen bg-stone-200 flex justify-center font-app">
      <FontStyles />
      <div className="w-full max-w-md min-h-screen relative shadow-2xl bg-indigo-600 text-white overflow-hidden flex flex-col" dir={cur.dir}>
        <Star8 size={220} className="absolute -right-16 -top-16 text-indigo-500 opacity-40" />
        <Star8 size={120} className="absolute -left-10 bottom-32 text-indigo-500 opacity-30" />

        {obStep > 0 && (
          <button onClick={() => setObStep(6)}
            className="absolute top-5 right-5 z-10 text-indigo-100 text-xs font-extrabold bg-indigo-700/60 px-3 py-1.5 rounded-full">
            {t("ob_skip")}
          </button>
        )}

        <div className="flex-1 flex flex-col justify-center px-7 relative">
          {obStep === 0 && (
            <>
              <div className="flex items-center gap-2.5">
                <Star8 size={30} className="text-amber-400" />
                <span className="font-display font-extrabold text-4xl">bali</span>
              </div>
              <p className="mt-6 text-sm font-bold text-indigo-100">Choisis ta langue · اختار اللغة ديالك</p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {LANGS.map((l) => (
                  <button key={l.id} onClick={() => { setLang(l.id); setObStep(1); }}
                    className="bg-white/10 border border-white/20 rounded-2xl p-3.5 text-left active:scale-95 transition-transform">
                    <span className="text-xl">{l.flag}</span>
                    <p className="text-sm font-extrabold mt-1" dir={l.dir}>{l.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {obStep === 1 && (
            <>
              <Star8 size={34} className="text-amber-400" />
              <p className="font-display font-extrabold text-3xl mt-4 leading-tight">{t("ob_title2")}</p>
              <div className="mt-7 space-y-4">
                {[["💸", t("ob_v1")], ["🏪", t("ob_v2")], ["🛡️", t("ob_v3")]].map(([e, txt]) => (
                  <div key={txt} className="flex items-start gap-3">
                    <span className="text-2xl">{e}</span>
                    <p className="text-sm font-bold text-indigo-50 leading-relaxed">{txt}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setObStep(2)}
                className="w-full mt-9 bg-white text-indigo-700 font-extrabold py-4 rounded-2xl active:scale-95 transition-transform">
                {t("ob_continue")}
              </button>
            </>
          )}

          {obStep === 2 && (
            <>
              <p className="font-display font-extrabold text-2xl">{t("ob_phone")}</p>
              <div className="mt-5 flex items-center bg-white rounded-2xl px-2 text-stone-900">
                <button onClick={() => setObCountryOpen(!obCountryOpen)}
                  className="flex items-center gap-1 px-2 py-4 shrink-0 font-extrabold text-sm">
                  <span className="text-lg">{COUNTRIES[obCountryI].flag}</span>
                  <span className="text-stone-500">{COUNTRIES[obCountryI].code}</span>
                  <span className="text-stone-400 text-xs">▾</span>
                </button>
                <input value={obPhone}
                  onChange={(e) => setObPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, COUNTRIES[obCountryI].len))}
                  inputMode="numeric" placeholder={COUNTRIES[obCountryI].ph}
                  className="flex-1 py-4 px-2 text-base font-extrabold outline-none bg-transparent min-w-0" />
              </div>

              {obCountryOpen && (
                <div className="mt-2 bg-white rounded-2xl p-1 text-stone-900 max-h-56 overflow-y-auto">
                  {COUNTRIES.map((c, i) => (
                    <button key={c.code} onClick={() => { setObCountryI(i); setObPhone(""); setObCountryOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${obCountryI === i ? "bg-indigo-50" : ""}`}>
                      <span className="text-lg">{c.flag}</span>
                      <span className="flex-1 text-sm font-bold">{c.name}</span>
                      <span className="text-xs font-extrabold text-stone-400">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}

              <button disabled={obPhone.length < COUNTRIES[obCountryI].len || obLoading} onClick={sendSms}
                className={`w-full mt-4 font-extrabold py-4 rounded-2xl transition-colors ${obPhone.length >= COUNTRIES[obCountryI].len && !obLoading ? "bg-white text-indigo-700" : "bg-white/20 text-indigo-200"}`}>
                {obLoading ? "Envoi en cours…" : t("ob_send")}
              </button>
              {obError && <p className="text-[11px] text-amber-300 font-bold mt-2">⚠️ {obError}</p>}
            </>
          )}

          {obStep === 3 && (
            <>
              <p className="font-display font-extrabold text-2xl">{t("ob_code")}</p>
              <p className="text-xs text-indigo-200 font-bold mt-1">{COUNTRIES[obCountryI].flag} {COUNTRIES[obCountryI].code} {obPhone}</p>
              <input value={obCode}
                onChange={(e) => setObCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                inputMode="numeric" placeholder="••••••"
                className="w-full mt-5 bg-white rounded-2xl py-4 text-center text-3xl font-extrabold tracking-[0.4em] outline-none text-stone-900" />
              <button disabled={obCode.length < 6 || obLoading}
                onClick={verifySms}
                className={`w-full mt-4 font-extrabold py-4 rounded-2xl transition-colors ${obCode.length >= 6 && !obLoading ? "bg-white text-indigo-700" : "bg-white/20 text-indigo-200"}`}>
                {obLoading ? "Vérification…" : t("ob_continue")}
              </button>
              {obError && <p className="text-[11px] text-amber-300 font-bold mt-2">⚠️ {obError}</p>}
              <button onClick={sendSms} className="w-full mt-2 text-[11px] text-indigo-200 font-bold underline">
                Renvoyer le code
              </button>
            </>
          )}

          {obStep === 4 && (
            <>
              <p className="text-6xl">🎁</p>
              <p className="font-display font-extrabold text-3xl mt-4 leading-tight">{t("gift_title")}</p>
              <p className="text-sm font-bold text-indigo-100 mt-3 leading-relaxed">{t("gift_text")}</p>
              <div className="mt-5 border-2 border-dashed border-amber-400 bg-white/10 rounded-2xl py-4 text-center">
                <p className="font-display font-extrabold text-2xl tracking-widest text-amber-400">MARHBA20</p>
              </div>
              <button onClick={() => { setObStep(5); showToast(t("gift_applied")); }}
                className="w-full mt-6 bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl active:scale-95 transition-transform">
                {t("gift_claim")}
              </button>
            </>
          )}

          {obStep === 5 && (
            <>
              <p className="font-display font-extrabold text-2xl">{t("synopsis_title")}</p>
              <div className="mt-5 bg-white/10 border border-white/20 rounded-2xl p-4">
                <p className="text-sm font-extrabold text-amber-300">{t("syn_buy")}</p>
                <div className="mt-2 space-y-1.5">
                  {["syn_b1", "syn_b2", "syn_b3"].map((k, i) => (
                    <div key={k} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-[13px] font-semibold text-indigo-50 leading-snug">{t(k)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 bg-white/10 border border-white/20 rounded-2xl p-4">
                <p className="text-sm font-extrabold text-amber-300">{t("syn_sell")}</p>
                <div className="mt-2 space-y-1.5">
                  {["syn_s1", "syn_s2", "syn_s3"].map((k, i) => (
                    <div key={k} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-[13px] font-semibold text-indigo-50 leading-snug">{t(k)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setObStep(6)}
                className="w-full mt-5 bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl active:scale-95 transition-transform">
                {t("syn_start")}
              </button>
            </>
          )}
        </div>

        <div className="pb-8 flex justify-center gap-1.5 relative">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${obStep === i ? "w-6 bg-amber-400" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* DEVENIR POINT BALI — inscription hanoutier en 3 étapes            */
  /* ---------------------------------------------------------------- */

  const partnerOnboarding = () => (
    <div className="fixed inset-0 z-40 flex justify-center bg-stone-900">
      <div className="w-full max-w-md min-h-screen relative flex flex-col text-white font-app overflow-y-auto">
        <Star8 size={180} className="absolute -right-12 -top-12 text-stone-800" />

        <div className="px-6 pt-6 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <Store size={16} className="text-stone-900" />
            </div>
            <p className="font-display font-extrabold">bali <span className="text-amber-400">Partenaire</span></p>
          </div>
          <button onClick={() => setPObStep(-1)}
            className="text-stone-400 text-xs font-extrabold bg-stone-800 px-3 py-1.5 rounded-full">Fermer</button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 relative py-6">
          {pObStep === 0 && (
            <>
              <p className="font-display font-extrabold text-2xl">Ton hanout 🏪</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">3 infos, 2 minutes. Validation sous 24 h.</p>
              <input value={pObName} onChange={(e) => setPObName(e.target.value)}
                placeholder="Nom du magasin — ex : Hanout Al Baraka"
                className="w-full mt-5 bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-400 text-white placeholder-stone-500" />
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {["Photo de la devanture", "Photo de ta CIN"].map((l, i) => (
                  <button key={l} onClick={() => setPObPhotos(pObPhotos.map((v, j) => (j === i ? !v : v)))}
                    className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-2 ${pObPhotos[i] ? "border-emerald-400 bg-emerald-400/10" : "border-stone-700 bg-stone-800"}`}>
                    {pObPhotos[i] ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Camera size={20} className="text-stone-500" />}
                    <span className={`text-[10px] font-extrabold text-center leading-tight ${pObPhotos[i] ? "text-emerald-300" : "text-stone-400"}`}>
                      {l}{pObPhotos[i] ? " ✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
              <button disabled={!pObName || !pObPhotos.every(Boolean)} onClick={() => setPObStep(1)}
                className={`w-full mt-5 font-extrabold py-4 rounded-2xl transition-colors ${pObName && pObPhotos.every(Boolean) ? "bg-amber-400 text-stone-900" : "bg-stone-800 text-stone-600"}`}>
                Continuer
              </button>
            </>
          )}

          {pObStep === 1 && (
            <>
              <p className="font-display font-extrabold text-2xl">L'adresse du magasin 📍</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">Les scans ne seront valides qu'à cette adresse — c'est ta protection.</p>
              <div className="mt-5 h-40 rounded-3xl bg-gradient-to-br from-stone-800 to-stone-700 relative overflow-hidden flex items-center justify-center border border-stone-700">
                <span className="absolute w-16 h-16 rounded-full border-2 border-amber-400/40 animate-ping" />
                <MapPin size={34} className="text-amber-400 relative" />
              </div>
              <div className="mt-3 bg-stone-800 rounded-2xl px-4 py-3.5 text-sm font-bold text-white border border-stone-700">
                12 rue Ibn Sina, Maârif — Casablanca
              </div>
              <button onClick={() => setPObStep(2)}
                className="w-full mt-4 bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl">C'est ici ✓</button>
            </>
          )}

          {pObStep === 2 && (
            <>
              <p className="font-display font-extrabold text-2xl">Tes versements 💰</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">4 DH par colis · versé chaque lundi · tu ne touches jamais d'espèces.</p>
              <input value={pObRib} onChange={(e) => setPObRib(e.target.value.replace(/[^0-9]/g, "").slice(0, 24))}
                inputMode="numeric" placeholder="RIB (24 chiffres)"
                className="w-full mt-5 bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-400 text-white placeholder-stone-500" />
              <p className="text-[11px] text-stone-500 font-semibold mt-2">Pas de compte bancaire ? Laisse vide — tu seras payé en espèces chez Wafacash.</p>
              <button onClick={() => setPObStep(3)}
                className="w-full mt-5 bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl">Envoyer mon dossier</button>
            </>
          )}

          {pObStep === 3 && (
            <>
              <CheckCircle2 size={60} className="text-emerald-400" />
              <p className="font-display font-extrabold text-2xl mt-4">Dossier envoyé ✅</p>
              <p className="text-xs text-stone-500 font-semibold mt-2 leading-relaxed">
                Validation sous 24 h, réponse par WhatsApp — puis 15 minutes de formation sur place et ton point est ouvert.
              </p>
              <div className="mt-5 bg-stone-800 rounded-2xl p-4 space-y-1.5 border border-stone-700">
                <p className="text-[11px] font-bold"><span className="text-stone-500">Magasin : </span>{pObName || "—"}</p>
                <p className="text-[11px] font-bold"><span className="text-stone-500">Adresse : </span>12 rue Ibn Sina, Maârif</p>
                <p className="text-[11px] font-bold"><span className="text-stone-500">Versement : </span>{pObRib.length === 24 ? "RIB •••" + pObRib.slice(-4) : "Espèces · Wafacash"}</p>
              </div>
              <button onClick={() => { setPObStep(-1); setAppMode("partner"); setPScreen("dash"); setPTab("colis"); loadPartnerOrders(); }}
                className="w-full mt-5 bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl">
                Voir le tableau de bord (démo) →
              </button>
            </>
          )}
        </div>

        <div className="pb-7 flex justify-center gap-1.5 relative">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${pObStep === i ? "w-6 bg-amber-400" : "w-1.5 bg-stone-700"}`} />
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* DÉPÔT DU COLIS — côté vendeur                                     */
  /* ---------------------------------------------------------------- */

  const depositScreen = () => {
    const steps = [
      { k: "tl_sold", d: "auj. · 10:12", done: true },
      { k: "tl_dropped", d: saleDropped ? "auj. · 16:05" : "—", done: saleDropped },
      { k: "tl_transit", d: "—", done: false },
      { k: "tl_picked", d: "—", done: false },
      { k: "tl_paid2", d: "—", done: false },
    ];
    return (
      <div className="fixed inset-0 z-40 flex justify-center bg-black/40" dir={cur.dir}>
        <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app pb-8">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setSaleOpen(false)}>
              <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-stone-900">{t("deposit_title")}</p>
              <p className="text-[10px] text-stone-500 font-bold truncate">{SALE.code} · {SALE.item.emoji} {SALE.item.title} · {SALE.buyer}</p>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${saleDropped ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {saleDropped ? t("dep_status_ok") : t("dep_status_todo")}
            </span>
          </div>

          <div className="px-5 pt-4 space-y-3">
            {/* QR de dépôt */}
            <div className="bg-white rounded-3xl p-5 shadow-sm flex flex-col items-center">
              {saleDropped ? (
                <div className="py-5 flex flex-col items-center text-center">
                  <CheckCircle2 size={62} className="text-emerald-500" />
                  <p className="text-sm font-extrabold text-stone-900 mt-3">{tf("dep_done_note", { n: SALE.buyer })}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-2xl border-2 border-stone-100 bg-white">
                    <QRCodeSVG seed={"DEP-" + SALE.code} size={168} />
                  </div>
                  <p className="text-[10px] text-stone-500 font-bold mt-3 text-center">{t("dep_show")}</p>
                </>
              )}
            </div>

            {/* Ce que tu vas recevoir */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4">
              <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                <Banknote size={14} /> {t("you_receive")} {SALE.item.price} DH
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">{t("after_insp")}</p>
            </div>

            {/* Ton point de dépôt */}
            <button onClick={() => setRelayView(ORDER.point)} className="w-full text-left bg-white rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Store size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1">{ORDER.point.name} <ChevronLeft size={13} className={`text-stone-400 ${cur.dir === "rtl" ? "" : "rotate-180"}`} /></p>
                  <p className="text-[11px] text-stone-500 font-semibold">{ORDER.point.addr}</p>
                  <p className="text-[10px] text-stone-500 font-bold mt-0.5 flex items-center gap-1">
                    <Star size={10} className="fill-amber-500 text-amber-500" /> {ORDER.point.rating} · {ORDER.point.hours} · {ORDER.point.dist}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-indigo-600 font-extrabold mt-2">{t("relay_see")} →</p>
            </button>

            {/* Les 3 gestes avant de déposer */}
            <div className="bg-white rounded-3xl p-4 shadow-sm space-y-2.5">
              {[t("dep_tip1"), t("dep_tip2"), tf("dep_tip3", { c: SALE.code })].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">{i + 1}</div>
                  <p className="text-xs text-stone-700 font-semibold leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>

            {/* Suivi */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              {steps.map((st, i) => (
                <div key={st.k} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${st.done ? "bg-emerald-500" : "bg-stone-200"}`}>
                      {st.done ? <Check size={12} className="text-white" /> : <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 flex-1 my-0.5 ${steps[i + 1].done ? "bg-emerald-400" : "bg-stone-200"}`} style={{ minHeight: 16 }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className={`text-xs font-extrabold ${st.done ? "text-stone-900" : "text-stone-400"}`}>{t(st.k)}</p>
                    <p className="text-[10px] text-stone-500 font-semibold">{st.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {!saleDropped && (
              <p className="text-[10px] text-amber-700 font-bold text-center">{tf("dep_before", { d: SALE.deadline })}</p>
            )}

            {!saleDropped && (
              <button onClick={() => { setSaleDropped(true); showToast(tf("dep_done_note", { n: SALE.buyer })); }}
                className="w-full border-2 border-dashed border-stone-300 text-stone-600 text-xs font-extrabold py-3.5 rounded-2xl">
                {t("dep_btn")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* TICKET DE RETRAIT — côté acheteur                                 */
  /* ---------------------------------------------------------------- */

  const ticketScreen = () => {
    const delivered = orderStatus !== "ready";
    const steps = [
      { k: "tl_ordered", d: "mar. 30 juin · 14:02", done: true },
      { k: "tl_dropped", d: "mer. 1 juil. · 10:15", done: true },
      { k: "tl_transit", d: "jeu. 2 juil. · 18:40", done: true },
      { k: "tl_arrived", d: "auj. · 09:12", done: true },
      { k: "tl_picked", d: delivered ? "auj. · 14:36" : "—", done: delivered },
    ];
    return (
      <div className="fixed inset-0 z-40 flex justify-center bg-black/40" dir={cur.dir}>
        <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app pb-8">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => setOrderOpen(false)}>
              <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
            </button>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-stone-900">{t("ticket_title")}</p>
              <p className="text-[10px] text-stone-500 font-bold">{ORDER.code} · {ORDER.item.emoji} {ORDER.item.title}</p>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${delivered ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
              {delivered ? t("tl_picked") : t("tl_arrived")}
            </span>
          </div>

          <div className="px-5 pt-4 space-y-3">
            {/* QR dynamique / statut retiré */}
            <div className="bg-white rounded-3xl p-5 shadow-sm flex flex-col items-center">
              {delivered ? (
                <div className="py-5 flex flex-col items-center">
                  <CheckCircle2 size={62} className="text-emerald-500" />
                  <p className="text-sm font-extrabold text-stone-900 mt-3">{t("tl_picked")} ✅ · 14:36</p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-2xl border-2 border-stone-100 bg-white">
                    <QRCodeSVG seed={ORDER.code + "-" + qrSeed} size={168} />
                  </div>
                  <div className="w-full mt-3">
                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(qrLeft / 60) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-stone-500 font-bold mt-2 flex items-center justify-center gap-1">
                      <Timer size={11} /> {tf("qr_regen", { s: qrLeft })} · {t("single_use")}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Code PIN — 2e facteur */}
            {!delivered && (
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-extrabold text-stone-500">CODE PIN</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    {(pinShown ? ORDER.pin.split("") : ["•", "•", "•", "•"]).map((d, i) => (
                      <div key={i} className="w-11 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-xl font-extrabold text-stone-900">{d}</div>
                    ))}
                  </div>
                  <button onClick={() => setPinShown(!pinShown)} className="text-xs font-extrabold text-indigo-600">
                    {pinShown ? t("hide_pin") : t("show_pin")}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 font-semibold mt-3 flex items-start gap-1.5">
                  <Lock size={11} className="mt-0.5 shrink-0" /> {t("pin_warn")}
                </p>
              </div>
            )}

            {/* Commande prépayée — séquestre bali */}
            {!delivered && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4">
                <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {t("paid_t")} ✅ · {ORDER.total} DH
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  {ORDER.item.price} DH + {ORDER.fee} DH ({t("protection")}) + {ORDER.delivery} DH (Point bali)
                </p>
                <p className="text-[10px] text-emerald-800 font-bold mt-2">{t("paid_sub")}</p>
              </div>
            )}

            {/* Point relais */}
            <button onClick={() => setRelayView(ORDER.point)} className="w-full text-left bg-white rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Store size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1">{ORDER.point.name} <ChevronLeft size={13} className={`text-stone-400 ${cur.dir === "rtl" ? "" : "rotate-180"}`} /></p>
                  <p className="text-[11px] text-stone-500 font-semibold">{ORDER.point.addr}</p>
                  <p className="text-[10px] text-stone-500 font-bold mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Star size={10} className="fill-amber-500 text-amber-500" /> {ORDER.point.rating}</span>
                    · {ORDER.point.hours} · {ORDER.point.dist}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-indigo-600 font-extrabold mt-2">{t("relay_see")} →</p>
            </button>

            {/* Timeline */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              {steps.map((st, i) => (
                <div key={st.k} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${st.done ? "bg-emerald-500" : "bg-stone-200"}`}>
                      {st.done ? <Check size={12} className="text-white" /> : <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 flex-1 my-0.5 ${steps[i + 1].done ? "bg-emerald-400" : "bg-stone-200"}`} style={{ minHeight: 16 }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className={`text-xs font-extrabold ${st.done ? "text-stone-900" : "text-stone-400"}`}>{t(st.k)}</p>
                    <p className="text-[10px] text-stone-500 font-semibold">{st.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Inspection au retrait — le paiement n'est libéré qu'après */}
            {orderStatus === "delivered" && (
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <p className="text-sm font-extrabold text-stone-900">{t("inspect_title")} 🔍</p>
                <p className="text-[10px] text-stone-500 font-semibold mt-1">{t("inspect_hint")}</p>
                <div className="mt-3 space-y-2">
                  {["insp_1", "insp_2", "insp_3"].map((k, i) => (
                    <button key={k} onClick={() => setInspChecks(inspChecks.map((v, j) => (j === i ? !v : v)))}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left ${inspChecks[i] ? "bg-emerald-50 border-emerald-300" : "bg-stone-50 border-stone-200"}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${inspChecks[i] ? "bg-emerald-500" : "bg-white border border-stone-300"}`}>
                        {inspChecks[i] && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-extrabold text-stone-800">{t(k)}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm font-extrabold text-stone-900 mt-4">{t("confirm_q")}</p>
                <div className="flex gap-2 mt-2">
                  <button disabled={!inspChecks.every(Boolean)}
                    onClick={() => { setOrderStatus("confirmed"); showToast(t("funds_ok")); }}
                    className={`flex-1 text-xs font-extrabold py-3 rounded-2xl ${inspChecks.every(Boolean) ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400"}`}>{t("confirm_ok")}</button>
                  <button onClick={() => { setOrderStatus("disputed"); showToast(t("funds_frozen")); }}
                    className="flex-1 bg-stone-100 text-stone-700 text-xs font-extrabold py-3 rounded-2xl">{t("confirm_ko")}</button>
                </div>
              </div>
            )}
            {orderStatus === "confirmed" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 text-xs font-extrabold text-emerald-800">{t("funds_ok")}</div>
            )}
            {orderStatus === "disputed" && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 text-xs font-extrabold text-amber-800">{t("funds_frozen")}</div>
            )}

            {!delivered && (
              <p className="text-[10px] text-amber-700 font-bold text-center">{tf("pickup_by", { d: ORDER.deadline })}</p>
            )}
            <p className="text-[10px] text-stone-500 font-semibold text-center flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-600" /> {t("secu_line")}
            </p>

            <button onClick={() => setTrustOpen(true)}
              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2">
              <MessageCircle size={14} /> {t("trust_title")}
            </button>

            {!delivered && (
              <button onClick={() => { setOrderOpen(false); setAppMode("partner"); setPScreen("dash"); loadPartnerOrders(); }}
                className="w-full border-2 border-dashed border-stone-300 text-stone-600 text-xs font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2">
                <Store size={14} /> {t("try_partner")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* BALI PARTENAIRE — l'app du hanoutier                              */
  /* ---------------------------------------------------------------- */

  const partnerApp = () => {
    /* Vraies données : colis réellement remis via vérification PIN */
    const realDelivered = pOrders.filter((o) => o.status === "completed").length;
    const realHandled = pOrders.length;
    const realGains = realDelivered * 4; // 4 DH par colis remis (niveau Argent)
    const delivered = orderStatus !== "ready";
    const gains = 12 + (delivered ? 4 : 0) + (depositDone ? 2 : 0);
    const week = 72 + gains;
    return (
      <div className="min-h-screen bg-stone-300 flex justify-center font-app">
        <FontStyles />
        <div className="w-full max-w-md bg-stone-100 min-h-screen relative shadow-2xl pb-8">
          {/* En-tête hanout */}
          <div className="bg-stone-900 text-white px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
                  <Store size={18} className="text-stone-900" />
                </div>
                <div>
                  <p className="font-display font-extrabold text-base leading-none">bali <span className="text-amber-400">Partenaire</span></p>
                  <p className="text-[10px] text-stone-500 font-bold mt-1">{ORDER.point.name} · {ORDER.point.owner}</p>
                </div>
              </div>
              {!isPartnerUrl && (
                <button onClick={() => setAppMode("client")}
                  className="flex items-center gap-1 bg-stone-800 text-stone-200 text-[10px] font-extrabold px-3 py-2 rounded-full">
                  <ArrowLeft size={12} /> Client
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full">● Ouvert · 7h–23h</span>
              <button onClick={() => { setPScreen("dash"); setPTab("gains"); }}
                className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full">Niveau Argent · colis ≤ 2 000 DH</button>
            </div>
          </div>

          {/* TABLEAU DE BORD */}
          {pScreen === "dash" && (
            <div className="px-5 pt-4 space-y-3">
              {/* Onglets */}
              <div className="flex gap-2">
                {[["colis", "📦 Colis"], ["gains", "💰 Gains & niveau"]].map(([id, l]) => (
                  <button key={id} onClick={() => setPTab(id)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition-colors ${pTab === id ? "bg-stone-900 text-white" : "bg-white text-stone-500 shadow-sm"}`}>
                    {l}
                  </button>
                ))}
              </div>

              {pTab === "colis" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {[[delivered ? "2" : "3", "À remettre"], ["2", "Arrivages"], [gains + " DH", "Gains du jour"]].map(([n, l]) => (
                      <div key={l} className="bg-white rounded-2xl p-3 text-center shadow-sm">
                        <p className="text-base font-extrabold text-stone-900">{n}</p>
                        <p className="text-[9px] font-bold text-stone-400 mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setPScreen("scan")}
                    className="w-full bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <QrCode size={18} /> Scanner un QR (client ou vendeur)
                  </button>

                  {/* Vérificateur RÉEL — remettre un colis contre code + PIN */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-indigo-100">
                    <p className="text-sm font-extrabold text-stone-900">🔐 {t("hverif_title")}</p>
                    <p className="text-[11px] text-stone-500 font-semibold mt-0.5">{t("hverif_sub")}</p>
                    <input value={hvCode} onChange={(e) => { setHvCode(e.target.value.toUpperCase()); setHvMsg(null); }}
                      placeholder={t("hverif_code")}
                      className="w-full mt-3 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-extrabold outline-none focus:border-indigo-400" />
                    <input value={hvPin} onChange={(e) => { setHvPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4)); setHvMsg(null); }}
                      inputMode="numeric" placeholder={t("hverif_pin")}
                      className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-lg font-extrabold tracking-[0.3em] text-center outline-none focus:border-indigo-400" />
                    <button onClick={verifyAndHandover} disabled={!hvCode.trim() || hvPin.length !== 4 || hvLoading}
                      className="w-full mt-3 bg-indigo-600 text-white text-sm font-extrabold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50">
                      {hvLoading ? "…" : t("hverif_btn")}
                    </button>
                    {hvMsg && (
                      <p className={`text-xs font-extrabold mt-2.5 text-center ${hvMsg.ok ? "text-emerald-600" : "text-rose-600"}`}>
                        {hvMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Capacité — pause sans appeler le support */}
                  <button onClick={() => setAcceptOn(!acceptOn)}
                    className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${acceptOn ? "bg-emerald-50" : "bg-stone-100"}`}>
                      <Package size={17} className={acceptOn ? "text-emerald-600" : "text-stone-400"} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-extrabold text-stone-900">Accepter de nouveaux colis</p>
                      <p className="text-[11px] text-stone-500 font-semibold">
                        {acceptOn ? "Actif · Emplacements 5/20" : "En pause — les nouveaux colis vont au point voisin"}
                      </p>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${acceptOn ? "bg-emerald-500" : "bg-stone-200"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${acceptOn ? "translate-x-5" : ""}`} />
                    </div>
                  </button>

                  <p className="text-[10px] font-extrabold text-stone-500 pt-1">COLIS DU JOUR</p>

                  {/* ---- VRAIS COLIS bali ---- */}
                  {pOrders.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 pt-1">
                        <p className="text-[10px] font-extrabold text-indigo-600">🟢 {t("real_parcels")}</p>
                        <span className="text-[9px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{pOrders.length}</span>
                      </div>
                      {pOrders.map((o) => {
                        const emo = { femmes: "👗", hommes: "👕", enfants: "🧸", tech: "📱", maison: "🏠", trad: "👘", sneakers: "👟" }[o.items && o.items.category] || "📦";
                        const toHand = o.status === "dropped" || o.status === "ready" || o.status === "in_transit";
                        return (
                          <div key={o.id} className="w-full bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3 border border-indigo-50">
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">{emo}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-stone-900">{o.code}</p>
                              <p className="text-[10px] text-stone-500 font-semibold truncate">
                                {o.items && o.items.title ? o.items.title : "Article"} · {o.total_dh} DH
                              </p>
                              <p className="text-[9px] font-bold mt-0.5">
                                {o.status === "paid"
                                  ? <span className="text-amber-600">📥 {t("p_to_receive")}</span>
                                  : <span className="text-indigo-600">📤 {t("p_to_handover")}</span>}
                              </p>
                            </div>
                            {toHand && (
                              <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full shrink-0">PIN</span>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}

                  <p className="text-[9px] font-bold text-stone-400 pt-2">— {t("p_demo")} —</p>

                  <button onClick={() => setPParcel({ emoji: "👟", code: ORDER.code, title: ORDER.item.title, who: "Abdel B.", slot: ORDER.point.slot, status: delivered ? "Remis ✅ 14:36" : "À retirer", note: delivered ? "Chaîne complète : Vendeur → Hanout → Acheteur. Rien à faire." : "Déjà payé en ligne. Vérifie le QR + PIN, laisse le client inspecter, puis remets. Rien à encaisser." })}
                    className="w-full text-left bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-xl">👟</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-stone-900">{ORDER.code}</p>
                      <p className="text-[10px] text-stone-500 font-semibold truncate">{ORDER.item.title} · Abdel B. · Empl. {ORDER.point.slot}</p>
                    </div>
                    {delivered ? (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Remis ✅ 14:36</span>
                    ) : (
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Retrait · Payé ✅</span>
                    )}
                  </button>

                  {/* Colis 2 — prépayé */}
                  <button onClick={() => setPParcel({ emoji: "👜", code: "BAL-3D8M1", title: "Sac Zara", who: "Kenza M.", slot: "A1", status: "Prépayé ✅", note: "Déjà payé en ligne : vérifie le QR + le PIN, puis remets directement. Aucun paiement à attendre." })}
                    className="w-full text-left bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-xl">👜</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-stone-900">BAL-3D8M1</p>
                      <p className="text-[10px] text-stone-500 font-semibold truncate">Sac Zara · Kenza M. · Empl. A1</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">Retrait · Prépayé</span>
                  </button>

                  {/* Colis 3 — dépôt vendeur */}
                  <div className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-xl">📦</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-stone-900">BAL-9K2P4</p>
                      <p className="text-[10px] text-stone-500 font-semibold truncate">Dépôt vendeur · Yassine_Casa</p>
                    </div>
                    {depositDone ? (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">En stock · B3 ✅</span>
                    ) : (
                      <button onClick={() => { setDepoChecks([false, false, false]); setDepositOpen(true); }}
                        className="text-[10px] font-extrabold bg-stone-900 text-white px-3 py-2 rounded-full">Recevoir</button>
                    )}
                  </div>

                  {/* Colis dormant — alerte retour J+7 */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl">⌚</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-stone-900">BAL-5T7Q2 · J+5</p>
                      <p className="text-[10px] text-amber-700 font-bold truncate">Non retiré — retour au vendeur dans 2 jours</p>
                    </div>
                    <button onClick={() => showToast("Rappel envoyé à l'acheteur 📲 (démo)")}
                      className="text-[10px] font-extrabold bg-stone-900 text-white px-3 py-2 rounded-full shrink-0">Relancer</button>
                  </div>

                  {/* SOS — un humain, comme côté client */}
                  <button onClick={() => showToast("WhatsApp bali Partenaire ouvert 📲 (démo)")}
                    className="w-full bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                    <span className="text-lg">🆘</span>
                    <p className="flex-1 text-left text-xs font-extrabold text-stone-900">Un problème ? WhatsApp bali <span className="text-stone-400">· réponse en moins de 2 h</span></p>
                  </button>
                </>
              )}

              {pTab === "gains" && (
                <>
                  {/* GAINS RÉELS — calculés sur les vraies remises PIN */}
                  <div className="bg-indigo-600 rounded-3xl p-5 text-white relative overflow-hidden">
                    <p className="text-[10px] font-extrabold text-indigo-200 flex items-center gap-1.5">
                      <Wallet size={13} className="text-amber-300" /> {t("pg_real_gains")}
                    </p>
                    <p className="font-display font-extrabold text-3xl mt-1 text-white">{realGains} DH</p>
                    <div className="flex gap-4 mt-3">
                      <div>
                        <p className="text-xl font-extrabold">{realDelivered}</p>
                        <p className="text-[10px] text-indigo-200 font-bold">{t("pg_delivered")}</p>
                      </div>
                      <div>
                        <p className="text-xl font-extrabold">{realHandled}</p>
                        <p className="text-[10px] text-indigo-200 font-bold">{t("pg_handled")}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-indigo-200 font-semibold mt-3">{t("pg_real_note")}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-px flex-1 bg-stone-300" />
                    <p className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wide">{t("pg_demo_zone")}</p>
                    <div className="h-px flex-1 bg-stone-300" />
                  </div>

                  {/* Gains — zéro espèces à gérer */}
                  <div className="bg-stone-900 rounded-3xl p-5 text-white relative overflow-hidden">
                    <Star8 size={70} className="absolute -right-3 -bottom-4 text-stone-800" />
                    <p className="text-[10px] font-extrabold text-stone-400 flex items-center gap-1.5 relative">
                      <Wallet size={13} className="text-amber-400" /> GAINS BALI · CETTE SEMAINE
                    </p>
                    <p className="font-display font-extrabold text-3xl mt-1 text-amber-400 relative">{week} DH</p>
                    <div className="h-1.5 bg-stone-700 rounded-full mt-3 overflow-hidden relative">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, (week / 150) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-stone-500 font-bold mt-2 relative">Objectif semaine : {week} / 150 DH · 0 espèces à gérer — versement chaque lundi</p>
                  </div>

                  {/* Niveau — motivation */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-stone-900">Niveau Argent 🥈 → Or 🥇</p>
                      <span className="text-[10px] font-extrabold text-stone-400">38 / 50 remises</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "76%" }} />
                    </div>
                    <p className="text-[10px] text-stone-500 font-semibold mt-2 leading-relaxed">
                      Niveau Or : 5 DH/colis (au lieu de 4), colis jusqu'à 5 000 DH, badge Or visible sur la carte bali — plus de clients choisissent ton point.
                    </p>
                  </div>

                  {/* Note des clients au retrait — contrôle qualité du réseau */}
                  <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                      <Star size={22} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-stone-900">4,9 · note des clients au retrait</p>
                      <p className="text-[11px] text-stone-500 font-semibold">« Rapide et souriant, mieux que la poste ! » — Kenza M.</p>
                    </div>
                  </div>

                  {/* Versements — transparence totale */}
                  <div className="bg-white rounded-3xl p-4 shadow-sm">
                    <p className="text-xs font-extrabold text-stone-900">Versements</p>
                    <div className="mt-2.5 space-y-2">
                      <div className="flex justify-between text-[11px] font-extrabold text-indigo-700">
                        <span>Lundi 6 juil. · à venir</span><span>{week} DH</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-stone-500">
                        <span>Lundi 29 juin · RIB •••4521 ✅</span><span>131 DH</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-stone-500">
                        <span>Lundi 22 juin · RIB •••4521 ✅</span><span>96 DH</span>
                      </div>
                    </div>
                  </div>

                  {/* Parrainage hanout → le réseau se recrute lui-même */}
                  <button onClick={() => showToast("Lien de parrainage copié — +50 DH par hanout activé 📲")}
                    className="w-full rounded-3xl p-4 bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 text-left relative overflow-hidden active:scale-95 transition-transform">
                    <Star8 size={56} className="absolute -right-2 -top-2 text-white opacity-20" />
                    <p className="text-sm font-extrabold relative">Parraine un hanout voisin → +50 DH 🤝</p>
                    <p className="text-[11px] font-bold text-stone-800/70 mt-1 relative">Versés dès son 10ᵉ colis remis. Partage ton lien WhatsApp.</p>
                  </button>
                </>
              )}
            </div>
          )}

          {/* SCAN */}
          {pScreen === "scan" && (
            <div className="px-5 pt-6 flex flex-col items-center">
              <div className="relative w-64 h-64 bg-stone-900 rounded-3xl overflow-hidden flex items-center justify-center">
                {camActive ? (
                  <>
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-6 border-2 border-amber-400/70 rounded-2xl pointer-events-none" />
                    <div className="scanline absolute left-8 right-8 h-0.5 bg-amber-400 rounded-full" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-6 border-2 border-amber-400/50 rounded-2xl" />
                    <QrCode size={60} className="text-stone-700" />
                  </>
                )}
              </div>

              {camError && <p className="text-[11px] text-rose-500 font-bold mt-3 text-center">⚠️ {camError}</p>}

              {!camActive ? (
                <button onClick={startCamera}
                  className="w-full bg-amber-400 text-stone-900 font-extrabold py-4 rounded-2xl mt-5 active:scale-95 flex items-center justify-center gap-2">
                  <Camera size={18} /> {t("cam_start")}
                </button>
              ) : (
                <>
                  <p className="text-[11px] text-stone-500 font-bold mt-3 text-center">{t("cam_hint")}</p>
                  <button onClick={stopCamera}
                    className="w-full bg-stone-200 text-stone-700 font-extrabold py-3 rounded-2xl mt-3 active:scale-95">
                    {t("cam_stop")}
                  </button>
                </>
              )}
              <button onClick={() => { stopCamera(); setPScreen("dash"); }} className="text-xs font-extrabold text-stone-500 mt-3">← {t("back")}</button>
            </div>
          )}

          {/* VÉRIFICATION PIN */}
          {pScreen === "verify" && (
            <div className="px-5 pt-4 space-y-3">
              <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ORDER.item.grad} flex items-center justify-center text-2xl`}>{ORDER.item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-stone-900">{ORDER.code}</p>
                  <p className="text-[11px] text-stone-500 font-semibold truncate">{ORDER.item.title} · Acheteur : Abdel B.</p>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full shrink-0">Payé · {ORDER.total} DH</span>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <p className="text-sm font-extrabold text-stone-900">Demande le code PIN au client 🔐</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Commande prépayée — rien à encaisser</p>
                <input value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  inputMode="numeric" placeholder="••••"
                  className="w-full mt-3 bg-stone-100 rounded-2xl py-4 text-center text-2xl font-extrabold tracking-[0.5em] outline-none focus:ring-2 focus:ring-amber-400" />
                {pinTries > 0 && (
                  <p className="text-[11px] font-bold text-rose-600 mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> Code incorrect — {3 - pinTries} essai{3 - pinTries > 1 ? "s" : ""} restant{3 - pinTries > 1 ? "s" : ""}
                  </p>
                )}
                <button onClick={() => {
                  if (pinInput === ORDER.pin) { setPScreen("collect"); }
                  else {
                    const n = pinTries + 1;
                    setPinTries(n);
                    setPinInput("");
                    if (n >= 3) setPScreen("locked");
                  }
                }} disabled={pinInput.length < 4}
                  className={`w-full mt-3 font-extrabold py-4 rounded-2xl transition-colors ${pinInput.length === 4 ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-400"}`}>
                  Vérifier le PIN
                </button>
                <p className="text-[10px] text-stone-500 font-semibold mt-3">Démo : le PIN se trouve sur le ticket du client 😉</p>
              </div>
              <button onClick={() => setPScreen("dash")} className="w-full text-xs font-extrabold text-stone-500">← Annuler</button>
            </div>
          )}

          {/* BLOQUÉ — 3 PIN incorrects */}
          {pScreen === "locked" && (
            <div className="px-5 pt-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-100 flex items-center justify-center">
                <Lock size={36} className="text-rose-600" />
              </div>
              <p className="font-display font-bold text-lg text-stone-900 mt-4">Retrait bloqué 15 min</p>
              <p className="text-xs text-stone-500 font-semibold mt-2 leading-relaxed max-w-xs">
                3 codes PIN incorrects. L'acheteur a été alerté par notification et SMS. Le QR a été révoqué et régénéré automatiquement.
              </p>
              <button onClick={() => { setPinTries(0); setPinInput(""); setPScreen("dash"); }}
                className="mt-5 bg-stone-900 text-white text-xs font-extrabold px-5 py-3 rounded-full">Réinitialiser (démo)</button>
            </div>
          )}

          {/* REMISE — commande prépayée, séquestre bali */}
          {pScreen === "collect" && (
            <div className="px-5 pt-4 space-y-3">
              <div className="bg-white rounded-3xl p-5 shadow-sm text-center">
                <p className="text-[10px] font-extrabold text-emerald-600">PIN VÉRIFIÉ ✅ — COMMANDE DÉJÀ PAYÉE EN LIGNE</p>
                <p className="font-display font-extrabold text-4xl text-stone-900 mt-2">{ORDER.total} DH</p>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">
                  Sécurisés chez bali · versés au vendeur après l'inspection de l'acheteur
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                <p className="text-xs font-extrabold text-emerald-800">Rien à encaisser — laisse l'acheteur inspecter le colis devant toi, puis remets-le.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-[11px] font-bold text-amber-800 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                C'est l'acheteur qui confirme dans SON app après inspection — c'est ça qui déclenche le paiement du vendeur. Toi, tu ne touches jamais d'argent.
              </div>

              <button onClick={() => { setOrderStatus("delivered"); setPScreen("done"); }}
                className="w-full bg-emerald-600 text-white font-extrabold py-4 rounded-2xl active:scale-95 transition-transform">
                📦 Remettre le colis
              </button>
              <button onClick={() => setPScreen("dash")} className="w-full text-xs font-extrabold text-stone-500">← Annuler</button>
            </div>
          )}

          {/* REMISE CONFIRMÉE — chaîne de responsabilité */}
          {pScreen === "done" && (
            <div className="px-5 pt-8 flex flex-col items-center">
              <CheckCircle2 size={62} className="text-emerald-500" />
              <p className="font-display font-bold text-xl text-stone-900 mt-3">Colis remis ✅</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">+4 DH ajoutés à tes gains du jour 💰</p>
              <div className="w-full bg-white rounded-3xl p-4 shadow-sm mt-5">
                <p className="text-[10px] font-extrabold text-stone-500 mb-3">CHAÎNE DE RESPONSABILITÉ · {ORDER.code}</p>
                {[
                  ["Vendeur — dépôt", "mer. 1 juil. · 10:15"],
                  ["Hanout Al Amal — garde", "auj. · 09:12"],
                  ["Acheteur — remise", "auj. · 14:36"],
                ].map(([l, d], i) => (
                  <div key={l} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                      {i < 2 && <div className="w-0.5 flex-1 my-0.5 bg-emerald-400" style={{ minHeight: 14 }} />}
                    </div>
                    <div className="pb-2.5">
                      <p className="text-xs font-extrabold text-stone-900">{l}</p>
                      <p className="text-[10px] text-stone-500 font-semibold">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setPScreen("dash")}
                className="w-full bg-stone-900 text-white font-extrabold py-4 rounded-2xl mt-4">Retour au tableau de bord</button>
            </div>
          )}

          {/* Fiche colis */}
          {pParcel && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setPParcel(null)}>
              <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl">{pParcel.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-base text-stone-900">{pParcel.code}</p>
                    <p className="text-[11px] text-stone-500 font-semibold truncate">{pParcel.title} · {pParcel.who}</p>
                  </div>
                  <button onClick={() => setPParcel(null)}><X size={20} className="text-stone-400" /></button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-stone-50 rounded-2xl p-3">
                    <p className="text-[9px] font-extrabold text-stone-400">EMPLACEMENT</p>
                    <p className="text-sm font-extrabold text-stone-900 mt-0.5">{pParcel.slot}</p>
                  </div>
                  <div className="bg-stone-50 rounded-2xl p-3">
                    <p className="text-[9px] font-extrabold text-stone-400">STATUT</p>
                    <p className="text-sm font-extrabold text-stone-900 mt-0.5">{pParcel.status}</p>
                  </div>
                </div>
                <div className="mt-3 bg-indigo-50 rounded-2xl p-3.5">
                  <p className="text-[11px] text-indigo-800 font-bold leading-relaxed">{pParcel.note}</p>
                </div>
                <button onClick={() => setPParcel(null)}
                  className="w-full mt-4 bg-stone-900 text-white font-extrabold py-3.5 rounded-2xl">Compris ✓</button>
              </div>
            </div>
          )}

          {/* Réception d'un dépôt vendeur */}
          {depositOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setDepositOpen(false)}>
              <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" onClick={(e) => e.stopPropagation()}>
                <p className="font-display font-bold text-base text-stone-900">Réception dépôt vendeur · BAL-9K2P4</p>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">Vérifie avant d'accepter la garde — tu deviens responsable du colis.</p>
                <div className="mt-4 space-y-2">
                  {["Colis scellé et intact", "Étiquette bali lisible (code + destinataire)", "Photo du colis prise 📷"].map((c, i) => (
                    <button key={c} onClick={() => setDepoChecks(depoChecks.map((v, j) => (j === i ? !v : v)))}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left ${depoChecks[i] ? "bg-emerald-50 border-emerald-300" : "bg-stone-50 border-stone-200"}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${depoChecks[i] ? "bg-emerald-500" : "bg-white border border-stone-300"}`}>
                        {depoChecks[i] && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-extrabold text-stone-800">{c}</span>
                    </button>
                  ))}
                </div>
                <button disabled={!depoChecks.every(Boolean)}
                  onClick={() => { setDepositDone(true); setDepositOpen(false); showToast("Garde transférée : Vendeur → Hanout ✅ Emplacement B3"); }}
                  className={`w-full mt-4 font-extrabold py-4 rounded-2xl ${depoChecks.every(Boolean) ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-400"}`}>
                  Accepter la garde (Vendeur → Hanout)
                </button>
              </div>
            </div>
          )}

          {toast && (
            <div className="fixed top-5 inset-x-0 flex justify-center z-50 px-5">
              <div className="bg-stone-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-lg max-w-md">{toast}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* Rendu principal                                                   */
  /* ---------------------------------------------------------------- */

  const TABS = [
    { id: "home", icon: Home, key: "nav_home" },
    { id: "search", icon: Search, key: "nav_explore" },
    { id: "sell", icon: Plus, key: "nav_sell" },
    { id: "msg", icon: MessageCircle, key: "nav_msg" },
    { id: "profile", icon: User, key: "nav_profile" },
  ];

  if (!authChecked) return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center font-app">
      <FontStyles />
      <div className="flex flex-col items-center gap-3">
        <Star8 size={40} className="text-amber-400 animate-pulse" />
        <span className="font-display font-extrabold text-3xl text-white">bali</span>
      </div>
    </div>
  );

  if (obStep < 6) return onboardingScreen();

  if (isPartnerUrl) return partnerApp();

  return (
    <div className="min-h-screen bg-stone-200 flex justify-center font-app">
      <FontStyles />
      <div className="w-full max-w-md bg-stone-50 min-h-screen relative shadow-2xl" dir={cur.dir}>
        {tab === "home" && homeScreen()}
        {tab === "search" && searchScreen()}
        {tab === "sell" && sellScreen()}
        {tab === "msg" && messagesScreen()}
        {tab === "profile" && profileScreen()}

        <div className="fixed bottom-0 inset-x-0 flex justify-center z-30">
          <div className="w-full max-w-md bg-white border-t border-stone-100 px-2 pt-2 pb-4 flex justify-around" dir={cur.dir}>
            {TABS.map((tb) => {
              const Icon = tb.icon;
              const active = tab === tb.id;
              const isSell = tb.id === "sell";
              return (
                <button key={tb.id} onClick={() => { setTab(tb.id); setActiveThread(null); }}
                  className="flex flex-col items-center gap-0.5 px-2">
                  <div className={isSell ? "bg-indigo-600 text-white rounded-2xl px-4 py-2 -mt-4 shadow-lg" :
                    active ? "text-indigo-600" : "text-stone-400"}>
                    <Icon size={isSell ? 20 : 21} strokeWidth={active || isSell ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${active ? "text-indigo-600" : "text-stone-400"}`}>{t(tb.key)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {toast && (
          <div className="fixed top-5 inset-x-0 flex justify-center z-50 px-5">
            <div className="bg-stone-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-lg max-w-md">
              {toast}
            </div>
          </div>
        )}

        {item && itemDetail(item)}
        {orderOpen && ticketScreen()}
        {saleOpen && depositScreen()}
        {payOpen && paySheet()}
        {trustOpen && trustSheet()}

        {/* Filtres — hub façon Vinted : un écran principal, chaque ligne ouvre sa facette */}
        {filtersOpen && (() => {
          const nRes = applyFilters(allItems).length;
          const sortLabels = { recent: t("sort_recent"), price_asc: t("sort_price_asc"), price_desc: t("sort_price_desc"), popular: t("sort_popular") };
          const checkbox = (sel) => (
            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${sel ? "bg-indigo-600 border-indigo-600" : "border-stone-300"}`}>
              {sel && <Check size={13} className="text-white" />}
            </span>
          );
          const facetRow = (view, label, value) => (
            <button key={view} onClick={() => setFilterView(view)}
              className="w-full flex items-center justify-between py-4 border-b border-stone-100">
              <span className="text-sm font-extrabold text-stone-900">{label}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400 max-w-[150px] truncate">{value}</span>
                <ChevronLeft size={15} className={`text-stone-300 ${cur.dir === "rtl" ? "" : "rotate-180"}`} />
              </span>
            </button>
          );
          const titles = { sort: t("filter_sort"), cat: t("filter_cat"), price: t("filter_price"), cond: t("filter_cond"), size: t("filter_size"), brand: t("filter_brand") };
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setFiltersOpen(false)}>
              <div className="w-full max-w-md bg-white rounded-t-3xl max-h-[85vh] flex flex-col font-app" onClick={(e) => e.stopPropagation()} dir={cur.dir}>

                {/* En-tête */}
                <div className="px-6 pt-5 pb-3 flex items-center gap-3 border-b border-stone-100">
                  {filterView !== "hub" ? (
                    <button onClick={() => setFilterView("hub")}>
                      <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
                    </button>
                  ) : null}
                  <p className="flex-1 font-display font-bold text-lg text-stone-900">
                    {filterView === "hub" ? t("filters_title") : titles[filterView]}
                  </p>
                  <button onClick={() => setFiltersOpen(false)}><X size={20} className="text-stone-400" /></button>
                </div>

                {/* Corps */}
                <div className="flex-1 overflow-y-auto px-6">
                  {filterView === "hub" && (
                    <div>
                      {facetRow("sort", t("filter_sort"), sortLabels[fSort])}
                      {facetRow("cat", t("filter_cat"), fCats.length ? fCats.map((id) => t("cat_" + id)).slice(0, 2).join(", ") + (fCats.length > 2 ? " +" + (fCats.length - 2) : "") : "—")}
                      {facetRow("price", t("filter_price"), fPriceMin || fPriceMax ? (fPriceMin || "0") + " – " + (fPriceMax || "∞") + " DH" : "—")}
                      {facetRow("cond", t("filter_cond"), fConds.length ? fConds.length + " ✓" : "—")}
                      {sizeGroups().length > 0 && facetRow("size", t("filter_size"), fSizes.length ? fSizes.length + " ✓" : "—")}
                      {brandGroups().length > 0 && facetRow("brand", t("filter_brand"), fBrands.length ? fBrands.length + " ✓" : "—")}
                    </div>
                  )}

                  {filterView === "sort" && (
                    <div className="py-3">
                      {Object.entries(sortLabels).map(([id, label]) => (
                        <button key={id} onClick={() => { setFSort(id); setFilterView("hub"); }}
                          className="w-full flex items-center justify-between py-3.5 border-b border-stone-100">
                          <span className={`text-sm ${fSort === id ? "font-extrabold text-indigo-700" : "font-bold text-stone-700"}`}>{label}</span>
                          {fSort === id && <Check size={17} className="text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {filterView === "cat" && (
                    <div className="py-3">
                      {CATALOG.map((u) => (
                        <button key={u.id} onClick={() => toggleIn(fCats, setFCats, u.id)}
                          className="w-full flex items-center gap-3 py-3.5 border-b border-stone-100">
                          <span className="text-xl w-8 text-center">{u.emoji}</span>
                          <span className="flex-1 text-left text-sm font-bold text-stone-800" dir={cur.dir}>{t("cat_" + u.id)}</span>
                          {checkbox(fCats.includes(u.id))}
                        </button>
                      ))}
                    </div>
                  )}

                  {filterView === "price" && (
                    <div className="py-5 flex items-center gap-3">
                      <input value={fPriceMin} onChange={(e) => setFPriceMin(e.target.value.replace(/[^0-9]/g, ""))}
                        inputMode="numeric" placeholder={t("price_min_ph")}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400" />
                      <span className="text-stone-500 font-bold">—</span>
                      <input value={fPriceMax} onChange={(e) => setFPriceMax(e.target.value.replace(/[^0-9]/g, ""))}
                        inputMode="numeric" placeholder={t("price_max_ph")}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400" />
                      <span className="text-xs font-extrabold text-stone-500">DH</span>
                    </div>
                  )}

                  {filterView === "cond" && (
                    <div className="py-3">
                      {t("conds").map((c, i) => (
                        <button key={i} onClick={() => toggleIn(fConds, setFConds, i)}
                          className="w-full flex items-center justify-between py-3.5 border-b border-stone-100">
                          <span className="text-sm font-bold text-stone-800">{c}</span>
                          {checkbox(fConds.includes(i))}
                        </button>
                      ))}
                    </div>
                  )}

                  {filterView === "size" && (
                    <div className="py-4">
                      {sizeGroups().map(([label, arr]) => (
                        <div key={label} className="mb-5">
                          <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide mb-2">{label}</p>
                          <div className="flex flex-wrap gap-2">
                            {arr.map((s) => (
                              <button key={label + s} onClick={() => toggleIn(fSizes, setFSizes, s)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border-2 ${fSizes.includes(s) ? "bg-indigo-600 border-indigo-600 text-white" : "border-stone-200 text-stone-600"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filterView === "brand" && (
                    <div className="py-3">
                      <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 mb-1">
                        <Search size={14} className="text-stone-400 shrink-0" />
                        <input value={bSearch} onChange={(e) => setBSearch(e.target.value)} placeholder={t("brand_search")}
                          className="flex-1 py-2.5 text-sm font-bold outline-none bg-transparent" />
                        {bSearch && <button onClick={() => setBSearch("")}><X size={14} className="text-stone-400" /></button>}
                      </div>
                      {brandGroups().map(([label, arr]) => {
                        const list = arr.filter((b) => b.toLowerCase().includes(bSearch.toLowerCase()));
                        if (list.length === 0) return null;
                        return (
                          <div key={label}>
                            <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide mt-4 mb-1">{label}</p>
                            {list.map((b) => (
                              <button key={label + b} onClick={() => toggleIn(fBrands, setFBrands, b)}
                                className="w-full flex items-center justify-between py-3 border-b border-stone-100">
                                <span className="text-sm font-bold text-stone-800">{b}</span>
                                {checkbox(fBrands.includes(b))}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pied fixe */}
                <div className="px-6 py-4 border-t border-stone-100 bg-white flex items-center gap-3">
                  <button onClick={resetFilters} className="text-xs font-extrabold text-stone-500 px-2">{t("filter_reset")}</button>
                  <button onClick={() => { setFilterView("hub"); setFiltersOpen(false); }}
                    className="flex-1 bg-indigo-600 text-white font-extrabold py-3.5 rounded-2xl active:scale-95 transition-transform">
                    {tf("filter_apply", { n: nRes })}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Ticket affiché juste après la création — PIN en clair, une seule fois */}
        {newOrderTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" dir={cur.dir}>
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 font-app text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
              <p className="font-display font-bold text-xl text-stone-900 mt-3">{t("real_order_title")}</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">{newOrderTicket.code} · {newOrderTicket.itemEmoji} {newOrderTicket.itemTitle}</p>
              <div className="mt-4 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl py-4">
                <p className="text-[10px] font-extrabold text-indigo-500">{t("real_pin_note")}</p>
                <p className="font-display font-extrabold text-4xl tracking-[0.3em] text-indigo-700 mt-2">{newOrderTicket.pinPlain}</p>
              </div>
              <p className="text-sm font-extrabold text-stone-900 mt-4">{newOrderTicket.total_dh} DH</p>
              <button onClick={() => { setNewOrderTicket(null); setOrdersOpen(true); }}
                className="w-full mt-5 bg-indigo-600 text-white font-extrabold py-3.5 rounded-2xl active:scale-95 transition-transform">
                {t("real_order_ok")}
              </button>
            </div>
          </div>
        )}

        {/* PANNEAU ADMIN — dashboard + modération (fondateur seulement) */}
        {adminOpen && (
          <div className="fixed inset-0 z-40 flex justify-center bg-black/40" dir={cur.dir}>
            <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app pb-8">
              <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-stone-900 sticky top-0 z-10">
                <button onClick={() => setAdminOpen(false)}>
                  <ChevronLeft size={22} className={`text-white ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
                </button>
                <ShieldCheck size={18} className="text-amber-400" />
                <p className="text-sm font-extrabold text-white">{t("admin_panel")}</p>
              </div>

              {/* Onglets */}
              <div className="px-5 pt-4">
                <div className="flex bg-stone-200 rounded-2xl p-1">
                  {[["stats", t("adm_stats")], ["mod", t("adm_mod")]].map(([id, label]) => (
                    <button key={id} onClick={() => setAdminTab(id)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${adminTab === id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {!adminStats && <p className="text-center text-xs text-stone-500 font-semibold py-10">…</p>}

              {/* CHIFFRES */}
              {adminTab === "stats" && adminStats && (
                <div className="px-5 pt-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      [t("adm_users"), adminStats.nUsers, "👥"],
                      [t("adm_items"), adminStats.nItems, "🏷️"],
                      [t("adm_active"), adminStats.nActive, "✅"],
                      [t("adm_orders"), adminStats.nOrders, "📦"],
                    ].map(([l, v, e]) => (
                      <div key={l} className="bg-white rounded-2xl p-4 shadow-sm">
                        <p className="text-2xl">{e}</p>
                        <p className="text-2xl font-extrabold text-stone-900 mt-1">{v}</p>
                        <p className="text-[10px] font-bold text-stone-400">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 space-y-2.5">
                    {[
                      [t("adm_gmv"), adminStats.gmv + " DH", "text-stone-900"],
                      [t("adm_rev"), adminStats.revenue + " DH", "text-emerald-600"],
                      [t("adm_held"), adminStats.held + " DH", "text-amber-600"],
                      [t("adm_done"), adminStats.completed, "text-indigo-600"],
                    ].map(([l, v, c]) => (
                      <div key={l} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-500">{l}</p>
                        <p className={`text-sm font-extrabold ${c}`}>{v}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] font-extrabold text-stone-400 uppercase mt-5 mb-2">{t("adm_recent_orders")}</p>
                  <div className="space-y-2">
                    {adminOrders.slice(0, 8).map((o, i) => (
                      <div key={i} className="bg-white rounded-xl px-3.5 py-2.5 shadow-sm flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-stone-900">{o.code}</p>
                          <p className="text-[10px] text-stone-500 font-semibold truncate">{o.items && o.items.title ? o.items.title : "—"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-extrabold text-stone-900">{o.total_dh} DH</p>
                          <p className="text-[9px] text-stone-500 font-bold">{o.status}</p>
                        </div>
                      </div>
                    ))}
                    {adminOrders.length === 0 && <p className="text-[11px] text-stone-500 font-semibold text-center py-3">—</p>}
                  </div>
                </div>
              )}

              {/* MODÉRATION */}
              {adminTab === "mod" && (
                <div className="px-5 pt-4 space-y-2">
                  {adminItems.map((it) => (
                    <div key={it.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                        {it.photos && it.photos[0] ? <img src={it.photos[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">🏷️</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-stone-900 truncate">{it.title}</p>
                        <p className="text-[10px] text-stone-500 font-semibold">{it.price_dh} DH · {it.category} · <span className={it.status === "active" ? "text-emerald-500" : "text-stone-400"}>{it.status}</span></p>
                      </div>
                      {it.status === "active" && (
                        <button onClick={() => adminRemoveItem(it.id)}
                          className="text-[10px] font-extrabold text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded-lg shrink-0">
                          {t("adm_remove")}
                        </button>
                      )}
                    </div>
                  ))}
                  {adminItems.length === 0 && <p className="text-[11px] text-stone-500 font-semibold text-center py-6">—</p>}
                </div>
              )}
            </div>
          </div>
        )}
        {ordersOpen && (() => {
          const buys = myOrders.filter((o) => !o.iSell);
          const sells = myOrders.filter((o) => o.iSell);
          const list = ordersTab === "buys" ? buys : sells;
          const statusLabel = (o) => {
            const m = { paid: "st_paid", dropped: "st_dropped", in_transit: "st_transit", ready: "st_ready", completed: "st_done" };
            return t(m[o.status] || "st_sold");
          };
          const statusColor = (o) =>
            o.status === "paid" ? "bg-amber-50 text-amber-700"
            : o.status === "completed" ? "bg-emerald-50 text-emerald-700"
            : "bg-indigo-50 text-indigo-700";
          return (
            <div className="fixed inset-0 z-40 flex justify-center bg-black/40" dir={cur.dir}>
              <div className="w-full max-w-md bg-stone-50 overflow-y-auto font-app pb-8">
                <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
                  <button onClick={() => setOrdersOpen(false)}>
                    <ChevronLeft size={22} className={`text-stone-700 ${cur.dir === "rtl" ? "rotate-180" : ""}`} />
                  </button>
                  <p className="text-sm font-extrabold text-stone-900">{t("my_orders")}</p>
                </div>

                {/* Onglets Achats / Ventes */}
                <div className="px-5 pt-4">
                  <div className="flex bg-stone-100 rounded-2xl p-1">
                    {[["buys", t("tab_buys"), buys.length], ["sells", t("tab_sells"), sells.length]].map(([id, label, count]) => (
                      <button key={id} onClick={() => setOrdersTab(id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${ordersTab === id ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"}`}>
                        {label}{count > 0 ? " · " + count : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bandeau : nouvelle vente à déposer */}
                {ordersTab === "sells" && sells.some((o) => o.status === "paid") && (
                  <div className="mx-5 mt-3 bg-amber-100 border border-amber-200 rounded-2xl px-4 py-3">
                    <p className="text-xs font-extrabold text-amber-800">{t("sale_new_banner")}</p>
                  </div>
                )}

                <div className="px-5 pt-4 space-y-2.5">
                  {list.length === 0 && (
                    <p className="text-xs text-stone-500 font-semibold text-center py-6">{ordersTab === "buys" ? t("no_buys") : t("no_sells")}</p>
                  )}
                  {list.map((o) => (
                    <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-stone-900">{o.code}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${statusColor(o)}`}>{statusLabel(o)}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-semibold mt-1">
                        {o.items && o.items.title ? o.items.title : "Article"} · {o.total_dh} DH
                      </p>
                      <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
                        {o.iSell ? t("other_buyer") : t("other_seller")} : {o.otherName}
                      </p>

                      {/* Action vendeur : déposer le colis */}
                      {o.iSell && o.status === "paid" ? (
                        <button onClick={() => depositParcel(o)}
                          className="w-full mt-3 bg-indigo-600 text-white text-xs font-extrabold py-3 rounded-xl active:scale-95 transition-transform">
                          📦 {t("deposit_cta")}
                        </button>
                      ) : (
                        !o.iSell && (
                          <p className="text-[10px] text-stone-500 font-bold mt-1.5 flex items-center gap-1">
                            <Lock size={10} /> {t("order_pin_hidden")}
                          </p>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        {nameOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setNameOpen(false)}>
            <div className="w-full max-w-md bg-white rounded-t-3xl p-6 font-app" onClick={(e) => e.stopPropagation()} dir={cur.dir}>
              <p className="font-display font-bold text-lg text-stone-900">Comment veux-tu apparaître ?</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">C'est le nom que verront les acheteurs et vendeurs.</p>
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value.slice(0, 30))}
                placeholder="Ex : Yassine, Kenza, Sneakers Casa…"
                className="w-full mt-4 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-400" />
              <button onClick={saveName} disabled={!nameInput.trim()}
                className="w-full mt-4 bg-indigo-600 text-white font-extrabold py-3.5 rounded-2xl disabled:opacity-50">
                Enregistrer
              </button>
            </div>
          </div>
        )}
        {pObStep >= 0 && partnerOnboarding()}
        {notifOpen && notifSheet()}

        {/* Fiches par-dessus tout : vendeur et point relais (z le plus élevé) */}
        {sellerView && sellerScreen(sellerView)}
        {relayView && relayScreen(relayView)}
        {langOpen && langSheet()}
      </div>
    </div>
  );
}

export default function BaliApp() {
  return (
    <ErrorBoundary>
      <BaliAppScreen />
    </ErrorBoundary>
  );
}
