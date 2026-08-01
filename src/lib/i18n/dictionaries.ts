import type { Locale } from "./config";

type DeepStringify<T> = T extends string
  ? string
  : T extends ReadonlyArray<infer U>
    ? DeepStringify<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: DeepStringify<T[K]> }
      : T;

export type Dictionary = DeepStringify<typeof en>;

const en = {
  common: {
    pricing: "Pricing",
    create: "Create",
    createAWoo: "Create a Woo",
    privacy: "Privacy",
    legal: "Legal notice",
    terms: "Terms",
    cookies: "Cookies",
    contact: "Contact",
    backHome: "Back home",
    loading: "Loading…",
    maybeLater: "Maybe later",
    cancelAnytime: "Cancel anytime",
    forever: "Forever",
    currentPlan: "Current plan",
    redirecting: "Redirecting…",
    language: "Language",
  },
  home: {
    tagline: "To woo.",
    heroTitle: "The easiest way to ask.",
    heroBody:
      "Plan a beautiful date invitation. Send it as a link. They accept, choose, or suggest another time.",
    ctaPrimary: "Send your first Woo 💌",
    ctaPricing: "See pricing",
    howLabel: "How it works",
    howTitle: "Three soft steps",
    step1Title: "Pick a plan",
    step1Body:
      "Choose a date, a time, and an activity — or leave a shortlist for them.",
    step2Title: "Send a Woo",
    step2Body:
      "We email a gorgeous invitation link. No app download required.",
    step3Title: "They respond",
    step3Body:
      "Accept, pick from your shortlist, or suggest another time. You're notified.",
    plansLabel: "Plans",
    plansTitle: "Free to try.",
    plansTitleItalic: "Pro to woo often.",
    plansBody:
      "Free is one Woo a month. Woo+ adds choice. Woo Pro is the obvious pick — unlimited, every theme, Surprise Date.",
    comparePlans: "Compare plans",
    freeHint: "1 Woo / mo",
    plusHint: "5 Woos · pick",
    proHint: "Unlimited · AI",
    footerNote: "To woo. · Made with care",
  },
  pricing: {
    label: "Pricing",
    title: "Soft start. Clear upgrade.",
    subtitle:
      "Free to try. Woo+ if you want choice. Woo Pro when you want everything.",
    canceledBanner:
      "Payment canceled. You're still on Free — you can try again anytime.",
    freeFeatures: [
      "1 Woo / month",
      "1 base theme",
      "I'll pick mode only",
      "Email delivery",
    ],
    plusFeatures: [
      "5 Woos / month",
      "3 themes",
      "Let them pick 💫",
      "Email delivery",
    ],
    proFeatures: [
      "Unlimited Woos",
      "All themes",
      "Surprise Date ✨ (AI)",
      "Read receipts",
    ],
    mostLoved: "Most loved ⭐",
    getPlus: "Get Woo+",
    upgradePro: "Upgrade to Woo Pro",
    unsubscribe: "Unsubscribe",
    billingTitle: "Payment & subscription",
    billingHeading: "Manage or unsubscribe",
    billingBody:
      "Cancel via Stripe. No commitment — you can resubscribe anytime.",
    billingEmail: "Payment email",
    manage: "Manage subscription",
    unsubStripe: "Unsubscribe (Stripe)",
    unsubSchedule: "Or schedule stop at the end of the paid period",
    enterEmailHint: "Enter the email used on Stripe if you're already subscribed.",
    feature: "Feature",
    features: {
      woos: "Woos / month",
      themes: "Themes",
      pick: '"Let them pick"',
      surprise: "Surprise Date ✨",
      receipts: "Read receipts",
    },
    unlimited: "Unlimited",
    all: "All",
    opening: "Opening…",
    needEmail: "Enter the email used for payment.",
  },
  create1: {
    step: "Step 1 of 2",
    title: "When works for you?",
    subtitle: "Pick a date and time — I'll make it special.",
    date: "Date",
    time: "Time",
    whoPicks: "Who picks the plan?",
    illPick: "I'll pick 🎯",
    letThemPick: "Let them pick 💫",
    thePlan: "The Plan",
    continue: "Continue",
    errDateTime: "Please pick a date and time.",
    errPlan: "Please choose a plan.",
    errProposed: "Select between 2 and 5 activities for them to choose from.",
    chooseActivity: "Choose an activity…",
    pickRange: "Pick {min}–{max} options · {count} selected",
  },
  create2: {
    step: "Step 2 of 2",
    title: "Who are you wooing?",
    subtitle: "We'll send them a beautiful link by email.",
    yourName: "Your name",
    yourEmail: "Your email",
    recipientName: "Recipient name",
    recipientEmail: "Recipient email",
    message: "Personal message",
    messagePlaceholder: "Add a little something…",
    theme: "Visual theme",
    recap: "Recap",
    send: "Send your Woo 💌",
    sending: "Sending…",
    errSender: "Add your name and email so they know who Woo'd them.",
    errRecipient: "Add the recipient's name and email.",
  },
  success: {
    welcome: "Welcome to {plan}",
    onItsWay: "Your Woo is on its way",
    unlockedPro:
      "Unlimited Woos, all themes, Surprise Date and read receipts are unlocked.",
    unlockedPlus: "5 Woos/mo, 3 themes, and “Let them pick” are unlocked.",
    emailed: "We've emailed the invitation. Share the link too if you like.",
    sendAnother: "Send another Woo",
    upsellFree:
      "Send unlimited Woos and let them pick with Woo+ or Woo Pro.",
    upsellPlus:
      "Unlock Surprise Date and unlimited themes with Woo Pro.",
    seePlans: "See plans",
    upgradePro: "Upgrade to Woo Pro",
  },
  recipient: {
    tagline: "To woo.",
    wantsToWoo: "{name} wants to woo you",
    onAt: "on {date} at {time}",
    pickFavorite: "Pick your favorite",
    yes: "Oui",
    youreIn: "You're in!",
    suggestionSent: "Suggestion sent",
    letThemKnow: "We've let them know.",
  },
  privacy: {
    label: "Privacy",
    title: "Your data on Woo",
    body1:
      "Woo processes personal data (names, emails, invitation content) to send date invitations and manage subscriptions. We use Supabase, Resend (email), Stripe (payments), and optionally Anthropic (Surprise Date for Pro).",
    retention:
      "Retention: cancelling a Stripe subscription does not automatically delete your Woo history. Billing may remain as Free. You can request erasure below.",
    contact: "Contact:",
    deleteTitle: "Delete my data",
    deleteBody:
      "We email a confirmation link first (proof of inbox ownership), then permanently delete matching Woo invitations and billing records.",
    email: "Email",
    requestDelete: "Request deletion",
    enterEmail: "Enter your email.",
  },
  cookies: {
    bannerTitle: "Cookies",
    bannerBody:
      "We use necessary cookies to run Woo, and optional advertising cookies (Google Ads) to measure paid signups if you allow them.",
    learnMore: "Cookie policy",
    acceptAll: "Accept all",
    necessaryOnly: "Necessary only",
    settings: "Cookie settings",
  },
  upgrade: {
    plusBlurb:
      "5 Woos/mo, 3 themes, and “Let them pick” for $2.99/mo.",
    plusFeature:
      "{feature} is included with Woo+ — 5 Woos/mo, 3 themes, and “Let them pick”.",
    plusCta: "Upgrade to Woo+",
    proBlurb:
      "Unlimited Woos, all themes, Surprise Date ✨ and read receipts for $4.99/mo.",
    proFeature:
      "{feature} unlocks with Woo Pro — unlimited Woos, all themes, Surprise Date & read receipts.",
    proCta: "Upgrade to Woo Pro ✨",
  },
  activities: {
    arcade: "Arcade Night",
    coffee: "Cozy Coffee",
    sunset: "Sunset Walk",
    dinner: "Dinner Date",
    movie: "Movie Night",
    mini_golf: "Mini Golf",
    bookstore: "Bookstore Wander",
    fast_food: "Fast Food Run",
    picnic: "Picnic",
    ice_cream: "Ice Cream Date",
    beach: "Beach Day",
    karaoke: "Karaoke Night",
    cooking: "Cook Together",
    surprise: "Surprise Date",
    aDate: "a date",
  },
  themes: {
    default: "Blush Soft",
    midnight: "Midnight Rose",
    golden: "Golden Hour",
    lavender: "Lavender Dream",
    ocean: "Ocean Mist",
    cherry: "Cherry Blossom",
  },
  plans: {
    free: "Free",
    woo_plus: "Woo+",
    woo_pro: "Woo Pro",
  },
};

const fr: Dictionary = {
  common: {
    pricing: "Tarifs",
    create: "Créer",
    createAWoo: "Créer un Woo",
    privacy: "Confidentialité",
    legal: "Mentions légales",
    terms: "CGU",
    cookies: "Cookies",
    contact: "Contact",
    backHome: "Retour à l’accueil",
    loading: "Chargement…",
    maybeLater: "Plus tard",
    cancelAnytime: "Résiliable à tout moment",
    forever: "Pour toujours",
    currentPlan: "Offre actuelle",
    redirecting: "Redirection…",
    language: "Langue",
  },
  home: {
    tagline: "Séduire.",
    heroTitle: "La façon la plus simple de demander.",
    heroBody:
      "Prépare une belle invitation. Envoie-la en lien. Iels acceptent, choisissent, ou proposent un autre moment.",
    ctaPrimary: "Envoie ton premier Woo 💌",
    ctaPricing: "Voir les tarifs",
    howLabel: "Comment ça marche",
    howTitle: "Trois étapes douces",
    step1Title: "Choisis un plan",
    step1Body:
      "Une date, une heure, une activité — ou une shortlist pour qu’iels choisissent.",
    step2Title: "Envoie un Woo",
    step2Body:
      "On envoie un joli lien par email. Pas d’app à télécharger.",
    step3Title: "Iels répondent",
    step3Body:
      "Acceptent, choisissent dans ta shortlist, ou proposent un autre créneau. Tu es notifié·e.",
    plansLabel: "Offres",
    plansTitle: "Essaye gratuitement.",
    plansTitleItalic: "Pro pour wooer souvent.",
    plansBody:
      "Free : 1 Woo par mois. Woo+ ajoute le choix. Woo Pro : illimité, tous les thèmes, Surprise Date.",
    comparePlans: "Comparer les offres",
    freeHint: "1 Woo / mois",
    plusHint: "5 Woos · choix",
    proHint: "Illimité · IA",
    footerNote: "Séduire. · Fait avec soin",
  },
  pricing: {
    label: "Tarifs",
    title: "Début doux. Upgrade clair.",
    subtitle:
      "Gratuit pour essayer. Woo+ pour le choix. Woo Pro pour tout avoir.",
    canceledBanner:
      "Paiement annulé. Tu es toujours sur Free — tu peux réessayer quand tu veux.",
    freeFeatures: [
      "1 Woo / mois",
      "1 thème de base",
      "Mode « je choisis » seulement",
      "Envoi par email",
    ],
    plusFeatures: [
      "5 Woos / mois",
      "3 thèmes",
      "Iels choisissent 💫",
      "Envoi par email",
    ],
    proFeatures: [
      "Woos illimités",
      "Tous les thèmes",
      "Surprise Date ✨ (IA)",
      "Accusés de lecture",
    ],
    mostLoved: "Le plus aimé ⭐",
    getPlus: "Prendre Woo+",
    upgradePro: "Passer à Woo Pro",
    unsubscribe: "Se désabonner",
    billingTitle: "Paiement & abonnement",
    billingHeading: "Gérer ou se désabonner",
    billingBody:
      "Annule via Stripe. Aucun engagement — tu peux te réabonner à tout moment.",
    billingEmail: "Email du paiement",
    manage: "Gérer mon abonnement",
    unsubStripe: "Se désabonner (Stripe)",
    unsubSchedule: "Ou programmer l’arrêt à la fin de la période payée",
    enterEmailHint:
      "Entre l’email utilisé sur Stripe si tu es déjà abonné·e.",
    feature: "Fonctionnalité",
    features: {
      woos: "Woos / mois",
      themes: "Thèmes",
      pick: "« Iels choisissent »",
      surprise: "Surprise Date ✨",
      receipts: "Accusés de lecture",
    },
    unlimited: "Illimité",
    all: "Tous",
    opening: "Ouverture…",
    needEmail: "Entre l’email utilisé pour le paiement.",
  },
  create1: {
    step: "Étape 1 sur 2",
    title: "Quand ça te va ?",
    subtitle: "Choisis une date et une heure — je m’occupe du reste.",
    date: "Date",
    time: "Heure",
    whoPicks: "Qui choisit le plan ?",
    illPick: "Je choisis 🎯",
    letThemPick: "Iels choisissent 💫",
    thePlan: "Le plan",
    continue: "Continuer",
    errDateTime: "Choisis une date et une heure.",
    errPlan: "Choisis un plan.",
    errProposed: "Sélectionne entre 2 et 5 activités.",
    chooseActivity: "Choisir une activité…",
    pickRange: "Choisis {min}–{max} options · {count} sélectionnée(s)",
  },
  create2: {
    step: "Étape 2 sur 2",
    title: "Qui wooes-tu ?",
    subtitle: "On leur envoie un beau lien par email.",
    yourName: "Ton prénom",
    yourEmail: "Ton email",
    recipientName: "Prénom du destinataire",
    recipientEmail: "Email du destinataire",
    message: "Message perso",
    messagePlaceholder: "Ajoute un petit mot…",
    theme: "Thème visuel",
    recap: "Récap",
    send: "Envoyer ton Woo 💌",
    sending: "Envoi…",
    errSender: "Ajoute ton prénom et ton email.",
    errRecipient: "Ajoute le prénom et l’email du destinataire.",
  },
  success: {
    welcome: "Bienvenue sur {plan}",
    onItsWay: "Ton Woo est en route",
    unlockedPro:
      "Woos illimités, tous les thèmes, Surprise Date et accusés de lecture sont débloqués.",
    unlockedPlus:
      "5 Woos/mois, 3 thèmes et « iels choisissent » sont débloqués.",
    emailed:
      "L’invitation a été envoyée par email. Tu peux aussi partager le lien.",
    sendAnother: "Envoyer un autre Woo",
    upsellFree:
      "Envoie des Woos illimités et laisse-les choisir avec Woo+ ou Woo Pro.",
    upsellPlus:
      "Débloque Surprise Date et tous les thèmes avec Woo Pro.",
    seePlans: "Voir les offres",
    upgradePro: "Passer à Woo Pro",
  },
  recipient: {
    tagline: "Séduire.",
    wantsToWoo: "{name} veut te wooer",
    onAt: "le {date} à {time}",
    pickFavorite: "Choisis ton préféré",
    yes: "Oui",
    youreIn: "C’est noté !",
    suggestionSent: "Suggestion envoyée",
    letThemKnow: "On les a prévenus.",
  },
  privacy: {
    label: "Confidentialité",
    title: "Tes données sur Woo",
    body1:
      "Woo traite des données personnelles (noms, emails, contenu d’invitation) pour envoyer des invitations et gérer les abonnements. Nous utilisons Supabase, Resend, Stripe, et éventuellement Anthropic (Surprise Date Pro).",
    retention:
      "Conservation : annuler un abonnement Stripe ne supprime pas automatiquement ton historique Woo. Tu peux demander l’effacement ci-dessous.",
    contact: "Contact :",
    deleteTitle: "Supprimer mes données",
    deleteBody:
      "On t’envoie d’abord un lien de confirmation par email, puis on supprime les invitations et la facturation liées.",
    email: "Email",
    requestDelete: "Demander la suppression",
    enterEmail: "Entre ton email.",
  },
  cookies: {
    bannerTitle: "Cookies",
    bannerBody:
      "Nous utilisons des cookies nécessaires pour faire fonctionner Woo, et des cookies publicitaires optionnels (Google Ads) pour mesurer les inscriptions payantes si tu les autorises.",
    learnMore: "Politique cookies",
    acceptAll: "Tout accepter",
    necessaryOnly: "Nécessaires uniquement",
    settings: "Réglages cookies",
  },
  upgrade: {
    plusBlurb:
      "5 Woos/mois, 3 thèmes et « iels choisissent » pour 2,99 $/mois.",
    plusFeature:
      "{feature} est inclus avec Woo+ — 5 Woos/mois, 3 thèmes et « iels choisissent ».",
    plusCta: "Passer à Woo+",
    proBlurb:
      "Woos illimités, tous les thèmes, Surprise Date ✨ et accusés de lecture pour 4,99 $/mois.",
    proFeature:
      "{feature} se débloque avec Woo Pro — illimité, tous les thèmes, Surprise Date & accusés de lecture.",
    proCta: "Passer à Woo Pro ✨",
  },
  activities: {
    arcade: "Soirée arcade",
    coffee: "Café cosy",
    sunset: "Balade au coucher du soleil",
    dinner: "Dîner en amoureux",
    movie: "Soirée ciné",
    mini_golf: "Mini-golf",
    bookstore: "Librairie flâneuse",
    fast_food: "Fast-food improvisé",
    picnic: "Pique-nique",
    ice_cream: "Glace ensemble",
    beach: "Journée plage",
    karaoke: "Soirée karaoké",
    cooking: "Cuisiner ensemble",
    surprise: "Surprise Date",
    aDate: "un rendez-vous",
  },
  themes: {
    default: "Blush doux",
    midnight: "Rose de minuit",
    golden: "Golden Hour",
    lavender: "Rêve lavande",
    ocean: "Brume océane",
    cherry: "Fleur de cerisier",
  },
  plans: {
    free: "Free",
    woo_plus: "Woo+",
    woo_pro: "Woo Pro",
  },
};

const es: Dictionary = {
  common: {
    pricing: "Precios",
    create: "Crear",
    createAWoo: "Crear un Woo",
    privacy: "Privacidad",
    legal: "Aviso legal",
    terms: "Términos",
    cookies: "Cookies",
    contact: "Contacto",
    backHome: "Volver al inicio",
    loading: "Cargando…",
    maybeLater: "Más tarde",
    cancelAnytime: "Cancela cuando quieras",
    forever: "Para siempre",
    currentPlan: "Plan actual",
    redirecting: "Redirigiendo…",
    language: "Idioma",
  },
  home: {
    tagline: "Enamorar.",
    heroTitle: "La forma más fácil de preguntar.",
    heroBody:
      "Prepara una invitación bonita. Envíala con un enlace. Aceptan, eligen u ofrecen otra hora.",
    ctaPrimary: "Envía tu primer Woo 💌",
    ctaPricing: "Ver precios",
    howLabel: "Cómo funciona",
    howTitle: "Tres pasos suaves",
    step1Title: "Elige un plan",
    step1Body:
      "Fecha, hora y actividad — o una shortlist para que elijan.",
    step2Title: "Envía un Woo",
    step2Body:
      "Enviamos un enlace precioso por email. Sin app que descargar.",
    step3Title: "Responden",
    step3Body:
      "Aceptan, eligen de tu lista u ofrecen otro momento. Te avisamos.",
    plansLabel: "Planes",
    plansTitle: "Prueba gratis.",
    plansTitleItalic: "Pro para wooear a menudo.",
    plansBody:
      "Free: 1 Woo al mes. Woo+ añade elección. Woo Pro: ilimitado, todos los temas, Surprise Date.",
    comparePlans: "Comparar planes",
    freeHint: "1 Woo / mes",
    plusHint: "5 Woos · elegir",
    proHint: "Ilimitado · IA",
    footerNote: "Enamorar. · Hecho con cariño",
  },
  pricing: {
    label: "Precios",
    title: "Empieza suave. Mejora clara.",
    subtitle:
      "Gratis para probar. Woo+ si quieres elegir. Woo Pro cuando lo quieres todo.",
    canceledBanner:
      "Pago cancelado. Sigues en Free — puedes intentarlo cuando quieras.",
    freeFeatures: [
      "1 Woo / mes",
      "1 tema base",
      "Solo modo « yo elijo »",
      "Envío por email",
    ],
    plusFeatures: [
      "5 Woos / mes",
      "3 temas",
      "Que elijan 💫",
      "Envío por email",
    ],
    proFeatures: [
      "Woos ilimitados",
      "Todos los temas",
      "Surprise Date ✨ (IA)",
      "Confirmación de lectura",
    ],
    mostLoved: "El favorito ⭐",
    getPlus: "Conseguir Woo+",
    upgradePro: "Pasar a Woo Pro",
    unsubscribe: "Cancelar suscripción",
    billingTitle: "Pago y suscripción",
    billingHeading: "Gestionar o cancelar",
    billingBody:
      "Cancela vía Stripe. Sin compromiso — puedes volver cuando quieras.",
    billingEmail: "Email del pago",
    manage: "Gestionar suscripción",
    unsubStripe: "Cancelar (Stripe)",
    unsubSchedule: "O programar el fin al terminar el periodo pagado",
    enterEmailHint:
      "Introduce el email usado en Stripe si ya estás suscrito/a.",
    feature: "Función",
    features: {
      woos: "Woos / mes",
      themes: "Temas",
      pick: "« Que elijan »",
      surprise: "Surprise Date ✨",
      receipts: "Confirmación de lectura",
    },
    unlimited: "Ilimitado",
    all: "Todos",
    opening: "Abriendo…",
    needEmail: "Introduce el email usado para el pago.",
  },
  create1: {
    step: "Paso 1 de 2",
    title: "¿Cuándo te va bien?",
    subtitle: "Elige fecha y hora — yo me encargo del resto.",
    date: "Fecha",
    time: "Hora",
    whoPicks: "¿Quién elige el plan?",
    illPick: "Yo elijo 🎯",
    letThemPick: "Que elijan 💫",
    thePlan: "El plan",
    continue: "Continuar",
    errDateTime: "Elige una fecha y una hora.",
    errPlan: "Elige un plan.",
    errProposed: "Selecciona entre 2 y 5 actividades.",
    chooseActivity: "Elige una actividad…",
    pickRange: "Elige {min}–{max} opciones · {count} seleccionada(s)",
  },
  create2: {
    step: "Paso 2 de 2",
    title: "¿A quién wooeas?",
    subtitle: "Les enviaremos un enlace bonito por email.",
    yourName: "Tu nombre",
    yourEmail: "Tu email",
    recipientName: "Nombre del destinatario",
    recipientEmail: "Email del destinatario",
    message: "Mensaje personal",
    messagePlaceholder: "Añade un detalle…",
    theme: "Tema visual",
    recap: "Resumen",
    send: "Enviar tu Woo 💌",
    sending: "Enviando…",
    errSender: "Añade tu nombre y email.",
    errRecipient: "Añade el nombre y email del destinatario.",
  },
  success: {
    welcome: "Bienvenido/a a {plan}",
    onItsWay: "Tu Woo está en camino",
    unlockedPro:
      "Woos ilimitados, todos los temas, Surprise Date y confirmación de lectura desbloqueados.",
    unlockedPlus:
      "5 Woos/mes, 3 temas y « que elijan » desbloqueados.",
    emailed:
      "Hemos enviado la invitación por email. También puedes compartir el enlace.",
    sendAnother: "Enviar otro Woo",
    upsellFree:
      "Envía Woos ilimitados y deja que elijan con Woo+ o Woo Pro.",
    upsellPlus:
      "Desbloquea Surprise Date y todos los temas con Woo Pro.",
    seePlans: "Ver planes",
    upgradePro: "Pasar a Woo Pro",
  },
  recipient: {
    tagline: "Enamorar.",
    wantsToWoo: "{name} quiere wooearte",
    onAt: "el {date} a las {time}",
    pickFavorite: "Elige tu favorito",
    yes: "Sí",
    youreIn: "¡Apuntado!",
    suggestionSent: "Sugerencia enviada",
    letThemKnow: "Ya se lo hemos contado.",
  },
  privacy: {
    label: "Privacidad",
    title: "Tus datos en Woo",
    body1:
      "Woo trata datos personales (nombres, emails, contenido de invitación) para enviar invitaciones y gestionar suscripciones. Usamos Supabase, Resend, Stripe y opcionalmente Anthropic (Surprise Date Pro).",
    retention:
      "Retención: cancelar Stripe no borra automáticamente tu historial Woo. Puedes pedir el borrado abajo.",
    contact: "Contacto:",
    deleteTitle: "Borrar mis datos",
    deleteBody:
      "Primero enviamos un enlace de confirmación por email y luego borramos invitaciones y facturación asociadas.",
    email: "Email",
    requestDelete: "Solicitar borrado",
    enterEmail: "Introduce tu email.",
  },
  cookies: {
    bannerTitle: "Cookies",
    bannerBody:
      "Usamos cookies necesarias para que Woo funcione, y cookies publicitarias opcionales (Google Ads) para medir altas de pago si las permites.",
    learnMore: "Política de cookies",
    acceptAll: "Aceptar todo",
    necessaryOnly: "Solo necesarias",
    settings: "Ajustes de cookies",
  },
  upgrade: {
    plusBlurb:
      "5 Woos/mes, 3 temas y « que elijan » por 2,99 $/mes.",
    plusFeature:
      "{feature} está incluido en Woo+ — 5 Woos/mes, 3 temas y « que elijan ».",
    plusCta: "Pasar a Woo+",
    proBlurb:
      "Woos ilimitados, todos los temas, Surprise Date ✨ y confirmación de lectura por 4,99 $/mes.",
    proFeature:
      "{feature} se desbloquea con Woo Pro — ilimitado, todos los temas, Surprise Date y lecturas.",
    proCta: "Pasar a Woo Pro ✨",
  },
  activities: {
    arcade: "Noche de arcade",
    coffee: "Café cozy",
    sunset: "Paseo al atardecer",
    dinner: "Cena especial",
    movie: "Noche de cine",
    mini_golf: "Mini golf",
    bookstore: "Librería a la deriva",
    fast_food: "Fast food improvisado",
    picnic: "Picnic",
    ice_cream: "Helado juntos",
    beach: "Día de playa",
    karaoke: "Noche de karaoke",
    cooking: "Cocinar juntos",
    surprise: "Surprise Date",
    aDate: "una cita",
  },
  themes: {
    default: "Blush suave",
    midnight: "Rosa de medianoche",
    golden: "Golden Hour",
    lavender: "Sueño lavanda",
    ocean: "Bruma oceánica",
    cherry: "Flor de cerezo",
  },
  plans: {
    free: "Free",
    woo_plus: "Woo+",
    woo_pro: "Woo Pro",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, fr, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  );
}
