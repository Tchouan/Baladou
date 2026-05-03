import { useState, useEffect, useCallback, useMemo } from "react";
// ─── FUSE.JS — Fuzzy search (chargé depuis CDN) ───────────────────
let FuseLib = null;
async function loadFuse() {
if (FuseLib) return FuseLib;
return new Promise((resolve) => {
const script = document.createElement(''script'');
script.src = ''https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.0.0/fuse.min.js'';
script.onload = () => { FuseLib = window.Fuse; resolve(window.Fuse); };
document.head.appendChild(script);
});
}

// Synonymes dog-friendly pour enrichir la recherche
const SYNONYMES = {
''restaurant'': [''bistro'',''brasserie'',''taverne'',''cantine'',''resto''],
''bistro'':     [''restaurant'',''brasserie'',''bar''],
''brasserie'':  [''restaurant'',''bistro'',''bar'',''bière''],
''café'':       [''cafe'',''coffee'',''brunch''],
''coffee'':     [''café'',''cafe''],
''chien'':      [''dog'',''canin'',''toutou'',''pitou'',''animal''],
''dog'':        [''chien'',''canin'',''toutou''],
''parc'':       [''park'',''jardin'',''espace vert'',''zone''],
''forêt'':      [''bois'',''sentier'',''nature'',''randonnée'',''trail''],
''sentier'':    [''trail'',''randonnée'',''chemin'',''piste''],
''terrasse'':   [''extérieur'',''dehors'',''patio'',''outdoor''],
''hors-laisse'':[''liberté'',''sans laisse'',''zone canine''],
''montreal'':   [''mtl'',''montréal''],
''plateau'':    [''plateau-mont-royal'',''pl.''],
''verdun'':     [''wellington''],
''saint'':      [''st'',''st-'',''ste''],
};

// Normalise une chaîne : minuscules, sans accents, sans ponctuation
function normalize(str) {
return str.toLowerCase()
.normalize(''NFD'').replace(/[\u0300-\u036f]/g, '''')
.replace(/[^a-z0-9\s]/g, '' '')
.replace(/\s+/g, '' '').trim();
}

// Recherche floue enrichie avec synonymes
function fuzzySearch(query, lieux) {
if (!query || query.trim().length < 2) return lieux;
const q = normalize(query);

// Étape 1 — Fuse.js si disponible
if (FuseLib) {
const fuse = new FuseLib(lieux, {
keys: [''name'',''quartier'',''desc'',''tags'',''politique'',''adresse''],
threshold: 0.4,        // 0 = exact, 1 = tout accepter
distance: 100,
includeScore: true,
ignoreLocation: true,
useExtendedSearch: false,
});
const fuseResults = fuse.search(q).map(r => r.item);
if (fuseResults.length > 0) return fuseResults;
}

// Étape 2 — Fallback : recherche avec synonymes + normalisation
const synonymsForQuery = Object.entries(SYNONYMES)
.filter(([k]) => q.includes(normalize(k)))
.flatMap(([,v]) => v);
const termes = [q, …synonymsForQuery];

return lieux.filter(l => {
const haystack = normalize(
[l.name, l.quartier, l.desc, …(l.tags||[]), l.politique||'''', l.adresse||''''].join('' '')
);
return termes.some(t => haystack.includes(t));
});
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
// Baladou palette — warm terracotta + sage + deep forest
bg:        ''#FBF7F2'',
bgCard:    ''#FFFFFF'',
bark:      ''#1E140A'',
soil:      ''#3D2B1A'',
terra:     ''#C96442'',  // primary CTA
terraDk:   ''#A44E30'',
terraLt:   ''#F0D5C8'',
sage:      ''#6B9E7A'',
sageDk:    ''#4A7A58'',
sageLt:    ''#D8EDDF'',
gold:      ''#D4A847'',
goldLt:    ''#FDF3D8'',
slate:     ''#5A7FA0'',
slateLt:   ''#D8E8F4'',
stone:     ''#E8E0D6'',
taupe:     ''#C8BAA8'',
warm:      ''#A8957E'',
muted:     ''#8A7460'',
deep:      ''#5C4A35'',
cream:     ''#F4EDE4'',
parch:     ''#EDE3D6'',
amber:     ''#E09840'',
amberLt:   ''#FEF6E4'',
};

const CAT = [
{ id:''cafes'',      label:''Cafés'',        icon:''☕'', color:T.terra,  desc:''Terrasses & brunchs'' },
{ id:''restos'',     label:''Restos'',       icon:''🍽️'', color:''#B85A3A'',desc:''Repas dog-friendly'' },
{ id:''boutiques'',  label:''Boutiques'',    icon:''🛍️'', color:T.slate,  desc:''Shopping avec toutou'' },
{ id:''parcs'',      label:''Parcs'',        icon:''🌿'', color:T.sage,   desc:''Zones hors-laisse'' },
{ id:''randonees'',  label:''Randonnées'',   icon:''🥾'', color:''#5C6B3A'',desc:''Sentiers & nature'' },
{ id:''campings'',   label:''Campings'',     icon:''⛺'', color:''#7A6B3A'',desc:''Nuits en plein air'' },
{ id:''activites'',  label:''Activités'',    icon:''🎯'', color:''#8A5A7A'',desc:''Sorties & loisirs'' },
];

const QUARTIERS = [
''Plateau-Mont-Royal'',''Mile-End'',''Verdun'',''Rosemont'',''Saint-Henri'',
''Outremont'',''Hochelaga'',''Griffintown'',''Vieux-Montréal'',''NDG'',
''Côte-des-Neiges'',''La Petite-Patrie'',''Villeray'',''Ahuntsic'',
];

const DESTINATIONS_ESCAPADE = [
''Charlevoix'',''Laurentides'',''Cantons-de-l’Est'',''Lanaudière'',
''Mauricie'',''Gaspésie'',''Outaouais'',''Côte-Nord'',
];

const LIEUX = [
// ── CAFÉS ──────────────────────────────────────────────────────────
{ id:1,  cat:''cafes'', name:''Saint JJH & Café'',              quartier:''Verdun'',             desc:''Café dog-friendly à Verdun. Chiens admis en terrasse, et l’hiver via la fenêtre à emporter. Friandises et eau souvent offerts !'', tags:[''Terrasse'',''Friandises'',''Hiver''], saison:null, politique:''Terrasse + fenêtre à emporter l’hiver, friandises et eau offerts'', adresse:''3323 Rue Evelyn, Montréal'', tel:''514-984-2267'', confirmations:0, lat:45.4632, lng:-73.5668 },
{ id:2,  cat:''cafes'', name:''Phin Cafe'',                     quartier:''Plateau-Mont-Royal'', desc:''Café dog-friendly sur la rue Roy.'', tags:[''Café'',''Dog-friendly''], saison:null, politique:''Connu comme dog-friendly'', adresse:''804 Rue Roy E, Montréal'', tel:null, confirmations:0, lat:45.5218, lng:-73.5748 },
{ id:3,  cat:''cafes'', name:''Bulla Café'',                    quartier:''Plateau-Mont-Royal'', desc:''Café dog-friendly sur la rue Saint-Denis.'', tags:[''Café'',''Dog-friendly''], saison:null, politique:''Connu comme dog-friendly'', adresse:''4141 Rue Saint-Denis, Montréal'', tel:null, confirmations:0, lat:45.5238, lng:-73.5768 },
{ id:4,  cat:''cafes'', name:''Café Alphabet'',                 quartier:''Mile-End'',           desc:''Café dog-friendly avec belle terrasse sur la rue Clark.'', tags:[''Café'',''Terrasse'',''Dog-friendly''], saison:null, politique:'''', adresse:''5765 Rue Clark, Montréal'', tel:null, confirmations:0, lat:45.5255, lng:-73.5968 },
{ id:5,  cat:''cafes'', name:''Bah! Café | Brazilian Coffee Shop'', quartier:''Plateau-Mont-Royal'', desc:''Café brésilien dog-friendly. Possède des friandises pour les chiens !'', tags:[''Café'',''Brésilien'',''Friandises''], saison:null, politique:''Dog-friendly, friandises offertes'', adresse:''857 Rue Marie-Anne, Montréal'', tel:''514-524-4410'', confirmations:0, lat:45.5228, lng:-73.5748 },
{ id:6,  cat:''cafes'', name:''GUILLAUME'',                     quartier:''Mile-End'',           desc:''Épicerie fine et café dog-friendly sur le boulevard Saint-Laurent.'', tags:[''Café'',''Épicerie'',''Dog-friendly''], saison:null, politique:''Connu comme dog-friendly'', adresse:''5170 Boul. Saint-Laurent, Montréal'', tel:''514-507-3199'', confirmations:0, lat:45.5262, lng:-73.5975 },
{ id:7,  cat:''cafes'', name:''Ô Petit Paris Mont-Royal'',      quartier:''Plateau-Mont-Royal'', desc:''Café d’ambiance parisienne dog-friendly sur l’avenue Mont-Royal.'', tags:[''Café'',''Français'',''Terrasse''], saison:null, politique:'''', adresse:''1592 Avenue du Mont-Royal E, Montréal'', tel:''514-528-6488'', confirmations:0, lat:45.5195, lng:-73.5748 },
{ id:8,  cat:''cafes'', name:''Ô Petit Paris Wellington'',      quartier:''Verdun'',             desc:''La version Verdun du café parisien dog-friendly. Terrasse animée sur Wellington.'', tags:[''Café'',''Français'',''Terrasse''], saison:null, politique:'''', adresse:''3944 Rue Wellington, Verdun'', tel:''438-380-0772'', confirmations:0, lat:45.4618, lng:-73.5682 },
{ id:9,  cat:''cafes'', name:''Mix’Heure'',                     quartier:''Plateau-Mont-Royal'', desc:''Café avec belle terrasse sur Saint-Denis. Dog-friendly et atmosphère détendue.'', tags:[''Café'',''Terrasse'',''Dog-friendly''], saison:null, politique:'''', adresse:''4282 Rue Saint-Denis, Montréal'', tel:''514-487-2131'', confirmations:0, lat:45.5235, lng:-73.5768 },
{ id:10, cat:''cafes'', name:''Café Alice'',                    quartier:''Rosemont'',           desc:''Café de quartier dog-friendly sur la rue Masson.'', tags:[''Café'',''Dog-friendly''], saison:null, politique:'''', adresse:''3756 Rue Masson, Montréal'', tel:''514-727-9144'', confirmations:0, lat:45.5380, lng:-73.5640 },
{ id:11, cat:''cafes'', name:''Café Lafontaine'',               quartier:''Rosemont'',           desc:''Café cosy dog-friendly sur l’avenue Papineau.'', tags:[''Café'',''Dog-friendly''], saison:null, politique:'''', adresse:''3535 Av. Papineau local 9, Montréal'', tel:''514-527-3030'', confirmations:0, lat:45.5308, lng:-73.5688 },
{ id:12, cat:''cafes'', name:''Chez Nouri'',                    quartier:''Plateau-Mont-Royal'', desc:''Café chaleureux dog-friendly sur l’avenue des Pins.'', tags:[''Café'',''Dog-friendly''], saison:null, politique:'''', adresse:''10 Av. des Pins O, Montréal'', tel:''514-823-9441'', confirmations:0, lat:45.5168, lng:-73.5742 },
{ id:13, cat:''cafes'', name:''Café Le Loup Bleu'',             quartier:''Plateau-Mont-Royal'', desc:''Café dog-friendly sur la rue Marie-Anne.'', tags:[''Café'',''Dog-friendly''], saison:null, politique:'''', adresse:''1279 Rue Marie-Anne, Montréal'', tel:null, confirmations:0, lat:45.5222, lng:-73.5738 },
{ id:14, cat:''cafes'', name:''Afrooshé Chocolaterie'',         quartier:''Plateau-Mont-Royal'', desc:''Chocolaterie artisanale dog-friendly sur l’avenue Mont-Royal.'', tags:[''Chocolaterie'',''Artisanal'',''Dog-friendly''], saison:null, politique:'''', adresse:''1828 Avenue du Mont-Royal E, Montréal'', tel:''514-522-2885'', confirmations:0, lat:45.5198, lng:-73.5718 },

// ── RESTAURANTS ────────────────────────────────────────────────────
{ id:15, cat:''restos'', name:''Bistro Garage Café'',            quartier:''Verdun'',             desc:''Bistro dog-friendly à Verdun. Chiens admis en terrasse, gamelle d’eau offerte !'', tags:[''Bistro'',''Terrasse'',''Gamelle offerte''], saison:null, politique:''Terrasse uniquement, gamelle d’eau offerte'', adresse:''275 Rue Hickson, Verdun'', tel:''514-768-4630'', confirmations:0, lat:45.4622, lng:-73.5672 },
{ id:16, cat:''restos'', name:''Bagel St-Lo Verdun'',            quartier:''Verdun'',             desc:''Bagel dog-friendly à Verdun. Chiens admis en terrasse chauffée même l’hiver !'', tags:[''Bagel'',''Terrasse chauffée'',''Hiver''], saison:null, politique:''Terrasse chauffée en hiver'', adresse:''5411 Rue de Verdun, Verdun'', tel:''514-507-8430'', confirmations:0, lat:45.4608, lng:-73.5698 },
{ id:17, cat:''restos'', name:''RAKU'',                          quartier:''Plateau-Mont-Royal'', desc:''Restaurant dog-friendly sur la rue Rachel.'', tags:[''Restaurant'',''Dog-friendly''], saison:null, politique:''Connu comme dog-friendly'', adresse:''12 Rue Rachel E, Montréal'', tel:''438-520-5130'', confirmations:0, lat:45.5212, lng:-73.5762 },
{ id:18, cat:''restos'', name:''Réservoir – Brasserie'',         quartier:''Plateau-Mont-Royal'', desc:''Brasserie artisanale dog-friendly sur l’avenue Duluth.'', tags:[''Brasserie'',''Bière'',''Terrasse''], saison:null, politique:''Connu comme dog-friendly'', adresse:''9 Av. Duluth E, Montréal'', tel:null, confirmations:0, lat:45.5218, lng:-73.5758 },
{ id:19, cat:''restos'', name:''Restaurant Mont-Royal Hot-Dog'', quartier:''Plateau-Mont-Royal'', desc:''Cantine emblématique dog-friendly sur l’avenue Mont-Royal.'', tags:[''Cantine'',''Hot-dog'',''Dog-friendly''], saison:null, politique:''Connu comme dog-friendly'', adresse:''1001 Avenue du Mont-Royal E, Montréal'', tel:''514-523-3670'', confirmations:0, lat:45.5198, lng:-73.5748 },
{ id:20, cat:''restos'', name:''Lloydie’s St-Viateur'',          quartier:''Mile-End'',           desc:''Restaurant dog-friendly sur la rue Saint-Viateur Ouest.'', tags:[''Restaurant'',''Dog-friendly''], saison:null, politique:''Connu comme dog-friendly'', adresse:''66 Rue Saint-Viateur O, Montréal'', tel:''514-274-7474'', confirmations:0, lat:45.5245, lng:-73.5988 },
{ id:21, cat:''restos'', name:''Le Trèfle – Taverne Irlandaise'',quartier:''Verdun'',             desc:''Taverne irlandaise dog-friendly sur Wellington. Chiens admis en terrasse.'', tags:[''Taverne'',''Irlandais'',''Terrasse''], saison:null, politique:''Terrasse uniquement'', adresse:''4718 Rue Wellington, Verdun'', tel:''514-762-3324'', confirmations:0, lat:45.4612, lng:-73.5668 },

// ── PARCS ──────────────────────────────────────────────────────────
{ id:22, cat:''parcs'', name:''Parc à chiens du Parc La Fontaine'', quartier:''Plateau-Mont-Royal'', desc:''Zone hors-laisse officielle dans le magnifique Parc La Fontaine. Très fréquenté et bien entretenu.'', tags:[''Hors-laisse'',''Grand parc'',''Central''], saison:null, politique:''Zone hors-laisse désignée'', adresse:''Parc La Fontaine, Montréal'', tel:null, confirmations:0, lat:45.5290, lng:-73.5695 },
{ id:23, cat:''parcs'', name:''Parc à chien Dupuis'',               quartier:''Plateau-Mont-Royal'', desc:''Petit parc à chiens de quartier, idéal pour les sorties rapides.'', tags:[''Hors-laisse'',''Quartier''], saison:null, politique:''Zone hors-laisse désignée'', adresse:''Parc Dupuis, Montréal'', tel:null, confirmations:0, lat:45.5180, lng:-73.5740 },
{ id:24, cat:''parcs'', name:''Parc à chiens Champion'',            quartier:''Rosemont'',           desc:''Parc à chiens de Rosemont recensé sur la Carte Canine de Montréal.'', tags:[''Hors-laisse'',''Rosemont''], saison:null, politique:''Zone hors-laisse désignée'', adresse:''Parc Champion, Rosemont'', tel:null, confirmations:0, lat:45.5420, lng:-73.5750 },
{ id:25, cat:''parcs'', name:''Parc à chiens de Verdun'',           quartier:''Verdun'',             desc:''Zone hors-laisse officielle à Verdun. Très apprécié des propriétaires de chiens du quartier.'', tags:[''Hors-laisse'',''Verdun''], saison:null, politique:''Zone hors-laisse désignée'', adresse:''Verdun, Montréal'', tel:null, confirmations:0, lat:45.4608, lng:-73.5695 },
{ id:26, cat:''parcs'', name:''Parc à chiens Sir-Wilfrid-Laurier'', quartier:''Plateau-Mont-Royal'', desc:''Zone canine clôturée très animée. Idéal pour socialiser — les chiens adorent, les maîtres aussi.'', tags:[''Clôturée'',''Social'',''Central''], saison:null, politique:''Zone hors-laisse clôturée'', adresse:''Parc Sir-Wilfrid-Laurier, Montréal'', tel:null, confirmations:0, lat:45.5352, lng:-73.5715 },
{ id:27, cat:''parcs'', name:''Parc à chiens du Père-Marquette'',   quartier:''Rosemont'',           desc:''Zone hors-laisse dans le Parc du Père-Marquette, quartier Rosemont.'', tags:[''Hors-laisse'',''Rosemont''], saison:null, politique:''Zone hors-laisse désignée'', adresse:''Parc du Père-Marquette, Rosemont'', tel:null, confirmations:0, lat:45.5395, lng:-73.5620 },
{ id:28, cat:''parcs'', name:''Parc à chiens de Rosemont'',         quartier:''Rosemont'',           desc:''Parc à chiens de Rosemont recensé sur la Carte Canine de Montréal.'', tags:[''Hors-laisse'',''Rosemont''], saison:null, politique:''Zone hors-laisse désignée'', adresse:''Rosemont, Montréal'', tel:null, confirmations:0, lat:45.5410, lng:-73.5780 },
{ id:29, cat:''parcs'', name:''Parc Rosemont'',                     quartier:''Rosemont'',           desc:''Parc de quartier dog-friendly à Rosemont.'', tags:[''Parc'',''Rosemont'',''Dog-friendly''], saison:null, politique:'''', adresse:''Rosemont, Montréal'', tel:null, confirmations:0, lat:45.5400, lng:-73.5800 },
{ id:30, cat:''parcs'', name:''Parc D’Argenson'',                   quartier:''Ahuntsic'',           desc:''Parc dog-friendly dans le quartier Ahuntsic, recensé sur la Carte Canine.'', tags:[''Parc'',''Ahuntsic'',''Dog-friendly''], saison:null, politique:'''', adresse:''Ahuntsic, Montréal'', tel:null, confirmations:0, lat:45.5580, lng:-73.6580 },
];

const ITINERAIRES_VILLE = {
''Mile-End_cafes'': {
titre:''Matinée café & boutiques Mile-End'',
emoji:''☕'',
etapes:[
{ heure:''9h30'',  icon:''☕'', lieu:''Café Olimpico'',   desc:''Café du matin en terrasse. Votre chien fera fureur auprès des habitués du quartier.'' },
{ heure:''10h30'', icon:''🛍️'', lieu:''Sophie & Cie'',    desc:''À 15 min à pied. Une petite gâterie méritée pour votre compagnon.'' },
{ heure:''12h00'', icon:''🐾'', lieu:''Parc Sir-Wilfrid-Laurier'', desc:''Zone hors-laisse clôturée. Parfait pour dépenser l’énergie avant le lunch.'' },
],
},
''Verdun_parcs'': {
titre:''Verdun au naturel'',
emoji:''🌿'',
etapes:[
{ heure:''10h00'', icon:''🌿'', lieu:''Parc des Rapides'',  desc:''Sentiers longeant le Saint-Laurent. Ambiance sauvage à 5 min de chez vous.'' },
{ heure:''12h00'', icon:''🍽️'', lieu:''Dépanneur Le Pick Up'', desc:''Lunch en terrasse avec les habitués de Verdun. Ambiance authentique garantie.'' },
{ heure:''14h00'', icon:''🌿'', lieu:''Parc Angrignon'',    desc:''Zone hors-laisse pour finir la journée. Le plus grand espace canin de l’île.'' },
],
},
''Plateau-Mont-Royal_restos'': {
titre:''Plateau gourmand avec toutou'',
emoji:''🍽️'',
etapes:[
{ heure:''11h00'', icon:''🐾'', lieu:''Parc Sir-Wilfrid-Laurier'', desc:''Commencez par dépenser l’énergie dans la zone hors-laisse clôturée.'' },
{ heure:''12h30'', icon:''🍽️'', lieu:''Le Chien Fumant'',  desc:''Brunch en terrasse dans la ruelle. Le nom dit tout !'' },
{ heure:''14h30'', icon:''☕'', lieu:''Café Névé'',         desc:''Café de spécialité pour finir en beauté. Terrasse dog-friendly.'' },
],
},
};

const ITINERAIRES_ESCAPADE = {
''Charlevoix_weekend'': {
titre:''Weekend magique à Charlevoix'',
emoji:''🏔️'',
jours:[
{ jour:''Vendredi soir'', etapes:[
{ heure:''17h00'', icon:''🚗'', lieu:''Départ Montréal'',        desc:''3h de route vers Charlevoix. Arrêt recommandé à Baie-Saint-Paul.'' },
{ heure:''20h00'', icon:''⛺'', lieu:''Arrivée à l’hébergement'', desc:''Installez-vous et profitez de la soirée en plein air.'' },
]},
{ jour:''Samedi'', etapes:[
{ heure:''8h00'',  icon:''🥾'', lieu:''Parc des Hautes-Gorges'',  desc:''Le sentier de la rivière Malbaie. Spectaculaire. Chiens admis sur la majorité des sentiers.'' },
{ heure:''12h00'', icon:''🍱'', lieu:''Pique-nique en forêt'',    desc:''Pause méritée au bord de la rivière. Votre chien peut se baigner !'' },
{ heure:''15h00'', icon:''🐋'', lieu:''Tadoussac – Observation'', desc:''Croisière aux baleines. Chiens admis sur le pont extérieur. Inoubliable.'' },
]},
{ jour:''Dimanche'', etapes:[
{ heure:''9h00'',  icon:''🌿'', lieu:''Baie-Saint-Paul – Rando'', desc:''Sentiers bucoliques avec vue sur le fleuve. Chiens très bienvenus.'' },
{ heure:''13h00'', icon:''🚗'', lieu:''Retour Montréal'',         desc:''Des souvenirs plein la tête et un chien épuisé — la combinaison parfaite.'' },
]},
],
},
''Laurentides_weekend'': {
titre:''Ressourcement dans les Laurentides'',
emoji:''🌲'',
jours:[
{ jour:''Samedi matin'', etapes:[
{ heure:''8h00'',  icon:''🚗'', lieu:''Départ Montréal'',         desc:''1h30 de route. La nature vous attend !'' },
{ heure:''9h30'',  icon:''🥾'', lieu:''Forêt Ouareau – Rawdon'',  desc:''Sentiers de rivière, cascades, liberté totale pour votre chien.'' },
{ heure:''12h30'', icon:''🍱'', lieu:''Pique-nique au bord de l’eau'', desc:''Cascades en fond sonore. Parfait.'' },
]},
{ jour:''Samedi après-midi'', etapes:[
{ heure:''14h00'', icon:''⛺'', lieu:''Camping Domaine du Lac Brown'', desc:''Arrivée au camping. Lac privé, forêt dense, zéro stress pour les chiens.'' },
{ heure:''16h00'', icon:''🏊'', lieu:''Baignade au lac'',          desc:''Votre chien va devenir accro à l’eau, c’est garanti.'' },
]},
{ jour:''Dimanche'', etapes:[
{ heure:''9h00'',  icon:''🥾'', lieu:''Sentiers du camping'',     desc:''Exploration matinale en forêt avant le retour.'' },
{ heure:''12h00'', icon:''🚗'', lieu:''Retour Montréal'',         desc:''Week-end accompli. Un chien heureux, un maître ressourcé.'' },
]},
],
},
};

// ─── UTILS ─────────────────────────────────────────────────────────
function catColor(id) { return CAT.find(c=>c.id===id)?.color || T.terra; }
function catIcon(id)  { return CAT.find(c=>c.id===id)?.icon  || ''📍''; }
function catLabel(id) { return CAT.find(c=>c.id===id)?.label || id; }

// ─── SHARED UI ─────────────────────────────────────────────────────

function SeasonBadge({ text }) {
if (!text) return null;
return (
<div style={{
background:T.amberLt, border:`1px solid ${T.amber}50`,
borderRadius:10, padding:''8px 12px'',
fontSize:12, color:''#7A5010'', lineHeight:1.6,
fontFamily:''‘Lora’,Georgia,serif'',
}}>⚠️ {text}</div>
);
}

function ConfBadge({ n }) {
return (
<span style={{
background:T.sageLt, color:T.sageDk,
fontSize:10, fontWeight:800, padding:''3px 8px'',
borderRadius:20, letterSpacing:''0.3px'',
}}>✓ {n} Baladours ont confirmé</span>
);
}

function TagChip({ label, color }) {
return (
<span style={{
background: color ? color+''15'' : T.cream,
color: color || T.deep, border:`1px solid ${color ? color+"30" : T.stone}`,
fontSize:10, fontWeight:700, padding:''3px 9px'',
borderRadius:20, letterSpacing:''0.3px'',
}}>{label}</span>
);
}

function Btn({ children, onClick, variant=''primary'', full, small }) {
const styles = {
primary: { bg:`linear-gradient(135deg,${T.terra},${T.terraDk})`, color:''white'', border:''none'', shadow:`0 4px 16px ${T.terra}35` },
secondary:{ bg:''white'', color:T.deep, border:`2px solid ${T.stone}`, shadow:''none'' },
sage:     { bg:`linear-gradient(135deg,${T.sage},${T.sageDk})`, color:''white'', border:''none'', shadow:`0 4px 16px ${T.sage}35` },
ghost:    { bg:T.parch, color:T.muted, border:`1.5px solid ${T.stone}`, shadow:''none'' },
};
const s = styles[variant];
return (
<button onClick={onClick} style={{
background:s.bg, color:s.color, border:s.border || ''none'',
borderRadius:14, padding: small?''9px 14px'':''13px 18px'',
fontSize: small?12:14, fontWeight:800, cursor:''pointer'',
fontFamily:''‘Nunito’,sans-serif'', width:full?''100%'':''auto'',
boxShadow:s.shadow, letterSpacing:''0.2px'',
display:''flex'', alignItems:''center'', justifyContent:''center'', gap:6,
}}>{children}</button>
);
}

function BottomNav({ screen, go }) {
const tabs = [
{ id:''home'',       icon:''🏠'', label:''Accueil'' },
{ id:''ville'',      icon:''🏙️'', label:''En ville'' },
{ id:''escapade'',   icon:''🌲'', label:''Escapade'' },
{ id:''contribuer'', icon:''➕'', label:''Contribuer'' },
];
return (
<nav style={{
position:''fixed'', bottom:0, left:''50%'', transform:''translateX(-50%)'',
width:''100%'', maxWidth:480,
background:''rgba(251,247,242,0.97)'', backdropFilter:''blur(20px)'',
borderTop:`1.5px solid ${T.stone}`,
padding:''10px 4px 22px'',
display:''flex'', justifyContent:''space-around'', zIndex:900,
}}>
{tabs.map(t=>(
<button key={t.id} onClick={()=>go(t.id)} style={{
background: screen===t.id ? T.terra+''12'' : ''none'',
border:''none'', cursor:''pointer'', borderRadius:12,
padding:''6px 12px'',
display:''flex'', flexDirection:''column'', alignItems:''center'', gap:2,
}}>
<span style={{ fontSize:22 }}>{t.icon}</span>
<span style={{ fontSize:9, fontWeight:900, letterSpacing:''0.8px'',
color: screen===t.id ? T.terra : T.warm,
textTransform:''uppercase'' }}>{t.label}</span>
{screen===t.id && <div style={{ width:4, height:4, borderRadius:''50%'', background:T.terra }}/>}
</button>
))}
</nav>
);
}

// ─── LIEU CARD ─────────────────────────────────────────────────────
function LieuCard({ lieu, onOpen, idx=0 }) {
const [vis, setVis] = useState(false);
useEffect(()=>{ const t=setTimeout(()=>setVis(true),idx*60); return()=>clearTimeout(t); },[idx]);
const col = catColor(lieu.cat);

return (
<div onClick={()=>onOpen(lieu)} style={{
background:T.bgCard, borderRadius:20,
border:`1.5px solid ${T.stone}`,
padding:16, cursor:''pointer'',
boxShadow:''0 2px 16px rgba(0,0,0,0.05)'',
opacity:vis?1:0, transform:vis?''translateY(0)'':''translateY(14px)'',
transition:''opacity 0.4s ease, transform 0.4s ease'',
}}>
{/* Top row */}
<div style={{ display:''flex'', justifyContent:''space-between'', alignItems:''flex-start'', marginBottom:6 }}>
<div style={{ flex:1 }}>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:16, fontWeight:800,
color:T.bark, lineHeight:1.25 }}>{lieu.name}</div>
<div style={{ fontSize:11, color:T.muted, fontWeight:700, marginTop:2,
textTransform:''uppercase'', letterSpacing:''0.5px'' }}>
{catIcon(lieu.cat)} {catLabel(lieu.cat)} · {lieu.quartier}
</div>
</div>
{lieu.politique && (
<div style={{
background:col+''15'', color:col, borderRadius:10,
padding:''4px 9px'', fontSize:10, fontWeight:800,
whiteSpace:''nowrap'', marginLeft:8, border:`1px solid ${col}25`,
}}>🐕 {lieu.politique.split('' '').slice(0,3).join('' '')}</div>
)}
</div>

```
  <p style={{ fontSize:13, color:T.deep, lineHeight:1.65, margin:"8px 0 10px",
    fontFamily:"'Lora',Georgia,serif", fontSize:14 }}>{lieu.desc}</p>

  {lieu.saison && <div style={{ marginBottom:10 }}><SeasonBadge text={lieu.saison} /></div>}

  <div style={{ display:"flex", flexWrap:"wrap", gap:5, alignItems:"center" }}>
    {lieu.tags.map(t=><TagChip key={t} label={t} color={col} />)}
    <ConfBadge n={lieu.confirmations} />
  </div>
</div>
```

);
}

// ─── BALADOU REPORTER WIDGET ───────────────────────────────────────
function ReporterWidget({ lieux, onConfirm, onOpenLieu }) {
const [query, setQuery]       = useState('''');
const [results, setResults]   = useState([]);
const [confirmed, setConfirmed] = useState({}); // id -> ''ok''|''warn''|''detail''
const [detail, setDetail]     = useState({}); // id -> string
const [showDetail, setShowDetail] = useState(null);

// Live search floue — gère fautes de frappe, synonymes, accents
useEffect(()=>{
if (query.trim().length < 2) { setResults([]); return; }
setResults(fuzzySearch(query, lieux).slice(0, 5));
}, [query, lieux]);

const handleConfirm = (lieu, type) => {
setConfirmed(c=>({…c, [lieu.id]:type}));
if (type===''ok'') onConfirm(lieu.id);
if (type===''detail'') setShowDetail(lieu.id);
};

return (
<div style={{
background:`linear-gradient(135deg,${T.terraLt},#FDE8DC)`,
borderRadius:20, padding:16, marginBottom:16,
border:`1.5px solid ${T.terra}30`,
}}>
{/* Header */}
<div style={{ display:''flex'', alignItems:''center'', gap:10, marginBottom:12 }}>
<div style={{
width:38, height:38, borderRadius:12,
background:`linear-gradient(135deg,${T.terra},${T.terraDk})`,
display:''flex'', alignItems:''center'', justifyContent:''center'', fontSize:18,
}}>🐾</div>
<div>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:15, fontWeight:800,
color:T.bark }}>Vous revenez d’une sortie ?</div>
<div style={{ fontSize:12, color:T.terraDk, lineHeight:1.4 }}>
Confirmez un lieu en 2 taps — ça aide tout le monde !
</div>
</div>
</div>

```
  {/* Search */}
  <div style={{
    background:"white", borderRadius:12, padding:"10px 13px",
    display:"flex", alignItems:"center", gap:8,
    border:`1.5px solid ${T.terra}30`,
    boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
  }}>
    <span style={{ fontSize:15, opacity:0.5 }}>🔍</span>
    <input
      value={query}
      onChange={e=>setQuery(e.target.value)}
      placeholder="Tapez le nom du lieu visité..."
      style={{
        background:"none", border:"none", color:T.bark,
        fontSize:14, flex:1, fontFamily:"'Nunito',sans-serif", outline:"none",
      }}
    />
    {query && (
      <span onClick={()=>{ setQuery(""); setResults([]); }}
        style={{ fontSize:13, color:T.muted, cursor:"pointer" }}>✕</span>
    )}
  </div>

  {/* Results */}
  {results.length > 0 && (
    <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
      {results.map(lieu => {
        const col = catColor(lieu.cat);
        const c = confirmed[lieu.id];
        return (
          <div key={lieu.id} style={{
            background:"white", borderRadius:14, padding:"12px 14px",
            border:`1.5px solid ${c ? (c==="ok"?T.sage:c==="warn"?T.amber:T.slate)+"50" : T.stone}`,
            transition:"all 0.2s",
          }}>
            {/* Lieu info */}
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:c?0:10 }}>
              <div style={{ cursor:"pointer" }} onClick={()=>onOpenLieu(lieu)}>
                <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:14,
                  fontWeight:800, color:T.bark }}>{lieu.name}</div>
                <div style={{ fontSize:11, color:T.muted, fontWeight:700, marginTop:1 }}>
                  {catIcon(lieu.cat)} {lieu.quartier}
                </div>
              </div>
              <div style={{ background:col+"15", color:col, borderRadius:8,
                padding:"3px 8px", fontSize:10, fontWeight:800, marginLeft:8 }}>
                🐕 {lieu.politique.split(" ").slice(0,2).join(" ")}
              </div>
            </div>

            {/* Confirmed state */}
            {c === "ok" && (
              <div style={{ display:"flex", alignItems:"center", gap:6,
                padding:"8px 0 0", borderTop:`1px solid ${T.stone}` }}>
                <span style={{ fontSize:16 }}>✅</span>
                <span style={{ fontSize:13, color:T.sageDk, fontWeight:700 }}>
                  Merci ! Confirmation enregistrée.
                </span>
              </div>
            )}
            {c === "warn" && (
              <div style={{ padding:"8px 0 0", borderTop:`1px solid ${T.stone}` }}>
                <div style={{ fontSize:13, color:"#8B5E2A", fontWeight:700, marginBottom:6 }}>
                  ⚠️ Merci de nous le signaler. Quelle correction ?
                </div>
                <textarea
                  value={detail[lieu.id]||""}
                  onChange={e=>setDetail(d=>({...d,[lieu.id]:e.target.value}))}
                  placeholder="Ex : La terrasse est maintenant fermée aux chiens..."
                  rows={2}
                  style={{
                    width:"100%", borderRadius:10, border:`1.5px solid ${T.amber}50`,
                    padding:"8px 10px", fontSize:13, color:T.bark, outline:"none",
                    fontFamily:"'Lora',Georgia,serif", resize:"none",
                    background:T.amberLt,
                  }}
                />
                <button onClick={()=>setConfirmed(c=>({...c,[lieu.id]:"sent"}))} style={{
                  marginTop:6, background:T.amber, color:"white", border:"none",
                  borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:800,
                  cursor:"pointer", fontFamily:"'Nunito',sans-serif",
                }}>Envoyer le signalement</button>
              </div>
            )}
            {c === "sent" && (
              <div style={{ display:"flex", alignItems:"center", gap:6,
                padding:"8px 0 0", borderTop:`1px solid ${T.stone}` }}>
                <span style={{ fontSize:16 }}>📩</span>
                <span style={{ fontSize:13, color:T.muted, fontWeight:700 }}>
                  Signalement envoyé — merci pour la communauté !
                </span>
              </div>
            )}
            {c === "detail" && showDetail===lieu.id && (
              <div style={{ padding:"8px 0 0", borderTop:`1px solid ${T.stone}` }}>
                <div style={{ fontSize:13, color:T.slate, fontWeight:700, marginBottom:6 }}>
                  ➕ Quel détail souhaitez-vous ajouter ?
                </div>
                <textarea
                  value={detail[lieu.id]||""}
                  onChange={e=>setDetail(d=>({...d,[lieu.id]:e.target.value}))}
                  placeholder="Ex : Ils acceptent maintenant les chiens à l'intérieur le soir..."
                  rows={2}
                  style={{
                    width:"100%", borderRadius:10, border:`1.5px solid ${T.slate}40`,
                    padding:"8px 10px", fontSize:13, color:T.bark, outline:"none",
                    fontFamily:"'Lora',Georgia,serif", resize:"none", background:T.slateLt,
                  }}
                />
                <button onClick={()=>setConfirmed(c=>({...c,[lieu.id]:"sent"}))} style={{
                  marginTop:6, background:T.slate, color:"white", border:"none",
                  borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:800,
                  cursor:"pointer", fontFamily:"'Nunito',sans-serif",
                }}>Ajouter ce détail</button>
              </div>
            )}

            {/* Action buttons — only if not yet confirmed */}
            {!c && (
              <div style={{ display:"flex", gap:7 }}>
                <button onClick={()=>handleConfirm(lieu,"ok")} style={{
                  flex:1, background:T.sageLt, color:T.sageDk,
                  border:`1.5px solid ${T.sage}40`, borderRadius:10,
                  padding:"8px 6px", fontSize:11, fontWeight:800,
                  cursor:"pointer", fontFamily:"'Nunito',sans-serif",
                }}>✅ Toujours ok !</button>
                <button onClick={()=>handleConfirm(lieu,"warn")} style={{
                  flex:1, background:T.amberLt, color:"#8B5E2A",
                  border:`1.5px solid ${T.amber}40`, borderRadius:10,
                  padding:"8px 6px", fontSize:11, fontWeight:800,
                  cursor:"pointer", fontFamily:"'Nunito',sans-serif",
                }}>⚠️ À corriger</button>
                <button onClick={()=>handleConfirm(lieu,"detail")} style={{
                  flex:1, background:T.slateLt, color:T.slate,
                  border:`1.5px solid ${T.slate}40`, borderRadius:10,
                  padding:"8px 6px", fontSize:11, fontWeight:800,
                  cursor:"pointer", fontFamily:"'Nunito',sans-serif",
                }}>➕ Détail</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}

  {/* Empty state after typing */}
  {query.length >= 2 && results.length === 0 && (
    <div style={{ marginTop:10, textAlign:"center", padding:"12px 0" }}>
      <p style={{ fontSize:13, color:T.muted, fontFamily:"'Lora',Georgia,serif",
        fontStyle:"italic" }}>
        Lieu introuvable ? <span style={{ color:T.terra, fontWeight:700,
          cursor:"pointer", textDecoration:"underline" }}>Ajoutez-le ici →</span>
      </p>
    </div>
  )}
</div>
```

);
}

// ─── SCREEN: HOME ──────────────────────────────────────────────────
function HomeScreen({ lieux, go, openLieu, onConfirm }) {
const [entered, setEntered] = useState(false);
useEffect(()=>{ setTimeout(()=>setEntered(true),80); },[]);

const highlights = lieux.filter(l=>l.confirmations>30).slice(0,3);

return (
<div style={{ paddingBottom:100 }}>
{/* Hero */}
<div style={{
background:`linear-gradient(155deg,${T.soil} 0%,${T.bark} 55%,#2A1808 100%)`,
padding:''56px 22px 32px'', position:''relative'', overflow:''hidden'',
opacity:entered?1:0, transition:''opacity 0.6s ease'',
}}>
{/* Decorative circles */}
<div style={{ position:''absolute'',top:-60,right:-60,width:240,height:240,
background:`radial-gradient(circle,${T.terra}22 0%,transparent 70%)`,borderRadius:''50%'',pointerEvents:''none'' }}/>
<div style={{ position:''absolute'',bottom:-40,left:-40,width:160,height:160,
background:`radial-gradient(circle,${T.sage}18 0%,transparent 70%)`,borderRadius:''50%'',pointerEvents:''none'' }}/>
<div style={{ position:''absolute'',top:''30%'',right:''10%'',width:80,height:80,
background:`radial-gradient(circle,${T.gold}18 0%,transparent 70%)`,borderRadius:''50%'',pointerEvents:''none'' }}/>

```
    <div style={{ position:"relative" }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{
          width:52, height:52, borderRadius:16,
          background:`linear-gradient(135deg,${T.terra},${T.terraDk})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:26, boxShadow:`0 4px 16px ${T.terra}50`,
        }}>🐾</div>
        <div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:30, fontWeight:900,
            color:"white", letterSpacing:"-0.5px", lineHeight:1.1 }}>Baladou</div>
          <div style={{ fontSize:10, color:T.terra, letterSpacing:"3px",
            textTransform:"uppercase", fontWeight:800 }}>Québec · Dog-friendly</div>
        </div>
      </div>

      {/* Slogan */}
      <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:18, color:"rgba(255,255,255,0.75)",
        fontStyle:"italic", lineHeight:1.5, marginBottom:24 }}>
        "Sortez ensemble."
      </p>

      {/* Two mode buttons */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <button onClick={()=>go("ville")} style={{
          background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.2)",
          borderRadius:16, padding:"14px 12px", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4,
        }}>
          <span style={{ fontSize:24 }}>🏙️</span>
          <span style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:"white", lineHeight:1.2 }}>En ville</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.4 }}>
            Explorer un quartier
          </span>
        </button>
        <button onClick={()=>go("escapade")} style={{
          background:`linear-gradient(135deg,${T.terra}CC,${T.terraDk}CC)`,
          border:"1.5px solid rgba(255,255,255,0.15)",
          borderRadius:16, padding:"14px 12px", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4,
          boxShadow:`0 4px 20px ${T.terra}40`,
        }}>
          <span style={{ fontSize:24 }}>🌲</span>
          <span style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:"white", lineHeight:1.2 }}>Escapade</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.75)", lineHeight:1.4 }}>
            Weekend & randonnées
          </span>
        </button>
      </div>
    </div>
  </div>

  <div style={{ padding:"20px 16px 0" }}>

    {/* Baladou Reporter */}
    <ReporterWidget lieux={lieux} onConfirm={onConfirm} onOpenLieu={openLieu} />

    {/* Contribute CTA */}
    <button onClick={()=>go("contribuer")} style={{
      width:"100%", background:T.sageLt,
      border:`1.5px solid ${T.sage}40`, borderRadius:16,
      padding:"13px 16px", cursor:"pointer", marginBottom:20,
      display:"flex", alignItems:"center", gap:12,
    }}>
      <span style={{ fontSize:24 }}>➕</span>
      <div style={{ textAlign:"left" }}>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:14, fontWeight:800,
          color:T.sageDk }}>Vous connaissez un endroit dog-friendly ?</div>
        <div style={{ fontSize:12, color:T.sage, marginTop:1 }}>
          Ajoutez-le — ça prend 60 secondes !
        </div>
      </div>
      <span style={{ marginLeft:"auto", color:T.sage, fontSize:18 }}>→</span>
    </button>

    {/* Highlights */}
    <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:20, fontWeight:900,
      color:T.bark, marginBottom:4 }}>✨ Les plus confirmés</div>
    <p style={{ fontSize:13, color:T.muted, marginBottom:14,
      fontFamily:"'Lora',Georgia,serif", fontStyle:"italic" }}>
      Validés par la communauté Baladou
    </p>
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {highlights.map((l,i)=><LieuCard key={l.id} lieu={l} onOpen={openLieu} idx={i} />)}
    </div>

    {/* Stats banner */}
    <div style={{
      background:`linear-gradient(135deg,${T.bark},${T.soil})`,
      borderRadius:20, padding:20, marginTop:20,
      display:"grid", gridTemplateColumns:"1fr 1fr 1fr", textAlign:"center",
    }}>
      {[
        { n:`${lieux.length}+`, label:"Lieux" },
        { n:"7", label:"Catégories" },
        { n:"100%", label:"Gratuit" },
      ].map((s,i)=>(
        <div key={i} style={{ borderRight: i<2?`1px solid rgba(255,255,255,0.1)`:"none" }}>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:22, fontWeight:900,
            color:T.terra }}>{s.n}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

);
}

// ─── SCREEN: EN VILLE ──────────────────────────────────────────────
function VilleScreen({ lieux, openLieu }) {
const [quartier, setQuartier] = useState('''');
const [cat, setCat] = useState(''all'');
const [recherche, setRecherche] = useState('''');

const cityLieux = lieux.filter(l =>
[''cafes'',''restos'',''boutiques'',''parcs'',''activites''].includes(l.cat)
);

const filtered = useMemo(() => {
// Filtre quartier et catégorie d’abord
const prefiltered = cityLieux.filter(l => {
const matchQ = !quartier || l.quartier === quartier;
const matchC = cat===''all'' || l.cat===cat;
return matchQ && matchC;
});
// Puis recherche floue sur le texte
return recherche.trim().length >= 2
? fuzzySearch(recherche, prefiltered)
: prefiltered;
}, [recherche, quartier, cat, lieux]);

return (
<div style={{ paddingBottom:100 }}>
{/* Header */}
<div style={{
background:`linear-gradient(150deg,${T.bark},#3A2010)`,
padding:''52px 20px 22px'',
}}>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', marginBottom:4 }}>🏙️ En ville</div>
<p style={{ fontSize:13, color:''rgba(255,255,255,0.55)'',
fontFamily:''‘Lora’,Georgia,serif'', fontStyle:''italic'', marginBottom:16 }}>
Trouvez les adresses dog-friendly dans votre quartier
</p>

```
    {/* Search */}
    <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:14,
      padding:"10px 14px", display:"flex", alignItems:"center", gap:8,
      border:"1.5px solid rgba(255,255,255,0.12)", marginBottom:10 }}>
      <span style={{ fontSize:16, opacity:0.6 }}>🔍</span>
      <input value={recherche} onChange={e=>setRecherche(e.target.value)}
        placeholder="Rechercher un lieu..."
        style={{ background:"none", border:"none", color:"white", fontSize:14,
          flex:1, fontFamily:"'Nunito',sans-serif", outline:"none" }}/>
      {recherche && <span onClick={()=>setRecherche("")} style={{ fontSize:14,
        color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>✕</span>}
    </div>

    {/* Quartier selector */}
    <select value={quartier} onChange={e=>setQuartier(e.target.value)} style={{
      width:"100%", background:"rgba(255,255,255,0.1)",
      border:"1.5px solid rgba(255,255,255,0.15)",
      borderRadius:12, padding:"10px 14px",
      color: quartier ? "white" : "rgba(255,255,255,0.5)",
      fontSize:14, fontFamily:"'Nunito',sans-serif", outline:"none",
    }}>
      <option value="">📍 Tous les quartiers</option>
      {QUARTIERS.map(q=><option key={q} value={q} style={{ color:T.bark }}>{q}</option>)}
    </select>
  </div>

  {/* Category pills */}
  <div style={{ background:"white", borderBottom:`1.5px solid ${T.stone}`,
    padding:"12px 16px", display:"flex", gap:8, overflowX:"auto" }}>
    <button onClick={()=>setCat("all")} style={{
      flexShrink:0, padding:"8px 14px", borderRadius:20,
      border:`2px solid ${cat==="all"?T.terra:T.stone}`,
      background:cat==="all"?T.terra+"15":"white",
      color:cat==="all"?T.terra:T.muted,
      fontWeight:800, fontSize:12, cursor:"pointer",
      fontFamily:"'Nunito',sans-serif", whiteSpace:"nowrap",
    }}>🐾 Tout</button>
    {CAT.filter(c=>["cafes","restos","boutiques","parcs","activites"].includes(c.id)).map(c=>(
      <button key={c.id} onClick={()=>setCat(c.id)} style={{
        flexShrink:0, padding:"8px 14px", borderRadius:20,
        border:`2px solid ${cat===c.id?c.color:T.stone}`,
        background:cat===c.id?c.color+"15":"white",
        color:cat===c.id?c.color:T.muted,
        fontWeight:800, fontSize:12, cursor:"pointer",
        fontFamily:"'Nunito',sans-serif", whiteSpace:"nowrap",
      }}>{c.icon} {c.label}</button>
    ))}
  </div>

  {/* Results */}
  <div style={{ padding:"14px 16px 0" }}>
    <div style={{ fontSize:12, color:T.muted, fontWeight:700,
      textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>
      <span style={{ color:T.terra, fontSize:16, fontWeight:900 }}>{filtered.length}</span>
      {" "}lieu{filtered.length>1?"x":""} trouvé{filtered.length>1?"s":""}
      {quartier && ` dans ${quartier}`}
    </div>

    {filtered.length===0 ? (
      <div style={{ textAlign:"center", padding:"50px 0" }}>
        <div style={{ fontSize:48 }}>🐕</div>
        <p style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:17,
          color:T.deep, marginTop:12 }}>Aucun lieu trouvé</p>
        <p style={{ fontSize:13, color:T.muted, marginTop:6, lineHeight:1.6 }}>
          Essayez un autre quartier ou une autre catégorie
        </p>
      </div>
    ) : (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map((l,i)=><LieuCard key={l.id} lieu={l} onOpen={openLieu} idx={i} />)}
      </div>
    )}
  </div>
</div>
```

);
}

// ─── SCREEN: ESCAPADE ──────────────────────────────────────────────
function EscapadeScreen({ lieux, openLieu }) {
const [mode, setMode] = useState(''accueil''); // accueil | generateur | resultat | randos | campings
const [prefs, setPrefs] = useState({ destination:'''', duree:''weekend'', gabarit:''moyen'', saison:''ete'' });
const [itinerary, setItinerary] = useState(null);
const [loading, setLoading] = useState(false);

const set = (k,v) => setPrefs(p=>({…p,[k]:v}));

const generate = () => {
setLoading(true);
setMode(''loading'');
setTimeout(()=>{
const key = `${prefs.destination}_${prefs.duree}`;
const res = ITINERAIRES_ESCAPADE[key] || ITINERAIRES_ESCAPADE[''Charlevoix_weekend''];
setItinerary(res);
setMode(''resultat'');
setLoading(false);
}, 2200);
};

const randos = lieux.filter(l=>l.cat===''randonees'');
const campings = lieux.filter(l=>l.cat===''campings'');

if (mode===''randos'') return (
<div style={{ paddingBottom:100 }}>
<div style={{ background:`linear-gradient(150deg,#3A4A20,#2A3A15)`, padding:''52px 20px 22px'' }}>
<button onClick={()=>setMode(''accueil'')} style={{
background:''rgba(255,255,255,0.15)'', border:''none'', borderRadius:10,
padding:''7px 14px'', color:''white'', fontSize:12, fontWeight:700,
cursor:''pointer'', marginBottom:14, fontFamily:''‘Nunito’,sans-serif'',
}}>← Retour</button>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', marginBottom:4 }}>🥾 Randonnées</div>
<p style={{ fontSize:13, color:''rgba(255,255,255,0.55)'', fontFamily:''‘Lora’,Georgia,serif'',
fontStyle:''italic'' }}>Sentiers dog-friendly au Québec · Infos saisonnières incluses</p>
</div>
<div style={{ padding:''16px 16px 0'', display:''flex'', flexDirection:''column'', gap:12 }}>
{randos.map((l,i)=><LieuCard key={l.id} lieu={l} onOpen={openLieu} idx={i} />)}
</div>
</div>
);

if (mode===''campings'') return (
<div style={{ paddingBottom:100 }}>
<div style={{ background:`linear-gradient(150deg,#3A3A20,#2A2A15)`, padding:''52px 20px 22px'' }}>
<button onClick={()=>setMode(''accueil'')} style={{
background:''rgba(255,255,255,0.15)'', border:''none'', borderRadius:10,
padding:''7px 14px'', color:''white'', fontSize:12, fontWeight:700,
cursor:''pointer'', marginBottom:14, fontFamily:''‘Nunito’,sans-serif'',
}}>← Retour</button>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', marginBottom:4 }}>⛺ Campings</div>
<p style={{ fontSize:13, color:''rgba(255,255,255,0.55)'', fontFamily:''‘Lora’,Georgia,serif'',
fontStyle:''italic'' }}>Campings dog-friendly · Saison estivale 2026</p>
</div>
<div style={{ padding:''16px 16px 0'', display:''flex'', flexDirection:''column'', gap:12 }}>
{campings.map((l,i)=><LieuCard key={l.id} lieu={l} onOpen={openLieu} idx={i} />)}
</div>
</div>
);

if (mode===''generateur'') return (
<div style={{ paddingBottom:100 }}>
<div style={{ background:`linear-gradient(150deg,${T.bark},#2A3A18)`, padding:''52px 20px 22px'' }}>
<button onClick={()=>setMode(''accueil'')} style={{
background:''rgba(255,255,255,0.15)'', border:''none'', borderRadius:10,
padding:''7px 14px'', color:''white'', fontSize:12, fontWeight:700,
cursor:''pointer'', marginBottom:14, fontFamily:''‘Nunito’,sans-serif'',
}}>← Retour</button>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', marginBottom:4 }}>✨ Générer mon escapade</div>
<p style={{ fontSize:13, color:''rgba(255,255,255,0.55)'', fontFamily:''‘Lora’,Georgia,serif'',
fontStyle:''italic'' }}>Dites-nous vos envies, on s’occupe du reste</p>
</div>
<div style={{ padding:''16px 16px 0'' }}>
<div style={{ background:''white'', borderRadius:20, padding:18, border:`1.5px solid ${T.stone}` }}>

```
      {/* Destination */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
          letterSpacing:"1px", marginBottom:8 }}>Destination</div>
        <select value={prefs.destination} onChange={e=>set("destination",e.target.value)} style={{
          width:"100%", border:`2px solid ${T.stone}`, borderRadius:12,
          padding:"10px 14px", fontSize:14, color:T.bark,
          fontFamily:"'Nunito',sans-serif", outline:"none", background:"white",
        }}>
          <option value="">Choisir une région...</option>
          {DESTINATIONS_ESCAPADE.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Durée */}
      {[
        { label:"Durée", key:"duree",   opts:[["weekend","🌙","Weekend (2 jours)"],["semaine","☀️","Semaine complète"]] },
        { label:"Gabarit du chien", key:"gabarit", opts:[["petit","🐩","Petit (< 10 kg)"],["moyen","🐕","Moyen"],["grand","🐕‍🦺","Grand"]] },
        { label:"Saison", key:"saison", opts:[["ete","☀️","Été"],["automne","🍂","Automne"],["hiver","❄️","Hiver"],["printemps","🌸","Printemps"]] },
      ].map(row=>(
        <div key={row.key} style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
            letterSpacing:"1px", marginBottom:8 }}>{row.label}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {row.opts.map(([val,icon,txt])=>(
              <button key={val} onClick={()=>set(row.key,val)} style={{
                padding:"9px 13px", borderRadius:12, border:`2px solid`,
                borderColor: prefs[row.key]===val ? T.terra : T.stone,
                background: prefs[row.key]===val ? T.terraLt : "white",
                color: prefs[row.key]===val ? T.terraDk : T.muted,
                fontWeight:700, fontSize:12, cursor:"pointer",
                fontFamily:"'Nunito',sans-serif",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <span>{icon}</span><span>{txt}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <Btn onClick={generate} full>Créer mon escapade 🐾</Btn>
    </div>
  </div>
</div>
```

);

if (mode===''loading'') return (
<div style={{ display:''flex'', flexDirection:''column'', alignItems:''center'',
justifyContent:''center'', height:''80vh'', paddingBottom:100 }}>
<div style={{ fontSize:56, marginBottom:20,
animation:''pawbounce 0.7s ease-in-out infinite alternate'' }}>🐾</div>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:20, color:T.bark,
marginBottom:8 }}>On prépare votre aventure…</div>
<div style={{ fontSize:13, color:T.muted }}>Recherche des meilleurs spots dog-friendly</div>
<style>{`@keyframes pawbounce{from{transform:translateY(0) rotate(-5deg)}to{transform:translateY(-18px) rotate(5deg)}}`}</style>
</div>
);

if (mode===''resultat'' && itinerary) return (
<div style={{ paddingBottom:100 }}>
<div style={{
background:`linear-gradient(150deg,${T.bark},#2A3A18)`,
padding:''52px 20px 28px'',
}}>
<button onClick={()=>setMode(''generateur'')} style={{
background:''rgba(255,255,255,0.15)'', border:''none'', borderRadius:10,
padding:''7px 14px'', color:''white'', fontSize:12, fontWeight:700,
cursor:''pointer'', marginBottom:14, fontFamily:''‘Nunito’,sans-serif'',
}}>← Modifier</button>
<div style={{ fontSize:44, marginBottom:8 }}>{itinerary.emoji}</div>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', lineHeight:1.2, marginBottom:6 }}>{itinerary.titre}</div>
<div style={{ display:''flex'', gap:8, flexWrap:''wrap'' }}>
{[prefs.destination, prefs.duree===''weekend''?''Weekend'':''Semaine'',
prefs.saison.charAt(0).toUpperCase()+prefs.saison.slice(1)].filter(Boolean).map((v,i)=>(
<span key={i} style={{ background:''rgba(255,255,255,0.15)'', borderRadius:8,
padding:''4px 10px'', fontSize:11, color:''rgba(255,255,255,0.85)'', fontWeight:700 }}>{v}</span>
))}
</div>
</div>

```
  <div style={{ padding:"16px 16px 0" }}>
    {itinerary.jours.map((jour, ji)=>(
      <div key={ji} style={{ marginBottom:16 }}>
        <div style={{
          background:`linear-gradient(135deg,${T.terra}15,${T.terra}05)`,
          borderRadius:12, padding:"10px 14px", marginBottom:10,
          border:`1px solid ${T.terra}25`,
        }}>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:T.terraDk }}>{jour.jour}</div>
        </div>

        <div style={{ background:"white", borderRadius:18, padding:16,
          border:`1.5px solid ${T.stone}` }}>
          {jour.etapes.map((etape, ei)=>(
            <div key={ei} style={{ display:"flex", gap:14, position:"relative",
              paddingBottom: ei<jour.etapes.length-1?16:0,
              marginBottom: ei<jour.etapes.length-1?4:0 }}>
              {ei<jour.etapes.length-1 && (
                <div style={{ position:"absolute", left:21, top:44, bottom:0,
                  width:2, background:`linear-gradient(${T.terra}50,${T.terra}08)` }}/>
              )}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:44 }}>
                <div style={{ background:T.terraLt, borderRadius:"50%", width:44, height:44,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:20, border:`2px solid ${T.terra}25`, flexShrink:0 }}>
                  {etape.icon}
                </div>
                <div style={{ fontSize:10, color:T.terra, fontWeight:800,
                  marginTop:4, textAlign:"center", lineHeight:1.2 }}>{etape.heure}</div>
              </div>
              <div style={{ paddingTop:4 }}>
                <div style={{ fontWeight:800, fontSize:14, color:T.bark }}>{etape.lieu}</div>
                <div style={{ fontSize:13, color:T.deep, lineHeight:1.6, marginTop:3,
                  fontFamily:"'Lora',Georgia,serif", fontSize:14 }}>{etape.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Actions */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 }}>
      <Btn variant="secondary">📤 Partager</Btn>
      <Btn variant="ghost" onClick={()=>setMode("generateur")}>🔄 Refaire</Btn>
    </div>
  </div>
</div>
```

);

// Escapade accueil
return (
<div style={{ paddingBottom:100 }}>
<div style={{
background:`linear-gradient(150deg,${T.bark},#2C3A18)`,
padding:''52px 20px 28px'', position:''relative'', overflow:''hidden'',
}}>
<div style={{ position:''absolute'',top:-40,right:-40,width:180,height:180,
background:`radial-gradient(circle,${T.sage}20 0%,transparent 70%)`,borderRadius:''50%'',pointerEvents:''none'' }}/>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', marginBottom:6 }}>🌲 Escapade</div>
<p style={{ fontSize:14, color:''rgba(255,255,255,0.6)'', fontFamily:''‘Lora’,Georgia,serif'',
fontStyle:''italic'' }}>Weekends, randonnées et campings dog-friendly au Québec</p>
</div>

```
  <div style={{ padding:"16px 16px 0" }}>
    {/* Generator CTA */}
    <button onClick={()=>setMode("generateur")} style={{
      width:"100%",
      background:`linear-gradient(135deg,${T.terra},${T.terraDk})`,
      border:"none", borderRadius:20, padding:"20px 18px",
      cursor:"pointer", marginBottom:14,
      display:"flex", alignItems:"center", gap:14,
      boxShadow:`0 6px 24px ${T.terra}35`,
    }}>
      <div style={{ fontSize:40 }}>✨</div>
      <div style={{ textAlign:"left" }}>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:18, fontWeight:900,
          color:"white", lineHeight:1.2, marginBottom:4 }}>
          Générer mon itinéraire
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.5 }}>
          Destination · Durée · Gabarit · Saison{"\n"}→ Votre escapade sur mesure
        </div>
      </div>
    </button>

    {/* Quick access */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
      <button onClick={()=>setMode("randos")} style={{
        background:`linear-gradient(135deg,#3A4A20,#2A3A15)`,
        border:"none", borderRadius:16, padding:"16px 14px",
        cursor:"pointer", textAlign:"left",
      }}>
        <div style={{ fontSize:28, marginBottom:6 }}>🥾</div>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
          color:"white" }}>Randonnées</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:2 }}>
          {randos.length} sentiers dog-friendly
        </div>
      </button>
      <button onClick={()=>setMode("campings")} style={{
        background:`linear-gradient(135deg,#4A4020,#3A3015)`,
        border:"none", borderRadius:16, padding:"16px 14px",
        cursor:"pointer", textAlign:"left",
      }}>
        <div style={{ fontSize:28, marginBottom:6 }}>⛺</div>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
          color:"white" }}>Campings</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:2 }}>
          {campings.length} campings · Saison 2026
        </div>
      </button>
    </div>

    {/* Seasonal alert */}
    <div style={{ background:T.amberLt, borderRadius:16, padding:14,
      border:`1.5px solid ${T.amber}40`, marginBottom:16 }}>
      <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:14, fontWeight:800,
        color:"#7A5010", marginBottom:6 }}>⚠️ Info saison importante</div>
      <p style={{ fontSize:13, color:"#8B6020", lineHeight:1.65,
        fontFamily:"'Lora',Georgia,serif", fontSize:13 }}>
        Les sentiers admis aux chiens varient selon la saison dans les parcs nationaux du Québec.
        Toutes nos fiches indiquent les restrictions actuelles — vérifiez toujours avant de partir.
      </p>
    </div>
  </div>
</div>
```

);
}

// ─── FORM FIELD — défini HORS de tout composant parent pour éviter
//     le bug de perte de focus clavier sur mobile ──────────────────
function FormField({ label, fieldKey, placeholder, multi, required, form, errors, onChange }) {
return (
<div style={{ marginBottom:14 }}>
<label style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:''uppercase'',
letterSpacing:''0.8px'', display:''block'', marginBottom:5 }}>
{label}{required && <span style={{ color:T.terra }}> *</span>}
</label>
{multi ? (
<textarea
value={form[fieldKey]}
onChange={e=>onChange(fieldKey, e.target.value)}
placeholder={placeholder} rows={3}
style={{
width:''100%'', borderRadius:12,
border:`2px solid ${errors[fieldKey]?T.terra:T.stone}`,
padding:''10px 12px'', fontSize:14, color:T.bark, outline:''none'',
fontFamily:''‘Lora’,Georgia,serif'', resize:''vertical'',
background:errors[fieldKey]?''#FFF5F5'':''white'', lineHeight:1.55,
}}/>
) : (
<input
value={form[fieldKey]}
onChange={e=>onChange(fieldKey, e.target.value)}
placeholder={placeholder}
style={{
width:''100%'', borderRadius:12,
border:`2px solid ${errors[fieldKey]?T.terra:T.stone}`,
padding:''10px 12px'', fontSize:14, color:T.bark, outline:''none'',
fontFamily:''‘Nunito’,sans-serif'',
background:errors[fieldKey]?''#FFF5F5'':''white'',
}}/>
)}
{errors[fieldKey] && <div style={{ fontSize:11, color:T.terra, marginTop:3 }}>Champ obligatoire</div>}
</div>
);
}

// ─── SCREEN: CONTRIBUER ────────────────────────────────────────────
function ContribuerScreen({ onAdd, lieux }) {
const [etape, setEtape] = useState(0);
const [form, setForm] = useState({
mode:''ville'', cat:''cafes'', nom:'''', quartier:'''', autreQuartier:'''',
adresse:'''', politique:'''', horaires:'''', tel:'''', desc:'''', saison:'''',
sentiers:'''', difficulte:'''', distance:'''', saison_ouverture:'''', prenom:'''', chien:'''',
});
const [errors, setErrors] = useState({});
const [doublons, setDoublons] = useState([]);
const [doubalonIgnored, setDoublonIgnored] = useState(false);

const set = (k,v) => {
setForm(f=>({…f,[k]:v}));
// Recherche floue de doublons en temps réel
if (k===''nom'' && v.trim().length >= 3) {
const found = fuzzySearch(v, lieux).slice(0, 3);
setDoublons(found);
setDoublonIgnored(false);
} else if (k===''nom'' && v.trim().length < 3) {
setDoublons([]);
}
};

const validate = () => {
const e = {};
if (!form.nom.trim())       e.nom = true;
if (!form.quartier.trim())  e.quartier = true;
if (!form.desc.trim())      e.desc = true;
setErrors(e);
return Object.keys(e).length===0;
};

const quartierFinal = form.quartier===''Autre''
? (form.autreQuartier||''Autre'').trim()
: form.quartier;

const submit = () => {
if (!validate()) return;
onAdd({
id: Date.now(),
cat: form.cat,
name: form.nom,
quartier: quartierFinal,
desc: form.desc,
tags: [],
saison: form.saison || null,
sentiers: form.sentiers || null,
politique: form.politique,
horaires: form.horaires || null,
tel: form.tel || null,
adresse: form.adresse || null,
confirmations: 1,
lat: 45.50+(Math.random()-0.5)*0.08,
lng: -73.57+(Math.random()-0.5)*0.12,
});
setEtape(2);
};

if (etape===0) return (
<div style={{ paddingBottom:100 }}>
<div style={{ background:`linear-gradient(150deg,${T.bark},${T.sageDk})`,
padding:''52px 20px 28px'', position:''relative'', overflow:''hidden'' }}>
<div style={{ position:''absolute'',top:-40,right:-40,width:160,height:160,
background:`radial-gradient(circle,${T.sage}25 0%,transparent 70%)`,borderRadius:''50%'',pointerEvents:''none'' }}/>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'', marginBottom:6 }}>➕ Contribuer</div>
<p style={{ fontSize:14, color:''rgba(255,255,255,0.6)'', fontFamily:''‘Lora’,Georgia,serif'',
fontStyle:''italic'' }}>Ensemble, on construit la meilleure ressource dog-friendly du Québec</p>
</div>

```
  <div style={{ padding:"20px 16px 0" }}>
    {/* Why contribute */}
    <div style={{ background:T.sageLt, borderRadius:20, padding:18,
      border:`1.5px solid ${T.sage}40`, marginBottom:16 }}>
      <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:17, fontWeight:800,
        color:T.sageDk, marginBottom:12 }}>🐾 Pourquoi contribuer ?</div>
      {[
        { icon:"🗺️", text:"Plus on est de fous, plus la base de données est riche — et utile pour tout le monde." },
        { icon:"⚡", text:"60 secondes suffisent. On a voulu un formulaire ultra simple, pas un roman." },
        { icon:"🙏", text:"Votre chien vous remerciera. Et tous les autres chiens du Québec aussi." },
      ].map((item,i)=>(
        <div key={i} style={{ display:"flex", gap:10, marginBottom:i<2?10:0,
          paddingBottom:i<2?10:0, borderBottom:i<2?`1px solid ${T.sage}30`:"none" }}>
          <span style={{ fontSize:18 }}>{item.icon}</span>
          <p style={{ fontSize:13, color:T.sageDk, lineHeight:1.6,
            fontFamily:"'Lora',Georgia,serif" }}>{item.text}</p>
        </div>
      ))}
    </div>

    {/* Actions */}
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <button onClick={()=>setEtape(1)} style={{
        background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,
        border:"none", borderRadius:16, padding:"16px 18px",
        cursor:"pointer", display:"flex", alignItems:"center", gap:14,
        boxShadow:`0 4px 20px ${T.sage}35`,
      }}>
        <span style={{ fontSize:32 }}>📍</span>
        <div style={{ textAlign:"left" }}>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:16, fontWeight:800,
            color:"white" }}>Ajouter un lieu</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>
            Café, resto, parc, camping, boutique...
          </div>
        </div>
        <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.7)", fontSize:20 }}>→</span>
      </button>

      <div style={{ background:"white", borderRadius:16, padding:16,
        border:`1.5px solid ${T.stone}` }}>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
          color:T.bark, marginBottom:10 }}>✓ Confirmer un lieu existant</div>
        <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, marginBottom:12,
          fontFamily:"'Lora',Georgia,serif" }}>
          Vous avez visité un lieu listé sur Baladou ? Confirmez qu'il est toujours dog-friendly — ça prend 10 secondes et c'est très précieux pour la communauté.
        </p>
        <p style={{ fontSize:12, color:T.warm, fontStyle:"italic",
          fontFamily:"'Lora',Georgia,serif" }}>
          💡 Sur chaque fiche de lieu, vous trouverez un bouton "Confirmer ce lieu" en bas de page.
        </p>
      </div>
    </div>
  </div>
</div>
```

);

if (etape===2) return (
<div style={{ paddingBottom:100 }}>
<div style={{ background:`linear-gradient(150deg,${T.sageDk},#3A6A48)`,
padding:''52px 20px 24px'' }}>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:24, fontWeight:900,
color:''white'' }}>Merci ! 🎉</div>
</div>
<div style={{ padding:''40px 20px'', textAlign:''center'' }}>
<div style={{ fontSize:72, marginBottom:16 }}>🐾</div>
<h3 style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:22, color:T.bark,
marginBottom:10 }}>Lieu ajouté avec succès !</h3>
<p style={{ fontFamily:''‘Lora’,Georgia,serif'', fontSize:15, color:T.deep,
lineHeight:1.7, marginBottom:24 }}>
Merci de contribuer à la communauté Baladou. Votre ajout est maintenant visible dans l’application.
</p>
<div style={{ background:T.sageLt, borderRadius:16, padding:16, marginBottom:24,
border:`1.5px solid ${T.sage}40`, textAlign:''left'' }}>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:16, fontWeight:800,
color:T.bark, marginBottom:4 }}>{form.nom}</div>
<div style={{ fontSize:12, color:T.muted }}>
📍 {form.quartier===''Autre''?form.autreQuartier:form.quartier} · {CAT.find(c=>c.id===form.cat)?.label}
</div>
<div style={{ fontSize:12, color:T.sage, fontWeight:700, marginTop:6 }}>
🐕 {form.politique}
</div>
{form.prenom && (
<div style={{ fontSize:12, color:T.muted, marginTop:6, fontStyle:''italic'' }}>
Ajouté par {form.prenom}{form.chien ? ` & ${form.chien}` : ''''}
</div>
)}
</div>
<Btn onClick={()=>{ setEtape(0); setForm({ mode:''ville'',cat:''cafes'',nom:'''',quartier:'''',autreQuartier:'''',adresse:'''',politique:'''',horaires:'''',tel:'''',desc:'''',saison:'''',sentiers:'''',difficulte:'''',distance:'''',saison_ouverture:'''',prenom:'''',chien:'''' }); setErrors({}); }} full>
Ajouter un autre lieu
</Btn>
</div>
</div>
);

return (
<div style={{ paddingBottom:100 }}>
<div style={{ background:`linear-gradient(150deg,${T.bark},${T.sageDk})`,
padding:''52px 20px 22px'' }}>
<button onClick={()=>setEtape(0)} style={{
background:''rgba(255,255,255,0.15)'', border:''none'', borderRadius:10,
padding:''7px 14px'', color:''white'', fontSize:12, fontWeight:700,
cursor:''pointer'', marginBottom:14, fontFamily:''‘Nunito’,sans-serif'',
}}>← Retour</button>
<div style={{ fontFamily:''‘Fraunces’,Georgia,serif'', fontSize:22, fontWeight:900,
color:''white'', marginBottom:4 }}>📍 Ajouter un lieu</div>
<p style={{ fontSize:13, color:''rgba(255,255,255,0.55)'', fontFamily:''‘Lora’,Georgia,serif'',
fontStyle:''italic'' }}>4 champs obligatoires · 60 secondes</p>
</div>

```
  <div style={{ padding:"16px 16px 0" }}>

    {/* Mode selector */}
    <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:12,
      border:`1.5px solid ${T.stone}` }}>
      <div style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
        letterSpacing:"0.8px", marginBottom:12 }}>C'est plutôt...</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <button onClick={()=>set("mode","ville")} style={{
          padding:"12px", borderRadius:14, border:"2px solid",
          borderColor: form.mode==="ville" ? T.terra : T.stone,
          background: form.mode==="ville" ? T.terraLt : "white",
          cursor:"pointer", textAlign:"left",
        }}>
          <div style={{ fontSize:22, marginBottom:4 }}>🏙️</div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:14, fontWeight:800,
            color: form.mode==="ville" ? T.terraDk : T.bark }}>En ville</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2, lineHeight:1.4 }}>
            Café, resto, boutique, parc à chiens...
          </div>
        </button>
        <button onClick={()=>set("mode","escapade")} style={{
          padding:"12px", borderRadius:14, border:"2px solid",
          borderColor: form.mode==="escapade" ? T.sage : T.stone,
          background: form.mode==="escapade" ? T.sageLt : "white",
          cursor:"pointer", textAlign:"left",
        }}>
          <div style={{ fontSize:22, marginBottom:4 }}>🌲</div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:14, fontWeight:800,
            color: form.mode==="escapade" ? T.sageDk : T.bark }}>Escapade</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2, lineHeight:1.4 }}>
            Randonnée, camping, hébergement...
          </div>
        </button>
      </div>
    </div>

    {/* Category — contextual based on mode */}
    <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:12,
      border:`1.5px solid ${T.stone}` }}>
      <div style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
        letterSpacing:"0.8px", marginBottom:10 }}>Type de lieu</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {CAT.filter(c => {
          if (form.mode==="ville") return ["cafes","restos","boutiques","parcs","activites"].includes(c.id);
          return ["randonees","campings","activites"].includes(c.id);
        }).map(c=>(
          <button key={c.id} onClick={()=>set("cat",c.id)} style={{
            padding:"9px 13px", borderRadius:12, border:`2px solid`,
            borderColor: form.cat===c.id ? c.color : T.stone,
            background: form.cat===c.id ? c.color+"15" : "white",
            color: form.cat===c.id ? c.color : T.muted,
            fontWeight:700, fontSize:12, cursor:"pointer",
            fontFamily:"'Nunito',sans-serif",
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
    {/* Main fields */}
    <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:12,
      border:`1.5px solid ${T.stone}` }}>
      <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:16, fontWeight:800,
        color:T.bark, marginBottom:14 }}>Infos du lieu</div>

      <FormField fieldKey="nom" label="Nom du lieu" placeholder={
        form.cat==="randonees" ? "Ex : Parc national d'Oka" :
        form.cat==="campings"  ? "Ex : Camping du Lac Beauchamp" :
        "Ex : Café Le Fielder"
      } required form={form} errors={errors} onChange={set} />

      {/* Détection de doublons */}
      {doublons.length > 0 && !doubalonIgnored && (
        <div style={{
          background:T.amberLt, borderRadius:14, padding:14, marginBottom:14,
          border:`1.5px solid ${T.amber}60`,
        }}>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:14, fontWeight:800,
            color:"#8B5E2A", marginBottom:10 }}>
            🔍 Ce lieu existe peut-être déjà...
          </div>
          {doublons.slice(0,3).map(d=>(
            <div key={d.id} style={{
              background:"white", borderRadius:10, padding:"10px 12px",
              marginBottom:8, border:`1px solid ${T.amber}40`,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:T.bark }}>{d.name}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>
                  📍 {d.quartier} · {CAT.find(c=>c.id===d.cat)?.label}
                </div>
              </div>
              <button onClick={()=>{ setEtape(0); }}
                style={{
                  background:T.sage, color:"white", border:"none",
                  borderRadius:8, padding:"6px 10px", fontSize:11,
                  fontWeight:800, cursor:"pointer", whiteSpace:"nowrap",
                  fontFamily:"'Nunito',sans-serif", marginLeft:8,
                }}>
                ✅ C'est ce lieu
              </button>
            </div>
          ))}
          <button onClick={()=>setDoublonIgnored(true)} style={{
            background:"none", border:"none", color:T.muted,
            fontSize:12, cursor:"pointer", fontWeight:700,
            fontFamily:"'Nunito',sans-serif", marginTop:4,
            textDecoration:"underline",
          }}>
            Non, c'est un lieu différent →
          </button>
        </div>
      )}

      {/* Quartier */}
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
          letterSpacing:"0.8px", display:"block", marginBottom:5 }}>
          {form.cat==="randonees" ? "Région / Ville la plus proche" : "Quartier / Ville"}
          <span style={{ color:T.terra }}> *</span>
        </label>
        <select value={form.quartier} onChange={e=>set("quartier",e.target.value)} style={{
          width:"100%", borderRadius:12,
          border:`2px solid ${errors.quartier?T.terra:T.stone}`,
          padding:"10px 12px", fontSize:14, color: form.quartier?T.bark:"#B5A08A",
          fontFamily:"'Nunito',sans-serif", outline:"none",
          background:errors.quartier?"#FFF5F5":"white",
        }}>
          <option value="">Choisir {form.mode==="ville" ? "un quartier" : "une région"}...</option>
          {form.mode==="ville" ? (
            <>
              <optgroup label="Montréal">
                {QUARTIERS.map(q=><option key={q} value={q}>{q}</option>)}
              </optgroup>
              <optgroup label="Proche de Montréal">
                {["Laval","Longueuil","Brossard","Saint-Bruno","Mont-Saint-Hilaire","Oka"].map(q=>(
                  <option key={q} value={q}>{q}</option>
                ))}
              </optgroup>
            </>
          ) : (
            <>
              <optgroup label="Régions du Québec">
                {DESTINATIONS_ESCAPADE.map(q=><option key={q} value={q}>{q}</option>)}
              </optgroup>
              <optgroup label="Proche de Montréal">
                {["Laval","Longueuil","Brossard","Saint-Bruno","Mont-Saint-Hilaire","Oka"].map(q=>(
                  <option key={q} value={q}>{q}</option>
                ))}
              </optgroup>
            </>
          )}
          <option value="Autre">Autre ville / région</option>
        </select>
        {form.quartier==="Autre" && (
          <input value={form.autreQuartier||""} onChange={e=>set("autreQuartier",e.target.value)}
            placeholder="Précisez la ville ou région..."
            style={{ width:"100%", borderRadius:12, border:`2px solid ${T.stone}`,
              padding:"10px 12px", fontSize:14, color:T.bark, outline:"none",
              fontFamily:"'Nunito',sans-serif", marginTop:8 }}/>
        )}
        {errors.quartier && <div style={{ fontSize:11, color:T.terra, marginTop:3 }}>Champ obligatoire</div>}
      </div>

      <FormField fieldKey="adresse"
        label={form.cat==="randonees" ? "Point de départ / Accès" : "Adresse"}
        placeholder={form.cat==="randonees" ? "Ex : Stationnement principal, route 344" : "Ex : 1234, rue Wellington"}
        form={form} errors={errors} onChange={set} />

      <FormField fieldKey="desc" label="Description" placeholder={
        form.cat==="randonees" ? "Décrivez les sentiers, le paysage, pourquoi c'est idéal avec un chien..." :
        form.cat==="campings"  ? "Décrivez le camping, l'environnement, les services pour les chiens..." :
        "Décrivez pourquoi c'est dog-friendly, l'ambiance..."
      } multi required form={form} errors={errors} onChange={set} />

      {/* Champs spécifiques Randonnées */}
      {form.cat==="randonees" && (<>
        <FormField fieldKey="sentiers"
          label="Sentiers admis aux chiens"
          placeholder="Ex : Sentier de la rivière ✓ · Boucle des lacs ✓ · Sentier du sommet ✗"
          multi form={form} errors={errors} onChange={set} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
              letterSpacing:"0.8px", display:"block", marginBottom:5 }}>Difficulté</label>
            <select value={form.difficulte||""} onChange={e=>set("difficulte",e.target.value)}
              style={{ width:"100%", borderRadius:12, border:`2px solid ${T.stone}`,
                padding:"10px 12px", fontSize:13, color:T.bark,
                fontFamily:"'Nunito',sans-serif", outline:"none" }}>
              <option value="">Choisir...</option>
              <option value="Facile">🟢 Facile</option>
              <option value="Modéré">🟡 Modéré</option>
              <option value="Difficile">🔴 Difficile</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:900, color:T.muted, textTransform:"uppercase",
              letterSpacing:"0.8px", display:"block", marginBottom:5 }}>Distance</label>
            <input value={form.distance||""} onChange={e=>set("distance",e.target.value)}
              placeholder="Ex : 8 km"
              style={{ width:"100%", borderRadius:12, border:`2px solid ${T.stone}`,
                padding:"10px 12px", fontSize:13, color:T.bark, outline:"none",
                fontFamily:"'Nunito',sans-serif" }}/>
          </div>
        </div>
      </>)}

      {/* Champs spécifiques Campings */}
      {form.cat==="campings" && (
        <FormField fieldKey="saison_ouverture"
          label="Saison d'ouverture"
          placeholder="Ex : Ouvert mai à octobre"
          form={form} errors={errors} onChange={set} />
      )}

      <FormField fieldKey="politique"
        label={form.cat==="randonees" ? "Règles pour les chiens" : "Politique chien"}
        placeholder={
          form.cat==="randonees" ? "Ex : En laisse obligatoire sur tous les sentiers" :
          form.cat==="campings"  ? "Ex : Chiens acceptés, en laisse hors de l'emplacement" :
          "Ex : Terrasse uniquement / Hors-laisse désigné..."
        }
        form={form} errors={errors} onChange={set} />

      <FormField fieldKey="saison"
        label="Restriction saisonnière (si applicable)"
        placeholder="Ex : ⚠️ Sentiers fermés mai–juin (nidification)"
        multi form={form} errors={errors} onChange={set} />

      <FormField fieldKey="horaires" label="Horaires" placeholder="Ex : 9h–21h lun–sam" form={form} errors={errors} onChange={set} />
      <FormField fieldKey="tel" label="Téléphone" placeholder="Ex : 514-555-1234" form={form} errors={errors} onChange={set} />
    </div>

    {/* About you */}
    <div style={{ background:"white", borderRadius:18, padding:16, marginBottom:12,
      border:`1.5px solid ${T.stone}` }}>
      <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:16, fontWeight:800,
        color:T.bark, marginBottom:14 }}>À propos de vous <span style={{ fontSize:12,
          fontWeight:400, color:T.muted }}>(optionnel)</span></div>
      <FormField fieldKey="prenom" label="Votre prénom"                    placeholder="Ex : Marie-Josée" form={form} errors={errors} onChange={set} />
      <FormField fieldKey="chien"  label="Prénom & race de votre chien"    placeholder="Ex : Biscuit, Golden Retriever" form={form} errors={errors} onChange={set} />
    </div>

    {/* Charter */}
    <div style={{ background:T.amberLt, borderRadius:14, padding:14, marginBottom:16,
      border:`1.5px solid ${T.amber}40` }}>
      <p style={{ fontSize:12, color:"#7A5010", lineHeight:1.65,
        fontFamily:"'Lora',Georgia,serif" }}>
        🐾 En contribuant, vous acceptez que votre ajout soit visible par toute la communauté Baladou. Merci de vous assurer que les informations sont exactes.
      </p>
    </div>

    <Btn onClick={submit} variant="sage" full>Partager ce lieu 🐾</Btn>
    {Object.keys(errors).length>0 && (
      <p style={{ textAlign:"center", fontSize:12, color:T.terra,
        fontWeight:700, marginTop:10 }}>
        ⚠ Veuillez remplir les champs obligatoires
      </p>
    )}
  </div>
</div>
```

);
}

// ─── SCREEN: FICHE DÉTAILLÉE ───────────────────────────────────────
function FicheScreen({ lieu, goBack, onConfirm }) {
const [confirmedStatus, setConfirmedStatus] = useState(null); // null | ''ok'' | ''warn'' | ''sent''
const [correctionText, setCorrectionText] = useState('''');
const col = catColor(lieu.cat);

const handleConfirmOk = () => {
setConfirmedStatus(''ok'');
onConfirm(lieu.id);
};

return (
<div style={{ paddingBottom:40 }}>
{/* Hero */}
<div style={{
background:`linear-gradient(150deg,${T.bark},${col}CC)`,
padding:''52px 20px 28px'',
}}>
<button onClick={goBack} style={{
background:''rgba(255,255,255,0.15)'', border:''none'', borderRadius:10,
padding:''7px 14px'', color:''white'', fontSize:12, fontWeight:700,
cursor:''pointer'', marginBottom:16, fontFamily:''‘Nunito’,sans-serif'',
}}>← Retour</button>

```
    <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", textTransform:"uppercase",
      letterSpacing:"2px", fontWeight:700, marginBottom:6 }}>
      {catIcon(lieu.cat)} {catLabel(lieu.cat)}
    </div>
    <h1 style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:26, fontWeight:900,
      color:"white", lineHeight:1.15, marginBottom:6 }}>{lieu.name}</h1>
    <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", fontWeight:700,
      marginBottom:12 }}>📍 {lieu.quartier}</div>

    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
      <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:8,
        padding:"4px 10px", fontSize:11, color:"white", fontWeight:700 }}>
        🐕 {lieu.politique}
      </div>
    </div>
  </div>

  <div style={{ padding:"16px 16px 0" }}>

    {/* Photo placeholders */}
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:6, marginBottom:14 }}>
      {[col+"30",col+"18",col+"10"].map((bg,i)=>(
        <div key={i} style={{
          background:`linear-gradient(135deg,${bg},${T.parch})`,
          borderRadius:i===0?16:10, height:i===0?130:60,
          gridRow:i===0?"1/3":undefined,
          display:"flex", alignItems:"center", justifyContent:"center",
          border:`1.5px solid ${T.stone}`,
        }}>
          <span style={{ fontSize:i===0?32:18, opacity:0.4 }}>{catIcon(lieu.cat)}</span>
        </div>
      ))}
    </div>

    {/* Description */}
    <div style={{ background:"white", borderRadius:16, padding:16, marginBottom:12,
      border:`1.5px solid ${T.stone}` }}>
      <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:15, color:T.deep,
        lineHeight:1.75 }}>{lieu.desc}</p>
      {lieu.saison && <div style={{ marginTop:12 }}><SeasonBadge text={lieu.saison} /></div>}
    </div>

    {/* Practical info */}
    <div style={{ background:"white", borderRadius:16, padding:16, marginBottom:12,
      border:`1.5px solid ${T.stone}` }}>
      <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:16, fontWeight:800,
        color:T.bark, marginBottom:12 }}>Infos pratiques</div>
      {[
        lieu.adresse && { icon:"📍", label:"Adresse",        val:lieu.adresse },
        lieu.politique && { icon:"🐕", label:"Politique chien", val:lieu.politique },
        lieu.horaires && { icon:"⏰", label:"Horaires",       val:lieu.horaires },
        lieu.tel && { icon:"📞", label:"Téléphone",          val:lieu.tel },
      ].filter(Boolean).map((row,i,arr)=>(
        <div key={row.label} style={{ display:"flex", gap:12,
          paddingBottom:i<arr.length-1?10:0, marginBottom:i<arr.length-1?10:0,
          borderBottom:i<arr.length-1?`1px solid ${T.stone}`:"none" }}>
          <span style={{ fontSize:18, minWidth:28, textAlign:"center" }}>{row.icon}</span>
          <div>
            <div style={{ fontSize:10, color:T.muted, fontWeight:700,
              textTransform:"uppercase", letterSpacing:"0.5px" }}>{row.label}</div>
            <div style={{ fontSize:13, color:T.bark, fontWeight:600, marginTop:2 }}>{row.val}</div>
          </div>
        </div>
      ))}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lieu.adresse||lieu.name) + ' ' + lieu.quartier)}`}
        target="_self"
        rel="noopener noreferrer"
        style={{
          display:"block", width:"100%", marginTop:12,
          background:`linear-gradient(135deg,${col},${col}CC)`,
          color:"white", borderRadius:12, padding:"11px",
          fontSize:14, fontWeight:800, cursor:"pointer",
          fontFamily:"'Fraunces',Georgia,serif",
          textDecoration:"none", textAlign:"center",
        }}>
        🗺️ Ouvrir dans Google Maps
      </a>
    </div>

    {/* Confirm button */}
    <div style={{
      background: confirmedStatus==="ok" ? T.sageLt : confirmedStatus==="sent" ? T.amberLt : "white",
      borderRadius:16, padding:16, marginBottom:12,
      border:`1.5px solid ${confirmedStatus==="ok"?T.sage+"60":confirmedStatus==="sent"?T.amber+"60":T.stone}`,
    }}>
      {confirmedStatus==="ok" && (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:T.sageDk }}>Merci pour votre confirmation !</div>
          <p style={{ fontSize:13, color:T.sage, marginTop:4 }}>
            Ça aide toute la communauté Baladou.
          </p>
        </div>
      )}

      {confirmedStatus==="sent" && (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:6 }}>📩</div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:"#8B5E2A" }}>Signalement envoyé !</div>
          <p style={{ fontSize:13, color:"#9B6E2A", marginTop:4 }}>
            Merci — on va vérifier et mettre à jour l'info.
          </p>
        </div>
      )}

      {confirmedStatus==="warn" && (
        <div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:T.bark, marginBottom:8 }}>⚠️ Quelle correction ?</div>
          <textarea
            value={correctionText}
            onChange={e=>setCorrectionText(e.target.value)}
            placeholder="Ex : La terrasse est maintenant fermée aux chiens..."
            rows={3}
            style={{
              width:"100%", borderRadius:12, border:`1.5px solid ${T.amber}60`,
              padding:"10px 12px", fontSize:13, color:T.bark, outline:"none",
              fontFamily:"'Lora',Georgia,serif", resize:"none",
              background:T.amberLt, lineHeight:1.55,
            }}
          />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={()=>setConfirmedStatus(null)} style={{
              flex:1, background:T.parch, color:T.muted,
              border:`1.5px solid ${T.stone}`, borderRadius:10, padding:"9px",
              fontSize:12, fontWeight:700, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",
            }}>Annuler</button>
            <button onClick={()=>setConfirmedStatus("sent")} style={{
              flex:2, background:`linear-gradient(135deg,${T.amber},#C07820)`,
              color:"white", border:"none", borderRadius:10, padding:"9px",
              fontSize:12, fontWeight:800, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",
            }}>Envoyer le signalement</button>
          </div>
        </div>
      )}

      {!confirmedStatus && (
        <>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:15, fontWeight:800,
            color:T.bark, marginBottom:6, textAlign:"center" }}>
            Vous y êtes allé récemment ?
          </div>
          <p style={{ fontSize:13, color:T.muted, marginBottom:12, lineHeight:1.6,
            fontFamily:"'Lora',Georgia,serif", textAlign:"center" }}>
            Confirmez que ce lieu est toujours dog-friendly — ça aide toute la communauté !
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleConfirmOk} style={{
              flex:1, background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,
              color:"white", border:"none", borderRadius:12, padding:"11px",
              fontSize:13, fontWeight:800, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",
            }}>✅ Toujours ok !</button>
            <button onClick={()=>setConfirmedStatus("warn")} style={{
              flex:1, background:T.amberLt, color:"#8B5E2A",
              border:`1.5px solid ${T.amber}50`, borderRadius:12, padding:"11px",
              fontSize:13, fontWeight:800, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",
            }}>⚠️ Info à corriger</button>
          </div>
        </>
      )}
    </div>

  </div>
</div>
```

);
}

// ─── APP ROOT ──────────────────────────────────────────────────────
export default function Baladou() {
const [screen, setScreen]     = useState(''home'');
const [lieux, setLieux]       = useState(LIEUX);
const [fiche, setFiche]       = useState(null);
const [prev, setPrev]         = useState(''home'');

// Charger Fuse.js au démarrage
useEffect(() => { loadFuse(); }, []);

const go = (s) => setScreen(s);

const openLieu = (lieu) => {
setPrev(screen);
setFiche(lieu);
setScreen(''fiche'');
};

const goBack = () => {
setScreen(prev);
setFiche(null);
};

const addLieu = (l) => setLieux(ls => [l, …ls]);

const confirmLieu = (id) => {
setLieux(ls => ls.map(l => l.id===id ? { …l, confirmations:l.confirmations+1 } : l));
};

const screens = {
home:      <HomeScreen      lieux={lieux} go={go} openLieu={openLieu} onConfirm={confirmLieu} />,
ville:     <VilleScreen     lieux={lieux} openLieu={openLieu} />,
escapade:  <EscapadeScreen  lieux={lieux} openLieu={openLieu} />,
contribuer:<ContribuerScreen onAdd={addLieu} lieux={lieux} />,
fiche:     fiche ? <FicheScreen lieu={fiche} goBack={goBack} onConfirm={confirmLieu} /> : null,
};

return (
<div style={{
fontFamily:''‘Nunito’,sans-serif'',
background:T.bg, minHeight:''100vh'',
maxWidth:480, margin:''0 auto'',
position:''relative'', overflowX:''hidden'',
}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;600;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#C8BAA8;border-radius:10px;} input::placeholder,textarea::placeholder{color:#B5A08A;} button{transition:opacity 0.15s,transform 0.15s;} button:active{opacity:0.82;transform:scale(0.97);} select option{color:#1E140A;}`}</style>
<div style={{ overflowY:''auto'', height:''100vh'', paddingBottom: screen===''fiche''?0:0 }}>
{screens[screen] || screens.home}
</div>
{screen !== ''fiche'' && <BottomNav screen={screen} go={go} />}
</div>
);
}
