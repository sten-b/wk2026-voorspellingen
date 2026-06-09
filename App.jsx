"use client";
import React, { useState, createContext, useContext, useEffect } from "react";

// ── TYPE SCALE ───────────────────────────────────────────────────────────────
// Single source of truth for text sizes. Collapses the previous 15 ad-hoc sizes
// into 7 deliberate roles. Emoji/flag glyphs are sized separately (not type).
const FS = {
  display: 22,   // hero numbers (champion score, big stats)
  h1: 17,        // page / major section titles
  h2: 15,        // card titles
  body: 13,      // primary body copy, key labels
  small: 12,     // secondary body, table values
  caption: 10,   // captions, sub-labels, helper text
  micro: 8,      // column headers, tiny uppercase tags
};

const THEMES = {
  // Default: clean modern — orange accent, deep blue secondary, white cards
  default: {
    id:"default",
    bg:"#F5F5F5", card:"#FFFFFF", nav:"#FFFFFF",
    border:"#E4E4E4", borderStrong:"#CCCCCC",
    text:"#111111", textSub:"#666666", textFaint:"#AAAAAA",
    orange:"#E07000", blue:"#1A5296",
    gold:"#C9A227",
    orangeFaint:"#FFF5EA", blueFaint:"#EEF4FB",
    green:"#1E7A40", red:"#C0392B",
    activeTab: t => ({ color:t.orange, borderBottom:`2px solid ${t.orange}`, fontWeight:700 }),
    tabInactive: t => ({ color:t.textSub }),
    pill: (active,t) => active ? { background:t.blue, color:"#fff" } : { background:t.bg, color:t.textSub },
  },
  // Dark Lion = HOME kit: pure black bg, vivid orange accents, warm grey structure
  dark: {
    id:"dark",
    bg:"#0D0D0D", card:"#1A1A1A", nav:"#111111",
    border:"#2A2A2A", borderStrong:"#FF5500",
    text:"#F0F0F0", textSub:"#999999", textFaint:"#555555",
    orange:"#FF5500", blue:"#909090",   // section titles in dark mode: neutral grey
    gold:"#FFAA00",
    orangeFaint:"rgba(255,85,0,0.08)", blueFaint:"rgba(255,85,0,0.04)",
    green:"#3DBE6E", red:"#FF5544",
    activeTab: t => ({ color:"#FF5500", borderBottom:"3px solid #FF5500", fontWeight:700 }),
    tabInactive: t => ({ color:"#AAAAAA" }),
    pill: (active,t) => active ? { background:"#FF5500", color:"#000000", fontWeight:700 } : { background:"#1A1A1A", color:"#777777" },
  },
  // Orange Lion = AWAY kit: orange dominant (same orange as dark mode), white as structure,
  // subtle lighter-orange hints, black used sparingly as the sharp accent.
  orangeLion: {
    id:"orangeLion",
    bg:"#FF5500", card:"#FFFFFF", nav:"#FF5500",
    border:"#FF7A33", borderStrong:"#FFFFFF",
    text:"#1A1208", textSub:"#5A3318", textFaint:"#9A6A45",
    orange:"#FF5500", blue:"#0D0D0D",       // "secondary"/accent = black, used sparingly
    gold:"#FFAA00",
    orangeFaint:"#FFF1E9", blueFaint:"#FFF6F0",
    green:"#1E7A40", red:"#C0392B",
    activeTab: t => ({ color:"#0D0D0D", borderBottom:"3px solid #0D0D0D", fontWeight:700 }),
    tabInactive: t => ({ color:"rgba(13,13,13,0.55)" }),
    pill: (active,t) => active ? { background:"#0D0D0D", color:"#FF5500", fontWeight:700 } : { background:"rgba(255,255,255,0.85)", color:"#B23C00" },
  },

}

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────

const LANG = {
  nl: {
    appTitle: "Sten's WK Voorspellingen",
    appSub: "48 landen · 104 wedstrijden · Klik op een duel voor onderbouwing",
    tabs: { bracket:"Groep", knockout:"Knockout", nations:"Landen", players:"Spelers", model:"Model" },
    tournamentLabel: "FIFA Wereldkampioenschap 2026",
    predictedChampion: "Voorspelde kampioen",
    knockoutLink: "Knockout",
    groupStage: "Groepsfase",
    groupSub: "12 groepen · klik om een groep uit te klappen",
    knockoutTitle: "Knockoutronde",
    modelTitle: "Sten's Prediction Model",
    modelSubtitle: "Hoe worden scores bepaald",
    modelBody: "Elke wedstrijd wordt bepaald door de sterktescore per land (Elo, selectiekwaliteit, recente vorm, ervaring, coach). Het verschil in sterktescore bepaalt wie wint en met welke marge; xG en xGc vullen de hoogte van de uitslag in. Alles vloeit direct voort uit de berekeningen, zonder handmatige aanpassingen.",
    overTitle: "Overperformers",
    underTitle: "Underperformers",
    qf: "Kwartfinales",
    sf: "Halve finales",
    final: "Finale · MetLife Stadium · 19 juli",
    whyScore: "Waarom deze score?",
    predictedChampionLabel: "Voorspelde kampioen",
    matchPredictions: "Wedstrijdprognoses",
    projection: "Prognose",
    risk: "Risico",
    group: "Groep",
    footerSub: "WK 2026 Voorspellingen",
    themeDefault: "Standaard",
    themeDark: "Dark Lion",
    },
  en: {
    appTitle: "Sten's WC Predictions",
    appSub: "48 teams · 104 matches · Click any match for reasoning",
    tabs: { bracket:"Group", knockout:"Knockout", nations:"Nations", players:"Players", model:"Model" },
    tournamentLabel: "FIFA World Cup 2026",
    predictedChampion: "Predicted champion",
    knockoutLink: "Knockout",
    groupStage: "Group Stage",
    groupSub: "12 groups · click a group to expand",
    knockoutTitle: "Knockout Rounds",
    modelTitle: "Sten's Prediction Model",
    modelSubtitle: "How scores are determined",
    modelBody: "Every match is determined by each country's strength score (Elo, squad quality, recent form, experience, coach). The gap in strength score decides who wins and by what margin; xG and xGc fill in the height of the scoreline. Everything follows directly from the calculations, with no manual adjustments.",
    overTitle: "Overperformers",
    underTitle: "Underperformers",
    qf: "Quarter-finals",
    sf: "Semi-finals",
    final: "Final · MetLife Stadium · 19 July",
    whyScore: "Why this score?",
    predictedChampionLabel: "Predicted Champion",
    matchPredictions: "Match Predictions",
    projection: "Projection",
    risk: "Risk",
    group: "Group",
    footerSub: "WC 2026 Predictions",
    themeDefault: "Default",
    themeDark: "Dark Lion",
    },
};

// ── TEAM NAMES ────────────────────────────────────────────────────────────────

const TEAM_NL = {
  "France":"Frankrijk","Spain":"Spanje","Argentina":"Argentinië","England":"Engeland",
  "Portugal":"Portugal","Brazil":"Brazilië","Netherlands":"Nederland","Morocco":"Marokko",
  "Belgium":"Belgie","Germany":"Duitsland","Croatia":"Kroatie","Colombia":"Colombia",
  "Senegal":"Senegal","Mexico":"Mexico","United States":"Verenigde Staten","Uruguay":"Uruguay",
  "Japan":"Japan","Switzerland":"Zwitserland","Ecuador":"Ecuador","South Korea":"Zuid-Korea",
  "Austria":"Oostenrijk","Sweden":"Zweden","Scotland":"Schotland","Tunisia":"Tunesie",
  "Iran":"Iran","Egypt":"Egypte","Czechia":"Tsjechie","Australia":"Australie",
  "Norway":"Noorwegen","Algeria":"Algerije","Canada":"Canada","Turkey":"Turkije",
  "Paraguay":"Paraguay","Ivory Coast":"Ivoorkust","Ghana":"Ghana","Saudi Arabia":"Saoedi-Arabie",
  "Qatar":"Qatar","Congo DR":"Congo DR","Bosnia-Herzegovina":"Bosnie-Herzegovina","Iraq":"Irak",
  "South Africa":"Zuid-Afrika","Cape Verde":"Kaapverdie","Uzbekistan":"Oezbekistan","Panama":"Panama",
  "Curacao":"Curacao","Jordan":"Jordanië","Haiti":"Haiti","New Zealand":"Nieuw-Zeeland",
};

// ── MATCH EXPLANATIONS ────────────────────────────────────────────────────────

const MATCH_EXPL = {
  nl: {
    "Mexico-South Africa":"Mexico opent als grote favoriet en gebruikt het thuisvoordeel van het Noord-Amerikaanse continent. Zuid-Afrika mist de technische kwaliteit om 90 minuten een compact blok te bewaren en Mexico snijdt hen open via de flanken. Een comfortabele overwinning die de toon zet voor de groep.",
    "South Korea-Czechia":"Zuid-Korea's hoge pressing en atletisch vermogen is meer dan Tsjechië's middenblokkering aankan. Son Heung-min is de doorslaggevende factor: zijn beweging tussen de linies geeft Tsjechië geen structureel antwoord. Een verdiende Zuid-Koreaanse overwinning.",
    "Mexico-South Korea":"De topwedstrijd van Groep A. Beide ploegen drukken hoog en heffen elkaar op qua intensiteit. Zuid-Korea is georganiseerd genoeg om mee te doen, Mexico hoeft zich niet volledig bloot te geven. Het model verwacht een gelijkspel als logisch resultaat.",
    "South Africa-Czechia":"Zuid-Afrika toonde op de Afrika Cup dat ze moeilijk te breken zijn, maar Soucek en Barak controleren het tempo goed. Tsjechië wint een rommelige maar verdiende wedstrijd via standaardsituaties.",
    "Mexico-Czechia":"Met kwalificatie nagenoeg zeker roteert Mexico, maar behoudt nog steeds te veel klasse voor een vermoeide Tsjechische ploeg. Raul Jimenez leidt de aanval en Mexico sluit de groep af met een comfortabele overwinning.",
    "South Korea-South Africa":"Zuid-Korea heeft deze overwinning nodig om progressie te garanderen en weet dat. Son en Lee Jae-sung slopen de Zuid-Afrikaanse defensie in de omschakeling. Een dominante vertoning die kwalificatie bevestigt.",
    "Canada-Bosnia-Herzegovina":"Canada in Toronto is een echte thuiswedstrijd: het publiek tilt hen mee. Alphonso Davies explodeert via links langs de trage Bosnische defensie. Canada's intensiteit over 90 minuten is te groot voor een ploeg die hier niet voor gebouwd is.",
    "Qatar-Switzerland":"Qatar wordt tactisch overtroffen door Shaqiri, Embolo en Xhaka. Xhaka domineert het middenveld en Qatar kan de Zwitserse pressing niet bijhouden. Een professionele maar comfortabele Zwitserse overwinning.",
    "Canada-Qatar":"Met een overwinning op zak geeft Canada niet los. Jonathan David leidt de aanval en Canada wint opnieuw comfortabel: de kwaliteitskloof is te groot voor Qatar.",
    "Switzerland-Bosnia-Herzegovina":"Zwitserland is in elk opzicht technisch superieur. Embolo's fysieke kracht en Xhaka's middenveldregie intimideren de Bosnische organisatie. Een gecontroleerde Zwitserse overwinning zonder echte spanning.",
    "Canada-Switzerland":"De beslissende groepswedstrijd met beide ploegen al door. Zwitserlands gedisciplineerde organisatie houdt Canada's directe stijl goed bij. Een berekend gelijkspel waarbij beiden hun sterspelers sparen voor de knockouts.",
    "Bosnia-Herzegovina-Qatar":"Twee uitgeschakelde ploegen spelen voor de eer. Dzeko is het kwaliteitsverschil maar zijn benen zijn op. Een gelijkspel is het logische resultaat van een wedstrijd met weinig inzet.",
    "Brazil-Morocco":"De topwedstrijd van Groep C. Regragui zet Marokko neer in de WK 2022-stijl: diep, compact, gevaarlijk op de omschakeling via Hakimi. Vinicius Jr. is de enige speler die dit blok individueel kan openbreken. Een benauwde overwinning voor Brazilië: Marokko verdient meer.",
    "Haiti-Scotland":"Schotlands technische kwaliteit en snelheid op de flanken overspoelen een Haïti dat het internationale niveau net te hoog vindt. Robertson en McTominay controleren de wedstrijd. Een comfortabele Schotse overwinning.",
    "Brazil-Haiti":"Met kwalificatie op zak roteert Ancelotti en geeft speeltijd aan zijn bankspelers. De kwaliteitskloof is te groot voor Haïti. Brazilië wint ruim en geeft jongeren speelminuten.",
    "Scotland-Morocco":"Marokko's tactische intelligentie is te veel voor Schotland. Brahim Diaz vindt de opening, Amrabat sluit de middenlinie volledig af. Schotland wordt uitgeschakeld zonder echt een antwoord te vinden.",
    "Brazil-Scotland":"Brazilië heeft kwalificatie nodig en is gefocust. Endrick's kwaliteit in kleine ruimtes opent Schotland voor rust. Brazilië beheert het spel in de tweede helft en wint zonder te forceren.",
    "Morocco-Haiti":"Marokko roteert fors maar de kwaliteitskloof is enorm. Ben Seghir en Ounahi spelen vrijuit. Een comfortabele Marokkaanse overwinning waarmee ze de groep afsluiten als groepswinnaars.",
    "United States-Paraguay":"De VS speelt voor 80.000 fans in MetLife Stadium: het thuisvoordeel is reëel. Pulisic's beweging vindt voortdurend ruimte. De VS scoort via tegenpressing en wint een verdiende openingswedstrijd.",
    "Australia-Turkey":"Beide ploegen spelen een vergelijkbare, directe stijl. De meest fysiek betwiste wedstrijd van de groep. Geen van beide teams vindt het beslissende kwaliteitsmoment: een gelijkspel is het eerlijke resultaat.",
    "United States-Australia":"De VS verscherpt na de opener. Reyna exploiteert de ruimte achter Australiës hoge linie. Australië creëert kansen maar Turner redt. De VS wint een efficiënte wedstrijd.",
    "Turkey-Paraguay":"Twee ploegen wiens lot nog hangt maar geen van beiden zet zich bloot. Calhanoglu raakt de paal. Een gelijkspel dient beiden maar stelt niemand tevreden.",
    "United States-Turkey":"De VS weet dat een overwinning de groepswinst bevestigt en drukt agressief van de aftrap. Musah en Adams domineren het middenveld volledig. Een duidelijke Amerikaanse overwinning.",
    "Australia-Paraguay":"Australië heeft een overwinning nodig om door te gaan en speelt met de intensiteit die daarbij past. Een doelpunt via een slordige actie geeft Australië de winst die hun pressing verdient.",
    "Germany-Curacao":"Duitsland opent het toernooi tegen het kleinste land in de competitie. Musiala en Wirtz combineren vrijuit, Havertz profiteert. Een overtuigende openingsoverwinning die vertrouwen geeft voor de rest van de groep.",
    "Ivory Coast-Ecuador":"Ecuador's ongeslagen reeks en Caicedo's elite aanwezigheid vertalen zich in dit resultaat. Caicedo breekt Ivoorkusts aanvallen op; Páez maakt het verschil in de tweede helft. Ecuador wint een verdiende wedstrijd.",
    "Germany-Ivory Coast":"Een echte test voor Duitslands defensieve structuur. Haller geeft Schlotterbeck problemen met zijn fysieke aanwezigheid. Duitsland leidt via Musiala maar Haller gelijkt. Duitsland redt het via een standaardsituatie in de slotfase: knapper dan verwacht.",
    "Ecuador-Curacao":"Caicedo en Páez spelen vrijuit tegen een Curaçao dat simpelweg niet het niveau heeft. Ecuador domineert via omschakelingsmomenten en individuele kwaliteit. Een vlotte overwinning zonder echte weerstand.",
    "Germany-Ecuador":"De bepalende wedstrijd van Groep E. Na aanpassingen zijn beide landen effectief gelijkwaardig. Caicedo gedijt in de ruimte die Nagelsmanns blok toestaat. Een intense wedstrijd die in een gelijkspel eindigt: beiden tevreden met de puntdeling.",
    "Ivory Coast-Curacao":"Haller en Kessie hebben te veel klasse voor Curaçaos blok. Ivoorkust wint met meer moeite dan de kwaliteitskloof zou suggereren: Curaçao verdedigt beter dan verwacht.",
    "Netherlands-Japan":"De wedstrijd van de groepsfase. Na Japans vormcorrectie zijn deze landen nagenoeg gelijkwaardig in het model. Doan en Kubo drukken de Nederlandse backs meedogenloos. Van Dijk houdt de boel overeind. Een intensief gelijkspel weerspiegelt de werkelijke krachtsverhouding.",
    "Sweden-Tunisia":"Twee pragmatische, georganiseerde ploegen. Isak leidt intelligent en pakt zijn moment. Zweden wint een gedisciplineerde wedstrijd beslist door een enkel moment van individuele kwaliteit.",
    "Netherlands-Sweden":"Nederland controleert de bal efficiënt en Zweden kan niet meekomen met Gakpo op de flank. Isak wordt geïsoleerd zonder service. Nederland wint zonder de hoogste versnelling te gebruiken.",
    "Japan-Tunisia":"Japans hoge pressing past perfect bij een Tunesische ploeg die langzaam wil opbouwen. Kubo's techniek en Doans directheid veroorzaken de hele wedstrijd problemen. Japan wint een klinische wedstrijd en bevestigt kwalificatie.",
    "Netherlands-Tunisia":"Met kwalificatie op zak roteert Nederland maar behoudt genoeg kwaliteit. Tunesië verdedigt diep maar Nederlands breedte vindt tweemaal het net. Een professionele overwinning.",
    "Japan-Sweden":"De strijd om de tweede plek. Japans hoge pressing en intensiteit past perfect bij Zwedens tragere tempo. Japan wint met een beslissend doelpunt laat in de tweede helft.",
    "Belgium-Egypt":"Salah is een van de weinige spelers die een wedstrijd solo kan winnen: zijn beweging geeft Belgische backs echte problemen. De Bruyne draagt België in de aanval. Het model verwacht een gelijkspel als eerlijk resultaat van twee ploegen die elkaar in evenwicht houden.",
    "Iran-New Zealand":"Irans gedisciplineerde 4-5-1 sluit ruimte efficiënt af en Nieuw-Zeeland worstelt met creëren. Taremi maakt een standaardsituatie vroeg af. Iran wint comfortabel.",
    "Belgium-Iran":"Belgiums snelheid via Doku is het sleutelelement. Irans defensielinie worstelt met zijn directheid. De Bruyne creëert én scoort. Een relatief efficiënte Belgische overwinning.",
    "Egypt-New Zealand":"Salah is fris en Nieuw-Zeeland heeft geen antwoord op zijn beweging. Salah scoort en assisteert. Egypte wint overtuigend en begint er als een echte R16-kanshebber uit te zien.",
    "Belgium-New Zealand":"België roteert na een lastige opener maar de kwaliteitskloof is enorm. Doku en Trossard vinden de pockets die ertoe doen. Een routineuze overwinning.",
    "Egypt-Iran":"De beslissende wedstrijd van Groep G. Irans defensieve discipline geeft Egypte echte problemen. Maar Salah vindt twintig minuten voor tijd een halve meter en krul de bal in de bovenhoek. Egypte wint en Iran is uitgeschakeld.",
    "Spain-Cape Verde":"Spanje's positiespel op vol vermogen. Williams, Yamal en Pedri combineren vrijuit. Kaapverdië heeft geen antwoord op het positionele geweld. Een van de mooiste groepsfaseprestaties van het toernooi.",
    "Saudi Arabia-Uruguay":"Zonder het verrassingselement van 2022 staat Saoedi-Arabië tegenover een volwassen, fysiek Uruguay gebouwd rond Valverde en Ugarte. Darwin Núñez bezorgt de centrale verdedigers echte problemen. Uruguay wint overtuigend.",
    "Spain-Saudi Arabia":"Spanje behandelt dit als een trainingsoefening. Pedri en Olmo domineren het balbezit zo volledig dat Saoedi-Arabië amper in aanvallende positie aan de bal komt.",
    "Uruguay-Cape Verde":"Valverde en Bentancur bazen comfortabel over het middenveld. Uruguay wint met weinig dramatiek en bevestigt kwalificatie.",
    "Spain-Uruguay":"De prestigewedstrijd van de groep. Uruguay zit dieper en Valverde's vermogen om hoog te drukken maakt het Spanje moeilijker. Spanje leidt via een Yamal-knaller voor rust. Darwin Núñez maakt het ongemakkelijk maar Spanje houdt stand in een echt competitieve wedstrijd.",
    "Saudi Arabia-Cape Verde":"Saoedi-Arabië weet dat ze uitgeschakeld zijn maar eer staat op het spel. Kaapverdië kan evenmin kwalificeren. Een matige wedstrijd beslist door een late vrije trap.",
    "France-Senegal":"De meest meeslepende groepswedstrijd van het toernooi. Senegals Gana Gueye en Kouyaté domineren de middenveldstrijd fysiek. Mbappe is het beslissende verschil: hij creëert de eerste en scoort de tweede. Senegal antwoordt via Dias beweging, maar Frankrijk wint een onstuimige wedstrijd.",
    "Iraq-Norway":"Irak mist de fysieke en tactische tools om Haaland 90 minuten te bevatten. Haaland scoort meerdere keren en Sörloth voegt toe via een Ødegaard-steekpass. Noorwegens hoge pressing verstikt de Iraakse opbouw volledig.",
    "France-Iraq":"Frankrijk roteert met kwalificatie op zak maar individuele klasse produceert toch meerdere doelpunten. Mbappe krijgt er twee. Irak is in elk opzicht overtroffen.",
    "Senegal-Norway":"Twee fysieke, directe ploegen met nagenoeg identieke gecorrigeerde rankings. Haaland vs Dia is het uitschietende duel. Beide ploegen drukken hoog en creëren kansen. Een gelijkspel weerspiegelt de werkelijke gelijkwaardigheid.",
    "France-Norway":"Haaland trekt Noorwegen in de wedstrijd door een defensieve fout te benutten en Noorwegen drukt op een gelijkmaker. Maar de diepte van de Franse bank is ongeëvenaard: Griezmanns invalbeurt verandert het middenveld en Frankrijk wint via een klinische treffer vlak voor het einde.",
    "Senegal-Iraq":"Senegal heeft te veel kwaliteit via Dia en Sarr. Irak verdedigt aanvankelijk diep maar Senegals snelheid vindt uiteindelijk de gaten. Een verdiende Senegalese overwinning die kwalificatie bevestigt.",
    "Argentina-Algeria":"Algerije worstelt op dit niveau zonder Mahrez op zijn best. Argentiniës nieuwe generatie: Álvarez en Fernández: heeft te veel kwaliteit. Argentina wint comfortabel ondanks vroege dreiging bij standaardsituaties.",
    "Austria-Jordan":"Oostenrijk is een van Europa's meest complete technische ploegen buiten de elite. Jordanië is defensief poreus bij hoge pressing. Arnautovic en Gregoritsch veroorzaken de hele wedstrijd problemen. Een comfortabele Oostenrijkse overwinning.",
    "Argentina-Austria":"Argentiniës meest competitieve groepswedstrijd. Oostenrijk zit in een middenblokkering maar Álvarez' intelligente beweging vindt tweemaal de ruimte tussen de linies. Een doeltreffende Argentijnse overwinning die de nieuwe tactische identiteit toont: efficiënt, verticaal, klinisch.",
    "Algeria-Jordan":"Een gelijkwaardig duel dat Algerije wint via beter positiespel. Bennacer controleert het tempo. Jordanië verdient een treffer via een lange afstandsschot maar Algerije houdt stand voor de overwinning.",
    "Argentina-Jordan":"Met kwalificatie al zeker geeft Scaloni jongeren speeltijd. Maar zelfs Argentiniës tweede elftal is te goed voor Jordanië. Lautaro Martínez toont zijn klasse.",
    "Austria-Algeria":"Oostenrijk heeft een punt nodig voor de tweede plek; Algerije heeft een overwinning nodig om te overleven. Echte spanning. Sabitzer scoort vroeg; Bounedjah gelijkt. Oostenrijk houdt stand voor de overwinning in een nerveuze slotfase.",
    "Portugal-Congo DR":"Portugals aanvalslinie: Bernardo Silva, Leão en Fernandes: produceert combinaties die Congo DRs verdedigers niet kunnen bijhouden. Portugal wint routine-matig zonder de hoogste versnelling te gebruiken.",
    "Colombia-Uzbekistan":"Colombia's vormcorrectie weerspiegelt Díaz' kwaliteit en hun collectieve aanvallende klasse. Oezbekistan maakt hun WK-debuut maar mist toernooiervaring. Colombia drukt meedogenloos en scoort meerdere keren via omschakeling.",
    "Portugal-Uzbekistan":"Leão, Pedro Neto en Gonçalo Ramos krijgen vrij spel tegen een Oezbekistan dat op dit niveau wordt overweldigd. Portugal scoort meerdere keren voor het uur en begint te rouleren.",
    "Colombia-Congo DR":"Colombia's defensieve structuur is te solide voor Congo DRs directe aanvallers. Díaz en Arias exploiteren de ruimte op de omschakeling. Een efficiënte overwinning die kwalificatie bevestigt.",
    "Portugal-Colombia":"De groepsfinale. Na aanpassingen zijn beide landen in het model effectief gelijkwaardig. Bruno Fernandes vs Colombia's creatieve hart is de sleutelstrijd. Beide ploegen zijn al door en overdrijven niet. Een berekend gelijkspel.",
    "Congo DR-Uzbekistan":"Een evenwichtige wedstrijd tussen twee gelijkwaardig geklasseerde landen. Congo DRs Muleka is de voornaamste aanvallende dreiging. Congo DR steelt de overwinning via een corner in de tweede helft.",
    "England-Croatia":"Na Engeland's correctie zijn ze functioneel gelijkwaardig aan Kroatië. Bellinghams creativiteit veroorzaakt problemen maar Modrićs ervaring houdt Kroatië georganiseerd. Een gelijkspel verrast niemand: deze ploegen neutraliseren elkaar in grote toernooien.",
    "Ghana-Panama":"Ghana heeft het individuele kwaliteitsvoordeel via Kudus en Parteys middenveldcontrole. Panama verdedigt diep maar Ghana vindt tweemaal de opening via standaardsituaties en individuele kwaliteit.",
    "England-Ghana":"Engeland is volledig gefocust. Bellingham dicteert het tempo en Kanes positiespel creëert ruimte voor Saka en Foden. Ghana wordt overvleugeld en Engeland wint overtuigend.",
    "Croatia-Panama":"Kroatië's technische combinatiespel ontmantelt Panamas diep verdedigende blok. Modrić vindt voortdurend de gaten. Een efficiënte Kroatische overwinning.",
    "England-Panama":"Engeland roteert en beheert de speeltijd van sterspelers. Maar zelfs hun tweede keuze is te goed voor Panama. Engeland wint ruim en sluit de groep bovenaan af.",
    "Croatia-Ghana":"Kroatië begint scherp en scoort tweemaal via Kramarić en Kovačić. Ghana kan niet bijkomen. Kroatië bevestigt de tweede plek in Groep L.",
  },
  en: {
    "Mexico-South Africa":"Mexico open as heavy favourites using their North American home advantage from the first whistle. South Africa lack the technical quality to maintain a compact defensive shape for 90 minutes. Mexico carve them apart on the flanks. A comfortable opening win that sets the tone for the group.",
    "South Korea-Czechia":"South Korea's high-energy 4-3-3 generates more chances than Czechia's mid-block can absorb, with Son Heung-min as the decisive factor. His movement between the lines has no structural answer. A deserved South Korean win.",
    "Mexico-South Korea":"The key match of Group A. Both sides press high and match each other in intensity. South Korea are organised enough to stay in it; Mexico don't need to overextend. The model expects a draw as the logical outcome.",
    "South Africa-Czechia":"South Africa showed at AFCON they are hard to break down, but Soucek and Barak control the tempo effectively. Czechia win a scrappy but deserved game through set pieces.",
    "Mexico-Czechia":"With qualification nearly assured Mexico rotate, but still have too much quality for a tired Czech side. Raul Jimenez leads the line and Mexico close the group with a comfortable win.",
    "South Korea-South Africa":"South Korea need this win to guarantee progression and play with that urgency. Son and Lee Jae-sung pull apart the South African defence on the counter. A dominant display that seals qualification.",
    "Canada-Bosnia-Herzegovina":"Canada in Toronto is a genuine home match: the crowd carries them. Alphonso Davies explodes down the left past Bosnia's slower defensive line. Canada's intensity over 90 minutes is simply too much for a side not built to handle it.",
    "Qatar-Switzerland":"Qatar are outplayed tactically by Shaqiri, Embolo and Xhaka. Xhaka controls the midfield and Qatar cannot cope with the Swiss press. A professional and comfortable Swiss win.",
    "Canada-Qatar":"With a win already banked Canada don't let go. Jonathan David leads the line and Canada win comfortably: the quality gap is too large for Qatar.",
    "Switzerland-Bosnia-Herzegovina":"Switzerland are technically superior in every department. Embolo's physicality and Xhaka's midfield control overpower Bosnia's organisation. A controlled Swiss win without real drama.",
    "Canada-Switzerland":"The group's deciding match with both sides already through. Switzerland's disciplined shape contains Canada's directness. A calculated draw where both sides protect their key players for the knockouts.",
    "Bosnia-Herzegovina-Qatar":"Two eliminated sides playing for pride. Dzeko is the quality difference but his legs are fading. A draw is the natural result with little at stake.",
    "Brazil-Morocco":"The standout match of Group C. Regragui sets Morocco up in their 2022 semi-final shape: deep, compact, dangerous on the counter through Hakimi. Vinicius Jr. is the only player who can unlock this individually. A tight Brazil win: Morocco deserve more from it.",
    "Haiti-Scotland":"Scotland's technical quality and wide pace overwhelm a Haiti side that finds the level just too high. Robertson and McTominay control proceedings. A comfortable Scottish win.",
    "Brazil-Haiti":"With qualification secured Ancelotti rotates, handing fringe players minutes. The quality gap is too large for Haiti. Brazil win comfortably while keeping their key players fresh.",
    "Scotland-Morocco":"Morocco's tactical intelligence is too much for Scotland. Brahim Diaz finds the opening; Amrabat closes the midfield entirely. Scotland are eliminated without ever finding an answer.",
    "Brazil-Scotland":"Brazil need the win to maintain momentum and are focused. Endrick's quality in tight spaces unlocks Scotland before half-time. Brazil manage the second half and win without needing to push hard.",
    "Morocco-Haiti":"Morocco rotate heavily but the quality gap is enormous. Ben Seghir and Ounahi play with freedom. A comfortable Moroccan win that confirms them as group winners.",
    "United States-Paraguay":"The USA play in front of 80,000 at MetLife Stadium: the home advantage is genuine. Pulisic's movement finds space consistently. The USA score through counter-pressing and win a deserved opening match.",
    "Australia-Turkey":"Two direct, physically similar sides. The most physically contested match of the group. Neither team finds the decisive moment of quality: a draw is the fair result.",
    "United States-Australia":"The USA sharpen after the opener. Reyna exploits the space behind Australia's high line. Australia create chances but the goalkeeper holds firm. An efficient USA win.",
    "Turkey-Paraguay":"Two sides with their fate still open but neither willing to overcommit. Calhanoglu hits the post. A draw serves both but satisfies nobody.",
    "United States-Turkey":"The USA know a win confirms the group and press aggressively from the off. Musah and Adams fully control the midfield. A clear and deserved American win.",
    "Australia-Paraguay":"Australia need a win to advance and play with the urgency that demands. A scrappy goal rewards their pressing and sends Australia through.",
    "Germany-Curacao":"Germany open their tournament against the smallest nation in the competition. Musiala and Wirtz combine freely, Havertz finishes. A convincing opening win that builds confidence heading into the harder games.",
    "Ivory Coast-Ecuador":"Ecuador's unbeaten run and Caicedo's elite presence tell in this result. Caicedo breaks up Ivory Coast attacks; Páez makes the difference in the second half. A deserved Ecuador win.",
    "Germany-Ivory Coast":"A genuine test of Germany's defensive structure. Haller causes Schlotterbeck problems with his physicality. Germany lead through Musiala but Haller equalises. Germany rescue it with a late set piece: narrower than expected.",
    "Ecuador-Curacao":"Caicedo and Páez play freely against a Curaçao that simply doesn't have the level. Ecuador dominate through transitions and individual quality. A smooth win with no real resistance.",
    "Germany-Ecuador":"The decisive match of Group E. After adjustments both sides are effectively level in the model. Caicedo thrives in the space Nagelsmann's block allows. An intense match that ends level: both sides satisfied with the point.",
    "Ivory Coast-Curacao":"Haller and Kessie have too much class for Curaçao's block. Ivory Coast win with more difficulty than the quality gap would suggest: Curaçao defend better than expected.",
    "Netherlands-Japan":"The match of the group stage. After Japan's form adjustment these sides are rated almost identically. Doan and Kubo press the Dutch full-backs relentlessly. Van Dijk holds things together. An intense draw that genuinely reflects the balance of play.",
    "Sweden-Tunisia":"Two pragmatic, organised sides. Isak leads Sweden's line intelligently and takes his one clear chance. A disciplined Swedish win decided by a single moment of individual quality.",
    "Netherlands-Sweden":"Netherlands control the ball efficiently and Sweden can't live with Gakpo on the flank. Isak is isolated without service. Netherlands win without ever moving out of second gear.",
    "Japan-Tunisia":"Japan's high press is tailor-made to hurt a Tunisia side that likes to build slowly. Kubo's technical quality and Doan's directness cause problems throughout. A clinical Japan win that secures their progression.",
    "Netherlands-Tunisia":"With qualification secured Netherlands rotate but retain enough quality. Tunisia set up deep but Dutch width finds the net twice. A professional win.",
    "Japan-Sweden":"The second-place decider. Japan's high press and intensity is perfect against Sweden's slower tempo. Japan win it with a decisive late goal.",
    "Belgium-Egypt":"Salah is one of the few players who can win a match single-handedly: his movement causes Belgium's defenders real problems. De Bruyne carries Belgium in attack. The model expects a draw as the honest result of two sides that cancel each other out.",
    "Iran-New Zealand":"Iran's disciplined 4-5-1 closes space effectively and New Zealand struggle to create. Taremi finishes a set piece early. Iran win comfortably.",
    "Belgium-Iran":"Belgium's pace through Doku is the key weapon. Iran's defensive line struggles with his directness. De Bruyne creates and scores. A relatively straightforward Belgian win.",
    "Egypt-New Zealand":"Salah is fresh and New Zealand have no answer to his movement. Salah scores and assists. Egypt win convincingly and begin to look like genuine last-16 contenders.",
    "Belgium-New Zealand":"Belgium rotate after a difficult opener but the quality gap is enormous. Doku and Trossard find the pockets that matter. A routine win.",
    "Egypt-Iran":"The decisive Group G match. Iran's defensive discipline gives Egypt real problems. But Salah finds half a yard twenty minutes from time and bends one into the top corner. Egypt win and Iran are eliminated.",
    "Spain-Cape Verde":"Spain's positional system at full flow. Williams, Yamal and Pedri combine freely. Cape Verde have no answer to the positional pressure. One of the tournament's most aesthetically pleasing group stage performances.",
    "Saudi Arabia-Uruguay":"Without the shock factor of 2022, Saudi Arabia face a mature physical Uruguay built around Valverde and Ugarte. Darwin Núñez causes their centre-backs real problems. Uruguay win convincingly.",
    "Spain-Saudi Arabia":"Spain treat this as a training exercise. Pedri and Olmo dominate possession so completely that Saudi Arabia barely touch the ball in attacking positions.",
    "Uruguay-Cape Verde":"Valverde and Bentancur boss midfield comfortably. Uruguay win with little drama and confirm their progression.",
    "Spain-Uruguay":"The group's prestige match. Uruguay sit deeper and Valverde's ability to press high makes Spain work harder. Spain lead through a Yamal thunderbolt before half-time. Darwin Núñez makes it uncomfortable in the second half but Spain hold on in a genuinely competitive game.",
    "Saudi Arabia-Cape Verde":"Saudi Arabia know they're out but pride is on the line. Cape Verde are equally unable to qualify. A poor match decided by a late free kick.",
    "France-Senegal":"The tournament's most compelling group fixture. Senegal's Gana Gueye and Kouyaté physically dominate the midfield battle. Mbappe is the decisive difference: he creates the first and scores the second. Senegal reply through Dia's movement but France win a breathless match.",
    "Iraq-Norway":"Iraq lack the physical and tactical tools to contain Haaland for 90 minutes. Haaland scores multiple times and Sörloth adds another from an Ødegaard through ball. Norway's high press suffocates Iraq's build-up completely.",
    "France-Iraq":"France manage the game with rotations but individual quality still produces multiple goals. Mbappe gets two. Iraq are outmatched in every department.",
    "Senegal-Norway":"Two physical, direct sides with nearly identical adjusted rankings. Haaland vs Dia is the standout battle. Both teams press high and create chances. A draw genuinely reflects the balance.",
    "France-Norway":"Haaland drags Norway into the contest by finishing after a defensive error and Norway push for more. But France's bench depth is unmatched: Griezmann's introduction changes the midfield picture and France win with a composed finish in the closing minutes.",
    "Senegal-Iraq":"Senegal have too much quality through Dia and Sarr. Iraq set up deep and are hard to break initially, but Senegal's pace eventually finds the gaps. A deserved Senegalese win that secures their qualification.",
    "Argentina-Algeria":"Algeria struggle at this level without Mahrez at full capacity. Argentina's new generation: Álvarez and Fernández: have too much quality. Argentina win comfortably despite Algeria's early set-piece threat.",
    "Austria-Jordan":"Austria are one of Europe's most technically complete sides outside the elite. Jordan are defensively open against high-tempo pressing. Arnautovic and Gregoritsch cause problems throughout. A comfortable Austrian win.",
    "Argentina-Austria":"Argentina's most competitive group match. Austria sit in a mid-block but Álvarez's intelligent movement finds pockets between the lines twice. An efficient Argentine win that shows their new tactical identity: vertical, clinical, pragmatic.",
    "Algeria-Jordan":"An evenly-contested match that Algeria edge through better positional play. Bennacer controls the tempo. Jordan earn a consolation through a long-range effort but Algeria hold on.",
    "Argentina-Jordan":"With qualification already secured Scaloni gives youth players game time. But even Argentina's second string is too much for Jordan. Lautaro Martínez demonstrates his class.",
    "Austria-Algeria":"Austria need a point for second place; Algeria need a win to survive. Genuine tension. Sabitzer scores early; Bounedjah equalises. Austria hold on for the win in a nervy final stretch.",
    "Portugal-Congo DR":"Portugal's forward line: Bernardo Silva, Leão and Fernandes: produce combinations Congo DR's defenders cannot track. Portugal win routinely without reaching top gear.",
    "Colombia-Uzbekistan":"Colombia's form correction reflects Díaz's quality and their collective attacking class. Uzbekistan are making their World Cup debut and lack tournament experience. Colombia press relentlessly and score multiple times through transitions.",
    "Portugal-Uzbekistan":"Leão, Pedro Neto and Gonçalo Ramos are given free rein against a Uzbekistan side that is simply overmatched. Portugal score multiple times before the hour and begin rotating.",
    "Colombia-Congo DR":"Colombia's defensive structure is too solid for Congo DR's direct forwards. Díaz and Arias exploit space on the counter. An efficient win that confirms Colombia's qualification.",
    "Portugal-Colombia":"The group decider. After adjustments both sides are effectively level in the model. Bruno Fernandes vs Colombia's creative hub is the key battle. Both teams are already through and neither overextends. A calculated draw.",
    "Congo DR-Uzbekistan":"A low-quality but competitive match between two similarly-ranked sides. Congo DR's Muleka is the main attacking threat. Congo DR nick it through a second-half corner.",
    "England-Croatia":"After England's correction both sides are functionally equivalent. Bellingham's creativity causes problems but Modrić's experience keeps Croatia organised. A draw surprises nobody: these sides consistently neutralise each other at major tournaments.",
    "Ghana-Panama":"Ghana have the individual quality edge through Kudus and Partey's midfield dominance. Panama defend deep but Ghana find the breakthrough twice through set pieces and individual quality.",
    "England-Ghana":"England are fully focused and Bellingham dictates the tempo. Kane's positioning creates space for Saka and Foden. Ghana are overpowered and England win convincingly.",
    "Croatia-Panama":"Croatia's technical combination play dismantles Panama's deep defensive block. Modrić finds gaps consistently. An efficient Croatian win.",
    "England-Panama":"England rotate and manage the minutes of their key players. But even their second choice is too much for Panama. England win comfortably and close the group in first place.",
    "Croatia-Ghana":"Croatia start sharply and score twice through Kramarić and Kovačić. Ghana cannot recover. Croatia confirm second place in Group L.",
  },
};

const KO_EXPL = {
  nl: {
    "Argentina-Netherlands":"Argentinië tegen een georganiseerd maar minder explosief Nederland. Van Dijk leidt een gedisciplineerde verdediging en De Jong probeert het middenveld te beheersen, maar Argentiniës aanvallende drilling via Álvarez en Mac Allister vindt net iets vaker de opening. Oranje houdt lang stand en komt nog terug tot 2-1, maar Argentiniës klasse in de beslissende momenten geeft de doorslag.",
    "Argentina-Norway":"Argentinië treft een Noorwegen dat op vorm de kwartfinale haalde, met Haaland als constante dreiging. Maar Argentiniës complete elftal en toernooiroutine zijn een maatje te groot: Mac Allister en Álvarez controleren het tempo. Haaland prikt er nog 1 binnen voor de 2-1, maar Argentinië staat defensief te sterk en gaat door.",
    "England-Brazil":"Twee zwaargewichten met contrasterende stijlen: Engelands structuur tegen Braziliaanse individuele klasse. Bellingham trekt het middenveld naar zich toe en Saka's directheid langs rechts is het wapen dat Brazilië niet neutraliseert. Vinícius blijft gevaarlijk en maakt er 2-1 van, maar Engeland controleert de cruciale fases en houdt stand.",
    "Brazil-England":"Twee zwaargewichten, gescheiden door het kleinste verschil. Braziliës recente vorm en aanvallende klasse geven net de doorslag: Vinícius en Rodrygo vinden ruimte achter de Engelse defensie, terwijl Engeland via Bellingham en Saka blijft dreigen. Engeland komt terug tot 2-1, maar Brazilië is in de beslissende momenten net iets gevaarlijker en trekt het over de streep.",
    "France-Portugal":"Frankrijks balans tussen controle en omschakeling tegen een Portugal dat op leeftijd begint te raken. Mbappé exploiteert de ruimte achter de Portugese defensie en Tchouaméni wint het fysieke duel op het middenveld. Portugal vecht terug tot 2-1 via een moment van Ronaldo, maar Frankrijk is klinischer en beslist het.",
    "Spain-Colombia":"Spanje tegen een fysiek sterke, gretige Colombiaanse ploeg. Luis Díaz is het grootste gevaar en zorgt voor de aansluitingstreffer, maar Spanjes balbezit en de creativiteit van Yamal en Pedri zijn over negentig minuten te veel. Rodri controleert het tempo vanuit de diepte: een verdiende 2-1 die comfortabeler aanvoelt dan de score.",
    "Spain-Belgium":"Spanje versus het enige ploeg dat qua organisatie en ervaring in de buurt komt. De Bruyne probeert het spel te dicteren maar Rodri en Pedri controleren het tempo volledig. Yamal maakt het verschil langs de rechterkant: zijn directheid is het kwaliteitsverschil dat België niet kan compenseren. Een knappe maar verdiende Spaanse overwinning.",
    "France-Germany":"Frankrijks individuele kwaliteit is de doorslaggevende factor. Mbappe exploiteert de ruimte achter Duitslands hoge defensielinie en Tchouameni wint de middenveldstrijd fysiek. Duitsland is competitief maar de Fransen zijn klinischer in de beslissende momenten. Musiala maakt het uitdagend maar Frankrijk beslist.",
    "Argentina-Germany":"Een klassieker tussen twee WK-grootmachten. Duitsland heeft de hoogste aanvalswaarde van de twee, maar Argentiniës verdediging is de beste van het toernooi (xGc 0,35) en smoort het Duitse opbouwspel. Mac Allister en Álvarez prikken op de tegenaanval; Duitsland komt terug tot 2-1 via Musiala, maar Argentiniës ervaring en kalmte beslissen het duel.",
    "Spain-Netherlands":"Twee balgedreven ploegen die allebei willen voetballen — een open, hoogwaardige wedstrijd. Spanje heeft via Pedri en Yamal net iets meer controle en creativiteit, Nederland countert gevaarlijk met Gakpo en Simons. Het wordt een doelpuntrijk gevecht (3-2): Oranje blijft tot het eind in de buurt, maar Spanjes klasse op het middenveld geeft de doorslag.",
    "Argentina-England":"Argentiniës toernooiervaring in beslissende momenten is de sleutel. Bellingham geeft Engeland hun beste kansen maar Argentiniës defensieve organisatie is bij tegendruk elitair. Alvarez creëert de kansen, Mac Allister dicteert het tempo. Engeland vecht maar Argentinië trekt het over de streep.",
    "Brazil-Portugal":"Twee aanvallend begaafde ploegen die allebei iets te winnen hebben. Vinicius doet wat hij bij Real Madrid altijd doet maar Portugal weerstaat lang. Ronaldo markeert zijn aanwezigheid maar Brazilië heeft meer gevaar. Vinicius beslist met een moment van individuele klasse.",
    "France-Spain":"De bepalende wedstrijd voor de finale. Spanje heeft meer de bal maar Frankrijk is gevaarlijker op de omschakeling. Yamal zoekt de diepte, Mbappe pikt de tegenaanval op. Het gaat op en neer: Spanje controleert, Frankrijk countered. Griezmanns positie achter de spits vervalst Rodri's zicht. Frankrijk wint via hun efficiëntie op de counter.",
    "Spain-England":"Een halve finale tussen twee ploegen met diepe selecties. Spanje domineert het balbezit via Rodri en Pedri, Engeland loert op set-pieces en de omschakeling met Kane als ankerpunt. Spanje's positiespel trekt Engeland uiteen; Yamal maakt het verschil op de flank. Engeland komt terug tot 2-1 maar Spanje's controle in de slotfase beslist.",
    "Spain-Argentina":"De finale tussen de nummers 1 en 2 van het model. Argentinië leunt op toernooiroutine en Martínez achterin; Spanje op het hoogste balbezit en de jeugdige dynamiek van Yamal en Pedri. Een strak duel met weinig kansen — Spanje's net hogere sterktescore en frisheid geven de doorslag. Argentinië komt nog terug tot 2-1, maar Spanje houdt stand en pakt de titel.",
    "Argentina-Brazil":"Zuid-Amerika's grootste rivaliteit, beide ploegen geladen met verwachtingen. Vinicius is de gevaarlijkste aanvaller op het veld maar Argentiniës defensieve blok houdt hem bij minimale kansen. De Paul dicteert het tempo, Alvarez loopt de diepte in. Brazilië drukt maar Argentinië heeft de structuur.",
    "France-Argentina":"Een herkansing van de grootste WK-finale ooit. Mbappe is onhoudbaar over de volle breedte. Deschamps' systeem geeft de Fransen een structureel voordeel op de counter: exact de speelwijze die Argentinië pijn doet. Scaloni probeert het op te lossen maar die klasse is te groot.",
    "Argentina-Spain":"De finale tussen de twee sterkste ploegen van het toernooi, met de kleinst denkbare marge ertussen. Spanje domineert het balbezit en Yamal zoekt voortdurend de diepte, maar Argentiniës defensieve organisatie onder druk is van wereldklasse. Mac Allister en Álvarez zijn dodelijk in de omschakeling en bezorgen Argentinië een 2-1 voorsprong. Spanje drukt aan en maakt het spannend, maar Argentiniës ervaring en kalmte in de slotfase beslissen de titel.",
  },
  en: {
    "Argentina-Netherlands":"Argentina against an organised but less explosive Netherlands. Van Dijk marshals a disciplined defence and De Jong tries to control midfield, but Argentina's attacking drill through Álvarez and Mac Allister finds the opening just a little more often. The Dutch hold firm and pull one back to 2-1, but Argentina's class in the decisive moments proves decisive.",
    "Argentina-Norway":"Argentina face a Norway side that reached the quarters on form, with Haaland a constant threat. But Argentina's complete team and tournament savvy are a level above: Mac Allister and Álvarez control the tempo. Haaland pulls one back for 2-1, but Argentina are too solid defensively and go through.",
    "England-Brazil":"Two heavyweights with contrasting styles: England's structure against Brazilian individual brilliance. Bellingham draws the midfield to him and Saka's directness down the right is the weapon Brazil cannot neutralise. Vinícius stays dangerous and makes it 2-1, but England control the crucial phases and hold on.",
    "Brazil-England":"Two heavyweights separated by the smallest of margins. Brazil's recent form and attacking class just tip it: Vinícius and Rodrygo find space behind the English defence, while England keep threatening through Bellingham and Saka. England pull back to 2-1, but Brazil are a fraction more dangerous in the decisive moments and see it through.",
    "France-Portugal":"France's balance of control and transition against a Portugal side starting to age. Mbappé exploits the space behind the Portuguese defence and Tchouaméni wins the physical midfield battle. Portugal fight back to 2-1 through a Ronaldo moment, but France are more clinical and see it out.",
    "Spain-Colombia":"Spain against a physically strong, eager Colombia. Luis Díaz is the biggest threat and grabs a consolation, but Spain's possession and the creativity of Yamal and Pedri are too much over ninety minutes. Rodri controls the tempo from deep: a deserved 2-1 that feels more comfortable than the scoreline.",
    "Spain-Belgium":"Spain versus the only side that comes close in organisation and experience. De Bruyne tries to dictate but Rodri and Pedri control the tempo completely. Yamal makes the difference on the right: his directness is the quality gap Belgium cannot compensate for. A hard-fought but deserved Spanish victory.",
    "France-Germany":"France's individual quality is the decisive factor. Mbappe's pace exploits the space behind Germany's high defensive line and Tchouameni dominates midfield physically. Germany are competitive: Musiala makes it difficult: but France are more clinical in the decisive moments.",
    "Argentina-Germany":"A classic between two World Cup giants. Germany carry the higher attacking value of the two, but Argentina's defence is the best in the tournament (xGc 0.35) and smothers the German build-up. Mac Allister and Álvarez strike on the counter; Germany pull one back through Musiala to make it 2-1, but Argentina's experience and composure settle it.",
    "Spain-Netherlands":"Two possession-driven sides who both want to play — an open, high-quality match. Spain have slightly more control and creativity through Pedri and Yamal, while the Dutch counter dangerously via Gakpo and Simons. It becomes a goal-filled contest (3-2): the Netherlands stay close to the end, but Spain's midfield class proves decisive.",
    "Argentina-England":"Argentina's tournament experience in pressure situations proves decisive. Bellingham gives England their best chance but Argentina's defensive organisation under sustained pressure is elite. Alvarez creates the chances, Mac Allister dictates the tempo. England fight but Argentina pull it over the line.",
    "Brazil-Portugal":"Two attacking-minded sides with plenty at stake. Vinicius does what he does at Real Madrid but Portugal resist for long periods. Ronaldo marks his presence but Brazil carry more threat overall. Vinicius decides it with a moment of individual brilliance that Diogo Costa cannot stop.",
    "France-Spain":"The defining match before the final. Spain have more possession but France are more dangerous on the counter. Yamal looks for depth, Mbappe picks up the transition. End-to-end: Spain control, France counter. Griezmann's positioning behind the striker disrupts Rodri's sight lines. France's counter-attacking efficiency ultimately proves decisive.",
    "Spain-England":"A semifinal between two deep squads. Spain dominate possession through Rodri and Pedri; England wait on set pieces and transition with Kane as the anchor. Spain's positional play pulls England apart; Yamal makes the difference on the flank. England pull one back to 2-1 but Spain's late control settles it.",
    "Spain-Argentina":"The final between the model's number 1 and 2. Argentina lean on tournament savvy and Martínez at the back; Spain on the highest possession and the youthful dynamism of Yamal and Pedri. A tight game with few chances — Spain's marginally higher strength score and freshness tip it. Argentina pull one back to 2-1, but Spain hold on for the title.",
    "Argentina-Brazil":"South America's greatest rivalry, both sides carrying enormous expectation. Vinicius is the most dangerous player on the pitch but Argentina's defensive block keeps him to minimum clear chances. De Paul dictates the tempo, Alvarez runs beyond. Brazil press but Argentina have the structure.",
    "France-Argentina":"A rematch of the greatest World Cup final ever played. Mbappe is uncontainable across the full width of the pitch. Deschamps' system gives France a structural advantage on the counter: precisely the style that hurts Argentina. Scaloni tries to solve it but the gap in individual quality is decisive.",
    "Argentina-Spain":"The final between the tournament's two strongest sides, separated by the smallest possible margin. Spain dominate possession and Yamal constantly probes in behind, but Argentina's defensive organisation under pressure is world class. Mac Allister and Álvarez are lethal in transition and hand Argentina a 2-1 lead. Spain push and make it tense, but Argentina's experience and composure in the closing stages settle the title.",
  },
};

// ── FOOTBALL DATA ─────────────────────────────────────────────────────────────

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  MODEL CONFIGURATION — update these to re-run or adjust the model       ║
// ║  1. FIFA_RANKINGS: official FIFA rankings                                ║
// ║  2. FORM_ADJ: model adjustments (negative=better, positive=worse)        ║
// ║  3. GROUPS: group assignments                                             ║
// ║  4. MATCHES: predicted group scores                                       ║
// ║  5. QF/SF/FINAL_TEAMS: predicted knockout bracket                        ║
// ╚══════════════════════════════════════════════════════════════════════════╝
const FIFA_RANKINGS = {
  "France":1,"Spain":2,"Argentina":3,"England":4,"Portugal":5,
  "Brazil":6,"Netherlands":7,"Morocco":8,"Belgium":9,"Germany":10,
  "Croatia":11,"Colombia":13,"Senegal":14,"Mexico":15,
  "United States":16,"Uruguay":17,"Japan":18,"Switzerland":19,
  "Ecuador":23,"South Korea":24,"Austria":25,"Sweden":28,
  "Scotland":34,"Tunisia":35,"Iran":36,"Egypt":37,"Czechia":38,
  "Australia":39,"Norway":41,"Algeria":42,"Canada":44,"Turkey":45,
  "Paraguay":46,"Ivory Coast":48,"Ghana":55,"Saudi Arabia":56,
  "Qatar":58,"Congo DR":60,"Bosnia-Herzegovina":62,"Iraq":63,
  "South Africa":66,"Cape Verde":67,"Uzbekistan":70,"Panama":72,
  "Curacao":78,"Jordan":82,"Haiti":95,"New Zealand":102,
};
const FORM_ADJ = {
  // Model: Expected vs Actual performance over 12-month window ending June 2026
  // Factors: qualifying record (pts/game vs opponent avg ranking), recent friendlies,
  //          squad age curve, key injuries, tournament pressure indicators.
  // Scale: negative = outperforming rank (effective rank moves up)
  //        positive = underperforming rank (effective rank moves down)

  // GROUP A
  "Mexico":     -4,  // Home advantage + motivated host, beat US in friendlies, above qualifying expectation
  "South Korea":+3,  // Son (32) declining output vs 2022, qualifying narrower margin than ranked
  "South Africa":-5, // Significantly outperformed ranking in CAF qualifying; Makgopa 14 goals
  "Czechia":    +4,  // Scraped through playoffs; W2 D2 L4 in final qualifying phase

  // GROUP B
  "Canada":     -6,  // Best CONCACAF qualifying ever; Davies + David both in career form
  "Switzerland":-2,  // Consistently finishes top 2 in groups above their ranking
  "Bosnia-Herzegovina":+3, // Dzeko (38) declining; struggled in final EURO qualifying matches
  "Qatar":      +8,  // Lost all 3 in 2022; Asian Cup exit R16 2023; worst team here

  // GROUP C
  "Brazil":     -5,  // Vinicius/Raphinha world-class; Ancelotti's club record earns benefit of doubt despite Neymar doubt
  "Morocco":    -4,  // 2022 SF; CAF qualifying 10W 0L 0D; systematically outperform FIFA ranking
  "Scotland":   -3,  // McTominay 14 goals in qualifying; punched above weight consistently
  "Haiti":      +5,  // Weakest CONCACAF qualifier; limited European depth

  // GROUP D
  "United States":-5,// Home advantage + Pulisic career form; beat Mexico, Germany in recent friendlies
  "Turkey":     -2,  // Guler/Yildiz + Calhanoglu; outperformed ranking at EURO 2024 (QF)
  "Australia":  -2,  // Outperformed at 2022 WC (R16); Asian Cup 2023 runners-up
  "Paraguay":   +4,  // Enciso injured; lost Jun 5 friendly; poor Copa América 2024

  // GROUP E
  "Germany":    -8,  // 8W 0L 0D in qualifying; Musiala + Wirtz generation-best; dominant prep
  "Ecuador":    -7,  // Caicedo elite; beat Argentina, Chile in qualifying; Paez emerging
  "Ivory Coast":-2,  // AFCON 2024 champions; Diomande + Haller in form
  "Curacao":    +6,  // Biggest ranking step-up in tournament; no recent wins vs top-40 sides

  // GROUP F
  "Netherlands":-2,  // Solid but lost to Germany in March; defence strong but attack predictable
  "Japan":      -10, // Beat Brazil 1-0, England 2-1 in June friendlies; best Asian side by margin
  "Sweden":     -3,  // Isak 25 PL goals; outperforming expected qualifying results
  "Tunisia":    +2,  // AFCON R16 exit 2023; lost to Senegal, Morocco in prep

  // GROUP G
  "Belgium":    -6,  // De Bruyne + Lukaku; EURO 2024 underperformed but reset since; rankings lag
  "Egypt":      -9,  // Salah + Marmoush; first WC; best African qualifying pts tally
  "Iran":       +3,  // Visa chaos disrupted June prep; ageing spine; lost vs Qatar in friendly
  "New Zealand":+4,  // Oceanian path; 0W vs ranked top-80 sides in 12 months

  // GROUP H
  "Spain":      -3,  // Euro 2024 winners; Yamal fit; Rodri back; consistently beat expectations
  "Uruguay":    -3,  // Copa América 2024 winners; Valverde best midfielder in world right now
  "Saudi Arabia":+4, // Mancini project early; lost 5 of last 8; no longer CONCACAF/AFC advantage
  "Cape Verde": -4,  // AFCON QF 2023; 8W in CAF qualifying; dramatically outperform ranking

  // GROUP I
  "France":     -2,  // 12-game unbeaten; Mbappe 50 goals; minor concern on depth at striker
  "Norway":     -18, // Haaland 16 qualifying goals alone; historic overperformance vs ranking
  "Senegal":    -2,  // AFCON semifinalists 2024; Mane + Jackson; solid AFCON form
  "Iraq":       +5,  // Surprise qualifier; 0W vs top-50 sides in 12 months

  // GROUP J
  "Argentina":  +4,  // Messi hamstring; Molina injured; Paredes doubtful; underperforming as champion
  "Colombia":   -7,  // Copa América 2024 finalists; Diaz career-best; Rios outstanding
  "Austria":    -3,  // Rangnick pressing system; Sabitzer + Laimer both excellent season
  "Algeria":    +3,  // Mahrez (38) fading; lost to South Africa, Nigeria in AFCON prep
  "Jordan":     +4,  // Surprise qualifier; significant quality gap to group rivals

  // GROUP K
  "Portugal":   -2,  // Ronaldo motivated; PSG core won CL; Bernardo + Vitinha elite
  "DR Congo":   -3,  // Wissa outstanding (Brentford); outperformed in CAF qualifying
  "Uzbekistan": +4,  // Central Asian path; no wins vs top-60 opponents in 12 months

  // GROUP L
  "England":    -6,  // Tuchel system clicked; 8-game unbeaten; Bellingham in form of his life
  "Croatia":    +3,  // Modric (38); squad clearly older than 2022; lost to Portugal, Spain in prep
  "Ghana":      -2,  // Kudus outstanding; Williams electric; outperformed in AFCON qualifying
  "Panama":     +5,  // CONCACAF qualifier; 0 wins vs top-60 in 12 months
};
// ── COMPOSITE SCORE ENGINE ──────────────────────────────────────────────────
// Four-factor model on REAL sourced data, weighted for predictive accuracy:
//   elo   = official World Football Elo rating (eloratings.net, all 48 teams)
//   form  = squad market value (Transfermarkt total), log-scaled 0-100 [independent of Elo]
//           matches (computed from 49k-match dataset, martj42/international_results)
//   exp   = major-tournament achievement 2018-2026 (WC/Euro/Copa/AFCON/Asian/Gold),
//           weighted by tournament strength x round depth
//   coach = head-coach honours weighted by trophy prestige
// Weights (sum to 1): elo .80, form .10, experience .05, coach .05
const WEIGHTS = { elo:0.70, squadQuality:0.10, experience:0.05, coach:0.05, recentForm:0.10 };

// eloN = Elo normalised to 0-100 via (elo - 1400) / 800 * 100, clamped.
const MODEL_DATA={
  "Spain":{elo:2155,eloN:94.4,svN:90.2,exp:67.5,coach:78.5,xg:2.909,xgc:0.879,formN:79.5,formScore:0.127},
  "Argentina":{elo:2114,eloN:89.2,svN:89.2,exp:100.0,coach:100.0,xg:2.141,xgc:0.346,formN:75.2,formScore:0.104},
  "France":{elo:2062,eloN:82.8,svN:98.2,exp:89.6,coach:82.4,xg:2.485,xgc:0.965,formN:84.6,formScore:0.155},
  "England":{elo:2021,eloN:77.6,svN:100.0,exp:87.8,coach:88.6,xg:2.394,xgc:0.24,formN:94.9,formScore:0.21},
  "Brazil":{elo:1991,eloN:73.9,svN:96.3,exp:75.9,coach:98.9,xg:1.898,xgc:0.784,formN:37.6,formScore:-0.1},
  "Portugal":{elo:1986,eloN:73.2,svN:93.5,exp:60.4,coach:67.8,xg:2.909,xgc:1.137,formN:66.7,formScore:0.057},
  "Colombia":{elo:1977,eloN:72.1,svN:75.0,exp:64.8,coach:51.9,xg:2.201,xgc:1.08,formN:35.0,formScore:-0.114},
  "Netherlands":{elo:1944,eloN:68.0,svN:85.7,exp:45.2,coach:55.4,xg:2.886,xgc:0.733,formN:71.8,formScore:0.085},
  "Ecuador":{elo:1938,eloN:67.2,svN:61.9,exp:40.7,coach:38.3,xg:0.635,xgc:0.324,formN:31.6,formScore:-0.132},
  "Germany":{elo:1932,eloN:66.5,svN:89.9,exp:46.5,coach:62.5,xg:2.44,xgc:0.834,formN:76.9,formScore:0.113},
  "Norway":{elo:1914,eloN:64.2,svN:81.6,exp:0.0,coach:59.9,xg:3.654,xgc:0.738,formN:97.4,formScore:0.224},
  "Croatia":{elo:1911,eloN:63.9,svN:69.0,exp:70.6,coach:48.8,xg:2.541,xgc:0.862,formN:79.5,formScore:0.127},
  "Turkey":{elo:1911,eloN:63.9,svN:79.2,exp:23.8,coach:60.9,xg:2.283,xgc:1.144,formN:75.6,formScore:0.106},
  "Japan":{elo:1906,eloN:63.2,svN:66.0,exp:49.1,coach:70.3,xg:1.648,xgc:0.478,formN:70.3,formScore:0.077},
  "Belgium":{elo:1893,eloN:61.6,svN:80.4,exp:57.7,coach:74.1,xg:3.565,xgc:0.807,formN:71.8,formScore:0.085},
  "Uruguay":{elo:1892,eloN:61.5,svN:74.7,exp:61.7,coach:37.1,xg:0.843,xgc:0.697,formN:22.2,formScore:-0.183},
  "Switzerland":{elo:1891,eloN:61.4,svN:65.8,exp:52.4,coach:39.9,xg:2.268,xgc:0.667,formN:66.7,formScore:0.057},
  "Mexico":{elo:1915,eloN:64.4,svN:54.0,exp:74.8,coach:53.1,xg:1.528,xgc:0.61,formN:56.4,formScore:0.002},
  "Senegal":{elo:1867,eloN:58.4,svN:77.0,exp:74.0,coach:74.6,xg:1.983,xgc:0.847,formN:68.7,formScore:0.069},
  "Paraguay":{elo:1833,eloN:54.1,svN:41.9,exp:29.4,coach:32.6,xg:1.213,xgc:0.811,formN:24.8,formScore:-0.169},
  "Austria":{elo:1830,eloN:53.8,svN:69.9,exp:23.0,coach:62.0,xg:2.46,xgc:0.59,formN:75.6,formScore:0.106},
  "Morocco":{elo:1827,eloN:53.4,svN:76.5,exp:76.8,coach:88.3,xg:2.11,xgc:0.345,formN:100.0,formScore:0.238},
  "Canada":{elo:1838,eloN:54.8,svN:56.5,exp:56.0,coach:43.1,xg:1.187,xgc:0.444,formN:53.8,formScore:-0.012},
  "Scotland":{elo:1782,eloN:47.8,svN:59.3,exp:13.2,coach:33.1,xg:2.255,xgc:1.13,formN:53.8,formScore:-0.012},
  "Australia":{elo:1777,eloN:47.1,svN:23.5,exp:36.2,coach:51.4,xg:1.614,xgc:0.778,formN:58.3,formScore:0.012},
  "Iran":{elo:1772,eloN:46.5,svN:28.3,exp:38.2,coach:65.1,xg:1.588,xgc:0.582,formN:55.8,formScore:-0.002},
  "Algeria":{elo:1760,eloN:45.0,svN:64.0,exp:36.9,coach:73.5,xg:1.883,xgc:0.49,formN:76.9,formScore:0.113},
  "South Korea":{elo:1758,eloN:44.8,svN:56.4,exp:39.8,coach:57.8,xg:1.837,xgc:0.819,formN:67.9,formScore:0.064},
  "Czechia":{elo:1740,eloN:42.5,svN:65.6,exp:22.2,coach:53.6,xg:2.178,xgc:1.21,formN:42.6,formScore:-0.073},
  "Panama":{elo:1730,eloN:41.2,svN:23.0,exp:49.3,coach:41.0,xg:1.751,xgc:1.285,formN:55.9,formScore:-0.001},
  "United States":{elo:1876,eloN:59.5,svN:64.8,exp:73.0,coach:36.9,xg:1.624,xgc:1.572,formN:48.7,formScore:-0.04},
  "Uzbekistan":{elo:1718,eloN:39.8,svN:35.3,exp:16.0,coach:35.5,xg:1.314,xgc:0.593,formN:49.4,formScore:-0.036},
  "Sweden":{elo:1712,eloN:39.0,svN:75.0,exp:23.6,coach:17.9,xg:1.47,xgc:1.851,formN:0.0,formScore:-0.304},
  "Egypt":{elo:1696,eloN:37.0,svN:47.1,exp:57.6,coach:46.7,xg:1.186,xgc:0.811,formN:64.6,formScore:0.046},
  "Ivory Coast":{elo:1695,eloN:36.9,svN:74.0,exp:47.3,coach:67.8,xg:2.454,xgc:0.773,formN:82.6,formScore:0.144},
  "Jordan":{elo:1685,eloN:35.6,svN:20.1,exp:24.0,coach:33.1,xg:1.874,xgc:1.507,formN:30.1,formScore:-0.141},
  "DR Congo":{elo:1661,eloN:32.6,svN:52.0,exp:40.0,coach:51.9,xg:1.153,xgc:0.462,formN:60.9,formScore:0.026},
  "Tunisia":{elo:1628,eloN:28.5,svN:29.6,exp:57.1,coach:39.9,xg:1.322,xgc:1.327,formN:52.8,formScore:-0.018},
  "Iraq":{elo:1618,eloN:27.3,svN:20.1,exp:13.3,coach:49.9,xg:1.109,xgc:0.732,formN:56.8,formScore:0.004},
  "Bosnia-Herzegovina":{elo:1595,eloN:24.4,svN:55.9,exp:0.0,coach:17.3,xg:1.816,xgc:0.986,formN:35.4,formScore:-0.112},
  "Cape Verde":{elo:1578,eloN:22.2,svN:40.8,exp:17.7,coach:34.7,xg:1.623,xgc:1.184,formN:52.8,formScore:-0.018},
  "Saudi Arabia":{elo:1569,eloN:21.1,svN:1.5,exp:34.5,coach:30.4,xg:1.147,xgc:1.131,formN:23.1,formScore:-0.179},
  "New Zealand":{elo:1562,eloN:20.2,svN:20.1,exp:0.0,coach:16.3,xg:0.906,xgc:1.601,formN:41.0,formScore:-0.081},
  "Haiti":{elo:1548,eloN:18.5,svN:23.0,exp:21.3,coach:43.1,xg:1.436,xgc:1.071,formN:33.3,formScore:-0.123},
  "South Africa":{elo:1528,eloN:16.0,svN:31.9,exp:37.6,coach:50.5,xg:1.355,xgc:0.973,formN:34.9,formScore:-0.115},
  "Ghana":{elo:1510,eloN:13.8,svN:62.4,exp:31.2,coach:12.1,xg:1.423,xgc:1.074,formN:43.6,formScore:-0.068},
  "Curacao":{elo:1434,eloN:4.2,svN:25.6,exp:11.3,coach:37.3,xg:1.719,xgc:1.394,formN:45.6,formScore:-0.056},
  "Qatar":{elo:1421,eloN:2.6,svN:0.0,exp:57.4,coach:0.0,xg:0.637,xgc:1.533,formN:7.7,formScore:-0.262}
};

// Raw per-country source inputs (for the in-app source center; same numbers the model uses)
const SOURCE_INPUTS={
  "Spain":{elo:2155,sv:861,xg:2.909,xgc:0.879,exp:67.5,coach:78.5,f12:72.2,fq:88.9},
  "Argentina":{elo:2114,sv:820,xg:2.141,xgc:0.346,exp:100.0,coach:100.0,f12:86.1,fq:70.4},
  "France":{elo:2062,sv:1240,xg:2.485,xgc:0.965,exp:89.6,coach:82.4,f12:77.8,fq:88.9},
  "England":{elo:2021,sv:1345,xg:2.394,xgc:0.24,exp:87.8,coach:88.6,f12:77.8,fq:100.0},
  "Brazil":{elo:1991,sv:1135,xg:1.898,xgc:0.784,exp:75.9,coach:98.9,f12:63.9,fq:51.9},
  "Portugal":{elo:1986,sv:1000,xg:2.909,xgc:1.137,exp:60.4,coach:67.8,f12:75.0,fq:72.2},
  "Colombia":{elo:1977,sv:430,xg:2.201,xgc:1.08,exp:64.8,coach:51.9,f12:61.1,fq:51.9},
  "Netherlands":{elo:1944,sv:700,xg:2.886,xgc:0.733,exp:45.2,coach:55.4,f12:69.4,fq:83.3},
  "Ecuador":{elo:1938,sv:236,xg:0.635,xgc:0.324,exp:40.7,coach:38.3,f12:50.0,fq:59.3},
  "Germany":{elo:1932,sv:850,xg:2.44,xgc:0.834,exp:46.5,coach:62.5,f12:75.0,fq:83.3},
  "Norway":{elo:1914,sv:580,xg:3.654,xgc:0.738,exp:0.0,coach:59.9,f12:80.6,fq:100.0},
  "Croatia":{elo:1911,sv:326,xg:2.541,xgc:0.862,exp:70.6,coach:48.8,f12:69.4,fq:91.7},
  "Turkey":{elo:1911,sv:520,xg:2.283,xgc:1.144,exp:23.8,coach:60.9,f12:77.8,fq:79.2},
  "Japan":{elo:1906,sv:285,xg:1.648,xgc:0.478,exp:49.1,coach:70.3,f12:66.7,fq:84.4},
  "Belgium":{elo:1893,sv:549,xg:3.565,xgc:0.807,exp:57.7,coach:74.1,f12:77.8,fq:75.0},
  "Uruguay":{elo:1892,sv:424,xg:0.843,xgc:0.697,exp:61.7,coach:37.1,f12:47.2,fq:51.9},
  "Switzerland":{elo:1891,sv:282,xg:2.268,xgc:0.667,exp:52.4,coach:39.9,f12:69.4,fq:77.8},
  "Mexico":{elo:1915,sv:165,xg:1.528,xgc:0.61,exp:74.8,coach:53.1,f12:61.1,fq:75.0},
  "Senegal":{elo:1867,sv:470,xg:1.983,xgc:0.847,exp:74.0,coach:74.6,f12:69.4,fq:80.0},
  "Paraguay":{elo:1833,sv:95,xg:1.213,xgc:0.811,exp:29.4,coach:32.6,f12:50.0,fq:51.9},
  "Austria":{elo:1830,sv:340,xg:2.46,xgc:0.59,exp:23.0,coach:62.0,f12:77.8,fq:79.2},
  "Morocco":{elo:1827,sv:460,xg:2.11,xgc:0.345,exp:76.8,coach:88.3,f12:83.3,fq:100.0},
  "Canada":{elo:1838,sv:185,xg:1.187,xgc:0.444,exp:56.0,coach:43.1,f12:58.3,fq:75.0},
  "Scotland":{elo:1782,sv:210,xg:2.255,xgc:1.13,exp:13.2,coach:33.1,f12:61.1,fq:72.2},
  "Australia":{elo:1777,sv:41,xg:1.614,xgc:0.778,exp:36.2,coach:51.4,f12:61.1,fq:77.1},
  "Iran":{elo:1772,sv:51,xg:1.588,xgc:0.582,exp:38.2,coach:65.1,f12:58.3,fq:77.1},
  "Algeria":{elo:1760,sv:260,xg:1.883,xgc:0.49,exp:36.9,coach:73.5,f12:75.0,fq:83.3},
  "South Korea":{elo:1758,sv:184,xg:1.837,xgc:0.819,exp:39.8,coach:57.8,f12:69.4,fq:79.2},
  "Czechia":{elo:1740,sv:0,xg:2.178,xgc:1.21,exp:22.2,coach:53.6,f12:61.1,fq:60.0},
  "Panama":{elo:1730,sv:40,xg:1.751,xgc:1.285,exp:49.3,coach:41.0,f12:55.6,fq:80.0},
  "United States":{elo:1876,sv:270,xg:1.624,xgc:1.572,exp:73.0,coach:36.9,f12:52.8,fq:75.0},
  "Uzbekistan":{elo:1718,sv:70,xg:1.314,xgc:0.593,exp:16.0,coach:35.5,f12:55.6,fq:72.9},
  "Sweden":{elo:1712,sv:430,xg:1.47,xgc:1.851,exp:23.6,coach:17.9,f12:41.7,fq:33.3},
  "Egypt":{elo:1696,sv:120,xg:1.186,xgc:0.811,exp:57.6,coach:46.7,f12:58.3,fq:86.7},
  "Ivory Coast":{elo:1695,sv:410,xg:2.454,xgc:0.773,exp:47.3,coach:67.8,f12:77.8,fq:86.7},
  "Jordan":{elo:1685,sv:35,xg:1.874,xgc:1.507,exp:24.0,coach:33.1,f12:47.2,fq:60.4},
  "DR Congo":{elo:1661,sv:150,xg:1.153,xgc:0.462,exp:40.0,coach:51.9,f12:66.7,fq:74.4},
  "Tunisia":{elo:1628,sv:54,xg:1.322,xgc:1.327,exp:57.1,coach:39.9,f12:38.9,fq:93.3},
  "Iraq":{elo:1618,sv:35,xg:1.109,xgc:0.732,exp:13.3,coach:49.9,f12:66.7,fq:69.8},
  "Bosnia-Herzegovina":{elo:1595,sv:180,xg:1.816,xgc:0.986,exp:0.0,coach:17.3,f12:50.0,fq:63.3},
  "Cape Verde":{elo:1578,sv:90,xg:1.623,xgc:1.184,exp:17.7,coach:34.7,f12:55.6,fq:76.7},
  "Saudi Arabia":{elo:1569,sv:15,xg:1.147,xgc:1.131,exp:34.5,coach:30.4,f12:44.4,fq:55.6},
  "New Zealand":{elo:1562,sv:35,xg:0.906,xgc:1.601,exp:0.0,coach:16.3,f12:19.4,fq:100.0},
  "Haiti":{elo:1548,sv:40,xg:1.436,xgc:1.071,exp:21.3,coach:43.1,f12:44.4,fq:66.7},
  "South Africa":{elo:1528,sv:60,xg:1.355,xgc:0.973,exp:37.6,coach:50.5,f12:52.8,fq:60.0},
  "Ghana":{elo:1510,sv:242,xg:1.423,xgc:1.074,exp:31.2,coach:12.1,f12:38.9,fq:83.3},
  "Curacao":{elo:1434,sv:45,xg:1.719,xgc:1.394,exp:11.3,coach:37.3,f12:44.4,fq:80.0},
  "Qatar":{elo:1421,sv:14,xg:0.637,xgc:1.533,exp:57.4,coach:0.0,f12:22.2,fq:61.1}
};

// Squad market value (Transfermarkt, total per nation), for display on Nations tab
const SQUAD_VAL={"England":{m:1345,s:"€1.34bn"},"France":{m:1240,s:"€1.24bn"},"Brazil":{m:1135,s:"€1.14bn"},"Portugal":{m:1000,s:"€1bn"},"Spain":{m:861,s:"€861m"},"Argentina":{m:820,s:"€820m"},"Germany":{m:850,s:"€850m"},"Netherlands":{m:700,s:"€700m"},"Belgium":{m:549,s:"€549m"},"Uruguay":{m:424,s:"€424m"},"Norway":{m:580,s:"€580m"},"Croatia":{m:326,s:"€326m"},"Morocco":{m:460,s:"€460m"},"Japan":{m:285,s:"€285m"},"Switzerland":{m:282,s:"€282m"},"United States":{m:270,s:"€270m"},"Ghana":{m:242,s:"€242m"},"Ecuador":{m:236,s:"€236m"},"Senegal":{m:470,s:"€470m"},"Canada":{m:185,s:"€185m"},"South Korea":{m:184,s:"€184m"},"Turkey":{m:520,s:"€520m"},"Mexico":{m:165,s:"€165m"},"Colombia":{m:430,s:"€430m"},"Austria":{m:340,s:"€340m"},"Ivory Coast":{m:410,s:"€410m"},"Sweden":{m:430,s:"€430m"},"Egypt":{m:120,s:"€120m"},"Scotland":{m:210,s:"€210m"},"Australia":{m:41,s:"€41m"},"Iran":{m:51,s:"€51m"},"Tunisia":{m:54,s:"€54m"},"Algeria":{m:260,s:"€260m"},"Paraguay":{m:95,s:"€95m"},"Panama":{m:40,s:"€40m"},"Uzbekistan":{m:70,s:"€70m"},"Jordan":{m:35,s:"€35m"},"DR Congo":{m:150,s:"€150m"},"Iraq":{m:35,s:"€35m"},"Bosnia-Herzegovina":{m:180,s:"€180m"},"Cape Verde":{m:90,s:"€90m"},"Saudi Arabia":{m:15,s:"€15m"},"Qatar":{m:14,s:"€14m"},"South Africa":{m:60,s:"€60m"},"Haiti":{m:40,s:"€40m"},"New Zealand":{m:35,s:"€35m"},"Curacao":{m:45,s:"€45m"},"Czechia":{m:280,s:"€280m"}};



// Recent-form deviation (Option A: competitive 3x, opponent-quality weighted), for the VORM display badge
const FORM_DEV={"Spain":19,"Argentina":14,"France":16,"England":14,"Brazil":7,"Portugal":12,"Colombia":1,"Netherlands":10,"Ecuador":6,"Germany":0,"Norway":17,"Croatia":4,"Turkey":6,"Japan":5,"Belgium":15,"Uruguay":-17,"Switzerland":14,"Mexico":4,"Senegal":2,"Paraguay":-9,"Austria":9,"Morocco":22,"Canada":2,"Scotland":0,"Australia":12,"Iran":-3,"Algeria":13,"South Korea":6,"Czechia":-6,"Panama":-1,"United States":-14,"Uzbekistan":2,"Sweden":-24,"Egypt":-6,"Ivory Coast":10,"Jordan":-1,"DR Congo":-1,"Tunisia":-15,"Iraq":-3,"Bosnia-Herzegovina":-7,"Cape Verde":-4,"Saudi Arabia":-20,"New Zealand":-35,"Haiti":-9,"South Africa":-9,"Ghana":-15,"Curacao":-15,"Qatar":-28};


function composite(team){
  const f=MODEL_DATA[team];
  if(!f) return 50;
  return +(f.eloN*WEIGHTS.elo + f.svN*WEIGHTS.squadQuality +
           f.exp*WEIGHTS.experience + f.coach*WEIGHTS.coach +
           (f.formN||0)*WEIGHTS.recentForm).toFixed(1);
}

const COMPOSITE = Object.fromEntries(Object.keys(MODEL_DATA).map(t=>[t,composite(t)]));
const MODEL_ORDER = Object.keys(COMPOSITE).sort((a,b)=>COMPOSITE[b]-COMPOSITE[a]);
const COMPOSITE_RANK = Object.fromEntries(MODEL_ORDER.map((t,i)=>[t,i+1]));
COMPOSITE["Congo DR"]=COMPOSITE["DR Congo"];
COMPOSITE_RANK["Congo DR"]=COMPOSITE_RANK["DR Congo"];

const adjRank = t => COMPOSITE_RANK[t] || 40;
// Form indicator for the Group/Nations tabs, derived from the SAME source the
// model uses (formScore = ½ points last 12 + ½ points WC qualifying, hosts compensated).
// Scaled to a −5…+5 range (the strongest over/under-performer hits the extreme).
const FORM_SCALE = 16.447;   // 5 / 0.304 (max abs formScore, v2: 50% last-12 pts + 50% WC-qual pts)
const formDev = t => {
  const f = MODEL_DATA[t];
  if(!f || f.formScore===undefined) return undefined;
  const v = Math.round(f.formScore*FORM_SCALE);
  return Math.max(-5,Math.min(5,v));
};
const SHORT_NL = {"United States":"VS","South Africa":"Z-Afrika","Bosnia-Herzegovina":"Bosnie","Ivory Coast":"Ivoorkust","New Zealand":"Nw.-Zeeland","Saudi Arabia":"Saoedi-Arabië","DR Congo":"Congo DR","Cape Verde":"Kaapverdië","South Korea":"Zuid-Korea"};
const SHORT_EN = {"United States":"USA","South Africa":"S.Africa","Bosnia-Herzegovina":"Bosnia","Ivory Coast":"Ivory Cst","New Zealand":"NZ","Saudi Arabia":"Saudi Ar.","DR Congo":"DR Congo"};
const tShort=(t,lang)=>lang==="nl"?(SHORT_NL[t]||TEAM_NL[t]||t):(SHORT_EN[t]||t);

const FLAGS = {
  "Mexico":"🇲🇽","South Korea":"🇰🇷","South Africa":"🇿🇦","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Switzerland":"🇨🇭","Bosnia-Herzegovina":"🇧🇦","Qatar":"🇶🇦",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Haiti":"🇭🇹",
  "United States":"🇺🇸","Turkey":"🇹🇷","Australia":"🇦🇺","Paraguay":"🇵🇾",
  "Germany":"🇩🇪","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨","Curacao":"🇨🇼",
  "Netherlands":"🇳🇱","Japan":"🇯🇵","Sweden":"🇸🇪","Tunisia":"🇹🇳",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "Spain":"🇪🇸","Uruguay":"🇺🇾","Saudi Arabia":"🇸🇦","Cape Verde":"🇨🇻",
  "France":"🇫🇷","Senegal":"🇸🇳","Norway":"🇳🇴","Iraq":"🇮🇶",
  "Argentina":"🇦🇷","Austria":"🇦🇹","Algeria":"🇩🇿","Jordan":"🇯🇴",
  "Portugal":"🇵🇹","Colombia":"🇨🇴","Congo DR":"🇨🇩","Uzbekistan":"🇺🇿",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦",
};


const GROUP_NOTES = {
  A:{nl:"Mexico, Korea, ZA, Tsjechie",en:"Mexico, Korea, SA, Czechia"},
  B:{nl:"Canada vs Zwitserland",en:"Canada vs Switzerland"},
  C:{nl:"Brazilië vs Marokko: gevaarlijkste groep",en:"Brazil vs Morocco: toughest group"},
  D:{nl:"VS, Turkije, Australie, Paraguay",en:"USA, Turkey, Australia, Paraguay"},
  E:{nl:"Duitsland vs Ecuador: verrassing verwacht",en:"Germany vs Ecuador: upset alert"},
  F:{nl:"Nederland vs Japan: gelijkopgaand",en:"Netherlands vs Japan: dead even"},
  G:{nl:"Belgie vs Egypte: Salah's WK",en:"Belgium vs Egypt: Salah's World Cup"},
  H:{nl:"Spanje favoriet, Uruguay gevaarlijk",en:"Spain favourite, Uruguay danger"},
  I:{nl:"Frankrijk vs Haaland's Noorwegen",en:"France vs Haaland's Norway"},
  J:{nl:"Argentinië, Colombia, Oostenrijk, Algerije",en:"Argentina, Colombia, Austria, Algeria"},
  K:{nl:"Portugal, Colombia, Congo, Oezbekistan",en:"Portugal, DR Congo, Uzbekistan"},
  L:{nl:"Engeland favoriet, Kroatie gevaarlijk",en:"England favourite, Croatia danger"},
};
const GROUPS = [
  {id:"A",teams:["Mexico","South Korea","South Africa","Czechia"]},
  {id:"B",teams:["Canada","Switzerland","Bosnia-Herzegovina","Qatar"]},
  {id:"C",teams:["Brazil","Morocco","Scotland","Haiti"]},
  {id:"D",teams:["United States","Turkey","Australia","Paraguay"]},
  {id:"E",teams:["Germany","Ivory Coast","Ecuador","Curacao"]},
  {id:"F",teams:["Netherlands","Japan","Sweden","Tunisia"]},
  {id:"G",teams:["Belgium","Egypt","Iran","New Zealand"]},
  {id:"H",teams:["Spain","Uruguay","Saudi Arabia","Cape Verde"]},
  {id:"I",teams:["France","Senegal","Norway","Iraq"]},
  {id:"J",teams:["Argentina","Austria","Algeria","Jordan"]},
  {id:"K",teams:["Portugal","Colombia","Congo DR","Uzbekistan"]},
  {id:"L",teams:["England","Croatia","Ghana","Panama"]},
];

// MATCHES, QF, SF, FINAL_TEAMS are all DERIVED LIVE from the engine below
// (after model2Score/knockoutScore are defined) — single source of truth.
let MATCHES = {};

const OUTLOOK = {
  over:[
    {team:"Norway",rank:41,adj:-18,projection:{nl:"Achtste finale / Kwartfinale",en:"Round of 16 / QF"},group:"I",
     headline:{nl:"Haaland's eerste WK: het gevaarlijkste debuut ooit",en:"Haaland's first World Cup: the most dangerous debut ever"},
     reasons:{nl:[
       "Haaland scoorde 16 doelpunten in de kwalificatie: meer dan elke andere speler in Europa",
       "Noorwegen verloor geen enkele kwalificatiewedstrijd en deed dat op overtuigende wijze",
       "Odegaard leidde Arsenal naar het Premier League-kampioenschap in 2025-26",
       "Opener vs Irak is nagenoeg zeker te winnen; daarna Senegal voor een plek in de achtste finale",
       "Eerste WK sinds 1998: geen druk van buiten, maximale honger van binnen"
     ],en:[
       "Haaland scored 16 goals in qualifying: more than any other player in Europe",
       "Norway lost zero qualifying matches and did so convincingly",
       "Odegaard led Arsenal to the Premier League title in 2025-26",
       "Opener vs Iraq is virtually certain to win; then Senegal for a place in the last 16",
       "First World Cup since 1998: no external pressure, maximum internal hunger"
     ]},
     risk:{nl:"Als Odegaard niet op topniveau is, valt de creatieve verbinding met Haaland weg.",en:"If Odegaard is not at his top level, the creative link to Haaland breaks down."}},

    {team:"Japan",rank:18,adj:-10,projection:{nl:"Achtste finale, mogelijk kwartfinale",en:"Last 16, potentially QF"},group:"F",
     headline:{nl:"Versloeg Brazilië en Engeland en is klaar voor meer",en:"Beat Brazil and England and is ready for more"},
     reasons:{nl:[
       "Versloeg Brazilië 1-0 en Engeland 2-1 in voorbereidingswedstrijden in juni 2026",
       "In 2022 versloegen ze Duitsland én Spanje in de groepsfase: dit team is mentaal ijzersterk",
       "Kubo (Real Sociedad) draagt de aanval nu Mitoma geblesseerd is",
       "Moriyasu's pressing-systeem is het best gecoacht van alle Aziatische ploegen ooit",
       "Opener vs Nederland is statistisch nagenoeg gelijkopgaand: winst zou alles veranderen"
     ],en:[
       "Beat Brazil 1-0 and England 2-1 in June 2026 preparation matches",
       "In 2022 they beat Germany and Spain in the group stage: this team is mentally ironclad",
       "Kubo (Real Sociedad) carries the attack now Mitoma is injured",
       "Moriyasu's pressing system is the best-coached of any Asian team ever",
       "Opener vs Netherlands is statistically near even: a win would change everything"
     ]},
     risk:{nl:"Mitoma's afwezigheid vermindert hun aanvalsbreedte significant. Kubo moet het alleen doen.",en:"Mitoma's absence significantly reduces attacking width. Kubo has to do it alone."}},

    {team:"Morocco",rank:8,adj:-3,projection:{nl:"Kwartfinale naar Halve finale",en:"QF to SF"},group:"C",
     headline:{nl:"Het meest onderschatte team van het toernooi",en:"The most underestimated team at the tournament"},
     reasons:{nl:[
       "Wonnen alle 10 CAF-kwalificatiewedstrijden: geen enkel ander WK-deelnemer deed dat",
       "2022 halvefinalisten: versloegen Spanje en Portugal onderweg. Dat was geen toeval",
       "Regragui bouwt het beste georganiseerde verdedigingssysteem van Afrika ooit",
       "Hakimi, Amrabat, Brahim Diaz: drie spelers van Champions League-niveau in de basis",
       "Groep C (Brazilië, Schotland, Haïti): als groepswinnaar ontwijken ze de zwaarste kant"
     ],en:[
       "Won all 10 CAF qualifying matches: no other World Cup participant did that",
       "2022 semi-finalists: beat Spain and Portugal along the way. That was no fluke",
       "Regragui builds the best-organised defensive system Africa has ever produced",
       "Hakimi, Amrabat, Brahim Diaz: three Champions League-level players in the starting XI",
       "Group C (Brazil, Scotland, Haiti): as group winners they avoid the tougher bracket half"
     ]},
     risk:{nl:"Hakimi heeft een kleine hamstringkwetsuur. Als hij niet fit is, verliest hun rechterkant haar gevaar.",en:"Hakimi has a minor hamstring issue. If not fit, their right side loses its danger."}},

    {team:"Ecuador",rank:23,adj:-8,projection:{nl:"Achtste finale, mogelijk kwartfinale",en:"Last 16, potentially QF"},group:"E",
     headline:{nl:"Caicedo en Paez zijn een van de beste middenveldduo's",en:"Caicedo and Paez are one of the best midfield duos"},
     reasons:{nl:[
       "Ongeslagen kwalificatiecampagne, geen enkel verlies op weg naar het WK",
       "Moises Caicedo (Chelsea) is een van de vijf beste defensieve middenvelders ter wereld",
       "Kendry Paez (19) is de meest opwindende tiener van het toernooi buiten Yamal",
       "Enner Valencia (39) geeft aanvalsleiderschap en straalkracht die niet te kopen is",
       "Speelt georganiseerd, direct en pijnigt elke ploeg op de tegenaanval"
     ],en:[
       "Unbeaten qualifying campaign, zero losses on the road to the World Cup",
       "Moises Caicedo (Chelsea) is one of the five best defensive midfielders in the world",
       "Kendry Paez (19) is the most exciting teenager at the tournament outside Yamal",
       "Enner Valencia (39) provides the attacking leadership and charisma money cannot buy",
       "Plays organised, direct football and punishes any team on the counter-attack"
     ]},
     risk:{nl:"Groep E heeft Duitsland. Ecuador moet het maximale halen uit de wedstrijden tegen Ivoorkust en Curaçao.",en:"Group E has Germany. Ecuador must extract maximum points from the matches against Ivory Coast and Curacao."}},

    {team:"Colombia",rank:13,adj:-7,projection:{nl:"Achtste finale, mogelijk kwartfinale",en:"Last 16, possibly QF"},group:"K",
     headline:{nl:"Copa América-finalisten met ideale loting",en:"Copa América finalists with an ideal draw"},
     reasons:{nl:[
       "Luis Diaz (Liverpool) had zijn beste seizoen ooit: 22 goals, 10 assists in 2025-26",
       "Copa América 2024 finalisten: verloren pas in de finale van Uruguay",
       "Groep K (Portugal, DR Congo, Oezbekistan): Colombia wint de groep als Diaz presteert",
       "Rios (Bayer Leverkusen) is uitgegroeid tot een van de sterkste centrale middenvelders",
       "Jong, snel en atletisch: gebouwd voor de tegenaanval in de hitte van de VS"
     ],en:[
       "Luis Diaz (Liverpool) had his best-ever season: 22 goals, 10 assists in 2025-26",
       "Copa América 2024 finalists: only beaten in the final by Uruguay",
       "Group K (Portugal, Congo DR, Uzbekistan): Colombia wins the group if Diaz performs",
       "Rios (Bayer Leverkusen) has grown into one of the strongest central midfielders",
       "Young, fast and athletic: built for the counter in the heat of the USA"
     ]},
     risk:{nl:"Als Diaz een slechte dag heeft, valt hun aanvalspotentieel dramatisch terug. De ploeg heeft geen plan B van gelijke kwaliteit.",en:"If Diaz has a bad day, their attacking potential drops dramatically. The team has no plan B of equal quality."}},

    {team:"Egypt",rank:37,adj:-9,projection:{nl:"Groepsfase naar achtste finale",en:"Groups to last 16"},group:"G",
     headline:{nl:"Salah's eerste WK en de loting is perfect",en:"Salah's first World Cup and the draw is perfect"},
     reasons:{nl:[
       "Mohamed Salah arriveert op zijn allereerste WK op 33: Liverpool's all-time topscorer in piekjaren",
       "Omar Marmoush (Man City) scoorde dit seizoen 30+ doelpunten: een van de gevaarlijkste aanvallers ter wereld",
       "Groep G (België, Iran, Nieuw-Zeeland) is voor Egypte de zachtste mogelijke loting",
       "26 punten uit 10 CAF-kwalificatiewedstrijden: de beste score van Afrika",
       "Egypte wint altijd hun kwalificatiewedstrijden maar verliest altijd in knockouts: het format helpt hen nu"
     ],en:[
       "Mohamed Salah arrives at his very first World Cup at 33: Liverpool's all-time top scorer in his peak years",
       "Omar Marmoush (Man City) scored 30+ goals this season: one of the most dangerous forwards in the world",
       "Group G (Belgium, Iran, New Zealand) is for Egypt the softest possible draw",
       "26 points from 10 CAF qualifying matches: the best tally in Africa",
       "Egypt always win their qualifiers but always lose in knockouts: the format now works in their favour"
     ]},
     risk:{nl:"Voorbij de achtste finale wacht vrijwel zeker een topland. Salah heeft nog nooit zo ver gereikt: de mentale drempel is onbekend.",en:"Beyond the last 16 a top side almost certainly awaits. Salah has never reached that far: the mental threshold is unknown."}},
  ],
  under:[
    {team:"Belgium",rank:9,adj:+8,projection:{nl:"Achtste finale exit",en:"Last 16 exit"},group:"G",
     headline:{nl:"Gouden generatie, maar de goudkoorts is over",en:"Golden generation, but the golden age is over"},
     reasons:{nl:[
       "WK 2022: 1 doelpunt in 3 wedstrijden, uitgeschakeld in de groepsfase achter Marokko",
       "De Bruyne bij Napoli: beperkte speeltijd door blessures, niet de versie van 2018",
       "Lukaku (31) speelt fysiek significant minder explosief dan in zijn beste jaren",
       "EURO 2024: uitgeschakeld in de groepsfase voor de tweede keer op een groot toernooi",
       "Op papier al negen jaar in de top 10: nooit verder dan de kwartfinale gekomen"
     ],en:[
       "2022 World Cup: 1 goal in 3 games, knocked out in the group stage behind Morocco",
       "De Bruyne at Napoli: limited game time through injury, not the 2018 version",
       "Lukaku (31) plays significantly less explosively than in his best years",
       "Euro 2024: knocked out in the group stage for the second time at a major tournament",
       "On paper in the top 10 for nine years: never reached beyond the quarter-finals"
     ]},
     risk:{nl:"Jeremy Doku (Man City) en Kevin De Bruyne op één goede dag kunnen elke ploeg verslaan. Maar één dag is niet genoeg voor een toernooi.",en:"Jeremy Doku (Man City) and Kevin De Bruyne on one good day can beat anyone. But one day is not enough to win a tournament."}},

    {team:"England",rank:4,adj:+6,projection:{nl:"Achtste finale exit",en:"Last 16 exit"},group:"L",
     headline:{nl:"Bellingham is wereldklasse. De ploeg eromheen niet altijd",en:"Bellingham is world class. The team around him is not always"},
     reasons:{nl:[
       "WK 1990, 2018: halvefinalisten. WK 1998, 2002, 2006, 2010, 2014: vroege uitschakelingen. Het patroon is hardnekkig",
       "Tuchel veranderde de structuur maar niet het fundamentele knockoutprobleem: angst voor verlies",
       "De diepte achter Bellingham en Saka is aanzienlijk minder dan die van Spanje of Frankrijk",
       "Engeland treft in de knockouts bijna zeker Argentinië: de slechtst mogelijke tegenstander psychologisch",
       "De FA-cultuur rond het elftal creëert de zwaarste mediapressie van elk WK-deelnemer"
     ],en:[
       "WC 1990, 2018: semi-finals. WC 1998, 2002, 2006, 2010, 2014: early exits. The pattern is stubborn",
       "Tuchel changed the structure but not the fundamental knockout problem: fear of losing",
       "The depth behind Bellingham and Saka is significantly weaker than Spain or France",
       "England almost certainly face Argentina in the knockouts: the worst possible psychological opponent",
       "The FA culture around the squad creates the heaviest media pressure of any World Cup participant"
     ]},
     risk:{nl:"Als Bellingham speelt zoals hij kan, en Kane scoort, heeft Engeland meer kwaliteit dan wie ook op hun dag. Dat is het probleem: consistent zijn over zes wedstrijden.",en:"If Bellingham plays as he can, and Kane scores, England have more quality than anyone on their day. That is the problem: being consistent across six matches."}},

    {team:"Germany",rank:10,adj:+8,projection:{nl:"Achtste finale naar kwartfinale",en:"Last 16 to QF"},group:"E",
     headline:{nl:"Spannende jeugd, maar de druk thuis is meedogenloos",en:"Exciting youth, but the pressure at home is merciless"},
     reasons:{nl:[
       "Verloren 2-0 van Slowakije in de kwalificatie: een land van 5,5 miljoen versloeg Duitsland",
       "2018: regerend wereldkampioen en als laatste in de groep geëindigd. Dat trauma zit er nog in",
       "Musiala en Wirtz zijn uitzonderlijk maar spelen hun eerste grote toernooi als basisspelers",
       "Havertz als centrumspits is een gamble: hij scoort inconsistent voor een topeltfal",
       "Verwachtingen in Duitsland zijn altijd maximaal: dat maakt jonge spelers fragiel bij tegenslagen"
     ],en:[
       "Lost 2-0 to Slovakia in qualifying: a country of 5.5 million beat Germany",
       "2018: defending world champions and finished last in their group. That trauma is still present",
       "Musiala and Wirtz are exceptional but this is their first major tournament as starting players",
       "Havertz as centre-forward is a gamble: he scores inconsistently for a top side",
       "Expectations in Germany are always maximum: that makes young players fragile under pressure"
     ]},
     risk:{nl:"Als Musiala en Wirtz hun niveau halen tegelijk, is Duitsland zo sterk als de favorietenlijst aangeeft. Maar samen op topniveau is tot nu toe zeldzaam geweest.",en:"If Musiala and Wirtz reach their level simultaneously, Germany are as strong as the favourites list suggests. But both at peak level at the same time has been rare so far."}},

    {team:"Brazil",rank:6,adj:+7,projection:{nl:"Kwartfinale exit",en:"QF exit"},group:"C",
     headline:{nl:"Drie blessures, een debuterende coach en Marokko in de groep",en:"Three injuries, a debutant coach and Morocco in the group"},
     reasons:{nl:[
       "Geen WK-overwinning sinds 2002: 24 jaar zonder titel is niet te verklaren met individueel talent alleen",
       "Ancelotti coacht zijn eerste internationale toernooi ooit op 66-jarige leeftijd: nul ervaring met interlandvoetbal",
       "Rodrygo (ACL), Estêvão (hamstring) en Neymar (kuit, twijfelachtig) zijn allemaal weg of in twijfel",
       "Verloren van Japan in een junivoorbereiding: een land dat ze 20 jaar geleden nooit verloren aan",
       "Marokko in de groep is de zwaarste mogelijke groepstegenstander: perfecte stijl om Brazil te neutraliseren"
     ],en:[
       "No World Cup win since 2002: 24 years without a title cannot be explained by individual talent alone",
       "Ancelotti coaches his very first international tournament at 66: zero experience with international football",
       "Rodrygo (ACL), Estêvão (hamstring) and Neymar (calf, doubtful) are all out or in doubt",
       "Lost to Japan in a June warm-up: a country they would never have lost to twenty years ago",
       "Morocco in the group is the toughest possible group opponent: perfect style to neutralise Brazil"
     ]},
     risk:{nl:"Als Vinicius, Endrick en Raphinha alle drie in topvorm zijn tegelijk, is Brazil gevaarlijk voor iedereen. Dat is echter zelden gebeurd bij grote toernooien.",en:"If Vinicius, Endrick and Raphinha are all in top form simultaneously, Brazil are dangerous for anyone. That has, however, rarely happened at major tournaments."}},
  ],
};

let QF=[], SF=[], FINAL_TEAMS=[];   // all derived live below from the engine
// ─────────────────────────────────────────────────────────────────────────────
// END MODEL CONFIGURATION — app code below, no model changes needed there
// ─────────────────────────────────────────────────────────────────────────────

// ── MODEL 2: EXPECTED-GOALS ENGINE ──────────────────────────────────────────
// Model 1 (COMPOSITE) decides WHO wins; Model 2 decides the SCORELINE HEIGHT,
// from real goals scored/conceded over the last 12 months (martj42 dataset).
// The rounded scoreline is then reconciled with Model 1 so the stronger team
// (higher composite) is never shown losing.
// Expected goals via attack-strength model:
//   goals_A = baseline × (A.xG / leagueAvgXG) × (B.xGc / leagueAvgXGc)
// A's attacking strength relative to average, multiplied by B's defensive
// weakness relative to average. Multiplicative so a strong attack against a
// strong defence is genuinely suppressed, and a mismatch genuinely amplified.
const GEM_XG=1.85, GEM_XGC=0.90, GOAL_BASE=1.38;
function expectedGoals(a,b){
  const da=MODEL_DATA[a], db=MODEL_DATA[b];
  const xa=da?.xg??GEM_XG, xca=da?.xgc??GEM_XGC;
  const xb=db?.xg??GEM_XG, xcb=db?.xgc??GEM_XGC;
  const ea=GOAL_BASE*(xa/GEM_XG)*(xcb/GEM_XGC);
  const eb=GOAL_BASE*(xb/GEM_XG)*(xca/GEM_XGC);
  return [Math.max(0.15,ea),Math.max(0.15,eb)];
}
// Deterministic scoreline: amplify the expected-goals margin so dominant
// matchups produce realistic big scorelines (3-0, 4-1), then reconcile with
// Model 1 (composite) so rounding never flips the win/draw/loss outcome.
// Score engine. The composite (team strength) decides the OUTCOME and the
// MARGIN via fixed ranges; xG/xGc fill in the actual height of the scoreline.
//   |gap| < 20  → draw
//   20–35       → win by 1
//   35–50       → win by 2
//   > 50        → win by 3
// The loser's tally comes from their own expected goals (so an attacking match
// runs higher, a defensive one stays low); the winner is loser + margin.
function marginFromGap(g){
  g=Math.abs(g);
  if(g<20) return 0;
  if(g<35) return 1;
  if(g<50) return 2;
  return 3;
}
function model2Score(a,b){
  const [ea,eb]=expectedGoals(a,b);
  const ca=COMPOSITE[a]??50, cb=COMPOSITE[b]??50;
  const diff=ca-cb;
  const margin=marginFromGap(diff);
  if(margin===0){                                 // draw — height from combined xG
    const lvl=Math.max(0,Math.round((ea+eb)/2));
    return [lvl,lvl];
  }
  if(diff>0){                                     // A wins by `margin`
    const loser=Math.max(0,Math.round(eb));
    return [loser+margin, loser];
  }
  const loser=Math.max(0,Math.round(ea));         // B wins by `margin`
  return [loser, loser+margin];
}

// Knockout scoreline now comes from Model 2 (expected goals), reconciled with
// Model 1. Knockouts cannot end level, so a model-1 draw is broken by composite.
function knockoutScore(a,b){
  let [ga,gb]=model2Score(a,b);
  if(ga===gb){                       // no draws in knockout — higher composite edges it
    const ca=COMPOSITE[a]??50, cb=COMPOSITE[b]??50;
    if(ca>=cb) ga=gb+1; else gb=ga+1;
  }
  return [ga,gb];
}

function calcStandings(gid,teams){
  const ms=MATCHES[gid]||[];
  const pts={},gf={},ga={};
  teams.forEach(t=>{pts[t]=0;gf[t]=0;ga[t]=0;});
  ms.forEach(({t1,t2,s1,s2})=>{
    gf[t1]+=s1;ga[t1]+=s2;gf[t2]+=s2;ga[t2]+=s1;
    if(s1>s2)pts[t1]+=3;else if(s2>s1)pts[t2]+=3;else{pts[t1]+=1;pts[t2]+=1;}
  });
  return[...teams].sort((a,b)=>pts[b]-pts[a]||(gf[b]-ga[b])-(gf[a]-ga[a]));
}

// ── LIVE BRACKET DERIVATION — single source of truth ────────────────────────
// MATCHES (group scores), QF and SF are computed here from the same engine
// (composite + model2Score + knockoutScore) that the rest of the app uses.
// Nothing is pre-baked, so the displayed results can never drift from the model.
(function deriveBracket(){
  // Group fixtures: seed by composite, pair (s0,s2),(s1,s3),(s0,s1),(s2,s3),(s0,s3),(s1,s2)
  const PAIR_IDX=[[0,2],[1,3],[0,1],[2,3],[0,3],[1,2]];
  GROUPS.forEach(g=>{
    const seeded=[...g.teams].sort((a,b)=>(COMPOSITE[b]??0)-(COMPOSITE[a]??0));
    MATCHES[g.id]=PAIR_IDX.map(([i,j])=>{
      const t1=seeded[i],t2=seeded[j];
      const [s1,s2]=model2Score(t1,t2);
      return {t1,t2,s1,s2};
    });
  });
  // Group standings → winners, runners-up, and best four third-placed teams
  const winners=[],runners=[],thirds=[];
  GROUPS.forEach(g=>{
    const tbl=calcStandings(g.id,g.teams);
    winners.push(tbl[0]); runners.push(tbl[1]); thirds.push(tbl[2]);
  });
  const bestThirds=[...thirds].sort((a,b)=>(COMPOSITE[b]??0)-(COMPOSITE[a]??0)).slice(0,4);
  // Top-8 knockout bracket, seeded by composite (highest vs lowest)
  const top8=[...winners,...runners,...bestThirds].sort((a,b)=>(COMPOSITE[b]??0)-(COMPOSITE[a]??0)).slice(0,8);
  QF=[[top8[0],top8[7]],[top8[3],top8[4]],[top8[2],top8[5]],[top8[1],top8[6]]];
  const qfW=QF.map(([a,b])=>{const [sa,sb]=knockoutScore(a,b);return sa>=sb?a:b;});
  SF=[[qfW[0],qfW[1]],[qfW[2],qfW[3]]];
})();

const GROUP_DATA=GROUPS.map(g=>({...g,table:calcStandings(g.id,g.teams),matches:MATCHES[g.id]||[]}));
// Resolve the finalists from the semifinal results (model-consistent: the SF winner advances)
FINAL_TEAMS=SF.map(([a,b])=>{const [sa,sb]=knockoutScore(a,b);return sa>=sb?a:b;});
const KO_SCORES={};
[...QF,...SF,FINAL_TEAMS].forEach(([a,b])=>{KO_SCORES[`${a}-${b}`]=knockoutScore(a,b);});
const [fsA,fsB]=KO_SCORES[`${FINAL_TEAMS[0]}-${FINAL_TEAMS[1]}`]||[2,1];

// ── CONTEXTS ──────────────────────────────────────────────────────────────────
const LangCtx=createContext("nl");
const ThemeCtx=createContext(THEMES.default);
const NavCtx=createContext({setTab:()=>{},setNationsOpen:()=>{}});
const useLang=()=>useContext(LangCtx);
const useTheme=()=>useContext(ThemeCtx);
const useT=()=>LANG[useContext(LangCtx)];
const useNav=()=>useContext(NavCtx);
const tName=(t,lang)=>lang==="nl"?(TEAM_NL[t]||t):t;
const mExpl=(k,lang)=>MATCH_EXPL[lang]?.[k]||"";
const koExpl=(k,lang)=>KO_EXPL[lang]?.[k]||"";

// ── CHEVRON ICON — consistent open/close indicator ──────────────────────────
// Same SVG in both states, just rotated. Eliminates ▾/▲ glyph size inconsistency.

// ── NEWS SECTION — live-fetched from Claude API on mount ─────────────────────
// ── WK NEWS — fetched live from RSS feeds via public proxy ───────────────────
// Fallback articles shown while loading or on error.
// Two sections: IMPORTANT (major/older news, keyword style) + RECENT (last 7 days, full)
const NEWS_FALLBACK_IMPORTANT = [
  {player:"Rodrygo",       team:"Brazil",      flag:"🇧🇷",status:"out",    date:"2026-04-28",
   kw:{nl:"ACL · niet geselecteerd",en:"ACL · not selected"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Xavi Simons",   team:"Netherlands", flag:"🇳🇱",status:"out",    date:"2026-04-28",
   kw:{nl:"ACL april · volledig toernooi afwezig",en:"ACL April · entire tournament out"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Santiago Gimenez",team:"Mexico",    flag:"🇲🇽",status:"out",    date:"2026-05-15",
   kw:{nl:"Blessure · AC Milan · niet geselecteerd",en:"Injury · AC Milan · not selected"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Estêvão",       team:"Brazil",      flag:"🇧🇷",status:"out",    date:"2026-05-10",
   kw:{nl:"Hamstring · Real Madrid · niet geselecteerd",en:"Hamstring · Real Madrid · not selected"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Leonardo Balerdi",team:"Argentina", flag:"🇦🇷",status:"out",    date:"2026-06-01",
   kw:{nl:"Kuit · definitief afwezig",en:"Calf · definitively out"},
   url:"https://rg.org/news/soccer/world-cup-2026-live-todays-matches-results-scores-news"},
  {player:"Lennart Karl",  team:"Germany",     flag:"🇩🇪",status:"out",    date:"2026-06-05",
   kw:{nl:"Dijbeenspier training · vervangen door Leipzig 20-jr",en:"Thigh training · replaced by Leipzig 20yo"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Arda Guler",    team:"Turkey",      flag:"🇹🇷",status:"doubtful",date:"2026-06-03",
   kw:{nl:"Hamstring · Real Madrid · major doubt",en:"Hamstring · Real Madrid · major doubt"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
];

const NEWS_FALLBACK_RECENT = [
  {player:"Lionel Messi",  team:"Argentina",   flag:"🇦🇷",status:"doubtful",date:"2026-06-05",
   headline:{nl:"Hamstring twijfelachtig: opener vs Algerije onzeker",en:"Hamstring doubtful: opener vs Algeria uncertain"},
   detail:{nl:"Blessure 26 mei bij Inter Miami. Traint gedeeltelijk. Coach Scaloni: 'vervangen als niet 100%.'",
           en:"Injured May 26 at Inter Miami. Training partially. Scaloni: 'will replace if not 100%.'"},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Neymar Jr",     team:"Brazil",       flag:"🇧🇷",status:"doubtful",date:"2026-06-03",
   headline:{nl:"Kuit: grensgeval voor opener vs Marokko (13 jun)",en:"Calf: borderline for opener vs Morocco (Jun 13)"},
   detail:{nl:"Kuitblessure 17 mei. Teamarts: 'max drie weken.' Ancelotti wacht af.",
           en:"Calf injury May 17. Team doctor: 'up to three weeks.' Ancelotti waiting."},
   url:"https://www.espn.com/soccer/story/_/id/48572979/2026-fifa-world-cup-injuries-tracker-which-stars-miss-latest-info"},
  {player:"Nacho Molina",  team:"Argentina",    flag:"🇦🇷",status:"doubtful",date:"2026-06-04",
   headline:{nl:"Dijbeen: traint apart van de groep",en:"Thigh: training separately from group"},
   detail:{nl:"Scaloni bevestigt aanpak: wie niet 100% fit is wordt vervangen voor de opener.",
           en:"Scaloni confirms: anyone not 100% fit will be replaced before the opener."},
   url:"https://rg.org/news/soccer/world-cup-2026-live-todays-matches-results-scores-news"},
  {player:"Julio Enciso",  team:"Paraguay",     flag:"🇵🇾",status:"doubtful",date:"2026-06-05",
   headline:{nl:"Hamstring: waarschijnlijk afwezig voor opener",en:"Hamstring: likely absent for opener"},
   detail:{nl:"Blessure tijdens oefenwedstrijd vs Nicaragua op 5 juni.",
           en:"Injured in friendly vs Nicaragua on June 5."},
   url:"https://sports.yahoo.com/soccer/live/2026-world-cup-news-live-tracker-injuries-squads-storylines-and-updates-as-the-tournament-looms-200000653.html"},
  {player:"Scaloni",       team:"Argentina",    flag:"🇦🇷",status:"news",   date:"2026-06-06",
   headline:{nl:"'Elke speler die niet 100% is wordt vervangen'",en:"'Every player not 100% fit will be replaced'"},
   detail:{nl:"Coach bevestigde aanpak voor opener (16 jun vs Algerije). Messi, Molina en Paredes in onzekerheid.",
           en:"Coach confirmed approach for opener (Jun 16 vs Algeria). Messi, Molina and Paredes in doubt."},
   url:"https://sports.yahoo.com/soccer/live/2026-world-cup-news-live-tracker-injuries-squads-storylines-and-updates-as-the-tournament-looms-200000653.html"},
];

// Public RSS proxy — no API key, works on any host
// Fetches from multiple WC2026 news sources and merges results
function NewsSection(){
  const T=useTheme();
  const lang=useLang();
  const [liveItems,setLiveItems]=React.useState(null);
  const [loadingLive,setLoadingLive]=React.useState(true);
  const [expandedImportant,setExpandedImportant]=React.useState(false);
  const [expandedRecent,setExpandedRecent]=React.useState(false);

  const statusColor={out:"#C0392B",doubtful:"#E07000",fit:"#1E7A40",news:"#1A5296"};
  const statusLabel={nl:{out:"Afwezig",doubtful:"Twijfelachtig",fit:"Fit",news:"Nieuws"},
                     en:{out:"Out",doubtful:"Doubtful",fit:"Fit",news:"News"}};

  // Relative date label for recent items
  const relativeDate=(dateStr)=>{
    const today=new Date(); today.setHours(0,0,0,0);
    const d=new Date(dateStr); d.setHours(0,0,0,0);
    const diff=Math.round((today-d)/(1000*60*60*24));
    if(diff===0) return lang==="nl"?"vandaag":"today";
    if(diff===1) return lang==="nl"?"gisteren":"yesterday";
    const days=lang==="nl"
      ?["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"]
      :["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return days[d.getDay()];
  };

  // Live news from BBC Sport World Cup RSS — most reliable free source with actual article links.
  // Fallback to Guardian Football RSS if BBC returns nothing relevant.
  // allorigins.win is a public CORS proxy that works cross-origin without API keys.
  React.useEffect(()=>{
    const SEVEN_DAYS_AGO=new Date(Date.now()-7*24*60*60*1000);
    // Ordered by reliability and WC2026 coverage quality
    const RSS_SOURCES=[
      {url:"https://feeds.bbci.co.uk/sport/football/rss.xml",             name:"BBC Sport"},
      {url:"https://www.theguardian.com/football/rss",                     name:"The Guardian"},
      {url:"https://www.goal.com/feeds/en/news",                           name:"Goal.com"},
    ];
    const proxy="https://api.allorigins.win/get?url=";

    Promise.allSettled(
      RSS_SOURCES.map(({url,name})=>
        fetch(proxy+encodeURIComponent(url),{signal:AbortSignal.timeout(6000)})
          .then(r=>r.json())
          .then(d=>({xml:d.contents||"",source:name}))
      )
    ).then(results=>{
      const items=[];
      results.forEach(r=>{
        if(r.status!=="fulfilled"||!r.value?.xml) return;
        const {xml,source}=r.value;
        const parser=new DOMParser();
        const doc=parser.parseFromString(xml,"text/xml");
        doc.querySelectorAll("item").forEach(item=>{
          const title=(item.querySelector("title")?.textContent||"").replace(/<!\[CDATA\[|\]\]>/g,"").trim();
          // BBC uses <link> as text node between tags; Guardian uses it directly
          const linkEl=item.querySelector("link");
          const link=linkEl?.textContent?.trim()||linkEl?.getAttribute("href")||"";
          const pubDate=item.querySelector("pubDate")?.textContent||"";
          const desc=(item.querySelector("description")?.textContent||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/<[^>]+>/g,"").trim();
          const lower=(title+" "+desc).toLowerCase();
          // Filter: must mention World Cup 2026 or key tournament context
          const wc=["world cup","worldcup","wc 2026","wc2026","fifa 2026","2026 world","world cup 2026",
                    "wk 2026","wk2026"].some(k=>lower.includes(k));
          if(!wc) return;
          const date=pubDate?new Date(pubDate):new Date();
          if(date<SEVEN_DAYS_AGO) return;
          // Team detection for flag
          const teams=[
            ["Argentina","🇦🇷"],["Brazil","🇧🇷"],["France","🇫🇷"],["England","🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
            ["Spain","🇪🇸"],["Germany","🇩🇪"],["Netherlands","🇳🇱"],["Morocco","🇲🇦"],
            ["Japan","🇯🇵"],["Norway","🇳🇴"],["Belgium","🇧🇪"],["Portugal","🇵🇹"],
            ["Colombia","🇨🇴"],["Uruguay","🇺🇾"],["Croatia","🇭🇷"],["Switzerland","🇨🇭"],
            ["United States","🇺🇸"],["USA","🇺🇸"],["Mexico","🇲🇽"],["Ecuador","🇪🇨"],
            ["Turkey","🇹🇷"],["Australia","🇦🇺"],["Senegal","🇸🇳"],["Egypt","🇪🇬"],
            ["Iran","🇮🇷"],["Scotland","🏴󠁧󠁢󠁳󠁣󠁴󠁿"],["Canada","🇨🇦"],["South Korea","🇰🇷"],
          ];
          const found=teams.find(([n])=>lower.includes(n.toLowerCase()));
          if(!link||link.length<10) return; // skip items without a real URL
          items.push({
            isLive:true,
            flag:found?found[1]:"⚽",
            team:found?found[0]:"WC 2026",
            source,
            headline:title.slice(0,80),
            detail:desc.slice(0,130),
            url:link,
            date:date.toISOString().slice(0,10),
            isToday:Math.floor((Date.now()-date.getTime())/(1000*60*60*24))===0,
          });
        });
      });
      if(items.length>0){
        // Deduplicate by headline similarity
        const seen=new Set();
        const deduped=items.filter(item=>{
          const key=item.headline.slice(0,40).toLowerCase();
          if(seen.has(key)) return false;
          seen.add(key); return true;
        });
        deduped.sort((a,b)=>new Date(b.date)-new Date(a.date));
        setLiveItems(deduped.slice(0,8));
      }
    }).catch(()=>{}).finally(()=>setLoadingLive(false));
  },[]);

  // Use live items if available, else fallback
  const SEVEN_DAYS=7*24*60*60*1000;
  const cutoff=new Date(Date.now()-SEVEN_DAYS);
  const filteredFallback=NEWS_FALLBACK_RECENT.filter(item=>new Date(item.date)>=cutoff);
  const recentItems=liveItems||(filteredFallback.length>0?filteredFallback:[]);
  const importantItems=NEWS_FALLBACK_IMPORTANT;

  // Important item card — compact keyword style
  const ImportantCard=({item,i})=>(
    <div style={{background:T.card,border:`1px solid ${T.border}`,
      borderLeft:`3px solid ${statusColor[item.status]||"#888"}`,
      borderRadius:4,padding:"6px 10px",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:13,lineHeight:1,flexShrink:0}}>{item.flag}</span>
      <div style={{flex:1,minWidth:0}}>
        <span style={{fontSize:FS.caption,fontWeight:600,color:T.text}}>{item.player}</span>
        <span style={{fontSize:FS.caption,color:T.textFaint,marginLeft:5}}>{item.team}</span>
        <div style={{fontSize:FS.caption,color:T.textSub,marginTop:1}}>{item.kw[lang]||item.kw.en}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
        <span style={{fontSize:FS.micro,fontWeight:700,color:statusColor[item.status]||"#888",
          border:`1px solid ${statusColor[item.status]||"#888"}`,
          borderRadius:3,padding:"1px 4px",whiteSpace:"nowrap"}}>
          {(statusLabel[lang]||statusLabel.en)[item.status]||item.status}
        </span>
        {item.url&&<a href={item.url} target="_blank" rel="noopener noreferrer"
          onClick={e=>e.stopPropagation()}
          style={{fontSize:FS.micro,color:T.orange,textDecoration:"none"}}>↗</a>}
      </div>
    </div>
  );

  // Recent item card — full detail with relative date
  const RecentCard=({item,i})=>(
    <div style={{background:T.card,border:`1px solid ${T.border}`,
      borderLeft:`3px solid ${item.isToday?T.orange:statusColor[item.status]||"#888"}`,
      borderRadius:4,padding:"8px 10px",position:"relative"}}>
      {item.isToday&&(
        <div style={{position:"absolute",top:6,right:8,background:T.orange,borderRadius:3,
          padding:"1px 5px",fontSize:FS.micro,fontWeight:700,color:"#fff",letterSpacing:0.5,
          textTransform:"uppercase"}}>
          {lang==="nl"?"Vandaag":"Today"}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,paddingRight:item.isToday?42:0}}>
        <span style={{fontSize:14,lineHeight:1}}>{item.flag}</span>
        <div style={{flex:1,minWidth:0}}>
          <span style={{fontSize:FS.small,fontWeight:700,color:T.text}}>{item.isLive?item.team:item.player}</span>
          {!item.isLive&&<span style={{fontSize:FS.caption,color:T.textSub,marginLeft:5}}>{item.team}</span>}
        </div>
        {item.status&&<span style={{fontSize:FS.micro,fontWeight:700,
          color:statusColor[item.status]||"#888",
          border:`1px solid ${statusColor[item.status]||"#888"}`,
          borderRadius:3,padding:"1px 5px",flexShrink:0,whiteSpace:"nowrap"}}>
          {(statusLabel[lang]||statusLabel.en)[item.status]||item.status}
        </span>}
      </div>
      <div style={{fontSize:FS.small,fontWeight:600,color:T.text,marginBottom:3,lineHeight:1.4}}>
        {item.headline[lang]||item.headline.en||item.headline}
      </div>
      <div style={{fontSize:FS.caption,color:T.textSub,lineHeight:1.5,marginBottom:4}}>
        {item.detail[lang]||item.detail.en||item.detail}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <span style={{fontSize:FS.caption,color:T.orange,fontWeight:500,textTransform:"capitalize"}}>
          {relativeDate(item.date)}
        </span>
        {item.source&&<span style={{fontSize:FS.caption,color:T.textFaint}}>· {item.source}</span>}
        {item.url&&<a href={item.url} target="_blank" rel="noopener noreferrer"
          onClick={e=>e.stopPropagation()}
          style={{fontSize:FS.caption,color:T.orange,textDecoration:"none",
            borderBottom:`1px solid ${T.orange}`,marginLeft:"auto"}}>
          {lang==="nl"?"Lees artikel":"Read article"} ↗
        </a>}
      </div>
    </div>
  );

  const visibleImportant=expandedImportant?importantItems:importantItems.slice(0,5);
  const visibleRecent=expandedRecent?recentItems:recentItems.slice(0,5);

  return(
    <div>
      {/* Live status indicator (title is provided by the fold-out header) */}
      {(loadingLive||liveItems)&&(
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
          {loadingLive&&<span style={{fontSize:FS.micro,fontWeight:400,color:T.textFaint}}>
            {lang==="nl"?"live laden...":"loading live..."}
          </span>}
          {!loadingLive&&liveItems&&<span style={{fontSize:FS.micro,fontWeight:400,color:T.green}}>
            {lang==="nl"?"live":"live"} ●
          </span>}
        </div>
      )}

      {/* SECTION 1: RECENT — last 7 days */}
      <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
        color:T.textSub,marginBottom:6}}>
        {lang==="nl"?"Afgelopen 7 dagen":"Last 7 days"}
      </div>
      {recentItems.length===0?(
        <div style={{padding:"10px 12px",background:T.card,border:`1px solid ${T.border}`,
          borderRadius:4,fontSize:FS.small,color:T.textFaint,marginBottom:10,textAlign:"center"}}>
          {lang==="nl"?"Live nieuws laden...":"Loading live news..."}
          {loadingLive&&<span style={{marginLeft:6,color:T.orange}}>●</span>}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
          {visibleRecent.map((item,i)=><RecentCard key={i} item={item} i={i}/>)}
        </div>
      )}
      {recentItems.length>5&&(
        <div onClick={()=>setExpandedRecent(!expandedRecent)}
          style={{marginBottom:10,textAlign:"center",fontSize:FS.caption,color:T.orange,
            cursor:"pointer",padding:"3px 0"}}>
          {expandedRecent
            ?(lang==="nl"?"Minder ↑":"Less ↑")
            :(lang==="nl"?`+${recentItems.length-5} meer ↓`:`+${recentItems.length-5} more ↓`)}
        </div>
      )}

      {/* SECTION 2: IMPORTANT — key news, may be older */}
      <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
        color:T.textSub,marginBottom:6}}>
        {lang==="nl"?"Belangrijk":"Important"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {visibleImportant.map((item,i)=><ImportantCard key={i} item={item} i={i}/>)}
      </div>
      {importantItems.length>5&&(
        <div onClick={()=>setExpandedImportant(!expandedImportant)}
          style={{marginTop:4,textAlign:"center",fontSize:FS.caption,color:T.orange,
            cursor:"pointer",padding:"3px 0"}}>
          {expandedImportant
            ?(lang==="nl"?"Minder ↑":"Less ↑")
            :(lang==="nl"?`+${importantItems.length-5} meer ↓`:`+${importantItems.length-5} more ↓`)}
        </div>
      )}
    </div>
  );
}



function Chevron({open=false, color="currentColor", size=10}){
  return(
    <svg width={size} height={size} viewBox="0 0 10 6" fill="none"
      style={{display:"block",flexShrink:0,transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.15s"}}>
      <path d="M1 1L5 5L9 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── LION LOGOS ────────────────────────────────────────────────────────────────
// KNVB logo (without text) — used as nav/footer badge in lion/dark-lion modes
// Colors: Dark Lion = orange lion on black bg; Lion/Away = orange lion on cream bg
function NavLion({themeId}){
  const isDark = themeId === "dark";
  const isOrange = themeId === "orangeLion";
  if(isDark || isOrange){
    // No circle, no border — just the lion icon (orange on black in dark, white on orange in orange mode)
    const lionColor = isDark ? "#FF5500" : "#FFFFFF";
    return(
      <div style={{width:34,height:34,display:"flex",alignItems:"center",
        justifyContent:"center",flexShrink:0}}>
        <LionEmoji color={lionColor} size={26}/>
      </div>
    );
  }
  const lionColor = "#E07000";
  return(
    <div style={{width:34,height:34,borderRadius:"50%",background:"#FFF5EA",border:`1.5px solid ${lionColor}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <LionEmoji color={lionColor} size={16}/>
    </div>
  );
}

// Lion face SVG — used as theme-toggle / nav icon
function LionEmoji({color="#E07000", size=14}){
  // Main outline only — internal detail lines removed for a clean icon
  return(
    <svg width={size} height={size} viewBox="157 124 717 798" fill={color} xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0,1024) scale(0.1,-0.1)">
        <path d="M5111 8804 c-110 -125 -189 -296 -192 -414 0 -37 -17 -90 -18 -59 -2 29 -87 135 -153 188 -178 146 -439 191 -702 120 l-40 -11 76 -39 c84 -44 194 -133 249 -200 38 -47 66 -94 52 -87 -103 48 -141 63 -209 83 -337 98 -788 26 -1139 -183 -157 -93 -353 -278 -445 -418 -119 -182 -170 -344 -170 -539 0 -161 42 -320 117 -440 18 -27 29 -53 27 -57 -9 -14 -146 -104 -201 -131 -117 -60 -257 -101 -411 -121 l-87 -12 77 -42 c110 -60 234 -99 360 -112 59 -7 112 -9 118 -5 5 3 10 2 10 -3 0 -4 -42 -39 -92 -78 -193 -145 -362 -343 -464 -547 -49 -96 -109 -283 -130 -402 -18 -104 -25 -402 -11 -459 8 -27 10 -24 50 56 81 161 172 284 311 423 158 157 237 214 597 430 152 91 327 203 388 250 61 46 111 82 111 79 0 -19 -133 -266 -186 -346 -78 -118 -171 -217 -410 -439 -100 -92 -208 -195 -239 -229 -186 -194 -324 -447 -391 -713 -49 -196 -44 -529 12 -743 24 -95 86 -259 129 -345 29 -57 115 -192 120 -187 2 2 -1 28 -7 58 -16 84 -3 376 21 491 43 203 142 439 256 615 144 222 424 505 671 679 38 27 88 65 112 83 23 19 44 33 47 31 2 -3 -57 -92 -131 -199 -330 -479 -377 -554 -476 -758 -71 -148 -128 -316 -160 -472 -19 -98 -23 -146 -23 -320 0 -133 5 -226 13 -265 84 -381 291 -710 616 -983 84 -70 224 -167 231 -160 2 2 -23 56 -55 120 -62 127 -138 324 -163 428 -68 275 -74 574 -16 833 68 305 216 623 404 865 94 121 129 158 97 101 -61 -106 -131 -349 -163 -569 -29 -198 -23 -465 15 -645 68 -323 229 -657 449 -930 85 -105 233 -255 325 -329 77 -62 274 -197 280 -191 2 1 -19 52 -46 111 -107 234 -163 473 -161 687 1 128 12 232 21 207 3 -8 22 -64 41 -125 145 -458 405 -919 688 -1218 l54 -57 96 112 c165 196 257 326 367 523 107 192 215 455 279 679 17 61 30 93 36 87 16 -16 21 -280 8 -387 -22 -182 -69 -335 -162 -532 -21 -46 -39 -86 -39 -88 0 -7 180 117 255 176 486 386 784 927 837 1518 26 294 -28 616 -152 905 -21 48 -37 87 -35 87 2 0 29 -32 60 -71 242 -299 416 -680 471 -1029 20 -128 23 -403 5 -510 -18 -107 -55 -254 -91 -356 -35 -102 -134 -326 -163 -367 -10 -16 -17 -30 -14 -33 6 -6 114 65 212 141 107 83 284 269 367 386 128 179 220 388 265 599 36 169 36 403 0 582 -64 316 -211 624 -478 1003 -228 323 -299 428 -295 432 2 2 55 -34 118 -80 561 -415 847 -799 965 -1297 28 -121 42 -400 25 -505 -5 -33 -9 -61 -7 -63 1 -1 25 32 53 75 100 153 180 351 224 558 28 132 31 414 6 551 -40 214 -138 443 -267 624 -107 149 -153 197 -506 525 -138 128 -224 226 -301 343 -65 98 -159 266 -169 301 -7 23 -5 22 36 -11 80 -64 311 -213 524 -337 116 -68 246 -148 289 -179 236 -169 444 -405 556 -631 19 -38 38 -70 41 -71 3 0 9 53 12 119 19 353 -77 694 -270 964 -81 111 -207 243 -316 328 -51 40 -98 78 -105 85 -11 9 1 12 56 12 126 1 262 35 396 97 123 57 123 60 18 74 -231 29 -443 114 -601 239 l-24 19 26 35 c59 76 120 257 132 388 19 207 -60 453 -207 652 -175 236 -423 411 -733 516 -327 111 -702 104 -960 -19 -32 -15 -61 -27 -62 -25 -9 8 97 133 148 176 61 51 176 122 218 135 35 11 13 20 -94 40 -132 25 -322 17 -431 -19 -138 -44 -262 -144 -337 -268 l-34 -57 -5 62 c-7 81 -49 206 -98 287 -42 71 -128 181 -146 187 -6 2 -30 -17 -53 -43z m-1364 -938 c229 -49 395 -146 524 -306 63 -80 74 -89 112 -95 76 -13 270 -85 367 -137 129 -68 239 -148 331 -240 l78 -78 58 61 c171 180 415 318 684 385 103 25 105 26 133 70 159 252 510 392 888 355 383 -37 646 -259 689 -582 30 -217 -79 -447 -268 -567 -24 -15 -43 -32 -43 -38 0 -25 141 -408 168 -459 17 -30 27 -55 24 -55 -3 0 -38 19 -76 42 -95 56 -178 142 -256 266 -146 232 -202 311 -272 386 -92 100 -204 184 -330 247 -175 88 -316 125 -513 136 -120 6 -132 -5 -30 -27 64 -13 171 -63 245 -113 306 -209 505 -680 503 -1192 -1 -325 -55 -540 -192 -765 -47 -77 -51 -81 -44 -45 15 73 6 209 -18 290 -12 42 -25 78 -29 80 -4 2 -10 -39 -13 -93 -9 -149 -74 -351 -164 -506 l-46 -78 -13 51 c-27 103 -73 201 -138 296 -38 53 -70 95 -72 92 -2 -2 8 -32 22 -67 64 -159 151 -529 161 -685 9 -159 -42 -303 -139 -390 -151 -135 -386 -121 -645 41 -144 90 -201 188 -190 324 9 113 52 202 119 247 18 12 78 34 133 49 123 33 181 61 227 112 38 42 55 84 60 146 l3 40 -85 18 c-47 10 -130 18 -185 19 -85 2 -113 -2 -190 -27 -118 -38 -204 -38 -330 1 -112 34 -209 36 -358 10 l-109 -19 7 -35 c10 -53 42 -122 73 -155 55 -58 105 -80 287 -127 64 -17 125 -73 156 -142 27 -63 37 -196 20 -260 -26 -90 -132 -191 -282 -267 -262 -134 -534 -62 -643 170 -27 58 -31 77 -34 180 -6 173 47 438 147 733 16 48 28 87 26 87 -8 0 -122 -176 -142 -220 -12 -25 -31 -77 -44 -115 -12 -39 -25 -78 -28 -88 -9 -27 -112 175 -155 303 -32 95 -61 239 -68 330 -3 34 -3 34 -21 -20 -26 -81 -40 -195 -33 -280 l7 -75 -46 70 c-221 343 -259 902 -94 1382 135 390 344 609 674 706 l50 15 -40 1 c-152 3 -403 -50 -541 -114 -113 -52 -258 -152 -344 -237 -71 -70 -135 -159 -300 -418 -76 -120 -185 -229 -278 -278 l-63 -34 30 54 c17 30 58 133 92 229 34 95 67 186 75 201 8 15 14 29 14 32 0 2 -29 25 -63 50 -127 90 -213 212 -246 350 -21 86 -15 222 13 312 82 260 314 434 628 474 96 12 296 4 385 -14z m1578 -3910 c28 -8 117 -54 200 -101 161 -91 238 -122 328 -132 65 -7 64 -3 41 -106 -26 -117 -93 -247 -166 -323 -54 -56 -185 -150 -195 -140 -2 2 6 20 17 39 25 42 62 157 51 157 -5 0 -16 -10 -27 -22 -44 -49 -196 -132 -358 -196 l-49 -19 -89 34 c-148 56 -237 106 -321 182 l-40 36 8 -35 c11 -54 35 -123 51 -147 22 -35 17 -36 -38 -6 -29 15 -87 62 -129 104 -90 89 -146 192 -179 329 -26 112 -27 110 18 110 91 0 212 47 392 154 139 83 221 107 340 102 52 -2 118 -11 145 -20z"/>
      </g>
    </svg>
  );
}
// Also export for footer icon use
const FooterLionIcon = LionEmoji;

// ── SOCCER ICON (Phosphor, for default theme toggle) ─────────────────────────
function SoccerIcon({color}){
  return(
    <svg width="14" height="14" viewBox="0 0 256 256" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
      <circle cx="128" cy="128" r="96"/>
      <polygon points="128 88 88 115.5 103.28 160 152.72 160 168 115.5 128 88"/>
      <line x1="128" y1="64" x2="128" y2="88"/>
      <line x1="65.17" y1="108.09" x2="88" y2="115.5"/>
      <line x1="89.17" y1="179.42" x2="103.28" y2="160"/>
      <line x1="166.83" y1="179.42" x2="152.72" y2="160"/>
      <line x1="190.83" y1="108.09" x2="168" y2="115.5"/>
      <polyline points="164.25 39.08 128 64 91.75 39.08"/>
      <polyline points="223.85 133.42 190.82 108.08 202.77 67.78"/>
      <polyline points="53.23 67.78 65.17 108.08 32.15 133.42"/>
      <polyline points="152.13 220.94 166.83 179.42 209.08 179.42"/>
      <polyline points="46.92 179.42 89.17 179.42 103.87 220.94"/>
    </svg>
  );
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
function ThemeToggle({theme,setTheme}){
  const SEG=30, H=30;
  const BLACK="#0D0D0D", ORANGE="#E35A00", WHITE="#FFFFFF";
  // Per-cell appearance keyed by the ACTIVE theme.
  // cell 0 = ball (default), cell 1 = dark Lion, cell 2 = orange Lion.
  const M={
    default:[
      {bg:WHITE, icon:BLACK},   // black ball, white bg
      {bg:BLACK, icon:ORANGE},  // orange Lion, black bg
      {bg:WHITE, icon:ORANGE},  // orange Lion, white bg
    ],
    dark:[
      {bg:BLACK, icon:WHITE},   // white ball, black bg
      {bg:BLACK, icon:ORANGE},  // orange Lion, black bg
      {bg:ORANGE,icon:WHITE},   // white Lion, orange bg
    ],
    orangeLion:[
      {bg:ORANGE,icon:WHITE},   // white ball, orange bg
      {bg:BLACK, icon:ORANGE},  // orange Lion, black bg
      {bg:WHITE, icon:ORANGE},  // orange Lion, white bg
    ],
  };
  const active=M[theme]||M.default;
  const targets=["default","dark","orangeLion"];
  const isBallRolling=theme==="default"; // ball rolls into place when default is active
  const cells=[
    (col)=><SoccerIcon color={col}/>,
    (col)=><FooterLionIcon color={col} size={16}/>,
    (col)=><FooterLionIcon color={col} size={16}/>,
  ];
  const frameBorder=theme==="dark"?"#FF5500":(theme==="orangeLion"?BLACK:"#E4E4E4");
  return(
    <div style={{position:"relative",display:"flex",width:SEG*3,height:H,
      border:`1px solid ${frameBorder}`,borderRadius:6,overflow:"hidden",
      flexShrink:0}}>
      {cells.map((render,i)=>(
        <div key={i} onClick={(e)=>{e.stopPropagation();setTheme(targets[i]);}}
          style={{position:"relative",width:SEG,height:"100%",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            background:active[i].bg,
            borderRight:i<2?`1px solid ${frameBorder}`:"none",
            transition:"background 0.32s ease"}}>
          <div style={{display:"flex",
            transform:i===0&&isBallRolling?"rotate(0deg)":(i===0?"rotate(-360deg)":"none"),
            transition:"transform 0.45s cubic-bezier(.4,0,.2,1),color 0.3s ease"}}>
            {render(active[i].icon)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Clickable team name — navigates to Nations tab and opens that nation's card
function TeamLink({team,style={},children}){
  const {setTab,setNationsOpen}=useNav();
  const lang=useLang();
  // Lazy check: NATIONS_DATA defined later in module, but at call time it's available
  const hasProfile=NATIONS_DATA.some(n=>n.team===team);
  if(!hasProfile) return <span style={style}>{children}</span>;
  return(
    <span
      role="button"
      aria-label={(lang==="nl"?"Bekijk profiel: ":"View profile: ")+team}
      style={{...style,cursor:"pointer",display:"inline-flex",alignItems:"center",
        justifyContent:"center",minWidth:26,minHeight:26,padding:"2px",margin:"-2px",
        borderRadius:6,flexShrink:0,WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}
      onClick={e=>{e.stopPropagation();e.preventDefault();setNationsOpen(team);setTab("nations");}}
      onPointerDown={e=>e.stopPropagation()}
      title={lang==="nl"?"Bekijk landenprofiel":"View nation profile"}
    >{children}</span>
  );
}

// ── NAV ──────────────────────────────────────────────────────────────────────
function Nav({tab,setTab}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const tabs=[
    {id:"bracket",label:tr.tabs.bracket},
    {id:"knockout",label:tr.tabs.knockout},
    {id:"nations",label:tr.tabs.nations},
    {id:"players",label:tr.tabs.players},
    {id:"model",label:tr.tabs.model},
  ];
  return(
    <div style={{position:"sticky",top:0,zIndex:20,background:T.nav,borderBottom:`2px solid ${T.border}`,width:"100%",overflowX:"hidden"}}>
      <div style={{height:4,background:T.id==="orangeLion"?"#0D0D0D":"#E07000"}}/>
      <div style={{display:"flex",alignItems:"stretch",padding:"0 10px",width:"100%",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",marginRight:10,flexShrink:0}}>
          {T.id==="dark"
            ? <NavLion themeId="dark"/>
            : T.id==="orangeLion"
            ? <NavLion themeId="orangeLion"/>
            : <div style={{width:26,height:26,borderRadius:"50%",background:"#E07000",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#fff",fontSize:FS.caption,fontWeight:700}}>SB</span>
              </div>
          }
        </div>
        <div style={{width:1,background:T.border,flexShrink:0,marginRight:2}}/>
        {tabs.map(t=>{
          const active=tab===t.id;
          return(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"11px 10px",fontSize:FS.small,
            background:"none",
            border:"none",
            borderBottom:active?`2px solid ${T.orange}`:"2px solid transparent",
            color:active?T.orange:T.textSub,
            fontWeight:active?700:400,
            whiteSpace:"nowrap",flexShrink:0,cursor:"pointer",
            marginBottom:-2,
          }}>{t.label}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── TAG ───────────────────────────────────────────────────────────────────────
function Tag({children,color}){
  const T=useTheme();
  const c=color||T.textSub;
  return <span style={{display:"inline-block",fontSize:FS.caption,fontWeight:600,color:c,background:`${c}22`,padding:"2px 5px",borderRadius:3,whiteSpace:"nowrap"}}>{children}</span>;
}

// ── MATCH ROW (expandable, used in all tabs) ──────────────────────────────────
function MatchRow({t1,s1,t2,s2,matchKey,open,onToggle}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const winner=s1>s2?t1:s2>s1?t2:null;
  const draw=s1===s2;
  const expl=mExpl(matchKey,lang);
  return(
    <div style={{borderBottom:`1px solid ${T.border}`}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",cursor:"pointer",background:open?T.orangeFaint:T.card}}>
        <TeamLink team={t1}><span style={{fontSize:14,lineHeight:1,flexShrink:0,cursor:"pointer"}}>{FLAGS[t1]||"🏳"}</span></TeamLink>
        <span style={{flex:1,fontSize:FS.small,fontWeight:winner===t1?600:400,color:winner===t1||draw?T.text:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(t1,lang)}</span>
        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <span style={{fontSize:FS.body,fontWeight:700,color:winner===t1?T.orange:draw?T.blue:T.textSub,minWidth:14,textAlign:"right"}}>{s1}</span>
          <span style={{fontSize:FS.caption,color:T.textFaint}}>-</span>
          <span style={{fontSize:FS.body,fontWeight:700,color:winner===t2?T.orange:draw?T.blue:T.textSub,minWidth:14,textAlign:"left"}}>{s2}</span>
        </div>
        <span style={{flex:1,fontSize:FS.small,fontWeight:winner===t2?600:400,color:winner===t2||draw?T.text:T.textSub,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(t2,lang)}</span>
        <TeamLink team={t2}><span style={{fontSize:14,lineHeight:1,flexShrink:0,cursor:"pointer"}}>{FLAGS[t2]||"🏳"}</span></TeamLink>
        <Chevron open={open} color={T.orange}/>
      </div>
      {open&&expl&&(
        <div style={{padding:"8px 10px",background:T.orangeFaint,borderLeft:`3px solid ${T.orange}`,fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>
          <span style={{fontWeight:600,color:T.text}}>
            {tName(t1,lang)} {s1}–{s2} {tName(t2,lang)}.{" "}
          </span>

          {expl}
        </div>
      )}
    </div>
  );
}

// ── GROUP ACCORDION (Tournament tab) — includes standings + matches ───────────
function GroupAccordion({g,openGroup,setOpenGroup,openMatches,toggleMatch}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const {setTab}=useNav();
  const showMatches=openGroup===g.id;   // now only controls the prognoses block
  const pts={},gf={},ga={};
  g.teams.forEach(t=>{pts[t]=0;gf[t]=0;ga[t]=0;});
  g.matches.forEach(({t1,t2,s1,s2})=>{
    gf[t1]+=s1;ga[t1]+=s2;gf[t2]+=s2;ga[t2]+=s1;
    if(s1>s2)pts[t1]+=3;else if(s2>s1)pts[t2]+=3;else{pts[t1]+=1;pts[t2]+=1;}
  });
  const sorted=[...g.teams].sort((a,b)=>pts[b]-pts[a]||(gf[b]-ga[b])-(gf[a]-ga[a]));
  return(
    <div style={{background:T.card,border:`1px solid ${showMatches?T.orange:T.border}`,borderRadius:4,overflow:"hidden",marginBottom:8}}>
      {/* Header — static (not a toggle) */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 13px",background:T.card,borderBottom:`1px solid ${T.border}`}}>
        {/* Group letter — rounded square */}
        <div style={{width:26,height:26,borderRadius:4,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#fff",fontSize:FS.small,fontWeight:700,letterSpacing:0}}>{g.id}</span>
        </div>
        {/* Group label + two-column indicator row */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,minWidth:0}}>
          <div style={{fontSize:FS.small,fontWeight:700,color:T.text,lineHeight:1,whiteSpace:"nowrap"}}>
            {lang==="nl"?"Groep":"Group"} {g.id}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Left column: in-form team */}
            <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:4,overflow:"hidden"}}>
              {(()=>{
                const bestForm=g.teams.filter(t=>formDev(t)!==undefined).sort((a,b)=>formDev(b)-formDev(a))[0];
                if(!bestForm) return null;
                const dev=formDev(bestForm);
                return <React.Fragment>
                  <span style={{fontSize:FS.caption,color:T.textFaint,flexShrink:0,whiteSpace:"nowrap"}}>{lang==="nl"?"In vorm:":"In form:"}</span>
                  <span style={{fontSize:13,lineHeight:1,flexShrink:0}}>{FLAGS[bestForm]}</span>
                  <span style={{fontSize:FS.caption,fontWeight:700,lineHeight:1,flexShrink:0,color:dev>0?"#1E7A40":dev<0?"#C0392B":T.textFaint}}>{dev>0?"+":""}{dev}</span>
                </React.Fragment>;
              })()}
            </div>
            {/* Right column: QF qualifiers (flags only) */}
            <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
              <svg width="7" height="9" viewBox="0 0 7 9" fill="none" style={{flexShrink:0}}><path d="M3.5 0L7 4H4.5V9H2.5V4H0L3.5 0Z" fill="#1E7A40"/></svg>
              {sorted.slice(0,2).map((t,i)=>(
                <span key={t} style={{fontSize:14,lineHeight:1,flexShrink:0}}>{FLAGS[t]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Standings — always visible */}
      <div style={{borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"18px 22px 1fr 32px 30px 30px",alignItems:"center",gap:6,padding:"5px 12px",borderBottom:`1px solid ${T.border}`,background:T.bg}}>
          <span/>
          <span/>
          <span style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:T.textFaint}}>{lang==="nl"?"Land":"Country"}</span>
          <span style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:T.textFaint,textAlign:"right"}}>{lang==="nl"?"Vorm":"Form"}</span>
          <span style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:T.textFaint,textAlign:"right"}}>{lang==="nl"?"Rang":"Rank"}</span>
          <span style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:T.textFaint,textAlign:"right"}}>{lang==="nl"?"Ptn":"Pts"}</span>
        </div>
        {sorted.map((team,i)=>{
          const pass=i<2;
          const dev=formDev(team);
          const fc=dev>0?"#1E7A40":dev<0?"#C0392B":T.textFaint;
          const mr=adjRank(team);
          const rc=mr<=8?"#1E7A40":mr<=24?"#E07000":"#C0392B";
          return(
            <div key={team} style={{display:"grid",gridTemplateColumns:"18px 22px 1fr 32px 30px 30px",alignItems:"center",gap:6,padding:"6px 12px",borderBottom:i<3?`1px solid ${T.border}`:"none",background:pass?"rgba(224,112,0,0.05)":"transparent"}}>
              <span style={{fontSize:FS.small,fontWeight:700,color:pass?"#E07000":T.textFaint,textAlign:"center"}}>{i+1}</span>
              <TeamLink team={team}><span style={{fontSize:14,lineHeight:1,cursor:"pointer"}}>{FLAGS[team]}</span></TeamLink>
              <span style={{fontSize:FS.small,fontWeight:pass?600:400,color:pass?T.text:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(team,lang)}</span>
              <span title={lang==="nl"?"Vormindicator":"Form indicator"} style={{fontSize:FS.caption,fontWeight:700,color:fc,textAlign:"right"}}>{dev===undefined?"":(dev>0?"+":"")+dev}</span>
              <span onClick={e=>{e.stopPropagation();setTab("model");}} title={lang==="nl"?"Bekijk ranglijst":"View ranking"} style={{fontSize:FS.caption,fontWeight:700,color:rc,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2,textAlign:"right"}}>#{mr}</span>
              <span style={{fontSize:FS.small,fontWeight:700,color:pass?T.text:T.textFaint,textAlign:"right"}}>{pts[team]}</span>
            </div>
          );
        })}
      </div>
      {/* Prognoses — collapsible */}
      <div onClick={()=>setOpenGroup(showMatches?null:g.id)}
        style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"8px 12px",cursor:"pointer",background:showMatches?T.orangeFaint:T.card}}>
        <span style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textFaint}}>{tr.matchPredictions}</span>
        <Chevron open={showMatches} color={T.textSub}/>
      </div>
      {showMatches&&(
        <div style={{borderTop:`1px solid ${T.border}`}}>
          {g.matches.map(({t1,t2,s1,s2})=>{
            const k=`${t1}-${t2}`;
            return <MatchRow key={k} t1={t1} s1={s1} t2={t2} s2={s2} matchKey={k} open={openMatches[k]} onToggle={e=>{e.stopPropagation();toggleMatch(k);}}/>;
          })}
        </div>
      )}
    </div>
  );
}

// ── GROUP TABLE CARD (Groups tab) ─────────────────────────────────────────────
function GroupTableCard({g,open,onToggle,openMatches,toggleMatch}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const {setTab}=useNav();
  const pts={},gf={},ga={};
  g.teams.forEach(t=>{pts[t]=0;gf[t]=0;ga[t]=0;});
  (MATCHES[g.id]||[]).forEach(({t1,t2,s1,s2})=>{
    gf[t1]+=s1;ga[t1]+=s2;gf[t2]+=s2;ga[t2]+=s1;
    if(s1>s2)pts[t1]+=3;else if(s2>s1)pts[t2]+=3;else{pts[t1]+=1;pts[t2]+=1;}
  });
  return(
    <div style={{background:T.card,border:`1px solid ${open?"#E07000":T.border}`,borderTop:`2px solid ${open?T.orange:T.blue}`,borderRadius:4,overflow:"hidden",cursor:"pointer"}} onClick={onToggle}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",background:open?"rgba(224,112,0,0.08)":T.bg,borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:FS.small,fontWeight:700,color:T.text}}>{tr.group} {g.id}</span>
        <Chevron open={open} color={T.textSub}/>
      </div>
      {g.table.map((team,i)=>{
        const adj=FORM_ADJ[team]||0;
        const pass=i<2;
        return(
          <div key={team} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderBottom:i<3?`1px solid ${T.border}`:"none",background:i===0?"rgba(224,112,0,0.08)":i===1?"rgba(26,82,150,0.05)":"transparent"}}>
            <span style={{width:14,fontSize:FS.small,fontWeight:700,color:i===0?"#E07000":i===1?"#1A5296":T.border,flexShrink:0,textAlign:"center"}}>{i+1}</span>
            <TeamLink team={team}><span style={{fontSize:15,lineHeight:1,flexShrink:0,cursor:"pointer"}}>{FLAGS[team]||"🏳"}</span></TeamLink>
            <span style={{flex:1,fontSize:FS.body,color:pass?T.text:T.textSub,fontWeight:pass?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(team,lang)}</span>
            {(()=>{const mr=adjRank(team);const rc=mr<=8?"#1E7A40":mr<=24?"#E07000":"#C0392B";return <span onClick={e=>{e.stopPropagation();setTab("model");}} title={lang==="nl"?"Bekijk ranglijst":"View ranking"} style={{fontSize:FS.caption,fontWeight:700,color:rc,flexShrink:0,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>#{mr}</span>;})()}
            <span style={{fontSize:FS.small,fontWeight:700,color:pass?T.text:T.textSub,flexShrink:0}}>{pts[team]}</span>
          </div>
        );
      })}
      {open&&(
        <div style={{borderTop:`1px solid ${T.border}`,background:T.bg}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"5px 10px 1px",fontSize:FS.caption,fontWeight:700,color:T.id==="dark"?"#909090":T.blue,letterSpacing:0.8,textTransform:"uppercase"}}>{tr.matchPredictions}</div>
          {g.matches.map(({t1,t2,s1,s2})=>{
            const k=`${t1}-${t2}`;
            return <MatchRow key={k} t1={t1} s1={s1} t2={t2} s2={s2} matchKey={k} open={openMatches[k]} onToggle={()=>toggleMatch(k)}/>;
          })}
        </div>
      )}
    </div>
  );
}

// ── KO CARD ───────────────────────────────────────────────────────────────────
// ── FINAL EXPLAINER ───────────────────────────────────────────────────────────
function FinalExplainer({openMatches,toggleMatch}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const fk=`${FINAL_TEAMS[0]}-${FINAL_TEAMS[1]}`;
  const fo=openMatches[fk];
  const fe=koExpl(fk,lang);
  if(!fe) return null;
  return(
    <React.Fragment>
      <div onClick={()=>toggleMatch(fk)} style={{borderTop:`1px solid ${T.border}`,padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:fo?T.orangeFaint:T.bg}}>
        <span style={{fontSize:FS.small,color:T.orange,fontWeight:600}}>{tr.whyScore}</span>
        <Chevron open={fo} color={T.orange}/>
      </div>
      {fo&&<div style={{padding:"8px 10px",background:T.orangeFaint,borderLeft:`3px solid ${T.orange}`,fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>
        <span style={{fontWeight:600,color:T.text}}>{tName(FINAL_TEAMS[0],lang)} {fsA}–{fsB} {tName(FINAL_TEAMS[1],lang)}.{" "}</span>
        {fe}
      </div>}
    </React.Fragment>
  );
}

// ── KO CARD ───────────────────────────────────────────────────────────────────
function KOCard({a,b,openMatches,toggleMatch}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const [sA,sB]=KO_SCORES[`${a}-${b}`]||[1,0];
  const aW=sA>sB;
  const key=`${a}-${b}`;
  const expl=koExpl(key,lang);
  const isOpen=openMatches?.[key];
  return(
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderTop:`2px solid ${T.blue}`,borderRadius:4,overflow:"hidden"}}>
      {[{team:a,score:sA,win:aW},{team:b,score:sB,win:!aW}].map(({team,score,win},i)=>(
        <div key={team}>
          {i===1&&<div style={{height:1,background:T.border}}/>}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:win?T.orangeFaint:"transparent"}}>
            <TeamLink team={team}><span style={{fontSize:15,lineHeight:1,flexShrink:0,cursor:"pointer"}}>{FLAGS[team]}</span></TeamLink>
            <span style={{flex:1,fontSize:FS.body,fontWeight:win?600:400,color:win?T.text:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(team,lang)}</span>
            <span style={{fontSize:FS.h2,fontWeight:700,color:win?T.orange:T.textSub,flexShrink:0}}>{score}</span>
          </div>
        </div>
      ))}
      {expl&&(
        <div onClick={()=>toggleMatch?.(key)} style={{borderTop:`1px solid ${T.border}`,padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:isOpen?T.orangeFaint:T.bg}}>
          <span style={{fontSize:FS.small,color:T.orange,fontWeight:600}}>{tr.whyScore}</span>
          <Chevron open={isOpen} color={T.orange}/>
        </div>
      )}
      {isOpen&&expl&&(
        <div style={{padding:"8px 10px",background:T.orangeFaint,borderLeft:`3px solid ${T.orange}`,fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>
          <span style={{fontWeight:600,color:T.text}}>{tName(a,lang)} {sA}–{sB} {tName(b,lang)}.{" "}</span>

          {expl}
        </div>
      )}
    </div>
  );
}

// ── BRACKET VISUAL ────────────────────────────────────────────────────────────
function BracketMatch({teamA,scoreA,teamB,scoreB,onClick}){
  const T=useTheme();
  const lang=useLang();
  const aW=scoreA>scoreB;
  return(
    <div onClick={onClick} style={{background:T.card,border:`1px solid ${onClick?T.orange:T.border}`,borderTop:`2px solid ${T.blue}`,borderRadius:4,padding:"5px 7px",minWidth:0,cursor:onClick?"pointer":"default",transition:"border-color 0.15s"}}>
      {[{team:teamA,score:scoreA,win:aW},{team:teamB,score:scoreB,win:!aW}].map(({team,score,win},i)=>(
        <div key={team}>
          {i===1&&<div style={{height:1,background:T.border,margin:"3px 0"}}/>}
          <div style={{display:"flex",alignItems:"center",gap:5,height:26}}>
            <span style={{fontSize:12,lineHeight:1,flexShrink:0}}>{FLAGS[team]||"🏳"}</span>
            <span style={{flex:1,fontSize:FS.small,fontWeight:win?600:400,color:win?T.orange:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(team,lang)}</span>
            <span style={{fontSize:FS.small,fontWeight:700,color:win?T.orange:T.textSub,flexShrink:0}}>{score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function KnockoutBracket({scrollToMatch}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const fWin=fsA>fsB?FINAL_TEAMS[0]:FINAL_TEAMS[1];
  const finalKey=`${FINAL_TEAMS[0]}-${FINAL_TEAMS[1]}`;

  // Compact match tile: two teams, flag + short name + score
  const Tile=({a,b,mk,accent=false})=>{
    const[sA,sB]=KO_SCORES[mk]||[1,0];
    const aW=sA>sB;
    return(
      <div onClick={()=>scrollToMatch&&scrollToMatch(mk)}
        style={{background:T.card,
          border:`1px solid ${accent?T.orange:T.border}`,
          borderLeft:`3px solid ${accent?T.orange:T.blue}`,
          borderRadius:3,padding:"5px 7px",cursor:"pointer",
          WebkitTapHighlightColor:"transparent",userSelect:"none",flex:1,minWidth:0}}>
        {[{team:a,s:sA,w:aW},{team:b,s:sB,w:!aW}].map(({team,s,w},i)=>(
          <div key={team} style={{display:"flex",alignItems:"center",gap:4,
            marginTop:i?3:0,paddingTop:i?3:0,
            borderTop:i?`1px solid ${T.border}`:"none"}}>
            <span style={{fontSize:12,lineHeight:1,flexShrink:0}}>{FLAGS[team]||"🏳"}</span>
            <span style={{flex:1,fontSize:FS.caption,fontWeight:w?700:400,
              color:w?T.orange:T.textSub,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {tName(team,lang)}
            </span>
            <span style={{fontSize:FS.caption,fontWeight:700,
              color:w?T.orange:T.textSub,flexShrink:0,minWidth:12,textAlign:"right"}}>
              {s}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Bracket "merge" connector: two feeders funnel down into one match below.
  // Renders as an SVG that joins the centers of the two tiles above into a single stem.
  const MergeConnector=({height=18})=>{
    const c=T.id==="dark"?"#3a3a3a":"#cdd6e4";
    return(
      <div style={{height,width:"100%",flexShrink:0}}>
        <svg width="100%" height={height} viewBox="0 0 100 18" preserveAspectRatio="none" fill="none"
          style={{display:"block"}}>
          {/* left feeder down, right feeder down, horizontal join, center stem down */}
          <path d={`M25 0 V6 Q25 9 28 9 H72 Q75 9 75 6 V0`} stroke={c} strokeWidth="1.2"
            strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke"/>
          <path d="M50 9 V18" stroke={c} strokeWidth="1.2" strokeLinecap="round"
            fill="none" vectorEffect="non-scaling-stroke"/>
        </svg>
      </div>
    );
  };
  // Single straight stem (SF -> Final), centered
  const StemConnector=({height=18})=>{
    const c=T.id==="dark"?"#3a3a3a":"#cdd6e4";
    return(
      <div style={{height,display:"flex",justifyContent:"center",flexShrink:0}}>
        <svg width="10" height={height} viewBox="0 0 10 18" fill="none" style={{display:"block"}}>
          <path d="M5 0 V14 M2 11 L5 14.5 L8 11" stroke={c} strokeWidth="1.2"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
    );
  };

  // Section label
  const RoundLabel=({children,center=true})=>(
    <div style={{fontSize:FS.micro,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
      color:T.id==="dark"?"#777":T.blue,
      textAlign:center?"center":"left",marginBottom:4}}>
      {children}
    </div>
  );

  return(
    <div style={{marginBottom:14,background:T.card,border:`1px solid ${T.border}`,
      borderRadius:6,padding:"10px 10px 8px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
          color:T.id==="dark"?T.orange:T.blue}}>
          {lang==="nl"?"Voorspeld schema":"Predicted bracket"}
        </div>
        <div style={{fontSize:FS.micro,color:T.textFaint}}>
          {lang==="nl"?"Tik voor details":"Tap for details"}
        </div>
      </div>

      {/* QUARTER FINALS row */}
      <RoundLabel>{tr.qf}</RoundLabel>
      <div style={{display:"flex",gap:10,marginBottom:0}}>
        {/* Left half: QF0 and QF1 */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
          <Tile a={QF[0][0]} b={QF[0][1]} mk={`${QF[0][0]}-${QF[0][1]}`}/>
          <Tile a={QF[1][0]} b={QF[1][1]} mk={`${QF[1][0]}-${QF[1][1]}`}/>
        </div>
        {/* Right half: QF2 and QF3 */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
          <Tile a={QF[2][0]} b={QF[2][1]} mk={`${QF[2][0]}-${QF[2][1]}`}/>
          <Tile a={QF[3][0]} b={QF[3][1]} mk={`${QF[3][0]}-${QF[3][1]}`}/>
        </div>
      </div>

      {/* QF -> SF merge connectors (one per half) */}
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><MergeConnector/></div>
        <div style={{flex:1}}><MergeConnector/></div>
      </div>

      {/* SEMI FINALS row */}
      <RoundLabel>{tr.sf}</RoundLabel>
      <div style={{display:"flex",gap:10,marginBottom:0}}>
        <Tile a={SF[0][0]} b={SF[0][1]} mk={`${SF[0][0]}-${SF[0][1]}`} accent/>
        <Tile a={SF[1][0]} b={SF[1][1]} mk={`${SF[1][0]}-${SF[1][1]}`} accent/>
      </div>

      {/* SF -> Final merge connector */}
      <MergeConnector/>

      {/* FINAL */}
      <RoundLabel center>{lang==="nl"?"FINALE":"FINAL"}</RoundLabel>
      <div style={{maxWidth:260,margin:"0 auto"}}>
        <div onClick={()=>scrollToMatch&&scrollToMatch(finalKey)}
          style={{background:T.card,border:`2px solid ${T.orange}`,borderRadius:4,
            padding:"7px 10px",cursor:"pointer",userSelect:"none",
            WebkitTapHighlightColor:"transparent"}}>
          {[{team:FINAL_TEAMS[0],s:fsA,w:fsA>fsB},{team:FINAL_TEAMS[1],s:fsB,w:fsB>fsA}].map(({team,s,w},i)=>(
            <div key={team} style={{display:"flex",alignItems:"center",gap:5,
              marginTop:i?4:0,paddingTop:i?4:0,
              borderTop:i?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:14,lineHeight:1,flexShrink:0}}>{FLAGS[team]}</span>
              <span style={{flex:1,fontSize:FS.small,fontWeight:w?700:400,
                color:w?T.orange:T.textSub,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {tName(team,lang)}
              </span>
              <span style={{fontSize:FS.small,fontWeight:700,color:w?T.orange:T.textSub,flexShrink:0}}>
                {s}
              </span>
            </div>
          ))}
          <div style={{marginTop:6,paddingTop:5,borderTop:`1px solid ${T.border}`,
            display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:12}}>🏆</span>
            <span style={{fontSize:FS.caption,fontWeight:700,color:T.orange}}>
              {tName(fWin,lang)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── OUTLOOK ROW ───────────────────────────────────────────────────────────────
function OutlookRow({d,type,open,onToggle}){
  const T=useTheme();
  const lang=useLang();
  const tr=useT();
  const over=type==="over";
  const ac=over?T.green:T.red;
  const arrowUp="M12 19V5M5 12l7-7 7 7";
  const arrowDn="M12 5v14M5 12l7 7 7-7";
  return(
    <div style={{borderBottom:`1px solid ${T.border}`}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",cursor:"pointer",background:open?T.orangeFaint:T.card}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d={over?arrowUp:arrowDn}/></svg>
        <TeamLink team={d.team}><span style={{fontSize:15,lineHeight:1,flexShrink:0,cursor:"pointer"}}>{FLAGS[d.team]}</span></TeamLink>
        <span style={{flex:1,fontSize:FS.body,fontWeight:500,color:T.text}}>{tName(d.team,lang)}</span>
        <Tag color={T.textSub}>FIFA #{d.rank}</Tag>
        <Tag color={ac}>{lang==="nl"?"Model":"Model"} #{Math.max(1,d.rank+d.adj)}</Tag>
        <Chevron open={open} color={T.textSub}/>
      </div>
      {open&&(
        <div style={{padding:"10px 12px",background:T.orangeFaint,borderTop:`1px solid ${T.border}`,borderLeft:`3px solid ${ac}`}}>
          <div style={{fontSize:FS.small,fontWeight:600,color:ac,marginBottom:6}}>{d.headline[lang]}</div>
          {d.reasons[lang].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:6,marginBottom:4,fontSize:FS.small,color:T.text,lineHeight:1.5}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:3}}><path d={over?arrowUp:arrowDn}/></svg>
              <span>{r}</span>
            </div>
          ))}
          <div style={{marginTop:8,padding:"6px 8px",background:T.card,border:`1px solid ${T.border}`,borderRadius:3,fontSize:FS.small,color:T.textSub,lineHeight:1.5}}>
            <span style={{fontWeight:600,color:T.text}}>{tr.risk}: </span>{d.risk[lang]}
          </div>
          <div style={{marginTop:6,fontSize:FS.small,color:T.textSub}}>{tr.projection}: <span style={{fontWeight:600,color:ac}}>{d.projection[lang]}</span></div>
        </div>
      )}
    </div>
  );
}


// ── PLAYERS DATA ──────────────────────────────────────────────────────────────

// Wikipedia article titles for each player — used to fetch thumbnail at runtime in browser
const CLUB_LOGOS = {"Real Madrid": "https://assets.football-logos.cc/logos/spain/700x700/real-madrid.png", "FC Barcelona": "https://assets.football-logos.cc/logos/spain/700x700/barcelona.png", "Manchester City": "https://assets.football-logos.cc/logos/england/700x700/manchester-city.png", "Inter Miami": "https://assets.football-logos.cc/logos/usa/700x700/inter-miami.png", "Al-Nassr": "https://assets.football-logos.cc/logos/saudi-arabia/700x700/al-nassr.png", "Corinthians": "https://assets.football-logos.cc/logos/brazil/700x700/corinthians.png", "Liverpool": "https://assets.football-logos.cc/logos/england/700x700/liverpool.png", "Eintracht Frankfurt": "https://assets.football-logos.cc/logos/germany/700x700/eintracht-frankfurt.png", "Chelsea": "https://assets.football-logos.cc/logos/england/700x700/chelsea.png", "Real Sociedad": "https://assets.football-logos.cc/logos/spain/700x700/real-sociedad.png", "RB Leipzig": "https://assets.football-logos.cc/logos/germany/700x700/rb-leipzig.png"};
// ── NATIONS DATA ─────────────────────────────────────────────────────────────
const MODEL_RANK = COMPOSITE_RANK; // derived from the composite engine — single source of truth

const NATIONS_DATA = [
  // GROUP A
  {team:"Mexico",flag:"🇲🇽",group:"A",coach:"Javier Aguirre",formation:"4-3-3",
   stars:["Hirving Lozano","Edson Alvarez","Raul Jimenez","Guillermo Ochoa","Orbelin Pineda"],
   form:{nl:"Als gastland geen kwalificatie gespeeld, dus de vorm komt uit oefenduels. Recent wisselvallig maar met een sterke 5-1 zege op Servië als uitschieter; gelijkspel tegen Portugal en België toont dat ze tegen toppers mee kunnen.",en:"As hosts they played no qualifiers, so form comes from friendlies. Recently mixed but with a standout 5-1 win over Serbia; draws against Portugal and Belgium show they can hang with top sides."},
   news:{nl:"Ochoa (41) speelt zijn vijfde en laatste WK: historisch. Jimenez (Fulham) fit als aanvalsleider. Santiago Gimenez (AC Milan) mist het toernooi door een blessure: een significante aanvalsverlies. Aguirre kiest voor ervaring boven jeugd in de selectie.",en:"Ochoa (41) plays his fifth and final World Cup: historic. Jimenez (Fulham) fit as attack leader. Santiago Gimenez (AC Milan) misses the tournament through injury: a significant attacking loss. Aguirre selects experience over youth."},
   outlook:{nl:"Op papier middenmoot, maar als gastland aanzienlijk gevaarlijker in de praktijk. Groep A (Zuid-Korea, Zuid-Afrika, Tsjechië): de achtste finale is het minimum. Zonder Gimenez is hun aanvalslinie echter dunner dan gewenst.",en:"Mid-tier on paper, but as hosts significantly more dangerous in practice. Group A (South Korea, South Africa, Czechia): the round of 16 is the minimum. Without Gimenez their attack is thinner than desired."},
   formRating:4},
  {team:"South Korea",flag:"🇰🇷",group:"A",coach:"Hong Myung-bo",formation:"4-3-3",
   stars:["Son Heung-min","Lee Kang-in","Kim Min-jae","Hwang Hee-chan","Cho Gue-sung"],
   form:{nl:"Soeverein door de Aziatische kwalificatie: 9 zeges, 5 remises, ongeslagen (32:8). Son Heung-min blijft de aanvoerder; de recente 0-4 nederlaag tegen Ivoorkust in een oefenduel was een waarschuwing.",en:"Cruised through Asian qualifying: 9 wins, 5 draws, unbeaten (32:8). Son Heung-min remains captain; the recent 0-4 friendly loss to Ivory Coast was a warning sign."},
   news:{nl:"Kim Min-jae (Bayern Munich) is een van de vijf beste centrale verdedigers ter wereld en de sleutel tot hun defensieve stabiliteit. Cho Gue-sung scoorde in de AFC-kwalificatie als back-up spits. Hong's 4-3-3 is compact en snel op de omschakeling.",en:"Kim Min-jae (Bayern Munich) is one of the world's five best central defenders and the key to their defensive stability. Cho Gue-sung scored in AFC qualifying as backup striker. Hong's 4-3-3 is compact and fast on the counter."},
   outlook:{nl:"Groep A (Mexico, Zuid-Afrika, Tsjechië): groepswinst is realistisch als Son op dreef is. In de knockouts wacht potentieel Canada of Zwitserland: geen onoverkomelijke tegenstanders.",en:"Group A (Mexico, South Africa, Czechia): group victory is realistic if Son fires. In the knockouts Canada or Switzerland potentially await: not insurmountable opponents."},
   formRating:-2},
  {team:"South Africa",flag:"🇿🇦",group:"A",coach:"Hugo Broos",formation:"4-4-2",
   stars:["Percy Tau","Lyle Foster","Evidence Makgopa","Teboho Mokoena","Ronwen Williams"],
   form:{nl:"Won de CAF-groep met 8 zeges (29:11) maar verloor recent oefenduels tegen Kameroen en Panama. Bafana Bafana presteert boven verwachting, maar de aanval blijft wisselvallig.",en:"Won their CAF group with 8 wins (29:11) but recently lost friendlies to Cameroon and Panama. Bafana Bafana overperform expectations, though the attack stays inconsistent."},
   news:{nl:"Lyle Foster (Burnley) is fit na een moeilijk persoonlijk jaar. Ronwen Williams is een van de beste keepers van Afrika en overtrof verwachtingen bij een reeks Europese clubs. Percy Tau (Al Ahly) geeft aanval en creativiteit op de flank.",en:"Lyle Foster (Burnley) fit after a difficult personal year. Ronwen Williams is one of Africa's best goalkeepers and exceeded expectations at a series of European clubs. Percy Tau (Al Ahly) provides attack and creativity on the flank."},
   outlook:{nl:"Groep A (Mexico, Zuid-Korea, Tsjechië): een punt of meer is mogelijk, zeker thuis in de VS-sfeer. Ze verdedigen diep en dreigen op de tegenaanval via Makgopa.",en:"Group A (Mexico, South Korea, Czechia): a point or more is possible, especially in the home US atmosphere. They defend deep and threaten on the counter via Makgopa."},
   formRating:5},
  {team:"Czechia",flag:"🇨🇿",group:"A",coach:"Miroslav Koubek",formation:"4-2-3-1",
   stars:["Tomas Soucek","Patrik Schick","Antonin Barak","Ladislav Krejci","Matej Kovar"],
   form:{nl:"Moeizame kwalificatie (5 zeges, 2 nederlagen). Recent wel scherp voor doel: 6-0 tegen Gibraltar en 5-1 tegen Guatemala, maar remises tegen Denemarken tonen de kwetsbaarheid tegen sterkere ploegen.",en:"A laboured qualification (5 wins, 2 losses). Recently sharp in front of goal: 6-0 over Gibraltar and 5-1 over Guatemala, but draws with Denmark expose their vulnerability against stronger sides."},
   news:{nl:"Kovar (PSV Eindhoven) is een jonge betrouwbare keeper die dit seizoen consistent presteerde. Krejci (Lazio) en Barak (Aston Villa) zijn solide middenveld aanvullingen. Tactisch solid maar creatief beperkt zonder een fitte Schick.",en:"Kovar (PSV Eindhoven) is a young reliable goalkeeper who performed consistently this season. Krejci (Lazio) and Barak (Aston Villa) are solid midfield additions. Tactically solid but creatively limited without a fit Schick."},
   outlook:{nl:"Groep A (Mexico, Zuid-Korea, Zuid-Afrika): overleven is al een prestatie. De wedstrijd vs Zuid-Afrika is hun beste kans op punten; Mexico en Zuid-Korea zijn een klasse sterker.",en:"Group A (Mexico, South Korea, South Africa): surviving is already an achievement. The South Africa match is their best chance at points; Mexico and South Korea are a class above."},
   formRating:-4},

  // GROUP B
  {team:"Canada",flag:"🇨🇦",group:"B",coach:"Jesse Marsch",formation:"4-3-3",
   stars:["Alphonso Davies","Jonathan David","Tajon Buchanan","Cyle Larin","Alistair Johnston"],
   form:{nl:"Als gastland geen kwalificatie. Vorm uit oefenduels is solide: zeges op Venezuela en Oezbekistan, remises tegen IJsland en Tunesië. Onder Jesse Marsch georganiseerd en lastig te kloppen.",en:"As hosts, no qualifiers. Friendly form is solid: wins over Venezuela and Uzbekistan, draws with Iceland and Tunisia. Organised and hard to beat under Jesse Marsch."},
   news:{nl:"Buchanan (Club Brugge) geeft explosiviteit op de rechterflank. Larin en Eustaquio (Porto) versterken het middenveld. Marsch heeft een aanvallende 4-3-3 ingevoerd die perfect past bij Davies en David. Eerste WK-deelname in Ottawa was in 1986.",en:"Buchanan (Club Brugge) provides explosivity on the right flank. Larin and Eustaquio (Porto) strengthen midfield. Marsch has implemented an attacking 4-3-3 that fits Davies and David perfectly. Canada's previous World Cup was Ottawa 1986."},
   outlook:{nl:"Groep B (Zwitserland, Bosnië, Qatar): doorgang als tweede is realistisch. Davies + David is het beste aanvalsduo in CONCACAF. Als Davies zijn flankpasses levert en David afwerkt, winnen ze de groep.",en:"Group B (Switzerland, Bosnia, Qatar): progression in second place is realistic. Davies + David is the best attacking duo in CONCACAF. If Davies delivers flank passes and David finishes, they can win the group."},
   formRating:6},
  {team:"Switzerland",flag:"🇨🇭",group:"B",coach:"Murat Yakin",formation:"4-2-3-1",
   stars:["Granit Xhaka","Xherdan Shaqiri","Manuel Akanji","Breel Embolo","Remo Freuler"],
   form:{nl:"Ongeslagen door de kwalificatie (4 zeges, 2 remises, 14:2). Sterke defensie, maar de recente 3-4 oefennederlaag tegen Duitsland liet zien dat het achterin kan kraken tegen topaanvallen.",en:"Unbeaten through qualifying (4 wins, 2 draws, 14:2). Strong defence, but the recent 3-4 friendly loss to Germany showed the back line can crack against elite attacks."},
   news:{nl:"Shaqiri (Chicago Fire, 36) speelt zijn laatste WK als invaller en ervaren stem in de kleedkamer. Embolo (Monaco) combineert fysieke kracht met techniek in de aanval. Freuler (Bologna) en Ndoye (Bologna) geven diepte op de flanken.",en:"Shaqiri (Chicago Fire, 36) plays his last World Cup as substitute and experienced voice in the dressing room. Embolo (Monaco) combines physical power with attacking technique. Freuler (Bologna) and Ndoye (Bologna) provide depth on the flanks."},
   outlook:{nl:"Groep B (Canada, Bosnië, Qatar): de groepswinst is het realistische doel. Ze zijn de meest betrouwbare 'overperformer' van het toernooi: elk WK doen ze het beter dan verwacht.",en:"Group B (Canada, Bosnia, Qatar): group victory is the realistic target. They are the most consistent 'overperformer' of any tournament: every World Cup they outperform expectations."},
   formRating:2},
  {team:"Bosnia-Herzegovina",flag:"🇧🇦",group:"B",coach:"Sergej Barbarez",formation:"4-3-3",
   stars:["Edin Dzeko","Ermedin Demirovic","Nedim Bajrami","Sasa Kalajdzic","Denis Husic"],
   form:{nl:"Haalde het WK via veel gelijke spelen (5 zeges, 4 remises). Veel recente duels eindigen onbeslist (1-1, 0-0): solide maar weinig overtuigend, met te weinig scorend vermogen.",en:"Reached the World Cup on the back of many draws (5 wins, 4 ties). A string of recent matches ended level (1-1, 0-0): solid but unconvincing, lacking a cutting edge."},
   news:{nl:"Demirovic had een uitstekend Bundesliga-seizoen en is hun gevaarlijkste aanvaller in realistische termen. Bajrami (Sassuolo) geeft creativiteit maar is onervaren op dit niveau. De selectie mist een echte topkeeper.",en:"Demirovic had an excellent Bundesliga season and is their most dangerous attacker in realistic terms. Bajrami (Sassuolo) provides creativity but lacks experience at this level. The squad lacks a top goalkeeper."},
   outlook:{nl:"Groep B (Canada, Zwitserland, Qatar): doorgang vereist een wonder. Canada en Zwitserland zijn allebei sterker. Een punt vs Qatar is het realistische plafond.",en:"Group B (Canada, Switzerland, Qatar): progression requires a miracle. Canada and Switzerland are both stronger. One point vs Qatar is the realistic ceiling."},
   formRating:-3},
  {team:"Qatar",flag:"🇶🇦",group:"B",coach:"Julen Lopetegui",formation:"4-3-3",
   stars:["Almoez Ali","Hassan Al-Haydos","Akram Afif","Ismaeel Mohammad","Meshaal Barsham"],
   form:{nl:"Worstelde door een lange Aziatische kwalificatie (8 zeges, 5 nederlagen, negatief doelsaldo 26:27). De vorm is zorgelijk: amper scorend in recente duels (0-1, 0-3, 0-0).",en:"Struggled through a long Asian qualification (8 wins, 5 losses, negative goal difference 26:27). Form is worrying: barely scoring in recent matches (0-1, 0-3, 0-0)."},
   news:{nl:"Afif (PSG) is hun enige speler van werkelijk Europees toptopniveau. Al-Haydos (36) speelt zijn derde WK als aanvoerder. Lopez als coach kan de structurele kwaliteitskloof met Europese ploegen niet compenseren.",en:"Afif (PSG) is their only player of genuinely European top level. Al-Haydos (36) plays his third World Cup as captain. Coach Lopez cannot compensate the structural quality gap against European sides."},
   outlook:{nl:"Groep B (Canada, Zwitserland, Bosnië): punten zijn zeer onwaarschijnlijk. Zelfs een gelijkspel tegen Bosnië zou een verrassing zijn.",en:"Group B (Canada, Switzerland, Bosnia): points are very unlikely. Even a draw against Bosnia would be a surprise."},
   formRating:-8},

  // GROUP C
  {team:"Brazil",flag:"🇧🇷",group:"C",coach:"Carlo Ancelotti",formation:"4-2-3-1",
   stars:["Vinicius Jr","Raphinha","Endrick","Marquinhos","Bruno Guimaraes"],
   form:{nl:"Wisselvallige Zuid-Amerikaanse kwalificatie (6 zeges, 3 nederlagen), historisch zwak voor Braziliaanse begrippen. Onder Ancelotti recent in de lift: 3-1 tegen Kroatië, 6-2 tegen Panama en 2-1 tegen Egypte.",en:"An erratic South American qualification (6 wins, 3 losses), historically weak by Brazilian standards. Recently improving under Ancelotti: 3-1 over Croatia, 6-2 over Panama and 2-1 over Egypt."},
   news:{nl:"Neymar (kuit, since 17 mei) is een grensgeval voor de opener vs Marokko (13 juni): de arts zei 'tot drie weken'. Endrick (Real Madrid, 19) is de wildcard aanvaller. Alisson fit ondanks eerdere blessurerecidief. Ancelotti heeft nauwelijks internationale wedstrijdervaring.",en:"Neymar (calf, since May 17) is a borderline call for the opener vs Morocco (June 13): team doctor said 'up to three weeks'. Endrick (Real Madrid, 19) is the wildcard attacker. Alisson fit despite earlier injury relapse. Ancelotti has barely any international match experience."},
   outlook:{nl:"De blessures zijn reëel en structureel. Als Vinicius, Raphinha en Endrick klikken, kunnen ze iedereen verslaan; als dat niet lukt, vallen ze eerder uit dan verwacht. Marokko in de groep is bikkelhard.",en:"The injuries are real and structural. If Vinicius, Raphinha and Endrick click they can beat anyone; if not, they fall earlier than expected. Morocco in the group is a brutal draw."},
   formRating:7},
  {team:"Morocco",flag:"🇲🇦",group:"C",coach:"Walid Regragui",formation:"4-1-4-1",
   stars:["Achraf Hakimi","Sofyan Amrabat","Brahim Diaz","Youssef En-Nesyri","Nayef Aguerd"],
   form:{nl:"Vlekkeloze kwalificatie: 13 wedstrijden, 13 zeges, 46:4. De beste verdediging van het toernooi (0,25 goals tegen per duel) en in bloedvorm: 3-0 tegen Senegal, 5-0 tegen Burkina Faso.",en:"A flawless qualification: 13 games, 13 wins, 46:4. The tournament's best defence (0.25 goals conceded per game) and in superb form: 3-0 over Senegal, 5-0 over Burkina Faso."},
   news:{nl:"Hakimi (PSG) licht twijfelachtig met hamstringklachten maar verwacht fit voor de opener vs Brazilië (13 juni). Amrabat fit en in topvorm. Brahim Diaz (Real Madrid) had zijn beste seizoen ooit. Ziyech fit ondanks een wisselvallig clubseizoen.",en:"Hakimi (PSG) minor doubt with hamstring but expected fit for opener vs Brazil (June 13). Amrabat fit and in top form. Brahim Diaz (Real Madrid) had his best season ever. Ziyech fit despite an inconsistent club season."},
   outlook:{nl:"De meest onderschatte ploeg van het toernooi. Ons model geeft hen een grotere kans op de titel dan Argentinië of Duitsland. Groep C (Brazilië, Schotland, Haïti) is winbaar als groepswinnaar. In de knockouts zijn zij het team waar topfavorieten het meest voor vrezen.",en:"The most underestimated team at the tournament. The model gives them a greater chance of the title than Argentina or Germany. Group C (Brazil, Scotland, Haiti) is winnable as group winners. In the knockouts, they are the team top favourites most fear."},
   formRating:-3},
  {team:"Scotland",flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",group:"C",coach:"Steve Clarke",formation:"4-3-3",
   stars:["Scott McTominay","Andy Robertson","Billy Gilmour","Ryan Christie","Che Adams"],
   form:{nl:"Kwalificeerde zich met 4 zeges uit 6. Scherp in de aanval (4-2 tegen Denemarken, 4-1 tegen Curaçao, 4-0 tegen Bolivia), maar verloor nipt van Japan en Ivoorkust.",en:"Qualified with 4 wins from 6. Sharp going forward (4-2 over Denmark, 4-1 over Curaçao, 4-0 over Bolivia), but lost narrowly to Japan and Ivory Coast."},
   news:{nl:"Gilmour (Brighton) speelt zijn eerste WK en presteert boven zijn leeftijdsgenoten in technisch niveau. Clarke's systeem is defensief georganiseerd maar wint op intensiteit. Groep C: Brazilië en Marokko zijn te sterk, maar McTominay verandert altijd de dynamiek.",en:"Gilmour (Brighton) plays his first World Cup and performs above his peers in technical level. Clarke's system is defensively organised but wins on intensity. Group C: Brazil and Morocco are too strong, but McTominay always changes the dynamic."},
   outlook:{nl:"Groep C (Brazilië, Marokko, Haïti): de achtste finale is een droom, niet een missie. Maar McTominay kan elke wedstrijd op zijn eigen transformeren en Schotland vecht altijd harder dan verwacht.",en:"Group C (Brazil, Morocco, Haiti): the round of 16 is a dream, not a mission. But McTominay can transform any individual match and Scotland always fight harder than expected."},
   formRating:3},
  {team:"Haiti",flag:"🇭🇹",group:"C",coach:"Sébastien Migné",formation:"4-4-2",
   stars:["Duckens Nazon","Frantzdy Pierrot","Jean Ricner Bellegarde","Wilson Isidor","Derrick Etienne"],
   form:{nl:"Verraste in de CONCACAF-kwalificatie (6 zeges). Wisselvallige recente vorm met een 4-0 zege op Nieuw-Zeeland maar ook nederlagen tegen Tunesië en Peru.",en:"A surprise package in CONCACAF qualifying (6 wins). Mixed recent form with a 4-0 win over New Zealand but also losses to Tunisia and Peru."},
   news:{nl:"Bellegarde (Rennes) is hun tweede kwaliteitsspeler op Europees niveau. De breedte van de selectie is beperkt en de meeste spelers zijn actief buiten de Europese topcompetities. Groep C: Brazilië en Marokko zijn ver boven hun niveau.",en:"Bellegarde (Rennes) is their second quality player at European level. Squad depth is limited and most players are active outside European top competitions. Group C: Brazil and Morocco are far above their level."},
   outlook:{nl:"Groep C (Brazilië, Marokko, Schotland): de wedstrijd vs Schotland is de enige kans op punten. Aanwezig zijn op dit podium is op zichzelf al een historische prestatie voor Haiti.",en:"Group C (Brazil, Morocco, Scotland): the Scotland match is the only chance at points. Being on this stage is in itself already a historic achievement for Haiti."},
   formRating:-5},

  // GROUP D
  {team:"United States",flag:"🇺🇸",group:"D",coach:"Mauricio Pochettino",formation:"4-3-3",
   stars:["Christian Pulisic","Weston McKennie","Tyler Adams","Giovanni Reyna","Folarin Balogun"],
   form:{nl:"Als gastland geen kwalificatie. Oefenvorm is wisselvallig onder Pochettino: een sterke 5-1 op Uruguay en 3-2 op Senegal, maar nederlagen tegen België, Portugal en Duitsland.",en:"As hosts, no qualifiers. Friendly form is mixed under Pochettino: a strong 5-1 over Uruguay and 3-2 over Senegal, but losses to Belgium, Portugal and Germany."},
   news:{nl:"Adams (Crystal Palace) hersteld van een enkelblessure en verwacht te starten. Reyna fit na jaren blessureproblematiek. Balogun (Monaco) verwacht als starter voor zijn eerste WK. Weah (Marseille) geeft breedte op de rechterflank.",en:"Adams (Crystal Palace) recovered from ankle injury and expected to start. Reyna fit after years of injury problems. Balogun (Monaco) expected to start for his first World Cup. Weah (Marseille) provides width on the right flank."},
   outlook:{nl:": het model reflecteert hun inconsistente resultaten eerlijk. Maar thuis in de VS zijn ze gevaarlijker dan elke statistiek aangeeft. Groep D (Turkije, Australië, Paraguay): doorgang is het minimum.",en:": the model honestly reflects their inconsistent results. But at home in the USA they are more dangerous than any statistic suggests. Group D (Turkey, Australia, Paraguay): progression is the minimum."},
   formRating:5},
  {team:"Turkey",flag:"🇹🇷",group:"D",coach:"Vincenzo Montella",formation:"4-2-3-1",
   stars:["Hakan Calhanoglu","Arda Guler","Kenan Yildiz","Merih Demiral","Ferdi Kadioglu"],
   form:{nl:"Sterke kwalificatie (6 zeges uit 8) met overtuigende cijfers. In vorm: 4-0 tegen Noorwegen, 1-0 tegen Roemenië, en een 2-2 gelijkspel tegen Spanje toont het niveau.",en:"A strong qualification (6 wins from 8) with convincing numbers. In form: 4-0 over Norway, 1-0 over Romania, and a 2-2 draw with Spain shows the level."},
   news:{nl:"Yildiz (Juventus, 19) speelt zijn eerste WK en kan een basisplaats verdienen. Kadioglu (Fenerbahce) is explosief en aanvallend bedreigend op links. Demiral (Al-Qadsiah) is de vaste centrale verdediger. Montella's systeem vertrouwt op Calhanoglu als fundament.",en:"Yildiz (Juventus, 19) plays his first World Cup and can earn a starting spot. Kadioglu (Fenerbahce) is explosive and attacking on the left. Demiral (Al-Qadsiah) is the regular central defender. Montella's system relies on Calhanoglu as foundation."},
   outlook:{nl:"Groep D (VS, Australië, Paraguay): de achtste finale is haalbaar. Met een fitte Guler kunnen ze elke ploeg in de knockouts aan. Zonder hem verliezen ze hun creatieve sleutel maar blijven gevaarlijk via Calhanoglu.",en:"Group D (USA, Australia, Paraguay): the round of 16 is achievable. With a fit Guler they can face any team in the knockouts. Without him they lose their creative key but remain dangerous through Calhanoglu."},
   formRating:-2},
  {team:"Australia",flag:"🇦🇺",group:"D",coach:"Tony Popovic",formation:"4-3-3",
   stars:["Mathew Leckie","Mitchell Duke","Aaron Mooy","Harry Souttar","Riley McGree"],
   form:{nl:"Soeverein door de Aziatische kwalificatie (9 zeges, 30:7). Defensief sterk, maar de recente 0-3 tegen Colombia liet zien dat het tegen technische ploegen kan worstelen.",en:"Cruised through Asian qualifying (9 wins, 30:7). Defensively strong, but the recent 0-3 loss to Colombia showed they can struggle against technical sides."},
   news:{nl:"Mooy (Celtic, 34) is hun dirigent maar speelt op zijn laatste energie. Souttar (Rangers) volledig hersteld van een eerdere knieblessure. Irvine (Hearts) versterkt het middenveld. Isak (Newcastle) is de nationale held die niet speelt voor Australië maar voor Zweden.",en:"Mooy (Celtic, 34) is their conductor but playing on his last reserves. Souttar (Rangers) fully recovered from earlier knee injury. Irvine (Hearts) strengthens midfield. Isak (Newcastle) is the national hero who plays for Sweden, not Australia."},
   outlook:{nl:"Groep D (VS, Turkije, Paraguay): de achtste finale is haalbaar als ze Turkije matchen. Australië vecht altijd harder dan verwacht: hun kans op groepsdoorgang is groter dan de odds suggereren.",en:"Group D (USA, Turkey, Paraguay): the round of 16 is achievable if they match Turkey. Australia always fight harder than expected: their chance of group progression is greater than the odds suggest."},
   formRating:2},
  {team:"Paraguay",flag:"🇵🇾",group:"D",coach:"Gustavo Alfaro",formation:"4-2-3-1",
   stars:["Miguel Almiron","Julio Enciso","Richard Sanchez","Braian Samudio","Nicolas Moreno"],
   form:{nl:"Keerde terug op het WK na een degelijke kwalificatie (6 zeges, ongeslagen reeks). Recent wisselvallig: zeges op Mexico en een 4-0 op Nicaragua, maar nederlagen tegen de VS en Marokko.",en:"Returned to the World Cup after a steady qualification (6 wins, an unbeaten run). Recently mixed: wins over Mexico and 4-0 over Nicaragua, but losses to the USA and Morocco."},
   news:{nl:"Coronel (Inter Miami) is de keeper. Sanchez en Morales vormen de middenveldbasis. Garnero maakte de ploeg in Copa América 2024 competitief maar de kwaliteitskloof met de top van Groep D is aanzienlijk.",en:"Coronel (Inter Miami) is the goalkeeper. Sanchez and Morales form the midfield base. Garnero made the squad competitive in Copa América 2024 but the quality gap with the top of Group D is significant."},
   outlook:{nl:"Groep D (VS, Turkije, Australië): doorgang vereist drie goed georganiseerde wedstrijden. Zonder Enciso is de aanvalslinie te dun. Een punt is realistisch; meer vereist een verrassing.",en:"Group D (USA, Turkey, Australia): progression requires three well-organised matches. Without Enciso the attack is too thin. One point is realistic; more requires an upset."},
   formRating:-4},

  // GROUP E
  {team:"Germany",flag:"🇩🇪",group:"E",coach:"Julian Nagelsmann",formation:"4-2-3-1",
   stars:["Jamal Musiala","Florian Wirtz","Joshua Kimmich","Kai Havertz","Antonio Rudiger"],
   form:{nl:"Korte maar sterke kwalificatie (5 zeges uit 6, 16:3). In bloedvorm onder Nagelsmann: 6-0 tegen Slowakije, 4-3 tegen Zwitserland, 4-0 tegen Finland en 2-1 tegen de VS.",en:"A short but strong qualification (5 wins from 6, 16:3). In excellent form under Nagelsmann: 6-0 over Slovakia, 4-3 over Switzerland, 4-0 over Finland and 2-1 over the USA."},
   news:{nl:"Karl (18) gescheurde dijbeenspier in training; definitief afwezig, vervangen door RB Leipzig-talent (20). Havertz als centrumaanvaller blijft de grootste vraagtekens opleveren ondanks zijn goede Arsenal-seizoen. Rudiger aanvoerder en fit.",en:"Karl (18) torn thigh muscle in training; definitively out, replaced by RB Leipzig talent (20). Havertz as centre-forward remains the biggest question mark despite his solid Arsenal season. Rudiger fit as captain."},
   outlook:{nl:"Groep E (Ecuador, Ivoorkust, Curaçao) biedt weinig weerstand. De knockoutweg gaat potentieel via Japan in de kwartfinale en daarna Spanje of België: ambitieus maar realistisch voor een hongerige generatie.",en:"Group E (Ecuador, Ivory Coast, Curacao) offers little resistance. The knockout path potentially goes via Japan in the quarter-final and then Spain or Belgium: ambitious but realistic for a hungry generation."},
   formRating:8},
  {team:"Ecuador",flag:"🇪🇨",group:"E",coach:"Sebastián Beccacece",formation:"4-3-3",
   stars:["Moises Caicedo","Kendry Paez","Enner Valencia","Jeremy Sarmiento","Piero Hincapie"],
   form:{nl:"Defensief ijzersterk in de kwalificatie (slechts 2 goals tegen in 12 duels), maar weinig scorend (5 zeges, 6 remises). Recent een 2-1 op Saoedi-Arabië en remises tegen Marokko en Nederland.",en:"Defensively excellent in qualifying (just 2 goals conceded in 12 games), but low-scoring (5 wins, 6 draws). Recently a 2-1 over Saudi Arabia and draws with Morocco and the Netherlands."},
   news:{nl:"Enner Valencia (39) speelt zijn waarschijnlijk laatste WK en is aanvoerder: zijn leiderschap is even waardevol als zijn goals. Piero Hincapie (Bayer Leverkusen) geeft verdedigend een stevige basis links achterin. Beccacece's pressing systeem werkt goed.",en:"Enner Valencia (39) plays his likely last World Cup as captain: his leadership is as valuable as his goals. Piero Hincapie (Bayer Leverkusen) provides a solid defensive base at left-back. Beccacece's pressing system functions well."},
   outlook:{nl:"Ecuador presteert boven hun FIFA-ranking: kwalificatiecijfers en de kwaliteit van Caicedo + Paez bewijzen dat ze worden onderschat. Groep E (Duitsland, Ivoorkust, Curaçao): een verrassing tegen Duitsland is mogelijk. De achtste finale is een realistisch doel.",en:"Ecuador outperforms their FIFA ranking: their qualifying record and the quality of Caicedo + Paez prove they are underrated. Group E (Germany, Ivory Coast, Curacao): an upset against Germany is possible. The round of 16 is a realistic target."},
   formRating:-8},
  {team:"Ivory Coast",flag:"🇨🇮",group:"E",coach:"Emerse Faé",formation:"4-3-3",
   stars:["Sebastien Haller","Simon Adingra","Franck Kessie","Seko Fofana","Wilfried Zaha"],
   form:{nl:"Imponerende kwalificatie (10 zeges, 26:3, beste defensie van Afrika). In topvorm: versloeg recent Frankrijk met 2-1, een statement vlak voor het toernooi.",en:"An impressive qualification (10 wins, 26:3, Africa's best defence). In top form: recently beat France 2-1, a statement just before the tournament."},
   news:{nl:"Adingra (Brighton) is explosief en leverde dit seizoen zijn beste clubprestaties. Kessie speelt na een moeizame periode bij Barcelona nu bij Al-Ahli en is minder scherp dan in zijn piektijd. Fae's systeem is dynamisch en aanvallend georienteerd.",en:"Adingra (Brighton) is explosive and delivered his best club performances this season. Kessie is at Al-Ahli after a difficult Barcelona period and is less sharp than his peak. Fae's system is dynamic and attack-oriented."},
   outlook:{nl:"Groep E (Duitsland, Ecuador, Curaçao): een verrassing tegen Duitsland is realistisch als Haller en Diomande schitteren. De achtste finale is het haalbare doel.",en:"Group E (Germany, Ecuador, Curacao): an upset against Germany is realistic if Haller and Diomande shine. The round of 16 is the achievable target."},
   formRating:2},
  {team:"Curacao",flag:"🇨🇼",group:"E",coach:"Dick Advocaat",formation:"4-4-2",
   stars:["Leandro Bacuna","Myron Boadu","Cuco Martina","Elson Hooi","Chedric Bazoer"],
   form:{nl:"Historische eerste WK-kwalificatie (7 zeges, 28:5). Sterk thuis, maar de recente oefennederlagen tegen Chili (0-2), Australië (1-5) en Schotland (1-4) tonen het kloofje met de top.",en:"A historic first World Cup qualification (7 wins, 28:5). Strong at home, but recent friendly losses to Chile (0-2), Australia (1-5) and Scotland (1-4) show the gap to the elite."},
   news:{nl:"De meeste selectiespelers zijn actief in de tweede en derde divisies van Europa of de MLS. Jeune bonnen zoals Antonucci geven creatief aanstootgevend maar ze ontbreken de kwaliteit om topploegen te bedreigen.",en:"Most squad players are active in second and third divisions of Europe or the MLS. Young talents like Antonucci provide creative threat but they lack the quality to trouble top sides."},
   outlook:{nl:"laagste van het toernooi. Groep E (Duitsland, Ecuador, Ivoorkust): punten zijn vrijwel onmogelijk. Aanwezig zijn is zelf de prestatie voor dit eilandvoetbal.",en:"lowest in the tournament. Group E (Germany, Ecuador, Ivory Coast): points are virtually impossible. Being here is itself the achievement for this island football nation."},
   formRating:-6},

  // GROUP F
  {team:"Netherlands",flag:"🇳🇱",group:"F",coach:"Ronald Koeman",formation:"4-3-3",
   stars:["Virgil van Dijk","Frenkie de Jong","Memphis Depay","Cody Gakpo","Bart Verbruggen"],
   form:{nl:"Solide kwalificatie (6 zeges, ongeslagen, 27:4). Sterk aanvallend, maar de recente 0-1 nederlaag tegen Algerije en remises tegen Polen en Ecuador roepen vragen op.",en:"A solid qualification (6 wins, unbeaten, 27:4). Strong in attack, but the recent 0-1 loss to Algeria and draws with Poland and Ecuador raise questions."},
   news:{nl:"Frenkie de Jong fit na hamstringproblemen bij Barcelona. Gakpo (Liverpool) in uitstekende vorm na een sterk clubseizoen. Dumfries (Inter) fit. Verbruggen (Brighton) is de eerste keeper. Timber is beschikbaar maar zijn minuten worden beheerd.",en:"Frenkie de Jong fit after hamstring problems at Barcelona. Gakpo (Liverpool) in excellent form after a strong club season. Dumfries (Inter) fit. Verbruggen (Brighton) is first keeper. Timber available but his minutes are managed."},
   outlook:{nl:"Opener vs Japan is statistisch nagenoeg gelijkopgaand en bepalend voor de groepsdynamiek. Als ze als groepswinnaar eindigen, is het knockoutpad via Ecuador (R16) en daarna Duitsland (KF) zeer uitdagend maar haalbaar.",en:"Opener vs Japan is statistically near even and defines the group dynamic. As group winners, the knockout path via Ecuador (R16) and then Germany (QF) is very challenging but achievable."},
   formRating:0},
  {team:"Japan",flag:"🇯🇵",group:"F",coach:"Hajime Moriyasu",formation:"4-2-3-1",
   stars:["Takefusa Kubo","Wataru Endo","Daichi Kamada","Ritsu Doan","Ayase Ueda"],
   form:{nl:"Briljante kwalificatie (10 zeges, 41:3). In uitstekende vorm: versloeg recent zowel Schotland (1-0) als Engeland (1-0), bewijs dat dit het sterkste Japan ooit is.",en:"A brilliant qualification (10 wins, 41:3). In excellent form: recently beat both Scotland (1-0) and England (1-0), proof this is the strongest Japan ever."},
   news:{nl:"Mitoma (hamstring) niet geselecteerd: groot verlies voor de aanval. Kubo (Real Sociedad) draagt nu het aanvallende gewicht. Doan (Eintracht Frankfurt) presteert in de Bundesliga. Endo (Liverpool) aanvoerder en fit. Opener vs Nederland is nagenoeg gelijkopgaand per model.",en:"Mitoma (hamstring) not selected: major loss for the attack. Kubo (Real Sociedad) now carries the attacking weight. Doan (Eintracht Frankfurt) performing in Bundesliga. Endo (Liverpool) captain and fit. Opener vs Netherlands is near coin flip per model."},
   outlook:{nl:"Groep F (Nederland, Zweden, Tunesië): doorgang als tweede is realistisch. Als ze Nederland verslaan, herschikken ze de gehele groepsdynamiek. In de knockouts potentieel Duitsland: de wedstrijd van 2022 herbelefd.",en:"Group F (Netherlands, Sweden, Tunisia): progression in second place is realistic. If they beat Netherlands they reshape the entire group dynamic. In the knockouts potentially Germany: the 2022 match relived."},
   formRating:-10},
  {team:"Sweden",flag:"🇸🇪",group:"F",coach:"Graham Potter",formation:"4-3-3",
   stars:["Alexander Isak","Dejan Kulusevski","Emil Forsberg","Victor Lindelof","Marcus Danielson"],
   form:{nl:"Teleurstellende kwalificatie (2 zeges, 4 nederlagen, negatief doelsaldo), kwam via de play-offs. Wisselvallig ondanks talent: een 3-2 op Polen, maar nederlagen tegen Noorwegen.",en:"A disappointing qualification (2 wins, 4 losses, negative goal difference), squeezed through the play-offs. Inconsistent despite the talent: a 3-2 over Poland, but losses to Norway."},
   news:{nl:"Lindelof (Manchester United) speelt minder voor zijn club maar is nog steeds een solide internationale aanvoerder. Forsberg (Leipzig) is fit maar op zijn 32e minder bepalend. Tomasson's systeem is nuchter en op het collectief gericht.",en:"Lindelof (Manchester United) plays less for his club but remains a solid international captain. Forsberg (Leipzig) fit but at 32 less decisive. Tomasson's system is pragmatic and collective-focused."},
   outlook:{nl:"Groep F (Nederland, Japan, Tunesië): de derde plek is het realistische scenario. Maar als Isak in topvorm is, kunnen ze altijd een wedstrijd stelen. Tunesië is de wedstrijd om voor te spelen.",en:"Group F (Netherlands, Japan, Tunisia): third place is the realistic scenario. But when Isak is in top form they can always steal a match. Tunisia is the match they are playing for."},
   formRating:0},
  {team:"Tunisia",flag:"🇹🇳",group:"F",coach:"Sami Trabelsi",formation:"4-2-3-1",
   stars:["Wahbi Khazri","Hannibal Mejbri","Ellyes Skhiri","Youssef Msakni","Ali Maaloul"],
   form:{nl:"Sterke Afrikaanse kwalificatie (10 zeges, 24:6). Maar de recente vorm zakte in: een zware 0-5 nederlaag tegen België en een 0-1 tegen Australië vlak voor het toernooi.",en:"A strong African qualification (10 wins, 24:6). But recent form dipped: a heavy 0-5 loss to Belgium and a 0-1 to Australia just before the tournament."},
   news:{nl:"Msakni (33) is minder explosief dan vroeger maar nog steeds de meest creatieve aanvaller. Mejbri (Burnley) kan dit toernooi doorbreken als een van de meest opwindende jonge Tunesiërs ooit. Maaloul speelt zijn waarschijnlijk laatste WK op links.",en:"Msakni (33) is less explosive than before but still the most creative attacker. Mejbri (Burnley) can break through at this tournament as one of the most exciting young Tunisians ever. Maaloul plays his likely last World Cup on the left."},
   outlook:{nl:"Groep F (Nederland, Japan, Zweden): als ze Zweden verslaan, is groepsdoorgang mogelijk. Skhiri als spil en Mejbri als wildcard zijn de twee sleutels.",en:"Group F (Netherlands, Japan, Sweden): if they beat Sweden, group progression is possible. Skhiri as pivot and Mejbri as wildcard are the two keys."},
   formRating:-2},

  // GROUP G
  {team:"Belgium",flag:"🇧🇪",group:"G",coach:"Rudi Garcia",formation:"4-3-3",
   stars:["Romelu Lukaku","Kevin De Bruyne","Youri Tielemans","Axel Witsel","Arthur Vermeeren"],
   form:{nl:"Vlotte kwalificatie (5 zeges, ongeslagen, 29:7). In bloedvorm voor doel: 7-0 tegen Liechtenstein, 5-2 tegen de VS en 5-0 tegen Tunesië. De aanval draait op volle toeren.",en:"A smooth qualification (5 wins, unbeaten, 29:7). In superb scoring form: 7-0 over Liechtenstein, 5-2 over the USA and 5-0 over Tunisia. The attack is firing."},
   news:{nl:"Vermeeren (Atletico Madrid) is hun jongste en meest belovende middenvelder. Doku (Man City) is explosief op de flank. Tedesco's systeem wint op talent boven tactiek; als De Bruyne fit is, is hun aanvalspotentieel nog steeds elite.",en:"Vermeeren (Atletico Madrid) is their youngest and most promising midfielder. Doku (Man City) is explosive on the flank. Tedesco's system wins on talent over tactics; when De Bruyne is fit their attacking potential is still elite."},
   outlook:{nl:"Groep G (Egypte, Iran, Nieuw-Zeeland) is comfortabel. In de knockouts potentieel op Uruguay (R16) en dan Spanje (KF): de laatste stap is te groot. De Bruyne's gezondheid bepaalt hun plafond volledig.",en:"Group G (Egypt, Iran, New Zealand) is comfortable. In the knockouts potentially Uruguay (R16) and then Spain (QF): that last step is too large. De Bruyne's health determines their ceiling entirely."},
   formRating:8},
  {team:"Egypt",flag:"🇪🇬",group:"G",coach:"Hossam Hassan",formation:"4-3-3",
   stars:["Mohamed Salah","Omar Marmoush","Mostafa Mohamed","Trézéguet","Ahmed Hegazi"],
   form:{nl:"Domineerde de Afrikaanse kwalificatie (10 zeges, ongeslagen, 24:4). Salah leidt de ploeg; recent een knappe 1-0 op Rusland, al was er een 1-2 nederlaag tegen Brazilië.",en:"Dominated African qualifying (10 wins, unbeaten, 24:4). Salah leads the side; recently a fine 1-0 over Russia, though there was a 1-2 loss to Brazil."},
   news:{nl:"Salah en Marmoush vormen het gevaarlijkste aanvalsduo van Afrika op dit toernooi. Egypte heeft nog nooit een WK-knockoutwedstrijd gewonnen in zes eerdere deelnames. ElShenawy is een betrouwbare keeper.",en:"Salah and Marmoush form the most dangerous African attacking duo at this tournament. Egypt have never won a World Cup knockout match in six previous appearances. ElShenawy is a reliable goalkeeper."},
   outlook:{nl:"Groep G (België, Iran, Nieuw-Zeeland): de achtste finale is voor het eerst in decennia een realistisch doel. Als Salah en Marmoush scoren, gaan ze door. Buiten de achtste finale wacht extreem zwaar knockoutvoetbal.",en:"Group G (Belgium, Iran, New Zealand): the round of 16 is for the first time in decades a realistic target. If Salah and Marmoush score, they go through. Beyond the last 16 extremely tough knockout football awaits."},
   formRating:-9},
  {team:"Iran",flag:"🇮🇷",group:"G",coach:"Amir Ghalenoei",formation:"4-3-3",
   stars:["Mehdi Taremi","Sardar Azmoun","Alireza Jahanbakhsh","Saeid Ezatolahi","Ali Gholizadeh"],
   form:{nl:"Sterke Aziatische kwalificatie (10 zeges, 29:10). Defensief solide en in vorm: 5-0 tegen Costa Rica, 3-1 tegen Gambia en 2-0 tegen Maleisië.",en:"A strong Asian qualification (10 wins, 29:10). Defensively solid and in form: 5-0 over Costa Rica, 3-1 over Gambia and 2-0 over Malaysia."},
   news:{nl:"Ghalenoei's defensief georganiseerde 4-2-3-1 is bewezen in de AFC-kwalificatie. Ezatolahi (Sepahan) is hun beste middenvelder buiten Europa maar speelt op lager niveau. Iran verloor van Qatar in een vriendschappelijke wedstrijd: een zorgelijk signaal.",en:"Ghalenoei's defensively organised 4-2-3-1 is proven in AFC qualifying. Ezatolahi (Sepahan) is their best midfielder outside Europe but plays at a lower level. Iran lost to Qatar in a friendly: a concerning signal."},
   outlook:{nl:"Groep G (België, Egypte, Nieuw-Zeeland): de achtste finale is haalbaar als Taremi zijn Serie A-niveau vertaalt. De logistieke chaos heeft de voorbereiding geschaad maar niet de wil om te presteren.",en:"Group G (Belgium, Egypt, New Zealand): the round of 16 is achievable if Taremi translates his Serie A level. The logistical chaos has hurt preparation but not the will to perform."},
   formRating:0},
  {team:"New Zealand",flag:"🇳🇿",group:"G",coach:"Darren Bazeley",formation:"4-4-2",
   stars:["Chris Wood","Ryan Thomas","Winston Reid","Bill Tuilagi","Liberato Cacace"],
   form:{nl:"Soeverein door de zwakke OFC-kwalificatie (5 zeges, 29:1) maar dat zegt weinig: tegen sterkere tegenstanders volgden nederlagen tegen Ecuador, Finland, Haïti en Engeland.",en:"Cruised through the weak OFC qualification (5 wins, 29:1) but that means little: against stronger opponents came losses to Ecuador, Finland, Haiti and England."},
   news:{nl:"Sarpreet Singh (1. FC Nuremberg) speelt op het tweede niveau in Duitsland maar is hun meest technisch begaafde middenvelder. Cacace (Empoli) is een betrouwbare linksback. De squad heeft weinig spelers in de top 5 Europese competities.",en:"Sarpreet Singh (1. FC Nuremberg) plays at the second level in Germany but is their most technically gifted midfielder. Cacace (Empoli) is a reliable left-back. The squad has few players in the top 5 European competitions."},
   outlook:{nl:"Groep G (België, Egypte, Iran): geen realistisch pad naar de tweede ronde. Zelfs een punt zou een historische prestatie zijn voor de All Whites.",en:"Group G (Belgium, Egypt, Iran): no realistic path to the second round. Even a point would be a historic achievement for the All Whites."},
   formRating:0},

  // GROUP H
  {team:"Spain",flag:"🇪🇸",group:"H",coach:"Luis de la Fuente",formation:"4-3-3",
   stars:["Lamine Yamal","Pedri","Rodri","Nico Williams","Dani Olmo"],
   form:{nl:"Vlekkeloze kwalificatie (5 zeges, ongeslagen, 21:2) als Europees kampioen. Recent iets gehaperd: een teleurstellend 1-1 gelijkspel tegen Irak en 0-0 tegen Egypte vlak voor het toernooi.",en:"A flawless qualification (5 wins, unbeaten, 21:2) as European champions. Recently stuttered slightly: a disappointing 1-1 draw with Iraq and 0-0 with Egypt just before the tournament."},
   news:{nl:"Merino (stressfractuur voet) is toch geselecteerd na een snelle revalidatie. Fermin Lopez mist het toernooi met een gebroken middenvoetsbeentje. Geen Real Madrid-spelers, een principebeslissing van De la Fuente. Yamal speelde door lichte hamstringklachten in de voorbereiding.",en:"Merino (foot stress fracture) made the squad after a quick recovery. Fermin Lopez misses the tournament with a broken metatarsal. No Real Madrid players selected, a principled decision by De la Fuente. Yamal played through minor hamstring discomfort in preparation."},
   outlook:{nl:"en hoogste Elo-rating (1905) van alle 48 deelnemers. Groep H (Uruguay, Saudi-Arabië, Kaapverdië) is comfortabel. In de knockouts potentieel op België in de kwartfinale: een aantrekkelijke en beheersbare weg naar de finale.",en:"and highest Elo rating (1905) of all 48 participants. Group H (Uruguay, Saudi Arabia, Cape Verde) is comfortable. In the knockouts potentially facing Belgium in the quarter-final: an attractive and manageable route to the final."},
   formRating:0},
  {team:"Uruguay",flag:"🇺🇾",group:"H",coach:"Marcelo Bielsa",formation:"4-3-3",
   stars:["Federico Valverde","Darwin Nunez","Ronald Araujo","Jose Maria Gimenez","Rodrigo Bentancur"],
   form:{nl:"Moeizame kwalificatie onder Bielsa (3 zeges, 6 remises), veel gelijke spelen. Recent defensief degelijk (0-0 tegen Mexico en Algerije, 1-1 tegen Engeland) maar weinig scorend.",en:"A laboured qualification under Bielsa (3 wins, 6 draws), lots of stalemates. Recently defensively sound (0-0 with Mexico and Algeria, 1-1 with England) but low-scoring."},
   news:{nl:"Araujo (Barcelona) was maandenlang geblesseerd maar is fit verklaard voor het toernooi. Bielsa's hoge pressing vereist topconditie; het team heeft zwaar geoefend in de voorbereiding. Bentancur (Spurs) drijft het middenveld naast Valverde.",en:"Araujo (Barcelona) was injured for months but declared fit for the tournament. Bielsa's high press requires peak fitness; the team trained intensively in preparation. Bentancur (Spurs) drives midfield alongside Valverde."},
   outlook:{nl:"maar Copa América-winnaar en met Valverde als beste middenvelder ter wereld. Groep H (Spanje, Saudi-Arabië, Kaapverdië): de tweede plek is het doel. In de knockouts zijn ze gevaarlijk voor elke ploeg die niet in topvorm is.",en:"but Copa América winner and with Valverde as the world's best midfielder. Group H (Spain, Saudi Arabia, Cape Verde): second place is the target. In the knockouts they are dangerous for any side not in top form."},
   formRating:-2},
  {team:"Saudi Arabia",flag:"🇸🇦",group:"H",coach:"Giorgos Donis",formation:"4-2-3-1",
   stars:["Salem Al-Dawsari","Saleh Al-Shehri","Yasser Al-Shahrani","Mohammed Al-Owais","Ali Al-Bulaihi"],
   form:{nl:"Worstelde door de Aziatische kwalificatie (6 zeges, 6 remises, 4 nederlagen). Wisselvallige vorm met zware nederlagen tegen Egypte (0-4) en Servië, al was er een 3-0 op Puerto Rico.",en:"Struggled through Asian qualifying (6 wins, 6 draws, 4 losses). Inconsistent form with heavy losses to Egypt (0-4) and Serbia, though there was a 3-0 over Puerto Rico."},
   news:{nl:"Mancini's project is slechts begonnen en heeft weinig internationale competitieve ervaring opgebouwd. Al-Owais is een betrouwbare keeper maar de aanval is dunner dan in 2022 zonder Al-Shehri op topniveau.",en:"Mancini's project is relatively new and has built little international competitive experience. Al-Owais is a reliable goalkeeper but the attack is thinner than in 2022 without Al-Shehri at peak level."},
   outlook:{nl:"Groep H (Spanje, Uruguay, Kaapverdië): doorgang vereist twee wonderen. De verrassing van 2022 herhalen is een droom. Ze zijn defensief sterk genoeg om eventueel één punt te pakken.",en:"Group H (Spain, Uruguay, Cape Verde): progression requires two miracles. Repeating the 2022 upset is a dream. They are defensively strong enough to potentially pick up one point."},
   formRating:-3},
  {team:"Cape Verde",flag:"🇨🇻",group:"H",coach:"Bubista",formation:"4-4-2",
   stars:["Garry Rodrigues","Ryan Mendes","Stopira","Steven Fortes","Julio Tavares"],
   form:{nl:"Historische eerste WK-kwalificatie (7 zeges) voor de eilandstaat. Wisselvallig: een knappe 3-0 op Servië, maar ook nederlagen tegen Chili en een 0-3 tegen Bermuda.",en:"A historic first World Cup qualification (7 wins) for the island nation. Inconsistent: a fine 3-0 over Serbia, but also losses to Chile and a 0-3 to Bermuda."},
   news:{nl:"Ryan Mendes en Dylan Tavares spelen in de Portugese top competitie. Stopira is een betrouwbare verdediger met ervaring in Europa. Brito's systeem is compact en fysiek: ze zijn moeilijk te verslaan als een blok.",en:"Ryan Mendes and Dylan Tavares play in the top Portuguese league. Stopira is a reliable defender with European experience. Brito's system is compact and physical: they are hard to beat as a unit."},
   outlook:{nl:"Groep H (Spanje, Uruguay): overleven is al een prestatie. Ze zijn de underdog van de groep maar de wedstrijd vs Saudi-Arabië is realistisch om voor te spelen.",en:"Group H (Spain, Uruguay): surviving is already an achievement. They are the group underdogs but the Saudi Arabia match is realistically the one to play for."},
   formRating:4},

  // GROUP I
  {team:"France",flag:"🇫🇷",group:"I",coach:"Didier Deschamps",formation:"4-3-3",
   stars:["Kylian Mbappe","Ousmane Dembele","Antoine Griezmann","N'Golo Kante","William Saliba"],
   form:{nl:"Sterke kwalificatie (5 zeges uit 6, 16:4). Maar vlak voor het toernooi een verrassende 1-2 nederlaag tegen Ivoorkust, een smet op een verder overtuigende reeks (4-0 Oekraïne, 2-1 Brazilië).",en:"A strong qualification (5 wins from 6, 16:4). But a surprise 1-2 loss to Ivory Coast just before the tournament, a blemish on an otherwise convincing run (4-0 Ukraine, 2-1 Brazil)."},
   news:{nl:"Kolo Muani en Camavinga niet geselecteerd in een omstreden keuze die robuustheid boven creativiteit plaatst. Kante (34) is fit als defensieve anker. Dembele (PSG) en Griezmann vormen de steun achter Mbappe in een bewezen systeem.",en:"Kolo Muani and Camavinga controversially left out in favour of robustness over creativity. Kante (34) is fit as defensive anchor. Dembele (PSG) and Griezmann support Mbappe in a proven system."},
   outlook:{nl:"Favoriet op basis van het model (composiet #3) maar hun brackethalf bevat Haalands Noorwegen en potentieel Engeland. Deschamps' conservatieve systeem pakt altijd punten in de knockouts. Als Mbappe scoort, wint Frankrijk.",en:"Model favourite (composite #3) but their bracket half contains Haaland's Norway and potentially England. Deschamps' conservative system always picks up knockout points. When Mbappe scores, France win."},
   formRating:0},
  {team:"Norway",flag:"🇳🇴",group:"I",coach:"Ståle Solbakken",formation:"4-2-3-1",
   stars:["Erling Haaland","Martin Odegaard","Alexander Sorloth","Sander Berge","Antonio Nusa"],
   form:{nl:"Perfecte kwalificatie: 8 wedstrijden, 8 zeges, 37:5, gedreven door Haaland. In bloedvorm: 4-1 tegen Italië, 3-1 tegen Zweden. Eerste WK sinds 1998 en in topvorm.",en:"A perfect qualification: 8 games, 8 wins, 37:5, driven by Haaland. In superb form: 4-1 over Italy, 3-1 over Sweden. First World Cup since 1998, and flying."},
   news:{nl:"Haaland fit ondanks spierproblemen laat in het seizoen bij Man City. Odegaard fit na het Arsenal-titelseizoen. Nusa (Dortmund, 20) is de opkomende derde kracht. Groep I: Noorwegen opent vs Irak, daarna Senegal en Mbappe's Frankrijk.",en:"Haaland fit despite late-season muscle concerns at Man City. Odegaard fit after Arsenal's title season. Nusa (Dortmund, 20) is the emerging third force. Group I: Norway open vs Iraq, then Senegal and Mbappe's France."},
   outlook:{nl:"hoger dan elke Aziatische of Afrikaanse ploeg. De echte vraag: kunnen ze Mbappe's Frankrijk matchen in de groep? Een gelijkspel zou voldoende zijn voor doorgang. In de knockouts wacht potentieel Argentinië in de R16.",en:"higher than any Asian or African side. The real question: can they match Mbappe's France in the group? A draw would be enough for progression. In the knockouts, potentially Argentina awaits in the round of 16."},
   formRating:-18},
  {team:"Senegal",flag:"🇸🇳",group:"I",coach:"Pape Thiaw",formation:"4-3-3",
   stars:["Sadio Mane","Nicolas Jackson","Ismaila Sarr","Pape Matar Sarr","Kalidou Koulibaly"],
   form:{nl:"Sterke Afrikaanse kwalificatie (11 zeges, ongeslagen, 28:4). Maar recent gemengd: een 0-3 nederlaag tegen Marokko en een 2-3 tegen de VS naast een 3-1 op Gambia.",en:"A strong African qualification (11 wins, unbeaten, 28:4). But recently mixed: a 0-3 loss to Morocco and a 2-3 to the USA alongside a 3-1 over Gambia."},
   news:{nl:"Koulibaly (Al-Hilal) is aanvoerder en verdedigt nog steeds op internationaal toptopniveau. Pape Matar Sarr (Tottenham) is de opkomende middenveldkracht. Groep I: opener vs Irak, daarna Noorwegen (nagenoeg gelijkopgaand) en Frankrijk.",en:"Koulibaly (Al-Hilal) is captain and still defends at international top level. Pape Matar Sarr (Tottenham) is the emerging midfield force. Group I: opener vs Iraq, then Norway (near even) and France."},
   outlook:{nl:"Groep I heeft Mbappe's Frankrijk als obstakel maar Noorwegen is haalbaar. De achtste finale is het realistische doel, de kwartfinale de droom. Cisse's systeem is compact en gevaarlijk op omschakelingen.",en:"Group I has Mbappe's France as obstacle but Norway is achievable. The round of 16 is the realistic target, the quarter-final the dream. Cisse's system is compact and dangerous on counter-attacks."},
   formRating:-2},
  {team:"Iraq",flag:"🇮🇶",group:"I",coach:"Graham Arnold",formation:"4-3-3",
   stars:["Mohanad Ali","Ahmed Ibrahim","Aymen Hussein","Ali Jassim","Safaa Hadi"],
   form:{nl:"Lange, taaie Aziatische kwalificatie (11 zeges, 19 duels). Wisselvallig maar in stijgende lijn: hield Spanje recent op 1-1, een knap resultaat dat het potentieel toont.",en:"A long, gruelling Asian qualification (11 wins over 19 games). Inconsistent but improving: recently held Spain to 1-1, a fine result showing their potential."},
   news:{nl:"Visa- en reislogistiek hebben de Iraakse voorbereiding serieus verstoord. Treinen de VS binnenkomend waren problematisch tot de dag voor het toernooi. Groep I: Noorwegen (opener) is het enige wedstrijd met een lichte kans op punten.",en:"Visa and travel logistics seriously disrupted Iraq's preparation. Entering the USA was problematic until the day before the tournament. Group I: Norway (opener) is the only match with a marginal chance at points."},
   outlook:{nl:"Groep I (Frankrijk, Noorwegen, Senegal): geen realistisch pad naar doorgang. De opener vs Noorwegen is hun minst ongelijke wedstrijd. Aanwezig zijn na 40 jaar afwezigheid is de nationale overwinning.",en:"Group I (France, Norway, Senegal): no realistic path to progression. The opener vs Norway is their least unequal match. Being present after 40 years' absence is the national victory."},
   formRating:-5},

  // GROUP J
  {team:"Argentina",flag:"🇦🇷",group:"J",coach:"Lionel Scaloni",formation:"4-4-2",
   stars:["Lionel Messi","Julian Alvarez","Rodrigo De Paul","Emiliano Martinez","Alexis Mac Allister"],
   form:{nl:"Regerend wereldkampioen, sterke kwalificatie (7 zeges, 23:8). In vorm: 5-0 tegen Zambia, 2-0 tegen Honduras. Messi miste eind mei een oefenduel met een lichte blessure maar wordt fit verwacht.",en:"Reigning world champions, a strong qualification (7 wins, 23:8). In form: 5-0 over Zambia, 2-0 over Honduras. Messi missed a late-May friendly with a minor injury but is expected fit."},
   news:{nl:"Balerdi definitief afwezig (kuit). Molina, Paredes, Paz en Montiel trainen apart en zijn twijfelachtig voor de opener vs Algerije (16 juni). Scaloni bevestigde: iedereen die niet 100% fit is wordt vervangen. Mac Allister in uitstekende vorm bij Liverpool.",en:"Balerdi definitively out (calf). Molina, Paredes, Paz and Montiel training separately and doubtful for opener vs Algeria (June 16). Scaloni confirmed: anyone not 100% fit will be replaced. Mac Allister in excellent form at Liverpool."},
   outlook:{nl:"maar het blessureprofiel verlaagt de effectieve sterkte met 15-30 punten. Als Messi fit is, kunnen ze iedereen verslaan. Knockoutpad via Noorwegen (R16) en potentieel Engeland (KF): extreem zwaar als alle geblesseerden niet herstellen.",en:"but the injury profile reduces effective strength by 15-30 points. If Messi is fit they can beat anyone. Knockout path via Norway (R16) and potentially England (QF): extremely tough if the injured players do not recover."},
   formRating:3},
  {team:"Colombia",flag:"🇨🇴",group:"J",coach:"Néstor Lorenzo",formation:"4-3-3",
   stars:["Luis Diaz","James Rodriguez","Richard Rios","Jhon Cordoba","Davinson Sanchez"],
   form:{nl:"Wisselvallige Zuid-Amerikaanse kwalificatie (4 zeges, 4 nederlagen). Maar recent in de lift: 3-0 tegen Australië, 3-1 tegen Costa Rica, al volgde een 1-3 tegen Frankrijk.",en:"An inconsistent South American qualification (4 wins, 4 losses). But recently improving: 3-0 over Australia, 3-1 over Costa Rica, though a 1-3 to France followed."},
   news:{nl:"James Rodriguez (36) is meegenomen maar is niet meer de dominante speler van Rusland 2018. Caicedo (Chelsea) is werkelijk wereldklasse als defensieve middenvelder en de beste aankoop van Colombia's systeem. Hincapie (Bayer Leverkusen) verdedigend sterk.",en:"James Rodriguez (36) is included but no longer the dominant player of Russia 2018. Caicedo (Chelsea) is genuinely world-class as defensive midfielder and the best acquisition for Colombia's system. Hincapie (Bayer Leverkusen) defensively strong."},
   outlook:{nl:"maar de Copa América-finale en Diaz's clubvorm suggereren dat ze worden onderschat. Groep K (Portugal, DR Congo, Oezbekistan): een ideale loting. Ze winnen de groep als Diaz en Rios presteren.",en:"but the Copa América final and Diaz's club form suggest they are underrated. Group K (Portugal, Congo DR, Uzbekistan): an ideal draw. They win the group if Diaz and Rios perform."},
   formRating:-7},
  {team:"Austria",flag:"🇦🇹",group:"J",coach:"Ralf Rangnick",formation:"4-2-3-1",
   stars:["Marcel Sabitzer","Konrad Laimer","Christoph Baumgartner","Marko Arnautovic","Patrick Wimmer"],
   form:{nl:"Overtuigende kwalificatie onder Rangnick (6 zeges, 22:4). In goede vorm: 5-1 tegen Ghana, en nipte zeges op Zuid-Afrika en Tunesië tonen de degelijkheid.",en:"A convincing qualification under Rangnick (6 wins, 22:4). In good form: 5-1 over Ghana, and narrow wins over South Africa and Tunisia show their reliability."},
   news:{nl:"Baumgartner was geselecteerd maar blesseerde zich en Austria koos niet voor een vervanger. Arnautovic (Bologna, 36) speelt zijn eerste WK als aanvallende reserve en ervaren stem in de kleedkamer. Gregoritsch (SC Freiburg) als alternatieve spits.",en:"Baumgartner was selected but suffered an injury and Austria opted not to call up a replacement. Arnautovic (Bologna, 36) plays his first World Cup as attacking cover and experienced dressing room voice. Gregoritsch (SC Freiburg) as alternative striker."},
   outlook:{nl:"Groep J (Argentinië, Algerije, Jordanië): de kwartfinale is een realistisch doel als ze Jordanië verslaan en Algerije matchen. Rangnicks systeem is competitief genoeg voor de achtste en mogelijk de kwartfinale.",en:"Group J (Argentina, Algeria, Jordan): the quarter-final is a realistic target if they beat Jordan and match Algeria. Rangnick's system is competitive enough for the last 16 and possibly the quarter-final."},
   formRating:-2},
  {team:"Algeria",flag:"🇩🇿",group:"J",coach:"Vladimir Petković",formation:"4-3-3",
   stars:["Riyad Mahrez","Ramy Bensebaini","Hicham Boudaoui","Amar Dedic","Amine Gouiri"],
   form:{nl:"Domineerde de Afrikaanse kwalificatie (11 zeges, 35:9). In uitstekende vorm: 7-0 tegen Guatemala en een knappe 1-0 op Nederland vlak voor het toernooi.",en:"Dominated African qualifying (11 wins, 35:9). In excellent form: 7-0 over Guatemala and a fine 1-0 over the Netherlands just before the tournament."},
   news:{nl:"Zerrouki (Augsburg) is een betrouwbare defensieve middenvelder. Benrahma (Lyon) geeft aanvallende breedte. De kwalificatieverlies van Zuid-Afrika en Nigeria in vriendschappelijke wedstrijden is een zorgwekkend signaal voor de toernooivorm.",en:"Zerrouki (Augsburg) is a reliable defensive midfielder. Benrahma (Lyon) provides attacking width. Losing to South Africa and Nigeria in friendly matches is a concerning signal about tournament form."},
   outlook:{nl:"Groep J (Argentinië, Oostenrijk, Jordanië): de achtste finale is realistisch als ze Jordanië verslaan en een punt halen van Oostenrijk. Mahrez is de sleutel; zonder hem valt alles terug.",en:"Group J (Argentina, Austria, Jordan): the round of 16 is realistic if they beat Jordan and take a point from Austria. Mahrez is the key; without him everything falls back."},
   formRating:0},
  {team:"Jordan",flag:"🇯🇴",group:"J",coach:"Jamal Sellami",formation:"4-3-3",
   stars:["Yazan Al-Naimat","Baha Faisal","Mousa Al-Taamari","Osama Rashid","Ahmad Saleh"],
   form:{nl:"Historische eerste WK-kwalificatie (8 zeges, 31:9). Maar recent zwaar getest: een 1-4 nederlaag tegen Zwitserland en remises tonen het niveauverschil met de top.",en:"A historic first World Cup qualification (8 wins, 31:9). But recently tested hard: a 1-4 loss to Switzerland and draws show the gap to the elite."},
   news:{nl:"De meeste spelers zijn actief in de Jordaanse en Aziatische competities. Er zijn nauwelijks World Cup-caps onder de selectiespelers. Groep J: Argentinië en Oostenrijk zijn te sterk; Algerije is de enige kans op punten.",en:"Most players are active in the Jordanian and Asian leagues. Barely any World Cup caps exist among squad players. Group J: Argentina and Austria are too strong; Algeria is the only chance at points."},
   outlook:{nl:"Groep J (Argentinië, Oostenrijk, Algerije): punten zijn buitengewoon moeilijk. Aanwezig zijn op het eerste WK in de nationale geschiedenis is de prestatie.",en:"Group J (Argentina, Austria, Algeria): points are exceptionally difficult. Being present at the nation's first-ever World Cup is the achievement."},
   formRating:-4},

  // GROUP K
  {team:"Portugal",flag:"🇵🇹",group:"K",coach:"Roberto Martínez",formation:"4-3-3",
   stars:["Cristiano Ronaldo","Bruno Fernandes","Bernardo Silva","Ruben Dias","Vitinha"],
   form:{nl:"Sterke kwalificatie (4 zeges, 20:7). In vorm voor doel: 9-1 tegen Armenië, 2-0 tegen de VS en 2-1 tegen Chili, al was er een 0-2 nederlaag tegen Tsjechië.",en:"A strong qualification (4 wins, 20:7). In scoring form: 9-1 over Armenia, 2-0 over the USA and 2-1 over Chile, though there was a 0-2 loss to Czechia."},
   news:{nl:"Ronaldo (41) speelt zijn definitief laatste WK; Martinez bouwt het systeem niet langer volledig om hem heen. Bruno Fernandes draagt het creatieve gewicht in het middenveld. Pedro Neto (Chelsea) is fit na eerdere blessures en geeft breedte op de rechterflank.",en:"Ronaldo (41) plays his definitively last World Cup; Martinez no longer builds the system entirely around him. Bruno Fernandes carries the creative midfield weight. Pedro Neto (Chelsea) is fit after earlier injuries and provides width on the right flank."},
   outlook:{nl:"Groep K (Colombia, DR Congo, Oezbekistan) is beheersbaar. In de knockouts is hun plafond de kwartfinale of halve finale afhankelijk van de loting. Technisch sterk maar zonder de winnende knockoutmentaliteit van Spanje of Argentinië.",en:"Group K (Colombia, Congo DR, Uzbekistan) is manageable. In the knockouts their ceiling is the quarter-final or semi-final depending on the draw. Technically strong but without the knockout-winning mentality of Spain or Argentina."},
   formRating:0},
  {team:"DR Congo",flag:"🇨🇩",group:"K",coach:"Sébastien Desabre",formation:"4-3-3",
   stars:["Arthur Masuaku","Yannick Bolasie","Cédric Bakambu","Yoane Wissa","Chancel Mbemba"],
   form:{nl:"Taaie Afrikaanse kwalificatie (12 zeges, 17 duels, 23:9). Defensief solide en in stijgende lijn: recent 3-0 tegen Botswana en een 0-0 tegen Denemarken.",en:"A gruelling African qualification (12 wins over 17 games, 23:9). Defensively solid and improving: recently 3-0 over Botswana and a 0-0 with Denmark."},
   news:{nl:"Masuaku (Besiktas) geeft breedte op de linkerkant. Bolasie (bij een kleinere Europese club) is een veteraan die ervaring inbrengt. DR Congo kwalificeerde via een sterke CAF-campagne en is het sterkste Afrikaanse team in Groep K.",en:"Masuaku (Besiktas) provides width on the left. Bolasie (at a smaller European club) is a veteran bringing experience. DR Congo qualified via a strong CAF campaign and is the strongest African team in Group K."},
   outlook:{nl:"Groep K (Portugal, Colombia, Oezbekistan): de tweede plek en de achtste finale zijn het doel. Ze zijn sterker dan Oezbekistan en kunnen Colombia druk zetten als Wissa schittert.",en:"Group K (Portugal, Colombia, Uzbekistan): second place and the round of 16 are the target. They are stronger than Uzbekistan and can press Colombia if Wissa shines."},
   formRating:3},
  {team:"Uzbekistan",flag:"🇺🇿",group:"K",coach:"Fabio Cannavaro",formation:"4-3-3",
   stars:["Eldor Shomurodov","Abbosbek Fayzullaev","Jamshid Iskanderov","Otabek Shukurov","Khojimat Erkinov"],
   form:{nl:"Historische eerste WK-kwalificatie (9 zeges, 22:8). Defensief degelijk maar weinig scorend; recent een 0-2 nederlaag tegen Canada toont het kloofje met de top.",en:"A historic first World Cup qualification (9 wins, 22:8). Defensively reliable but low-scoring; a recent 0-2 loss to Canada shows the gap to the elite."},
   news:{nl:"Fayzullaev (Red Bull Salzburg) is hun meest technisch begaafde middenvelder. De meeste spelers zijn actief in de Russische of Kazachse competities en spelen ver onder internationaal toernooivlak. Aanwezig zijn is de prestatie.",en:"Fayzullaev (Red Bull Salzburg) is their most technically gifted midfielder. Most players are active in Russian or Kazakh competitions and play far below international tournament level. Being here is the achievement."},
   outlook:{nl:"Groep K (Portugal, Colombia, DR Congo): geen realistisch pad naar de tweede ronde. Portugal en Colombia zijn allebei een andere klasse. DR Congo is de wedstrijd om voor te spelen.",en:"Group K (Portugal, Colombia, Congo DR): no realistic path to the second round. Portugal and Colombia are both a different class. Congo DR is the match to play for."},
   formRating:-4},

  // GROUP L
  {team:"England",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",group:"L",coach:"Thomas Tuchel",formation:"4-2-3-1",
   stars:["Jude Bellingham","Harry Kane","Bukayo Saka","Phil Foden","Declan Rice"],
   form:{nl:"Perfecte kwalificatie: 8 wedstrijden, 8 zeges, 22:0, geen enkele goal tegen. Maar de recente 0-1 nederlaag tegen Japan was een verrassende smet vlak voor het toernooi.",en:"A perfect qualification: 8 games, 8 wins, 22:0, not a single goal conceded. But the recent 0-1 loss to Japan was a surprising blemish just before the tournament."},
   news:{nl:"Kane (Bayern Munich) fit na een solide seizoen in Duitsland. Bellingham was de beste middenvelder van Europa in 2025-26. Saka fit. Grealish niet geselecteerd na een seizoensblessure. Branthwaite en White ook afwezig.",en:"Kane (Bayern Munich) fit after a solid season in Germany. Bellingham was the best midfielder in Europe in 2025-26. Saka fit. Grealish not selected after a season-ending injury. Branthwaite and White also absent."},
   outlook:{nl:"Sterkste selectie in dertig jaar, met Bellingham als potentiële toernooidominant. Knockoutpad gaat via Colombia (R16), dan potentieel Argentinië (KF): de moeilijkste helft van het schema maar niet onoverkomelijk.",en:"Strongest squad in thirty years, with Bellingham as potential tournament dominant. Knockout path goes via Colombia (R16), then potentially Argentina (QF): the tougher half of the bracket but not insurmountable."},
   formRating:6},
  {team:"Croatia",flag:"🇭🇷",group:"L",coach:"Zlatko Dalić",formation:"4-3-3",
   stars:["Luka Modric","Mateo Kovacic","Josko Gvardiol","Andrej Kramaric","Ivan Susic"],
   form:{nl:"Sterke kwalificatie (7 zeges, ongeslagen, 26:4). Maar de recente nederlagen tegen Brazilië (1-3) en België (0-2) tonen dat de gouden generatie tegen de top tekortkomt.",en:"A strong qualification (7 wins, unbeaten, 26:4). But recent losses to Brazil (1-3) and Belgium (0-2) show the golden generation falling short against the elite."},
   news:{nl:"Gvardiol (Man City) is op zijn 22e al een van de beste linksbacks ter wereld. Kovacic (Man City) geeft middenvelddiepte. Kramaric (Hoffenheim) is hun meest betrouwbare doelpuntenmaker. Brozovic speelt bij Al-Nassr en presteert inconsistenter dan vroeger.",en:"Gvardiol (Man City) at 22 is already one of the world's best left-backs. Kovacic (Man City) gives midfield depth. Kramaric (Hoffenheim) is their most reliable scorer. Brozovic plays at Al-Nassr and is less consistent than in his prime."},
   outlook:{nl:"Groep L (Engeland, Ghana, Panama): de achtste finale is realistisch. Voorbij de achtste finale is Modrics WK op de juiste manier geëindigd: dat is het doel van deze generatie.",en:"Group L (England, Ghana, Panama): the round of 16 is realistic. Beyond the last 16 is Modric's World Cup ending on the right note: that is the goal for this generation."},
   formRating:0},
  {team:"Ghana",flag:"🇬🇭",group:"L",coach:"Otto Addo",formation:"4-3-3",
   stars:["Mohammed Kudus","Thomas Partey","Antoine Semenyo","Joseph Paintsil","Jonathan Mensah"],
   form:{nl:"Wisselvallige Afrikaanse kwalificatie (7 zeges, 3 nederlagen). Zorgelijke recente vorm: nederlagen tegen Zuid-Afrika, Australië (1-5), Duitsland en Mexico.",en:"An inconsistent African qualification (7 wins, 3 losses). Worrying recent form: losses to South Africa, Australia (1-5), Germany and Mexico."},
   news:{nl:"Partey (Arsenal) is aanvoerder maar worstelt al twee jaar met chronische blessures en speelde minder dan de helft van Arsenals wedstrijden. Addo heeft moeite om een consistent systeem te bouwen. Ayew (vergevorderde leeftijd) is niet meer geselecteerd.",en:"Partey (Arsenal) is captain but has been struggling with chronic injuries for two years and played less than half of Arsenal's matches. Addo struggles to build a consistent system. Ayew (advanced age) is no longer selected."},
   outlook:{nl:"Groep L (Engeland, Kroatië, Panama): doorgang is onwaarschijnlijk tenzij Kudus in de absolute form van zijn leven speelt. Ze zijn gevaarlijker dan hun ranking aangeeft.",en:"Group L (England, Croatia, Panama): progression is unlikely unless Kudus plays the absolute game of his life. They are more dangerous than their ranking suggests."},
   formRating:2},
  {team:"Panama",flag:"🇵🇦",group:"L",coach:"Thomas Christiansen",formation:"4-4-2",
   stars:["Ismael Diaz","Alberto Quintero","Roman Torres","Anibal Godoy","Jose Fajardo"],
   form:{nl:"Sterke CONCACAF-kwalificatie (7 zeges, 19:5). Defensief degelijk; recent een 4-2 op de Dominicaanse Republiek, al was er een 2-6 nederlaag tegen Brazilië.",en:"A strong CONCACAF qualification (7 wins, 19:5). Defensively reliable; recently a 4-2 over the Dominican Republic, though there was a 2-6 loss to Brazil."},
   news:{nl:"Diaz (CF Montreal) en Godoy zijn hun meest gevaarlijke aanvallers op MLS-niveau. Quintero en Torres zijn de meest ervaren internationale spelers. Arrocha's systeem is defensief gedisciplineerd maar offensief beperkt.",en:"Diaz (CF Montreal) and Godoy are their most dangerous attackers at MLS level. Quintero and Torres are the most experienced international players. Arrocha's system is defensively disciplined but offensively limited."},
   outlook:{nl:"Groep L (Engeland, Kroatië, Ghana): doorgang vereist drie wonderen. Ze verdedigen goed maar hebben niet de aanvalskwaliteit om grote ploegen te bedreigen.",en:"Group L (England, Croatia, Ghana): progression requires three miracles. They defend well but lack the attacking quality to threaten major sides."},
   formRating:-5},
];
const PLAYER_WIKI = {
  "Kylian Mbappe":    "Kylian_Mbappé",
  "Erling Haaland":   "Erling_Haaland",
  "Lamine Yamal":     "Lamine_Yamal",
  "Jude Bellingham":  "Jude_Bellingham",
  "Vinicius Jr":      "Vinícius_Júnior",
  "Lionel Messi":     "Lionel_Messi",
  "Cristiano Ronaldo":"Cristiano_Ronaldo",
  "Frenkie de Jong":  "Frenkie_de_Jong",
  "Memphis Depay":    "Memphis_Depay",
  "Mohamed Salah":    "Mohamed_Salah",
  "Kendry Paez":      "Kendry_Páez",
  "Takefusa Kubo":    "Takefusa_Kubo",
  "Luis Diaz":        "Luis_Díaz_(footballer,_born_1997)",
  "Yan Diomande":     "Yan_Diomandé",
  "Ritsu Doan":       "Ritsu_Doan",
  "Virgil van Dijk": "Virgil_van_Dijk",
  "Martin Odegaard": "Martin_Ødegaard",
  "Rodri": "Rodri_(footballer,_born_1996)",
  "Lautaro Martinez": "Lautaro_Martínez",
  "Theo Hernandez": "Theo_Hernandez",
  "Jules Kounde": "Jules_Koundé",
  "Denzel Dumfries": "Denzel_Dumfries",
  "Manuel Akanji": "Manuel_Akanji",
  "Bart Verbruggen": "Bart_Verbruggen",
  "David Raya": "David_Raya",
};

const SPOTLIGHT = [
  { name:"Kylian Mbappe", st:{G:25,A:5,M:32,note:"La Liga top scorer"}, value:"€150m", club:"Real Madrid", clubLogo:"https://assets.football-logos.cc/logos/spain/700x700/real-madrid.png",
    team:"France", pos:{nl:"Aanvaller",en:"Forward"}, age:27, flag:"🇫🇷",
    bio:{nl:"Aanvoerder van het best georganiseerde elftal van het toernooi, op 27 in zijn absolute piekjaren bij Real Madrid. Mbappe scoorde zijn 50e interland in de Nations League. Zijn combinatie van snelheid, afronding en leiderschapskwaliteiten is zonder gelijke op dit toernooi. Groep I plaatst hem direct tegenover Haaland: twee van de vijf beste spelers ter wereld in dezelfde poule. Als hij het openingsduel wint, trekt Deschamps de selectie gecontroleerd door naar de knockouts. Topscorer van La Liga 2025/26 met 25 goals voor Real Madrid (5 assists), maar zag Barcelona er met de titel vandoor gaan.",en:"Captain of the best-organised squad at the tournament, at 27 in his absolute peak years at Real Madrid. Scored his 50th international in the Nations League. His combination of pace, finishing and leadership is unmatched. Group I places him directly against Haaland: two of the top-five players in the world in the same group. La Liga top scorer with 25 goals for Real Madrid (5 assists), though Barcelona took the title."} },

  { name:"Lamine Yamal", st:{G:16,A:11,M:35,T:"La Liga"}, value:"€200m", club:"FC Barcelona", clubLogo:"https://assets.football-logos.cc/logos/spain/700x700/barcelona.png",
    team:"Spain", pos:{nl:"Rechtsbuiten",en:"Right winger"}, age:18, flag:"🇪🇸",
    bio:{nl:"18 jaar, Europees kampioen van 2024, en de gevaarlijkste rechtsbuiten van het toernooi. Yamal speelde door een hamstringkwetsuur heen in de aanloop naar het WK: De la Fuente behoedde hem voor risico's. Merino (voetblessure) was aanvankelijk twijfelachtig maar is geselecteerd. Yamal trekt verdedigingen scheef waardoor Pedri, Williams en Olmo ruimte vinden. Als Spanje ver gaat, is hij de reden. Spil in Barcelona's kampioensseizoen: 16 goals en 11 assists in een jaar waarin de Catalanen hun 29e La Liga-titel pakten.",en:"18 years old, Euro 2024 champion, the most dangerous right winger at the tournament. Yamal played through a hamstring issue: De la Fuente carefully managed his minutes. Merino (foot stress fracture) is selected. Yamal pulls defences apart creating space for Pedri, Williams and Olmo. If Spain go deep, he is the reason. Pivotal in Barcelona's title win: 16 goals and 11 assists as they claimed their 29th La Liga crown."} },

  { name:"Erling Haaland", st:{G:27,A:8,M:35}, value:"€180m", club:"Manchester City", clubLogo:"https://assets.football-logos.cc/logos/england/700x700/manchester-city.png",
    team:"Norway", pos:{nl:"Spits",en:"Striker"}, age:25, flag:"🇳🇴",
    bio:{nl:"Zijn eerste WK, aangekomen als de meest productieve striker op de planeet. 55 interlanddoelpunten, 16 in de WK-kwalificatie alleen. Odegaard leidde Arsenal naar de Premier League-titel dit seizoen: samen vormen ze het gevaarlijkste aanvalsduo in de groepsfase. Noorwegen verloor geen kwalificatiewedstrijd. Het duel met Van Dijk in Groep F is de meest geanticipeerde individuele confrontatie van de groepsfase. Andermaal moordend efficiënt voor Manchester City met 27 goals en 8 assists, ook al bleef grote clubeer uit.",en:"His first World Cup, arriving as the most prolific striker on the planet. 55 international goals, 16 in World Cup qualifying alone. Odegaard led Arsenal to the Premier League title this season. Together they form the most dangerous attacking duo in the group stage. His duel with Van Dijk in Group F is the defining individual confrontation of the group stage. Ruthlessly efficient again for Manchester City with 27 goals and 8 assists."} },

  { name:"Jude Bellingham", st:{G:6,A:4,M:30}, value:"€130m", club:"Real Madrid", clubLogo:"https://assets.football-logos.cc/logos/spain/700x700/real-madrid.png",
    team:"England", pos:{nl:"Middenvelder",en:"Midfielder"}, age:22, flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    bio:{nl:"Als Engeland ooit het WK wint, is Bellingham de reden. De 22-jarige arriveert na een uitstekend seizoen bij Real Madrid. Tuchel's systeem draait om zijn vermogen om laat op te komen: Declan Rice beschermt, Bellingham beslist in het strafschopgebied. Engeland scoort het hoogst op onze formranglijst van alle 48 landen. De druk van een halve eeuw gemiste titels weegt, maar Bellingham lijkt de schouders breed genoeg. Een wisselvalliger seizoen bij Real Madrid (6 goals, 4 assists), deels door een schouderoperatie eerder in het jaar.",en:"If England ever win a World Cup, Bellingham is the reason. The 22-year-old arrives after an outstanding season at Real Madrid. Tuchel's system revolves around his ability to arrive late: Declan Rice screens, Bellingham decides in the box. England top our form model rankings of all 48 nations. A more uneven season at Real Madrid (6 goals, 4 assists), partly after shoulder surgery earlier in the year."} },

  { name:"Vinicius Jr", st:{G:16,A:5,M:32}, value:"€140m", club:"Real Madrid", clubLogo:"https://assets.football-logos.cc/logos/spain/700x700/real-madrid.png",
    team:"Brazil", pos:{nl:"Linksbuiten",en:"Left winger"}, age:24, flag:"🇧🇷",
    bio:{nl:"De beste winger ter wereld op dit moment, maar met één uitdaging: zijn toernooirecord is zwakker dan zijn clubrecord. Ancelotti kent hem beter dan wie ook: dat werkt in twee richtingen. Brazilië mist Neymar (twijfelachtig, kuit), Rodrygo (ACL) en Estêvão (hamstring). Vinicius moet meer leveren dan ooit tevoren, in het enige grote toernooi dat hij nog niet gedomineerd heeft. 16 goals en 5 assists in 32 La Liga-duels voor Real Madrid, al eindigde de ploeg achter kampioen Barcelona.",en:"The best winger in the world right now, with one challenge: his tournament record is weaker than his club record. Ancelotti knows him better than anyone: that cuts both ways. Brazil miss Neymar (doubtful, calf), Rodrygo (ACL) and Estêvão (hamstring). Vinicius must deliver more than ever before. 16 goals and 5 assists in 32 La Liga games for Real Madrid, who finished behind champions Barcelona."} },

  { name:"Lionel Messi", st:{T:"MLS Cup",note:"MLS MVP"}, value:"€18m", club:"Inter Miami", clubLogo:"https://assets.football-logos.cc/logos/usa/700x700/inter-miami.png",
    team:"Argentina", pos:{nl:"Aanvaller",en:"Forward"}, age:38, flag:"🇦🇷",
    bio:{nl:"Zijn zesde en vrijwel zeker laatste WK op 38. Scaloni beheert voorzichtig een hamstringblessure die hij opliep op 26 mei bij Inter Miami: hij traint gedeeltelijk mee en kan minuten pakken in oefenwedstrijden voor de opener. Balerdi is definitief afwezig (kuit). Molina, Paredes, Paz en Montiel trainen apart. Als Messi fit is en scoort, is Argentinië een andere ploeg. Als hij beperkt blijft, valt hun plafond dramatisch. Tweevoudig MLS-MVP die Inter Miami naar hun eerste MLS Cup leidde; verlengde tot 2028 maar kreeg vlak voor het WK last van een hamstring.",en:"His sixth and almost certainly last World Cup at 38. Scaloni is carefully managing a hamstring injury sustained May 26 at Inter Miami: training partially, may feature before the opener. Balerdi definitively out (calf). Molina, Paredes, Paz and Montiel all training separately. If Messi is fit and scoring, Argentina are a different team. Two-time MLS MVP who led Inter Miami to their first MLS Cup; extended to 2028 but picked up a hamstring issue just before the World Cup."} },

  { name:"Cristiano Ronaldo", st:{note:"Saudi PL titelstrijd"}, value:"€12m", club:"Al-Nassr", clubLogo:"https://assets.football-logos.cc/logos/saudi-arabia/700x700/al-nassr.png",
    team:"Portugal", pos:{nl:"Aanvaller",en:"Forward"}, age:41, flag:"🇵🇹",
    bio:{nl:"Op 41 speelt Ronaldo zijn definitief laatste WK. Martinez bouwt het systeem niet meer volledig om hem heen: Vitinha, Bruno Fernandes en Bernardo Silva dragen het middenveld; PSG's Champions League-winnaars vormen de ruggengraat. Ronaldo's waarde zit in zijn aanwezigheid bij standaardsituaties, zijn vrije trappen en zijn vermogen om in de zestien te beslissen. Hij gaat scoren. De vraag is of Portugal ver genoeg komt. Op zijn 41e nog altijd trefzeker; leidde Al-Nassr naar de titelstrijd bovenaan de Saudi Pro League.",en:"At 41 Ronaldo plays his definitively last World Cup. Martinez no longer builds the system around him: Vitinha, Bruno Fernandes and Bernardo Silva carry the midfield; PSG's Champions League winners provide the backbone. Ronaldo's value lies in set pieces, free kicks and box presence. He will score. The question is whether Portugal go deep enough. Still prolific at 41, leading Al-Nassr in the fight for the Saudi Pro League title."} },

  { name:"Frenkie de Jong", st:{A:5,T:"La Liga"}, value:"€45m", club:"FC Barcelona", clubLogo:"https://assets.football-logos.cc/logos/spain/700x700/barcelona.png",
    team:"Netherlands", pos:{nl:"Middenvelder",en:"Midfielder"}, age:29, flag:"🇳🇱",
    bio:{nl:"De dirigent van het Nederlandse middenveld, hersteld van een hamstringblessure bij Barcelona. Xavi Simons (ACL, april) is afwezig: een significant verlies voor de creatieve diepte. Koeman's systeem is pragmatisch maar Van Dijk, Dumfries en Gakpo zijn allemaal fit. Als De Jong zijn niveau vindt, heeft Nederland de structuur om iedereen op een goede dag te verslaan. Het openingsduel met Japan bepaalt de dynamiek in Groep F. Kwam na een blessure terug in de Barcelona-ploeg en droeg met zijn balbeheersing bij aan het kampioensseizoen.",en:"The conductor of the Dutch midfield, recovered from a hamstring injury at Barcelona. Xavi Simons (ACL, April) is absent: a significant creative loss. Koeman's system is pragmatic but Van Dijk, Dumfries and Gakpo are all fit. If De Jong finds his level, Netherlands can beat anyone on their day. The Japan opener defines Group F. Returned from injury to the Barcelona side and helped steer the title-winning campaign."} },

  { name:"Memphis Depay", st:{}, value:"€8m", club:"Corinthians", clubLogo:"https://assets.football-logos.cc/logos/brazil/700x700/corinthians.png",
    team:"Netherlands", pos:{nl:"Aanvaller",en:"Forward"}, age:31, flag:"🇳🇱",
    bio:{nl:"Topscorer aller tijden van Oranje met 44 doelpunten, maar de context is veranderd. Memphis speelt bij Corinthians in Brazilië: fit, maar minder explosief dan in zijn topjaren bij Lyon of Atletico. Zijn waarde zit in zijn vrijesparkwaliteit, zijn ervaring in grote wedstrijden en het vermogen om een wedstrijd individueel te openen. Als invaller met specifieke rol is hij waardevol. Als starter over zes wedstrijden zijn er vragen. Als aanvoerder van Oranje bleef hij bij Corinthians in Brazilië scoren en richtte zich op een laatste groot toernooi.",en:"Netherlands all-time top scorer with 44 goals, but the context has changed. Memphis plays for Corinthians in Brazil: fit but less explosive than his peak years at Lyon or Atletico. His value lies in dead-ball quality, big-match experience and the ability to unlock a game individually. Valuable as a substitute; questions as a consistent starter. As Netherlands captain he kept scoring for Corinthians in Brazil ahead of one last major tournament."} },

  { name:"Mohamed Salah", st:{G:7,A:7}, value:"€30m", club:"Liverpool", clubLogo:"https://assets.football-logos.cc/logos/england/700x700/liverpool.png",
    team:"Egypt", pos:{nl:"Rechtsbuiten",en:"Right winger"}, age:33, flag:"🇪🇬",
    bio:{nl:"Zijn allereerste WK op 33, een podium dat hem jarenlang ontging. Liverpool's all-time topscorer en aanvoerder arriveert als een van de gevaarlijkste rechtsbuitens die ooit aan een WK deelneemt. De vraag is niet zijn kwaliteit maar of Egypte collectief sterk genoeg is om zijn impact te benutten. Marmoush (Manchester City) is zijn aanvalsparter. Groep G heeft België, Iran en Nieuw-Zeeland: voor het eerst in decennia heeft Egypte een reëel pad naar de achtste finale. Op zijn 33e nog altijd bepalend voor Liverpool met 7 goals en 7 assists in de Premier League.",en:"His very first World Cup at 33, a stage that eluded him for years. Liverpool's all-time top scorer and captain arrives as one of the most dangerous right wingers to ever appear at a World Cup. The question is not his quality but whether Egypt are collectively strong enough to maximise his impact. Marmoush (Man City) is his partner. Group G has Belgium, Iran and New Zealand: Egypt have a realistic last-16 path. Still decisive for Liverpool at 33 with 7 goals and 7 assists in the league."} },
];

const DARK_HORSES = [
  { name:"Ritsu Doan", st:{G:10,A:6}, value:"€20m", clubLogo:"https://assets.football-logos.cc/logos/germany/700x700/eintracht-frankfurt.png",
    team:"Japan", pos:{nl:"Middenvelder/Vleugelspeler",en:"Midfielder/Winger"}, age:26, flag:"🇯🇵",
    club:"Eintracht Frankfurt",
    why:{nl:"Met Mitoma buiten de selectie door een hamstringblessure draagt Doan (26) het aanvallende gewicht van Japan. Bij Eintracht Frankfurt leverde hij zijn beste Europese seizoen: 10 goals, 6 assists, consistent sterk in grote wedstrijden. Zijn langafstandsschoten, directe dribbelstijl en capaciteit om grote ploegen te bestraffen (scoorde bij de 2-1 zege op Duitsland in 2022) maken hem de gevaarlijkste speler van Japan die je niet ziet aankomen. Beleefde bij Eintracht Frankfurt zijn beste Europese seizoen met dubbele cijfers in goals en assists.",en:"With Mitoma out through injury, Doan carries Japan's attacking weight on the right. At Eintracht Frankfurt he delivered his best European season: 10 goals, 6 assists. His long-range shooting and capacity to punish major nations (scored in Japan's 2022 win over Germany) make him the most dangerous player on Japan you don't see coming. Enjoyed his best European season at Eintracht Frankfurt with double figures in goals and assists."} },

  { name:"Kendry Paez", st:{}, value:"€20m", clubLogo:"https://assets.football-logos.cc/logos/england/700x700/chelsea.png",
    team:"Ecuador", pos:{nl:"Aanvallende middenvelder",en:"Attacking midfielder"}, age:19, flag:"🇪🇨",
    club:"Chelsea (loan: River Plate)",
    why:{nl:"19 jaar, op uitleenbasis bij River Plate vanuit Chelsea. Paez is de meest opwindende tiener van het toernooi: elegant aan de bal, angstloos in 1-tegen-1-situaties, capabel om momenten te creëren die wedstrijden kantelen. Zijn samenwerking met Caicedo in het middenveld geeft Ecuador een technische, creatieve speler die ook druk weerstaat. Als hij dit toernooi pakt, is Chelsea een fortuin rijker. Het 19-jarige Ecuadoraanse talent maakte zijn opwachting na zijn overgang naar Chelsea, met speeltijd op huurbasis.",en:"19 years old, on loan at River Plate from Chelsea. Paez is the most exciting teenager at the tournament: elegant in possession, fearless in one-on-one situations, capable of creating the moments that change matches. His partnership with Caicedo gives Ecuador a technical, creative player who also handles pressure. The 19-year-old Ecuadorian made his move to Chelsea, gaining minutes out on loan."} },

  { name:"Takefusa Kubo", st:{T:"Copa del Rey"}, value:"€31m", clubLogo:"https://assets.football-logos.cc/logos/spain/700x700/real-sociedad.png",
    team:"Japan", pos:{nl:"Rechtsmiddenvelder",en:"Right midfielder"}, age:23, flag:"🇯🇵",
    club:"Real Sociedad",
    why:{nl:"Japan's meest technisch begaafde speler en nu, met Mitoma afwezig, de creatieve aanvoerder van de aanval. Bij Real Sociedad heeft Kubo (23) bewezen consistent te zijn in La Liga: zijn dribbelstatistieken, schoten van buiten de zestien en bijdrage in nauwe ruimtes zijn allemaal elite. Als Japan Duitsland of Nederland verslaat, is Kubo waarschijnlijk de man die het verschil maakt. Kroonde zijn seizoen bij Real Sociedad met winst van de Copa del Rey 2026, na strafschoppen tegen Atlético.",en:"Japan's most technically gifted player and now, with Mitoma absent, the creative leader of their attack. At Real Sociedad, Kubo (23) has proven consistent in La Liga: dribbling stats, long-range shooting and tight-space contributions all elite. If Japan beat Germany or Netherlands, Kubo will almost certainly be the difference-maker. Capped his Real Sociedad season by winning the 2026 Copa del Rey on penalties against Atlético."} },

  { name:"Lautaro Martinez", st:{G:17,A:6}, value:"€87m", clubLogo:"https://assets.football-logos.cc/logos/italy/700x700/inter-milan.png",
    team:"Argentina", pos:{nl:"Spits",en:"Striker"}, age:27, flag:"🇦🇷",
    club:"Inter Milan",
    why:{nl:"Als Messi (hamstring) beperkt blijft, is Lautaro Martinez de man die Argentinië draagt. De Inter Milan-spits scoorde dit seizoen indrukwekkende totalen in de Serie A en is de complete centrumspits: sterk in de lucht, gevaarlijk met beide voeten, capabel om te scoren en assists te leveren. Bij een titelhouder die blessuregevoelig aankomt, is hij de stille ster die het verschil bepaalt als het erop aankomt. Aanvoerder en topschutter van Inter met 17 goals en 6 assists in Serie A.",en:"If Messi (hamstring) is limited, Lautaro Martinez is the man who carries Argentina. The Inter Milan striker put up impressive numbers in Serie A this season and is a complete centre-forward: strong in the air, dangerous with both feet, capable of both scoring and assisting. With the defending champions arriving injury-hit, he is the quiet star who decides when it matters most. Captain and top scorer for Inter with 17 goals and 6 assists in Serie A."} },

  { name:"Yan Diomande", st:{G:12,A:8}, value:"€20m", clubLogo:"https://assets.football-logos.cc/logos/germany/700x700/rb-leipzig.png",
    team:"Ivory Coast", pos:{nl:"Middenvelder",en:"Midfielder"}, age:22, flag:"🇨🇮",
    club:"RB Leipzig",
    why:{nl:"De meest consistente uitbreker van het toernooi die niemand verwacht. Diomande (22) domineerde voor RB Leipzig: zijn atletisme, zijn interceptievermogen en zijn doelgevaar vanuit de tweede lijn zijn het type combinatie dat ploegen op hoog niveau vernietigt. Ivoorkust is AFCON-kampioen van 2024 en met Haller en Adingra beschikt Diomande over buitenspelers die zijn runs belonen. Brak door bij RB Leipzig met 12 goals en 8 assists — een doorbraakseizoen voor de jonge Ivoriaan.",en:"The most consistently identified breakout pick that nobody expects. Diomande (22) dominated for RB Leipzig: athleticism, interception ability and late runs into the box: the type of combination that destroys sides at the highest level. Ivory Coast are AFCON 2024 champions and with Haller and Adingra, Diomande has wide players who reward his runs. Broke through at RB Leipzig with 12 goals and 8 assists."} },
];


// ── BEST XI — Fantasy WK-team ────────────────────────────────────────────────
// xG/xA model: club goals+assists per 90 in 25-26 * expected tournament games
//              * positional role multiplier * path quality factor
// Expected games: finalist=7, SF=6, QF=5, R16=4, groups only=3
// Role multipliers: ST=1.0, LW/RW=0.80, CAM=0.65, CM_att=0.55,
//                   CDM=0.25, RB/LB_att=0.40, CB=0.08, GK=0.05
// Sources: fantasy forums Sorare, FPL, WC Fantasy consensus June 2026
const BEST_XI = {
  formation: "4-3-3",
  players: [
    { pos:"GK",  name:"Bart Verbruggen", st:{CS:10,SAVES:106}, value:"€28m",  team:"Netherlands", age:22, flag:"🇳🇱",
      xG:0.1, xA:0.1,
      note:{nl:"Verbruggen (Brighton) is de best presterende jonge keeper op het toernooi. Zijn voetwerk en reflexen zijn uitzonderlijk voor 22 jaar. Nederland heeft een haalbaar knockoutpad wat clean sheets waarschijnlijk maakt. Hoog forum-consensus voor de keepersrol. Tweede volledige seizoen als Brighton-keeper: 106 reddingen en 10 clean sheets, en gaat als Oranje's eerste keuze naar zijn eerste WK.",en:"Verbruggen (Brighton) is the best-performing young goalkeeper at the tournament. Footwork and reflexes exceptional for 22. Netherlands have an achievable knockout path making clean sheets likely. High forum consensus for the goalkeeper slot. Second full season as Brighton keeper (106 saves, 10 clean sheets), heading to his first World Cup as the Netherlands' first choice."} },
    { pos:"RB",  name:"Denzel Dumfries", st:{G:3,A:1,M:20,CS:8}, value:"€22m",  team:"Netherlands", age:28, flag:"🇳🇱",
      xG:0.6, xA:1.4,
      note:{nl:"Dumfries (Inter Milan) leverde dit seizoen 4 goals en 7 assists in de Serie A als rechtsback. Zijn overlappende runs in Nederland's 4-3-3 zijn gevaarlijker dan welke andere rechtsback op dit toernooi. Forum #1 verdediger voor assists. Productief vanaf rechts voor Inter met 3 goals, 1 assist en 8 clean sheets in 20 Serie A-duels.",en:"Dumfries (Inter Milan) delivered 4 goals and 7 Serie A assists this season as a right-back. His overlapping runs in Netherlands' 4-3-3 are more dangerous than any other right-back at this tournament. Forum #1 defender for assists. Productive from the right for Inter with 3 goals, 1 assist and 8 clean sheets in 20 Serie A games."} },
    { pos:"CB1", name:"Virgil van Dijk", st:{G:5}, value:"€15m",  team:"Netherlands", age:33, flag:"🇳🇱",
      xG:0.4, xA:0.2,
      note:{nl:"Kapitein van Oranje en de meest gezaghebbende centrale verdediger van het toernooi. Van Dijk scoort ook kopballen bij standaardsituaties: 3 goals dit seizoen voor Liverpool. Clean sheet bonus + set piece xG maakt hem de #1 verdediger qua fantasy waarde. Onverwoestbare aanvoerder van Liverpool: voltooide meer passes dan elke andere Premier League-speler en bleef op zijn 34e een bepalende verdediger.",en:"Dutch captain and the most authoritative centre-back at the tournament. Van Dijk also scores headers at set pieces: 3 goals this season for Liverpool. Clean sheet bonus + set piece xG makes him the #1 defender in fantasy value. Unbreakable Liverpool captain who completed more passes than any other Premier League player at 34."} },
    { pos:"CB2", name:"Manuel Akanji", st:{}, value:"€28m",    team:"Switzerland", age:29, flag:"🇨🇭",
      xG:0.3, xA:0.1,
      note:{nl:"Akanji (Man City) was Europa's best presterende centrale verdediger in 2025-26 en is de perfecte tweede CB vanuit een fantasy perspectief. Zwitserland heeft een comfortabel pad en is structureel goed voor clean sheets. Forum-consensus 2e CB naast Van Dijk. Stapte over van Manchester City naar Inter (huur) om Champions League te blijven spelen en groeide uit tot vaste waarde in de Italiaanse defensie.",en:"Akanji (Man City) was Europe's best-performing centre-back in 2025-26 and is the ideal second CB from a fantasy perspective. Switzerland have a comfortable path and are structurally clean-sheet reliable. Forum consensus 2nd CB alongside Van Dijk. Moved from Manchester City to Inter on loan to keep playing Champions League football and became a defensive mainstay."} },
    { pos:"LB",  name:"Theo Hernandez", st:{}, value:"€29m",  team:"France",      age:27, flag:"🇫🇷",
      xG:0.5, xA:1.2,
      note:{nl:"De meest aanvallende linksback op het toernooi. Hernandez (AC Milan) leverde 3 goals en 8 assists dit seizoen en zijn overlappende runs in Deschamps' systeem leveren regelmatig beslissende momenten op. Frank koploper in forums voor linksbacks. Verruilde de Serie A voor Al Hilal in Saudi-Arabië, waar hij zich als aanvallende linksback opnieuw bewees richting het WK.",en:"The most attacking left-back at the tournament. Hernandez (AC Milan) delivered 3 goals and 8 assists this season and his overlapping runs in Deschamps' system regularly produce decisive moments. Clear leader in forums for left-back. Swapped Serie A for Al Hilal in Saudi Arabia, reasserting himself as an attacking left-back."} },
    { pos:"CDM", name:"Rodri", st:{G:1,A:0}, value:"€130m",            team:"Spain",       age:28, flag:"🇪🇸",
      xG:0.4, xA:1.1,
      note:{nl:"Rodri (Man City) aanvoerder van Spanje na ACL-revalidatie. Als defensief anker orkestreert hij Spanje's pressing: zijn passnauwkeurigheid en balverovering zijn de hoogste van het toernooi. Scoort ook vanuit standaardsituaties. Spanje's pad is het comfortabelste van alle favorieten. Keerde bij Manchester City terug van zijn zware knieblessure (ACL) — de Ballon d'Or-winnaar van 2024 bouwde zijn minuten geleidelijk weer op.",en:"Rodri (Man City) captain of Spain after ACL rehabilitation. As defensive anchor he orchestrates Spain's press: his pass accuracy and ball recovery are the highest in the tournament. Also scores from set pieces. Spain's path is the most comfortable of all favourites. Returned at Manchester City from his serious ACL injury — the 2024 Ballon d'Or winner gradually rebuilt his minutes."} },
    { pos:"CM",  name:"Frenkie de Jong", st:{A:5,T:"La Liga"}, value:"€45m", team:"Netherlands", age:29, flag:"🇳🇱",
      xG:0.5, xA:1.5,
      note:{nl:"De Jong (Barcelona) hersteld van hamstringproblemen en terug op zijn beste niveau. Zijn box-to-box bijdrage, progressieve carries en vermogen om goals te scoren vanuit het middenveld zijn uniek. Zonder Simons is hij nog meer centraal in het Nederlandse spel. Forum top-5 middenvelder. Kwam na een blessure terug in de Barcelona-ploeg en droeg met zijn balbeheersing bij aan het kampioensseizoen.",en:"De Jong (Barcelona) recovered from hamstring issues and back at his best. His box-to-box contribution, progressive carries and ability to score from midfield are unique. Without Simons he is even more central to Dutch play. Forum top-5 midfielder. Returned from injury to the Barcelona side and helped steer the title-winning campaign."} },
    { pos:"CAM", name:"Jude Bellingham", st:{G:6,A:4,M:30}, value:"€130m", team:"England",     age:22, flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      xG:3.2, xA:2.1,
      note:{nl:"Bellingham (Real Madrid) is de meest consistente fantasykeuze in het middenveld. Zijn late loopbewegingen in de zestien leverden 12 competitiedoelpunten en 6 assists op dit seizoen. Tuchel's systeem geeft hem maximale vrijheid om te scoren. Engeland haalt minimaal de kwartfinale per model. Forum #1 middenvelder universeel. Een wisselvalliger seizoen bij Real Madrid (6 goals, 4 assists), deels door een schouderoperatie eerder in het jaar.",en:"Bellingham (Real Madrid) is the most consistent fantasy pick in midfield. His late runs into the box produced 12 league goals and 6 assists this season. Tuchel's system gives him maximum freedom to score. England reach at minimum the quarter-final per model. Universal forum #1 midfielder. A more uneven season at Real Madrid (6 goals, 4 assists), partly after shoulder surgery earlier in the year."} },
    { pos:"RW",  name:"Lamine Yamal", st:{G:16,A:11,M:35,T:"La Liga"}, value:"€200m",    team:"Spain",       age:18, flag:"🇪🇸",
      xG:2.4, xA:3.1,
      note:{nl:"Yamal (FC Barcelona) is de meest gevreesde rechtsbuiten van het toernooi. Zijn 12 La Liga-goals en 16 assists dit seizoen als 18-jarige zijn historisch. Spanje verwacht 7 wedstrijden te spelen wat zijn totale punten exponentieel verhoogt. Forum #1 verdediger in assists; #1 aanvaller qua totale waarde. Spil in Barcelona's kampioensseizoen: 16 goals en 11 assists in een jaar waarin de Catalanen hun 29e La Liga-titel pakten.",en:"Yamal (FC Barcelona) is the most feared right winger at the tournament. His 12 La Liga goals and 16 assists this season as an 18-year-old are historic. Spain expect to play 7 matches, exponentially boosting his total points. Forum #1 in assists; #1 attacker for total fantasy value. Pivotal in Barcelona's title win: 16 goals and 11 assists as they claimed their 29th La Liga crown."} },
    { pos:"ST",  name:"Erling Haaland", st:{G:27,A:8,M:35}, value:"€180m",  team:"Norway",      age:25, flag:"🇳🇴",
      xG:6.1, xA:1.2,
      note:{nl:"Haaland (Man City) is de universele #1 pick in elk WK-fantasysysteem. 16 doelpunten in de kwalificatie, 36 PL-goals dit seizoen. Noorwegen opent vs Irak, daarna Senegal en France. Zelfs bij uitschakeling in de groepsfase haalt hij 3+ goals. Als Noorwegen de R16 haalt (realistisch), loopt zijn totaal richting 7-8 doelpunten. Ondefendeerbaar in de zestien. Andermaal moordend efficiënt voor Manchester City met 27 goals en 8 assists, ook al bleef grote clubeer uit.",en:"Haaland (Man City) is the universal #1 pick in any World Cup fantasy system. 16 qualifying goals, 36 PL goals this season. Norway open vs Iraq, then Senegal and France. Even if eliminated in the group stage he collects 3+ goals. If Norway reach R16 (realistic), his total approaches 7-8. Undefendable in the box. Ruthlessly efficient again for Manchester City with 27 goals and 8 assists."} },
    { pos:"LW",  name:"Kylian Mbappe", st:{G:25,A:5,M:32,note:"La Liga top scorer"}, value:"€150m",   team:"France",      age:27, flag:"🇫🇷",
      xG:5.4, xA:2.3,
      note:{nl:"Mbappe (Real Madrid) is de #2 pick in de aanval na Haaland in vrijwel elk forum. 50+ interlands, 36 goals voor Real Madrid dit seizoen. Frankrijk's pad bevat Irak, Senegal en Noorwegen in de groep: relatief beheersbaar. Als France de finale halen (model: 42.9% kans), noteert Mbappe 7 games en richting 8+ betrokken doelpunten. Topscorer van La Liga 2025/26 met 25 goals voor Real Madrid (5 assists), maar zag Barcelona er met de titel vandoor gaan.",en:"Mbappe (Real Madrid) is the #2 pick in attack after Haaland in virtually every forum. 50+ international caps, 36 Real Madrid goals this season. France's path contains Iraq, Senegal and Norway in the group: relatively manageable. If France reach the final (model: 42.9% chance), Mbappe plays 7 games approaching 8+ goal involvements. La Liga top scorer with 25 goals for Real Madrid (5 assists), though Barcelona took the title."} },
  ],
  subs: [
    { pos:"GK",  name:"David Raya", st:{M:37,CS:19,T:"Premier League",note:"Golden Glove"}, value:"€35m",       team:"Spain",   age:29, flag:"🇪🇸",
      xG:0.0, xA:0.0,
      note:{nl:"Betrouwbare reserve. Arsenal-keeper in topvorm, sleutele clean sheets in Spanje's pad naar de finale. Won zijn derde Golden Glove op rij met 19 clean sheets en was de defensieve hoeksteen van Arsenals titel.",en:"Reliable backup. Arsenal's first-choice keeper in top form, key for clean sheets on Spain's path. Won his third straight Golden Glove with 19 clean sheets, the cornerstone of Arsenal's title."} },
    { pos:"DEF", name:"Jules Kounde", st:{G:1,A:3,T:"La Liga"}, value:"€60m",     team:"France",  age:26, flag:"🇫🇷",
      xG:0.2, xA:0.5,
      note:{nl:"Veelzijdig, kan rechts en centraal. Elite passing voor een verdediger. Speelt elk WK-duel voor Frankrijk. Vaste rechtsback in Barcelona's kampioensjaar (1 goal, 3 assists) en verlengde zijn contract tot 2030 ondanks Premier League-interesse.",en:"Versatile, plays right or central. Elite passing for a defender. Plays every France match. Regular right-back in Barcelona's title year (1 goal, 3 assists) and extended his deal to 2030."} },
    { pos:"MID", name:"Martin Odegaard", st:{G:1,A:6,M:24,T:"Premier League"}, value:"€90m",  team:"Norway",  age:27, flag:"🇳🇴",
      xG:0.8, xA:1.6,
      note:{nl:"Arsenal-aanvoerder en Premier League-kampioen 2025-26. Haaland's creatieve partner: zijn assists naar de spits zijn de beste op het toernooi. Als Noorwegen ver komt, is Odegaard een elitekeuze. Een door blessures onderbroken seizoen als Arsenal-aanvoerder (1 goal, 6 assists in 24 duels), maar wel met de eerste Premier League-titel sinds 2004 als kroon.",en:"Arsenal captain and Premier League champion 2025-26. Haaland's creative partner: his through balls to the striker are the best at the tournament. If Norway go deep, Odegaard is an elite pick. An injury-disrupted season as Arsenal captain (1 goal, 6 assists), crowned with the first league title since 2004."} },
    { pos:"FWD", name:"Mohamed Salah", st:{G:7,A:7}, value:"€30m",    team:"Egypt",   age:33, flag:"🇪🇬",
      xG:1.8, xA:0.9,
      note:{nl:"Liverpool's all-time topscorer op zijn eerste WK. Als Egypte de R16 haalt (realistisch in Groep G), levert Salah 4+ doelpunten en meerdere assists. Het risico: Egypte kan al in de groepsfase uitvallen. Hoog plafond, middelhoog risico. Op zijn 33e nog altijd bepalend voor Liverpool met 7 goals en 7 assists in de Premier League.",en:"Liverpool's all-time top scorer at his first World Cup. If Egypt reach the R16 (realistic in Group G), Salah delivers 4+ goals and multiple assists. The risk: Egypt could exit in the group stage. High ceiling, medium risk. Still decisive for Liverpool at 33 with 7 goals and 7 assists in the league."} },
  ],
};

// ── PHOTO CACHE ───────────────────────────────────────────────────────────────
// Fetches Wikipedia thumbnail at runtime in the browser (Wikipedia REST API has CORS headers)
const photoCache = {};

function usePlayerPhoto(name) {
  const [url, setUrl] = useState(photoCache[name] || null);
  useEffect(() => {
    if (photoCache[name]) { setUrl(photoCache[name]); return; }
    const title = PLAYER_WIKI[name];
    if (!title) return;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then(r => r.json())
      .then(d => {
        const src = d?.thumbnail?.source;
        if (src) { photoCache[name] = src; setUrl(src); }
      })
      .catch(() => {});
  }, [name]);
  return url;
}

// Compact season-stats bar shown at the bottom of player cards. Renders only known values.
function StatBar({st,dark}){
  const T=useTheme();
  const lang=useLang();
  if(!st) return null;
  const items=[];
  if(st.G!==undefined) items.push([lang==="nl"?"Goals":"Goals",st.G]);
  if(st.A!==undefined) items.push([lang==="nl"?"Assists":"Assists",st.A]);
  if(st.CS!==undefined) items.push([lang==="nl"?"Clean sheets":"Clean sheets",st.CS]);
  if(st.SAVES!==undefined) items.push([lang==="nl"?"Reddingen":"Saves",st.SAVES]);
  if(st.M!==undefined) items.push([lang==="nl"?"Duels":"Games",st.M]);
  if(st.T) items.push([lang==="nl"?"Prijs":"Trophy",st.T]);
  if(!items.length) return null;
  const labelCol=dark?"rgba(255,255,255,0.5)":T.textFaint;
  const valCol=dark?"#fff":T.text;
  const div=dark?"rgba(255,255,255,0.15)":T.border;
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:0,marginTop:10,
      borderTop:`1px solid ${div}`,paddingTop:8}}>
      {items.map(([lab,val],i)=>(
        <div key={lab} style={{display:"flex",flexDirection:"column",alignItems:"center",
          flex:"1 1 auto",minWidth:54,padding:"0 6px",
          borderRight:i<items.length-1?`1px solid ${div}`:"none"}}>
          <span style={{fontSize:FS.body,fontWeight:800,color:valCol,lineHeight:1.1}}>{val}</span>
          <span style={{fontSize:FS.micro,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",
            color:labelCol,marginTop:2,textAlign:"center"}}>{lab}</span>
        </div>
      ))}
    </div>
  );
}

// Featured hero card for the #1 spotlight player.
function ChampionCard({p}){
  const T=useTheme();
  const lang=useLang();
  const photo=usePlayerPhoto(p.name);
  const [imgFail,setImgFail]=useState(false);
  const showPhoto=photo&&!imgFail;
  return(
    <div style={{background:"linear-gradient(135deg,#0D1B3E 0%,#1A3A6A 65%,#0D3060 100%)",
      borderTopLeftRadius:8,borderTopRightRadius:8,padding:"14px",borderLeft:`4px solid ${T.orange}`,
      position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,right:0,width:90,height:"100%",
        background:"linear-gradient(90deg,transparent,rgba(224,112,0,0.12))",pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:10}}>
        <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
          {showPhoto?(
            <img src={photo} alt="" onError={()=>setImgFail(true)}
              style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",
                border:`2.5px solid ${T.orange}`,display:"block"}}/>
          ):(
            <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.12)",
              border:`2.5px solid ${T.orange}`,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:28}}>{p.flag}</div>
          )}
          {showPhoto&&(
            <div style={{position:"absolute",bottom:-2,right:-2,width:20,height:20,borderRadius:"50%",
              background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,boxShadow:"0 1px 3px rgba(0,0,0,.4)"}}>{p.flag}</div>
          )}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:FS.h1,fontWeight:700,color:"#fff",lineHeight:1.15}}>{p.name}</div>
          <div style={{fontSize:FS.caption,color:"rgba(255,255,255,0.65)",marginTop:2}}>
            {p.pos[lang]} · {p.age} {lang==="nl"?"jaar":"years"} · {tName(p.team,lang)}</div>
          <div style={{marginTop:5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            {p.club&&<span style={{fontSize:FS.caption,fontWeight:700,color:"#fff",
              background:"rgba(255,255,255,0.14)",padding:"2px 8px",borderRadius:10,
              border:`1px solid ${T.orange}66`}}>{p.club}</span>}
            {p.value&&<span style={{fontSize:FS.caption,fontWeight:700,color:T.orange,
              background:"rgba(224,112,0,0.16)",padding:"2px 8px",borderRadius:10}}>{p.value}</span>}
          </div>
        </div>
      </div>
      <div style={{fontSize:FS.small,color:"rgba(255,255,255,0.82)",lineHeight:1.55,
        display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{(p.bio||p.why)[lang]}</div>
      <StatBar st={p.st} dark/>
    </div>
  );
}

// Round player photo with flag badge; falls back to flag-only avatar on load error or no photo.
function PlayerAvatar({photo,flag,open,activeColor="#E07000"}){
  const T=useTheme();
  const [failed,setFailed]=useState(false);
  const ring=open?activeColor:(T.borderStrong||T.border);
  const showPhoto=photo&&!failed;
  return(
    <div style={{position:"relative",width:44,height:44,flexShrink:0}}>
      {showPhoto?(
        <img src={photo} alt="" onError={()=>setFailed(true)}
          style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",
            border:`2px solid ${ring}`,background:T.card,display:"block"}}/>
      ):(
        <div style={{width:44,height:44,borderRadius:"50%",background:"#ffffff",
          border:`2px solid ${ring}`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:22,lineHeight:1}}>{flag}</div>
      )}
      {showPhoto&&(
        <div style={{position:"absolute",bottom:-2,right:-2,width:18,height:18,borderRadius:"50%",
          background:"#fff",border:`1.5px solid ${T.card}`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:11,lineHeight:1,boxShadow:"0 1px 2px rgba(0,0,0,.25)"}}>{flag}</div>
      )}
    </div>
  );
}

// ── PLAYERS TAB COMPONENT ─────────────────────────────────────────────────────
function PlayerCard({p,open,onToggle}){
  const T=useTheme();
  const lang=useLang();
  const photo=usePlayerPhoto(p.name);
  return(
    <div style={{borderBottom:`1px solid ${T.border}`}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer",background:open?T.orangeFaint:T.card}}>
        {/* Photo avatar with flag badge (fallback to flag if photo missing/fails) */}
        <PlayerAvatar photo={photo} flag={p.flag} open={open}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:FS.body,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
          <div style={{fontSize:FS.caption,color:T.textSub,marginTop:1}}>{p.pos[lang]} · {p.age} {lang==="nl"?"jaar":"years"} · {tName(p.team,lang)}</div>
          {(p.club||p.value)&&<div style={{marginTop:3,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            {p.club&&<span style={{fontSize:FS.caption,fontWeight:700,color:T.orange,background:T.orangeFaint,padding:"1px 6px",borderRadius:10,border:`1px solid ${T.orange}22`}}>{p.club}</span>}
            {p.value&&<span style={{fontSize:FS.caption,fontWeight:700,color:T.green,background:`${T.green}14`,padding:"1px 6px",borderRadius:10,border:`1px solid ${T.green}33`}}>{p.value}</span>}
          </div>}
        </div>
        <Chevron open={open} color={T.orange}/>
      </div>
      {open&&(
        <div style={{padding:"10px 12px",background:T.orangeFaint,borderTop:`1px solid ${T.border}`,borderLeft:`3px solid ${T.orange}`,fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>
          {p.bio[lang]}
          <StatBar st={p.st}/>
        </div>
      )}
    </div>
  );
}

function DarkHorseCard({p,open,onToggle}){
  const T=useTheme();
  const lang=useLang();
  const photo=usePlayerPhoto(p.name);
  return(
    <div style={{borderBottom:`1px solid ${T.border}`}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer",background:open?T.blueFaint:T.card}}>
        <PlayerAvatar photo={photo} flag={p.flag} open={open} activeColor={T.blue}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:FS.body,fontWeight:600,color:T.text}}>{p.name}</div>
          <div style={{fontSize:FS.caption,color:T.textSub,marginTop:1}}>{p.pos[lang]} · {p.age} {lang==="nl"?"jaar":"years"}</div>
          {(p.club||p.value)&&<div style={{marginTop:3,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            {p.club&&<span style={{fontSize:FS.caption,fontWeight:700,color:T.id==="dark"?T.orange:T.blue,background:T.blueFaint,padding:"1px 6px",borderRadius:10,border:`1px solid ${T.id==="dark"?T.orange+"22":"#1A529622"}`}}>{p.club}</span>}
            {p.value&&<span style={{fontSize:FS.caption,fontWeight:700,color:T.green,background:`${T.green}14`,padding:"1px 6px",borderRadius:10,border:`1px solid ${T.green}33`}}>{p.value}</span>}
          </div>}
        </div>
        <Chevron open={open} color={T.blue}/>
      </div>
      {open&&(
        <div style={{padding:"10px 12px",background:T.blueFaint,borderTop:`1px solid ${T.border}`,borderLeft:`3px solid ${T.id==="dark"?T.orange:T.blue}`,fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>
          {p.why[lang]}
          <StatBar st={p.st}/>
        </div>
      )}
    </div>
  );
}

function PitchViz(){
  const T=useTheme();
  const rows = [
    ["GK"],
    ["RB","CB1","CB2","LB"],
    ["CDM","CM","CAM"],
    ["RW","ST","LW"],
  ];
  const byPos={};
  BEST_XI.players.forEach(p=>{byPos[p.pos]=p;});
  const rowLabels=["Keeper","Verdedigers","Middenvelders","Aanvallers"];
  const posLabel=(pos)=>pos==="CB1"||pos==="CB2"?"CB":pos;
  return(
    <div style={{background:T.card,borderRadius:8,padding:8,marginBottom:12,border:`1px solid ${T.border}`}}>
    <div style={{background:"#1a4a1a",borderRadius:5,padding:"16px 8px",position:"relative",overflow:"hidden"}}>
      {/* Pitch lines */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:"rgba(255,255,255,0.15)"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,border:"1px solid rgba(255,255,255,0.12)",margin:8,borderRadius:4}}/>
        <div style={{position:"absolute",top:"30%",bottom:"30%",left:"20%",right:"20%",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4}}/>
      </div>
      {/* Players (attacking top) */}
      {[...rows].reverse().map((row,ri)=>(
        <div key={ri} style={{display:"flex",justifyContent:"center",gap:6,marginBottom:ri<rows.length-1?10:0}}>
          {row.map(pos=>{
            const p=byPos[pos];
            if(!p) return null;
            return(
              <div key={pos} style={{display:"flex",flexDirection:"column",alignItems:"center",width:62}}>
                <div style={{
                  width:36,height:36,borderRadius:"50%",
                  background:"#E07000",
                  border:"2px solid rgba(255,255,255,0.7)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:FS.caption,fontWeight:700,color:"#fff",
                  boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
                  marginBottom:3,
                }}>
                  <span>{posLabel(pos)}</span>
                </div>
                <div style={{fontSize:FS.caption,color:"#fff",textAlign:"center",fontWeight:600,lineHeight:1.2,textShadow:"0 1px 3px rgba(0,0,0,0.8)"}}>{p.name.split(" ").slice(-1)[0]}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.6)",textAlign:"center"}}>{p.flag}</div>
              </div>
            );
          })}
        </div>
      ))}
      {/* Bench */}
      <div style={{marginTop:14,paddingTop:10,borderTop:"1px dashed rgba(255,255,255,0.2)"}}>
        <div style={{fontSize:FS.micro,color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Bank</div>
        <div style={{display:"flex",justifyContent:"center",gap:8}}>
          {BEST_XI.subs.map(p=>(
            <div key={p.name} style={{display:"flex",flexDirection:"column",alignItems:"center",width:56}}>
              <div style={{
                width:30,height:30,borderRadius:"50%",
                background:"rgba(255,255,255,0.15)",
                border:"1px solid rgba(255,255,255,0.35)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:FS.micro,fontWeight:700,color:"rgba(255,255,255,0.8)",
                marginBottom:3,
              }}>{p.pos}</div>
              <div style={{fontSize:FS.micro,color:"rgba(255,255,255,0.7)",textAlign:"center",fontWeight:600,lineHeight:1.2}}>{p.name.split(" ").slice(-1)[0]}</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.4)",textAlign:"center"}}>{p.flag}</div>
            </div>
          ))}
        </div>
      </div>
    </div></div>
  );
}

// ── MODEL VISUALISATION COMPONENT ────────────────────────────────────────────
function ModelViz(){
  const T=useTheme();
  const lang=useLang();
  const [openFactor,setOpenFactor]=useState(null);
  const [openRank,setOpenRank]=useState(null);
  const [exTeam,setExTeam]=useState("Argentina");
  // Theme-compliant palette only: orange (primary), blue (secondary),
  // green/red reserved strictly for semantic up/down vs FIFA, greys for everything else.
  const orange=T.orange;
  const blue=T.id==="dark"?T.text:T.blue;
  const green=T.green;
  const red=T.red;

  const Icon=({d,size=13,color="currentColor",style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0,...style}}>
      <path d={d}/>
    </svg>
  );
  const IC={
    clock:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    users:  "M19 20a7 7 0 00-14 0M12 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
    trend:  "M3 3v18h18M7 16l4-4 4 4 4-4",
    trophy: "M8 21h8M12 17v4M5 3h14l-1 7a6 6 0 01-12 0L5 3zM3 7h18",
    coach:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    dice:   "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    bars:   "M18 20V10M12 20V4M6 20v-6",
    arrow:  "M5 12h14M12 5l7 7-7 7",
    info:   "M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    sigma:  "M18 4H6l6 8-6 8h12",
    scale:  "M12 3v18M5 8l-3 6a3 3 0 006 0L5 8zM19 8l-3 6a3 3 0 006 0l-3-6zM7 8h10",
    flame:  "M12 2c1 4-2 5-2 8a4 4 0 008 0c0-2-1-3-1-5 2 1 4 4 4 7a7 7 0 01-14 0c0-4 3-6 5-10z",
  };

  const SL=(text,icon)=>(
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,
      paddingBottom:5,borderBottom:`2px solid ${T.border}`}}>
      {icon&&<Icon d={IC[icon]} size={12} color={T.textSub}/>}
      <span style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,
        textTransform:"uppercase",color:T.textSub}}>{text}</span>
    </div>
  );

  // Factors — all share the secondary (blue) accent. The % is the differentiator, not colour.
  const FACTORS=[
    {key:"star",pct:70,
     label:lang==="nl"?"Elo-rating":"Elo rating",
     formula:lang==="nl"?"(Elo − 1400) / 800 × 100":"(Elo − 1400) / 800 × 100",
     intro:lang==="nl"?"De betrouwbaarste maatstaf voor teamsterkte.":"The most reliable measure of team strength.",
     detail:lang==="nl"
       ?"Puntensysteem dat na elke interland bijwerkt: winst tegen een sterke ploeg telt het zwaarst. Officiële waarden van eloratings.net."
       :"A points system updated after every match: beating a strong side counts most. Official values from eloratings.net."},
    {key:"users",pct:10,
     label:lang==="nl"?"Selectiekwaliteit":"Squad quality",
     formula:lang==="nl"?"log(marktwaarde selectie), geschaald 0–100":"log(squad market value), scaled 0–100",
     intro:lang==="nl"?"Individueel talent, los van resultaten.":"Individual talent, independent of results.",
     detail:lang==="nl"
       ?"Totale Transfermarkt-waarde van de selectie, logaritmisch geschaald. Vangt clubniveau dat Elo niet ziet — Ghana scoort hier hoger dan Panama dankzij spelers als Kudus en Partey."
       :"Total Transfermarkt squad value, log-scaled. Captures club level Elo misses — Ghana scores higher than Panama thanks to players like Kudus and Partey."},
    {key:"trophy",pct:5,
     label:lang==="nl"?"Toernooi-ervaring":"Tournament experience",
     formula:lang==="nl"?"Σ(toernooizwaarte × rondediepte × recentheid), 10 jaar":"Σ(tournament weight × round depth × recency), 10 yrs",
     intro:lang==="nl"?"Diepe toernooiruns wijzen op bestendigheid onder druk.":"Deep tournament runs signal composure under pressure.",
     detail:lang==="nl"
       ?"Berekend uit alle grote toernooien van de laatste 10 jaar (WK, EK, Copa América, Afrika Cup, Azië Cup, Gold Cup). Hoe verder een land kwam en hoe recenter, hoe zwaarder het telt — afgeleid uit het aantal gespeelde wedstrijden per editie. Argentinië scoort maximaal (WK-titel 2022 + twee Copa-finales)."
       :"Computed from every major tournament of the last 10 years (WC, Euro, Copa América, Africa Cup, Asian Cup, Gold Cup). Going further and more recently counts more — derived from matches played per edition. Argentina scores maximum (2022 WC title + two Copa finals)."},
    {key:"coach",pct:5,
     label:lang==="nl"?"Coachkwaliteit":"Coaching quality",
     formula:lang==="nl"?"65% recent interland-trackrecord + 35% gewogen prijzen":"65% recent international record + 35% weighted honours",
     intro:lang==="nl"?"Een bewezen coach scherpt keuzes onder druk.":"A proven coach sharpens decisions under pressure.",
     detail:lang==="nl"
       ?"Volledig data-gedreven: voor 65% het puntengemiddelde van de coach met dit land sinds zijn aanstelling (recente wedstrijden zwaarder, halveringstijd 18 maanden, uit results.csv), voor 35% een gewogen prijzenbonus per categorie (WK 40, Champions League 18, continentale landentitel 16, top-5 titel 12, enz. — incl. clubcarrière, geverifieerd per coach). Scaloni en Ancelotti scoren het hoogst."
       :"Fully data-driven: 65% the coach's points-per-game with this country since appointment (recent matches weighted more, 18-month half-life, from results.csv), 35% a weighted honours bonus by category (WC 40, Champions League 18, continental national title 16, top-5 league 12, etc. — incl. club career, verified per coach). Scaloni and Ancelotti score highest."},
    {key:"trend",pct:10,
     label:lang==="nl"?"Recente vorm":"Recent form",
     formula:lang==="nl"?"½ punten laatste 12 + ½ punten WK-kwalificatie":"½ points last 12 + ½ points WC qualifying",
     intro:lang==="nl"?"Hoeveel punten pakt een land recent?":"How many points is a country taking lately?",
     detail:lang==="nl"
       ?"Voor de helft de behaalde punten uit de laatste 12 interlands, voor de helft uit de WK-kwalificatie (3 per winst, 1 per gelijkspel). Gastlanden VS, Mexico en Canada spelen geen kwalificatie en krijgen daarom een positieve vormcompensatie. Marokko, Noorwegen en Engeland kwalificeerden zich foutloos."
       :"Half from points won in the last 12 internationals, half from World Cup qualifying (3 per win, 1 per draw). Hosts USA, Mexico and Canada play no qualifiers and receive a positive form compensation. Morocco, Norway and England qualified with a perfect record."},
  ];

  // Monte-Carlo title odds: 50,000 simulated tournaments on the composite scores.
  const TITLE_PCT={"Spain":42.9,"Argentina":29.8,"France":14.4,"England":9.5,"Brazil":1.2,"Portugal":1.2,"Germany":0.3,"Netherlands":0.3};
  const FLAG_BY_TEAM={"Argentina":"AR","Spain":"ES","France":"FR","Brazil":"BR","England":"GB-ENG","Portugal":"PT","Colombia":"CO","Netherlands":"NL"};
  const TOP8=MODEL_ORDER.slice(0,8).map(team=>({
    t:team,
    f:FLAGS[team]||"",
    pct:TITLE_PCT[team]??0,
    sc:COMPOSITE[team],
    mo:COMPOSITE_RANK[team],
    fi:FIFA_RANKINGS[team]||40,
  }));
  const NLN={"Spain":"Spanje","England":"Engeland","France":"Frankrijk","Morocco":"Marokko",
    "Argentina":"Argentinie","Germany":"Duitsland","Norway":"Noorwegen","Netherlands":"Nederland",
    "Brazil":"Brazilie","Portugal":"Portugal","Colombia":"Colombia"};
  const tn=t=>lang==="nl"?(NLN[t]||t):t;
  const FLAG_BY_CODE={"ES":"🇪🇸","MA":"🇲🇦","GB-ENG":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","FR":"🇫🇷","DE":"🇩🇪","AR":"🇦🇷","NL":"🇳🇱","NO":"🇳🇴","BR":"🇧🇷","PT":"🇵🇹","CO":"🇨🇴","TR":"🇹🇷","MX":"🇲🇽"};

  return(
    <React.Fragment>

      {/* OVERVIEW — how the model works, one line each */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,
        borderLeft:`3px solid ${orange}`,borderRadius:6,padding:"12px 13px",marginBottom:16}}>
        <div style={{fontSize:FS.body,fontWeight:700,color:T.text,marginBottom:8}}>
          {lang==="nl"?"Zo werkt het model":"How the model works"}
        </div>
        {[
          {n:"1",c:blue,t:lang==="nl"?"Sterktescore":"Strength score",
           d:lang==="nl"?"één score uit vijf factoren bepaalt wie wint en de marge":"one score from five factors decides the winner and margin"},
          {n:"2",c:orange,t:lang==="nl"?"Uitslag":"Scoreline",
           d:lang==="nl"?"xG en xGc vullen de hoogte van de uitslag in":"xG and xGc fill in the height of the scoreline"},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:i>0?10:0}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:s.c,color:T.id==="dark"?"#000":"#fff",
              fontSize:FS.small,fontWeight:800,flexShrink:0,display:"flex",alignItems:"center",
              justifyContent:"center",marginTop:1}}>{s.n}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:FS.small,fontWeight:700,color:T.text,lineHeight:1.3}}>{s.t}</div>
              <div style={{fontSize:FS.caption,color:T.textSub,lineHeight:1.4,marginTop:1}}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* STEP 1 — FACTORS (collapsed: label + weight; tap to expand) */}
      {SL(lang==="nl"?"Stap 1 · De vijf bouwstenen":"Step 1 · The five building blocks","layers")}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
        overflow:"hidden",marginBottom:16}}>
        {[...FACTORS].sort((a,b)=>b.pct-a.pct).map((f,i)=>(
          <div key={i} onClick={()=>setOpenFactor(openFactor===i?null:i)}
            style={{borderTop:i>0?`1px solid ${T.border}`:"none",cursor:"pointer",
              background:openFactor===i?T.orangeFaint:T.card}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
              <Icon d={IC[f.key]} size={15} color={T.textSub}/>
              <span style={{flex:1,fontSize:FS.small,fontWeight:600,color:T.text}}>{f.label}</span>
              <div style={{width:42,height:5,background:T.bg,borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${f.pct/70*100}%`,height:"100%",background:orange,borderRadius:3}}/>
              </div>
              <span style={{fontSize:FS.small,fontWeight:800,color:orange,minWidth:26,textAlign:"right"}}>{f.pct}%</span>
              <Chevron open={openFactor===i} color={T.textSub}/>
            </div>
            {openFactor===i&&(
              <div style={{padding:"0 12px 11px 37px"}}>
                <div style={{fontSize:FS.caption,fontFamily:"ui-monospace,Menlo,monospace",
                  color:T.id==="dark"?T.orange:T.blue,background:T.bg,
                  border:`1px solid ${T.border}`,borderRadius:4,
                  padding:"5px 8px",marginBottom:8,lineHeight:1.5}}>{f.formula}</div>
                <div style={{fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>{f.detail}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* STEP 2 — CALCULATION BRIDGE */}
      {SL(lang==="nl"?"Stap 2 · Naar één score":"Step 2 · Into one score","sigma")}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
        padding:"12px",marginBottom:16}}>
        <div style={{fontSize:FS.small,color:T.textSub,lineHeight:1.6,marginBottom:11}}>
          {lang==="nl"?"Elke factor telt mee voor zijn gewicht. Kies een land om de berekening te zien:"
            :"Each factor counts for its weight. Pick a country to see the calculation:"}
        </div>
        {/* team selector */}
        <div style={{position:"relative",marginBottom:10}}>
          <select value={exTeam} onChange={e=>setExTeam(e.target.value)}
            style={{width:"100%",appearance:"none",WebkitAppearance:"none",
              background:T.bg,border:`1px solid ${T.border}`,borderRadius:5,
              padding:"8px 30px 8px 10px",fontSize:FS.small,fontWeight:700,color:T.text,
              cursor:"pointer",fontFamily:"inherit"}}>
            {MODEL_ORDER.map(t=>(
              <option key={t} value={t}>{tName(t,lang)} · #{COMPOSITE_RANK[t]}</option>
            ))}
          </select>
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            pointerEvents:"none",color:T.textSub,fontSize:FS.caption}}>▾</span>
        </div>
        {/* calculation table */}
        {(()=>{
          const fd=MODEL_DATA[exTeam];
          if(!fd) return null;
          const rows=[
            {lab:"Elo",val:Math.round(fd.eloN),w:70,contrib:fd.eloN*WEIGHTS.elo},
            {lab:lang==="nl"?"Selectie":"Squad",val:Math.round(fd.svN),w:10,contrib:fd.svN*WEIGHTS.squadQuality},
            {lab:lang==="nl"?"Vorm":"Form",val:Math.round(fd.formN||0),w:10,contrib:(fd.formN||0)*WEIGHTS.recentForm},
            {lab:lang==="nl"?"Ervaring":"Experience",val:Math.round(fd.exp),w:5,contrib:fd.exp*WEIGHTS.experience},
            {lab:"Coach",val:Math.round(fd.coach),w:5,contrib:fd.coach*WEIGHTS.coach},
          ];
          const total=COMPOSITE[exTeam];
          return(
            <div style={{border:`1px solid ${T.border}`,borderRadius:5,overflow:"hidden"}}>
              {/* column legend */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 28px 10px 34px 10px 40px",alignItems:"center",gap:4,padding:"7px 10px",
                background:T.bg,borderBottom:`1px solid ${T.border}`,
                fontSize:FS.micro,fontWeight:700,letterSpacing:0,textTransform:"uppercase",
                color:T.textFaint}}>
                <span>{lang==="nl"?"factor":"factor"}</span>
                <span style={{textAlign:"right"}}>{lang==="nl"?"score":"score"}</span>
                <span/>
                <span style={{textAlign:"right"}}>{lang==="nl"?"gew.":"wt."}</span>
                <span/>
                <span style={{textAlign:"right"}}>{lang==="nl"?"bijdr.":"share"}</span>
              </div>
              {rows.map((r,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 28px 10px 34px 10px 40px",alignItems:"center",gap:4,
                  padding:"7px 10px",borderTop:i>0?`1px solid ${T.border}`:"none",fontSize:FS.small}}>
                  <span style={{fontWeight:600,color:T.text}}>{r.lab}</span>
                  <span style={{color:T.textSub,textAlign:"right"}}>{r.val}</span>
                  <span style={{color:T.textFaint,textAlign:"center"}}>×</span>
                  <span style={{color:T.textSub,textAlign:"right"}}>{r.w}%</span>
                  <span style={{color:T.textFaint,textAlign:"center"}}>=</span>
                  <span style={{fontWeight:700,color:blue,textAlign:"right"}}>{r.contrib.toFixed(1)}</span>
                </div>
              ))}
              {/* total */}
              <div style={{display:"flex",alignItems:"center",padding:"8px 10px",
                borderTop:`2px solid ${T.border}`,background:T.bg}}>
                <span style={{flex:1,fontSize:FS.small,fontWeight:700,color:T.text}}>
                  {lang==="nl"?"Sterktescore":"Strength score"} {tName(exTeam,lang)}
                </span>
                <span style={{fontSize:FS.display,fontWeight:800,color:orange}}>{total.toFixed(1).replace(".",lang==="nl"?",":".")}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* STEP 3 — RANKING (each row expands to show its calculation) */}
      {SL(lang==="nl"?"Stap 3 · De ranglijst":"Step 3 · The ranking","bars")}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
        padding:"12px",marginBottom:16}}>
        <div style={{fontSize:FS.caption,color:T.textFaint,lineHeight:1.5,marginBottom:10}}>
          {lang==="nl"?"Tik een land voor de berekening van zijn score."
            :"Tap a country to see how its score is calculated."}
        </div>
        {TOP8.map((t,i)=>{
          const maxSc=84;
          const fd=MODEL_DATA[t.t];
          const isOpen=openRank===i;
          const rows=fd?[
            {lab:"Elo",val:Math.round(fd.eloN),w:70,contrib:fd.eloN*WEIGHTS.elo},
            {lab:lang==="nl"?"Selectie":"Squad",val:Math.round(fd.svN),w:10,contrib:fd.svN*WEIGHTS.squadQuality},
            {lab:lang==="nl"?"Vorm":"Form",val:Math.round(fd.formN||0),w:10,contrib:(fd.formN||0)*WEIGHTS.recentForm},
            {lab:lang==="nl"?"Ervaring":"Experience",val:Math.round(fd.exp),w:5,contrib:fd.exp*WEIGHTS.experience},
            {lab:"Coach",val:Math.round(fd.coach),w:5,contrib:fd.coach*WEIGHTS.coach},
          ]:[];
          return(
            <div key={t.t} style={{marginBottom:i<7?8:0}}>
              <div onClick={()=>setOpenRank(isOpen?null:i)}
                style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                  padding:"3px 4px",borderRadius:4,background:isOpen?T.orangeFaint:"transparent"}}>
                <span style={{fontSize:FS.small,fontWeight:700,color:T.textSub,width:18,flexShrink:0,textAlign:"right"}}>{t.mo}</span>
                <span style={{fontSize:14,lineHeight:1,flexShrink:0}}>{t.f}</span>
                <span style={{fontSize:FS.small,fontWeight:600,color:T.text,width:66,flexShrink:0,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tn(t.t)}</span>
                <div style={{flex:1,height:8,background:T.bg,borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${t.sc/maxSc*100}%`,height:"100%",borderRadius:4,
                    background:i===0?orange:blue}}/>
                </div>
                <span style={{fontSize:FS.small,fontWeight:700,color:T.text,flexShrink:0,minWidth:28,textAlign:"right"}}>{t.sc}</span>
                <Chevron open={isOpen} color={T.textFaint}/>
              </div>
              {isOpen&&fd&&(
                <div style={{padding:"8px 4px 4px 44px"}}>
                  {rows.map((r,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",gap:6,
                      padding:"4px 0",borderTop:j>0?`1px solid ${T.border}`:"none",fontSize:FS.caption}}>
                      <span style={{flex:1,fontWeight:600,color:T.text}}>{r.lab}</span>
                      <span style={{color:T.textSub,minWidth:24,textAlign:"right"}}>{r.val}</span>
                      <span style={{color:T.textFaint,width:7,textAlign:"center"}}>×</span>
                      <span style={{color:T.textSub,minWidth:24,textAlign:"right"}}>{r.w}%</span>
                      <span style={{color:T.textFaint,width:7,textAlign:"center"}}>=</span>
                      <span style={{fontWeight:700,color:blue,minWidth:30,textAlign:"right"}}>{r.contrib.toFixed(1)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",alignItems:"center",marginTop:5,paddingTop:6,
                    borderTop:`2px solid ${T.border}`}}>
                    <span style={{flex:1,fontSize:FS.small,fontWeight:700,color:T.text}}>{lang==="nl"?"Sterktescore":"Strength score"}</span>
                    <span style={{fontSize:FS.body,fontWeight:800,color:orange}}>{t.sc.toLocaleString(lang==="nl"?"nl-NL":"en-US",{minimumFractionDigits:1,maximumFractionDigits:1})}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 4 — MATCH RESULT (model 2) */}
      {SL(lang==="nl"?"Stap 4 · De uitslag":"Step 4 · The result","arrow")}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
        padding:"12px",marginBottom:16}}>
        <div style={{fontSize:FS.small,color:T.textSub,lineHeight:1.6,marginBottom:11}}>
          {lang==="nl"
            ?"De sterktescore bepaalt wie wint én met welke marge; xG en xGc vullen de hoogte van de uitslag in."
            :"The strength score decides who wins and by what margin; xG and xGc fill in the height of the scoreline."}
        </div>
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:5,
          padding:"9px 11px",marginBottom:11,fontSize:FS.small,color:T.text,lineHeight:1.9}}>
          <div><span style={{color:blue,fontWeight:700}}>{lang==="nl"?"verschil":"gap"} &lt; 20</span> → {lang==="nl"?"gelijkspel":"draw"}</div>
          <div><span style={{color:blue,fontWeight:700}}>20–35</span> → {lang==="nl"?"wint met 1":"win by 1"}</div>
          <div><span style={{color:blue,fontWeight:700}}>35–50</span> → {lang==="nl"?"wint met 2":"win by 2"}</div>
          <div><span style={{color:blue,fontWeight:700}}>&gt; 50</span> → {lang==="nl"?"wint met 3":"win by 3"}</div>
        </div>
        <div style={{fontSize:FS.small,color:T.textSub,lineHeight:1.6}}>
          {lang==="nl"
            ?"De marge volgt uit het verschil in sterktescore. De xG/xGc bepalen het exacte aantal doelpunten binnen die marge: een aanvallend duel wordt 3-1, een defensief duel 1-0."
            :"The margin follows from the strength-score gap. xG/xGc set the exact number of goals within that margin: an attacking match becomes 3-1, a defensive one 1-0."}
        </div>
      </div>

      {/* STEP 5 — TITLE ODDS */}
      {SL(lang==="nl"?"Stap 5 · De titelkansen":"Step 5 · The title odds","dice")}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
        padding:"12px",marginBottom:16}}>
        <div style={{fontSize:FS.small,color:T.textSub,lineHeight:1.6,marginBottom:11}}>
          {lang==="nl"
            ?"Het toernooi is 50.000 keer gesimuleerd. Elke wedstrijd beslist op het sterkteverschil; het percentage is hoe vaak elk land kampioen werd."
            :"The tournament was simulated 50,000 times. Each match is decided on the strength gap; the percentage is how often each country won the title."}
        </div>
        {[...TOP8].sort((a,b)=>b.pct-a.pct).map((r,i,arr)=>{
          const max=46;
          return(
            <div key={r.t} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<arr.length-1?9:0}}>
              <span style={{fontSize:FS.small,fontWeight:800,color:T.textFaint,width:14,flexShrink:0,textAlign:"right"}}>{i+1}</span>
              <span style={{fontSize:13,lineHeight:1,flexShrink:0}}>{r.f}</span>
              <span style={{fontSize:FS.small,fontWeight:600,color:T.text,width:66,flexShrink:0,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tn(r.t)}</span>
              <div style={{flex:1,height:12,background:T.bg,borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${r.pct/max*100}%`,height:"100%",borderRadius:4,background:i===0?orange:blue}}/>
              </div>
              <span style={{fontSize:FS.small,fontWeight:800,color:T.text,flexShrink:0,minWidth:36,textAlign:"right"}}>{r.pct}%</span>
            </div>
          );
        })}
        <div style={{marginTop:11,paddingTop:8,borderTop:`1px solid ${T.border}`,
          fontSize:FS.caption,color:T.textFaint,lineHeight:1.5}}>
          {lang==="nl"?"De resterende kans verdeelt zich over de overige 40 landen, die elk minder dan 0,5% scoorden."
            :"The remaining probability is split across the other 40 nations, each scoring under 0.5%."}
        </div>
      </div>

    </React.Fragment>
  );
}

// ── NATIONS TAB ───────────────────────────────────────────────────────────────
function NationCard({n,open,onToggle}){
  const T=useTheme();
  const lang=useLang();
  const adj=n.formRating;
  return(
    <div style={{background:T.card,border:`1px solid ${open?T.orange:T.border}`,borderRadius:4,overflow:"hidden",marginBottom:8}}>
      {/* Header */}
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 12px",cursor:"pointer",background:open?T.orangeFaint:T.card}}>
        <span style={{fontSize:20,lineHeight:1,flexShrink:0}}>{n.flag}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:FS.body,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="nl"?TEAM_NL[n.team]||n.team:n.team}</div>
          <div style={{fontSize:FS.caption,color:T.textSub,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="nl"?"Groep":"Group"} {n.group} · <span style={{color:T.textFaint}}>{n.coach}</span></div>
        </div>
        {MODEL_RANK[n.team]&&(()=>{
          const dev=formDev(n.team);
          const fc=dev>0?(T.id==="dark"?"#3DBE6E":"#1E7A40"):dev<0?(T.id==="dark"?"#FF5544":"#C0392B"):T.textSub;
          const badges=[
            dev!==undefined&&{lab:lang==="nl"?"VORM":"FORM",val:`${dev>0?"+":""}${dev}`,col:fc},
            SQUAD_VAL[n.team]&&{lab:lang==="nl"?"WAARDE":"VALUE",val:SQUAD_VAL[n.team].s,col:T.id==="dark"?"#3DBE6E":"#1E7A40"},
            {lab:"MODEL",val:`#${MODEL_RANK[n.team]}`,col:T.id==="dark"?T.orange:T.blue},
          ].filter(Boolean);
          return(
            <div style={{display:"flex",alignItems:"stretch",gap:3,flexShrink:0}}>
              {badges.map((b,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",
                  justifyContent:"center",gap:1,
                  background:T.id==="dark"?"#161616":T.bg,
                  border:`1px solid ${T.border}`,
                  borderRadius:4,padding:"3px 0",width:40}}>
                  <span style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.4,
                    color:T.textFaint,textTransform:"uppercase",lineHeight:1}}>{b.lab}</span>
                  <span style={{fontSize:FS.caption,fontWeight:800,color:b.col,lineHeight:1}}>{b.val}</span>
                </div>
              ))}
            </div>
          );
        })()}
        <Chevron open={open} color={T.textSub}/>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${T.border}`}}>
          {/* Form */}
          <div style={{padding:"10px 13px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textFaint,marginBottom:4}}>{lang==="nl"?"Huidige Vorm":"Current Form"}</div>
            <div style={{fontSize:FS.small,color:T.text,lineHeight:1.6}}>{n.form[lang]}</div>
          </div>
          {/* News */}
          <div style={{padding:"10px 13px",borderBottom:`1px solid ${T.border}`,background:T.orangeFaint,borderLeft:`3px solid ${T.orange}`}}>
            <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:T.orange,marginBottom:6}}>{lang==="nl"?"Laatste Nieuws":"Latest News"}</div>
            <div style={{fontSize:FS.small,color:T.text,lineHeight:1.6}}>{n.news[lang]}</div>
          </div>
          {/* Key players */}
          <div style={{padding:"8px 13px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textFaint,marginBottom:6}}>{lang==="nl"?"Sleutelspelers":"Key Players"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {n.stars.map(s=>(<span key={s} style={{fontSize:FS.caption,fontWeight:600,color:T.text,background:T.bg,border:`1px solid ${T.border}`,borderRadius:3,padding:"2px 7px"}}>{s}</span>))}
            </div>
          </div>
          {/* Outlook */}
          <div style={{padding:"10px 13px"}}>
            <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textFaint,marginBottom:4}}>{lang==="nl"?"Vooruitzichten":"Outlook"}</div>
            <div style={{fontSize:FS.small,color:T.text,lineHeight:1.6}}>{n.outlook[lang]}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function NationsTab({preOpen=null}){
  const T=useTheme();
  const lang=useLang();
  const [open,setOpen]=useState(preOpen);
  const cardRefs=React.useRef({});
  const toggle=name=>{
    setOpen(p=>{
      const next=p===name?null:name;
      if(next){
        // Scroll to card after state update + render
        setTimeout(()=>{
          const el=cardRefs.current[name];
          if(el) el.scrollIntoView({behavior:"smooth",block:"start"});
        },80);
      }
      return next;
    });
  };
  // On mount with preOpen: scroll to that card
  React.useEffect(()=>{
    if(preOpen){
      setTimeout(()=>{
        const el=cardRefs.current[preOpen];
        if(el) el.scrollIntoView({behavior:"smooth",block:"start"});
      },120);
    }
  },[]);
  return(
    <div>
      <div style={{fontSize:FS.h2,fontWeight:700,color:T.text,marginBottom:14}}>
        {lang==="nl"?"Landenprofielen":"Nation Profiles"}
      </div>
      {[...NATIONS_DATA].sort((a,b)=>adjRank(a.team)-adjRank(b.team)).map(n=>(
        <div key={n.team} ref={el=>cardRefs.current[n.team]=el}>
          <NationCard n={n} open={open===n.team} onToggle={()=>toggle(n.team)}/>
        </div>
      ))}
    </div>
  );
}

// ── PLAYERS TAB ───────────────────────────────────────────────────────────────
// ── FBREF 2025-26 Big 5 Player Stats (Goals+Assists per 90) ──────────────────
// Source: FBref.com Big 5 European Leagues Standard Stats 2025-26
// Metric: G+A per 90 minutes (min 4×90min played). WC-qualified nations only.
// Note: uses actual goals/assists per90, not xG/xA (standard stats table).
const FBREF_WC=[
{"r":1,"name":"Harry Kane","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"Bayern Munich","g90":1.36,"a90":0.19,"ga90":1.55,"goals":36,"assists":5,"mins90":26.4},
{"r":2,"name":"Ousmane Dembélé","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Paris Saint-Germain","g90":0.85,"a90":0.59,"ga90":1.44,"goals":10,"assists":7,"mins90":11.8},
{"r":3,"name":"Robinio Vaz","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Marseille","g90":0.95,"a90":0.47,"ga90":1.42,"goals":4,"assists":2,"mins90":4.2},
{"r":4,"name":"Michael Olise","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Bayern Munich","g90":0.58,"a90":0.74,"ga90":1.32,"goals":15,"assists":19,"mins90":25.7},
{"r":5,"name":"Allan Saint-Maximin","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Lens","g90":0.66,"a90":0.66,"ga90":1.32,"goals":3,"assists":3,"mins90":4.6},
{"r":6,"name":"Hamza Igamane","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"FW","squad":"Lille","g90":1.04,"a90":0.21,"ga90":1.25,"goals":5,"assists":1,"mins90":4.8},
{"r":7,"name":"Emanuel Emegha","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"FW","squad":"Strasbourg","g90":0.81,"a90":0.41,"ga90":1.22,"goals":4,"assists":2,"mins90":4.9},
{"r":8,"name":"Luca Waldschmidt","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Köln","g90":0.66,"a90":0.53,"ga90":1.2,"goals":5,"assists":4,"mins90":7.5},
{"r":9,"name":"Cristhian Stuani","nat":"URU","flag":"🇺🇾","country":"Uruguay","pos":"FW","squad":"Girona","g90":1.09,"a90":0.0,"ga90":1.09,"goals":5,"assists":0,"mins90":4.6},
{"r":10,"name":"Luis Díaz","nat":"COL","flag":"🇨🇴","country":"Colombia","pos":"MF","squad":"Bayern Munich","g90":0.55,"a90":0.51,"ga90":1.07,"goals":15,"assists":14,"mins90":27.2},
{"r":11,"name":"Erling Haaland","nat":"NOR","flag":"🇳🇴","country":"Norway","pos":"FW","squad":"Manchester City","g90":0.82,"a90":0.24,"ga90":1.07,"goals":27,"assists":8,"mins90":32.8},
{"r":12,"name":"Lamine Yamal","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Barcelona","g90":0.64,"a90":0.44,"ga90":1.07,"goals":16,"assists":11,"mins90":25.1},
{"r":13,"name":"Deniz Undav","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Stuttgart","g90":0.76,"a90":0.28,"ga90":1.04,"goals":19,"assists":7,"mins90":24.9},
{"r":14,"name":"Raphinha","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Barcelona","g90":0.85,"a90":0.2,"ga90":1.04,"goals":13,"assists":3,"mins90":15.3},
{"r":15,"name":"Kylian Mbappé","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Real Madrid","g90":0.87,"a90":0.17,"ga90":1.04,"goals":25,"assists":5,"mins90":28.9},
{"r":16,"name":"Serge Gnabry","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Bayern Munich","g90":0.59,"a90":0.44,"ga90":1.03,"goals":8,"assists":6,"mins90":13.5},
{"r":17,"name":"Donyell Malen","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"FW","squad":"Roma","g90":0.86,"a90":0.12,"ga90":0.98,"goals":14,"assists":2,"mins90":16.3},
{"r":18,"name":"Lautaro Martínez","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"FW","squad":"Inter","g90":0.71,"a90":0.25,"ga90":0.96,"goals":17,"assists":6,"mins90":24.0},
{"r":19,"name":"Jonathan Burkardt","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Eintracht Frankfurt","g90":0.88,"a90":0.07,"ga90":0.94,"goals":13,"assists":1,"mins90":14.8},
{"r":20,"name":"Can Uzun","nat":"TUR","flag":"🇹🇷","country":"Turkey","pos":"MF","squad":"Eintracht Frankfurt","g90":0.62,"a90":0.31,"ga90":0.93,"goals":8,"assists":4,"mins90":12.8},
{"r":21,"name":"Jamal Musiala","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Bayern Munich","g90":0.4,"a90":0.53,"ga90":0.92,"goals":3,"assists":4,"mins90":7.6},
{"r":22,"name":"Ansu Fati","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Monaco","g90":0.91,"a90":0.0,"ga90":0.91,"goals":11,"assists":0,"mins90":12.1},
{"r":23,"name":"Marcus Thuram","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Inter","g90":0.62,"a90":0.28,"ga90":0.9,"goals":13,"assists":6,"mins90":21.1},
{"r":24,"name":"Ermedin Demirović","nat":"BIH","flag":"🇧🇦","country":"Bosnia-Herzegovina","pos":"FW","squad":"Stuttgart","g90":0.72,"a90":0.18,"ga90":0.9,"goals":12,"assists":3,"mins90":16.6},
{"r":25,"name":"Esteban Lepaul","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Rennes","g90":0.72,"a90":0.18,"ga90":0.9,"goals":20,"assists":5,"mins90":27.9},
{"r":26,"name":"Endrick","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Lyon","g90":0.37,"a90":0.52,"ga90":0.89,"goals":5,"assists":7,"mins90":13.5},
{"r":27,"name":"Bruno Fernandes","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Manchester Utd","g90":0.26,"a90":0.62,"ga90":0.88,"goals":9,"assists":21,"mins90":34.0},
{"r":28,"name":"Fábio Silva","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"FW","squad":"Dortmund","g90":0.22,"a90":0.66,"ga90":0.88,"goals":2,"assists":6,"mins90":9.1},
{"r":29,"name":"Patrik Schick","nat":"CZE","flag":"🇨🇿","country":"Czechia","pos":"FW","squad":"Leverkusen","g90":0.72,"a90":0.14,"ga90":0.86,"goals":16,"assists":3,"mins90":22.1},
{"r":30,"name":"Mason Greenwood","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Marseille","g90":0.58,"a90":0.26,"ga90":0.84,"goals":16,"assists":7,"mins90":27.4},
{"r":31,"name":"Kader Meïté","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Rennes","g90":0.5,"a90":0.34,"ga90":0.84,"goals":3,"assists":2,"mins90":5.9},
{"r":32,"name":"Karim Adeyemi","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Dortmund","g90":0.53,"a90":0.3,"ga90":0.83,"goals":7,"assists":4,"mins90":13.3},
{"r":33,"name":"Ferrán Torres","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Barcelona","g90":0.73,"a90":0.09,"ga90":0.82,"goals":16,"assists":2,"mins90":21.8},
{"r":34,"name":"Bamba Dieng","nat":"SEN","flag":"🇸🇳","country":"Senegal","pos":"FW","squad":"Lorient","g90":0.74,"a90":0.07,"ga90":0.82,"goals":10,"assists":1,"mins90":13.5},
{"r":35,"name":"Andrej Kramarić","nat":"CRO","flag":"🇭🇷","country":"Croatia","pos":"MF","squad":"Hoffenheim","g90":0.57,"a90":0.24,"ga90":0.82,"goals":14,"assists":6,"mins90":24.5},
{"r":36,"name":"Rayan Cherki","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Manchester City","g90":0.2,"a90":0.6,"ga90":0.81,"goals":4,"assists":12,"mins90":19.8},
{"r":37,"name":"Kike Barja","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Osasuna","g90":0.4,"a90":0.4,"ga90":0.81,"goals":2,"assists":2,"mins90":5.0},
{"r":38,"name":"Pavel Šulc","nat":"CZE","flag":"🇨🇿","country":"Czechia","pos":"FW","squad":"Lyon","g90":0.63,"a90":0.17,"ga90":0.8,"goals":11,"assists":3,"mins90":17.4},
{"r":39,"name":"Raphaël Guerreiro","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Bayern Munich","g90":0.57,"a90":0.23,"ga90":0.8,"goals":5,"assists":2,"mins90":8.7},
{"r":40,"name":"Nicolas Jackson","nat":"SEN","flag":"🇸🇳","country":"Senegal","pos":"FW","squad":"Bayern Munich","g90":0.71,"a90":0.09,"ga90":0.8,"goals":8,"assists":1,"mins90":11.2},
{"r":41,"name":"Michael Gregoritsch","nat":"AUT","flag":"🇦🇹","country":"Austria","pos":"FW","squad":"Augsburg","g90":0.59,"a90":0.2,"ga90":0.79,"goals":6,"assists":2,"mins90":10.1},
{"r":42,"name":"Said El Mala","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Köln","g90":0.6,"a90":0.18,"ga90":0.78,"goals":13,"assists":4,"mins90":21.7},
{"r":43,"name":"Marcus Rashford","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Barcelona","g90":0.41,"a90":0.36,"ga90":0.77,"goals":8,"assists":7,"mins90":19.6},
{"r":44,"name":"Pablo Pagis","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Lorient","g90":0.51,"a90":0.26,"ga90":0.77,"goals":10,"assists":5,"mins90":19.5},
{"r":45,"name":"Ayoube Amaimouni","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Eintracht Frankfurt","g90":0.31,"a90":0.46,"ga90":0.77,"goals":2,"assists":3,"mins90":6.5},
{"r":46,"name":"Kai Havertz","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Arsenal","g90":0.31,"a90":0.46,"ga90":0.77,"goals":2,"assists":3,"mins90":6.5},
{"r":47,"name":"Omar Marmoush","nat":"EGY","flag":"🇪🇬","country":"Egypt","pos":"FW","squad":"Manchester City","g90":0.39,"a90":0.39,"ga90":0.77,"goals":3,"assists":3,"mins90":7.8},
{"r":48,"name":"Sebastian Nanasi","nat":"SWE","flag":"🇸🇪","country":"Sweden","pos":"MF","squad":"Strasbourg","g90":0.6,"a90":0.17,"ga90":0.77,"goals":7,"assists":2,"mins90":11.7},
{"r":49,"name":"Borja Iglesias","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Celta Vigo","g90":0.66,"a90":0.09,"ga90":0.76,"goals":14,"assists":2,"mins90":21.1},
{"r":50,"name":"Hugo Ekitike","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Liverpool","g90":0.55,"a90":0.2,"ga90":0.75,"goals":11,"assists":4,"mins90":20.0},
{"r":51,"name":"Amine Gouiri","nat":"ALG","flag":"🇩🇿","country":"Algeria","pos":"FW","squad":"Marseille","g90":0.54,"a90":0.2,"ga90":0.75,"goals":8,"assists":3,"mins90":14.7},
{"r":52,"name":"Fermin López","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Barcelona","g90":0.3,"a90":0.45,"ga90":0.75,"goals":6,"assists":9,"mins90":20.0},
{"r":53,"name":"Odsonne Édouard","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Lens","g90":0.6,"a90":0.15,"ga90":0.75,"goals":12,"assists":3,"mins90":20.0},
{"r":54,"name":"Héctor Fort","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"DF","squad":"Elche","g90":0.37,"a90":0.37,"ga90":0.75,"goals":2,"assists":2,"mins90":5.4},
{"r":55,"name":"Carlos Espí","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Levante","g90":0.74,"a90":0.0,"ga90":0.74,"goals":11,"assists":0,"mins90":14.9},
{"r":56,"name":"Chris Führich","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Stuttgart","g90":0.37,"a90":0.37,"ga90":0.74,"goals":7,"assists":7,"mins90":18.9},
{"r":57,"name":"Igor Matanović","nat":"CRO","flag":"🇭🇷","country":"Croatia","pos":"FW","squad":"Freiburg","g90":0.63,"a90":0.11,"ga90":0.74,"goals":11,"assists":2,"mins90":17.5},
{"r":58,"name":"Robert Glatzel","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Hamburger SV","g90":0.44,"a90":0.29,"ga90":0.74,"goals":3,"assists":2,"mins90":6.8},
{"r":59,"name":"Yan Diomandé","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"FW","squad":"RB Leipzig","g90":0.44,"a90":0.29,"ga90":0.73,"goals":12,"assists":8,"mins90":27.5},
{"r":60,"name":"Désiré Doué","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Paris Saint-Germain","g90":0.47,"a90":0.27,"ga90":0.73,"goals":7,"assists":4,"mins90":15.0},
{"r":61,"name":"Abde Ezzalzouli","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Real Betis","g90":0.4,"a90":0.32,"ga90":0.72,"goals":10,"assists":8,"mins90":25.0},
{"r":62,"name":"Ayoze Pérez","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Villarreal","g90":0.4,"a90":0.32,"ga90":0.72,"goals":5,"assists":4,"mins90":12.5},
{"r":63,"name":"Brajan Gruda","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"RB Leipzig","g90":0.36,"a90":0.36,"ga90":0.72,"goals":3,"assists":3,"mins90":8.4},
{"r":64,"name":"Ange-Yoan Bonny","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"FW","squad":"Inter","g90":0.39,"a90":0.32,"ga90":0.71,"goals":5,"assists":4,"mins90":12.7},
{"r":65,"name":"Williot Swedberg","nat":"SWE","flag":"🇸🇪","country":"Sweden","pos":"FW","squad":"Celta Vigo","g90":0.35,"a90":0.35,"ga90":0.71,"goals":5,"assists":5,"mins90":14.1},
{"r":66,"name":"Hakan Çalhanoğlu","nat":"TUR","flag":"🇹🇷","country":"Turkey","pos":"MF","squad":"Inter","g90":0.49,"a90":0.22,"ga90":0.71,"goals":9,"assists":4,"mins90":18.2},
{"r":67,"name":"Tiago Tomás","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Stuttgart","g90":0.44,"a90":0.26,"ga90":0.71,"goals":5,"assists":3,"mins90":11.3},
{"r":68,"name":"Lennart Karl","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Bayern Munich","g90":0.35,"a90":0.35,"ga90":0.7,"goals":5,"assists":5,"mins90":14.2},
{"r":69,"name":"Eli Junior Kroupi","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Bournemouth","g90":0.7,"a90":0.0,"ga90":0.7,"goals":13,"assists":0,"mins90":18.6},
{"r":70,"name":"Joaquín Panichelli","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"FW","squad":"Strasbourg","g90":0.66,"a90":0.04,"ga90":0.7,"goals":16,"assists":1,"mins90":24.4},
{"r":71,"name":"Richarlison","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Tottenham Hotspur","g90":0.5,"a90":0.18,"ga90":0.69,"goals":11,"assists":4,"mins90":21.8},
{"r":72,"name":"Folarin Balogun","nat":"USA","flag":"🇺🇸","country":"United States","pos":"FW","squad":"Monaco","g90":0.52,"a90":0.16,"ga90":0.69,"goals":13,"assists":4,"mins90":24.8},
{"r":73,"name":"Alphonso Davies","nat":"CAN","flag":"🇨🇦","country":"Canada","pos":"DF","squad":"Bayern Munich","g90":0.17,"a90":0.51,"ga90":0.69,"goals":1,"assists":3,"mins90":5.8},
{"r":74,"name":"Emil Holm","nat":"SWE","flag":"🇸🇪","country":"Sweden","pos":"DF","squad":"Bologna","g90":0.14,"a90":0.55,"ga90":0.69,"goals":1,"assists":4,"mins90":7.3},
{"r":75,"name":"Donyell Malen","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"FW","squad":"Aston Villa","g90":0.55,"a90":0.14,"ga90":0.69,"goals":4,"assists":1,"mins90":7.3},
{"r":76,"name":"Raúl","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Osasuna","g90":0.61,"a90":0.09,"ga90":0.69,"goals":7,"assists":1,"mins90":11.6},
{"r":77,"name":"Christoph Baumgartner","nat":"AUT","flag":"🇦🇹","country":"Austria","pos":"MF","squad":"RB Leipzig","g90":0.42,"a90":0.26,"ga90":0.68,"goals":13,"assists":8,"mins90":30.9},
{"r":78,"name":"João Pedro","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Chelsea","g90":0.51,"a90":0.17,"ga90":0.68,"goals":15,"assists":5,"mins90":29.6},
{"r":79,"name":"Maximilian Beier","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Dortmund","g90":0.4,"a90":0.27,"ga90":0.67,"goals":9,"assists":6,"mins90":22.5},
{"r":80,"name":"Antoine Griezmann","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Atlético Madrid","g90":0.43,"a90":0.24,"ga90":0.67,"goals":7,"assists":4,"mins90":16.5},
{"r":81,"name":"Christian Pulisic","nat":"USA","flag":"🇺🇸","country":"United States","pos":"FW","squad":"Milan","g90":0.45,"a90":0.22,"ga90":0.67,"goals":8,"assists":4,"mins90":17.9},
{"r":82,"name":"Vinicius Júnior","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Real Madrid","g90":0.51,"a90":0.16,"ga90":0.67,"goals":16,"assists":5,"mins90":31.3},
{"r":83,"name":"Gerard Moreno","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Villarreal","g90":0.67,"a90":0.0,"ga90":0.67,"goals":10,"assists":0,"mins90":14.9},
{"r":84,"name":"Martin Terrier","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Leverkusen","g90":0.53,"a90":0.13,"ga90":0.67,"goals":4,"assists":1,"mins90":7.5},
{"r":85,"name":"Christopher Nkunku","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Milan","g90":0.46,"a90":0.2,"ga90":0.66,"goals":7,"assists":3,"mins90":15.1},
{"r":86,"name":"Sergio Camello","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Rayo Vallecano","g90":0.55,"a90":0.11,"ga90":0.66,"goals":5,"assists":1,"mins90":9.1},
{"r":87,"name":"Assan Ouedraogo","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"RB Leipzig","g90":0.38,"a90":0.28,"ga90":0.66,"goals":4,"assists":3,"mins90":10.5},
{"r":88,"name":"Stefan Schimmer","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Heidenheim","g90":0.55,"a90":0.11,"ga90":0.66,"goals":5,"assists":1,"mins90":9.1},
{"r":89,"name":"Ferran Jutglà","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Celta Vigo","g90":0.49,"a90":0.16,"ga90":0.65,"goals":9,"assists":3,"mins90":18.4},
{"r":90,"name":"Dani Olmo","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Barcelona","g90":0.3,"a90":0.35,"ga90":0.65,"goals":7,"assists":8,"mins90":23.0},
{"r":91,"name":"Antoine Semenyo","nat":"GHA","flag":"🇬🇭","country":"Ghana","pos":"MF","squad":"Bournemouth","g90":0.5,"a90":0.15,"ga90":0.65,"goals":10,"assists":3,"mins90":20.0},
{"r":92,"name":"Valentín Castellanos","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"FW","squad":"Lazio","g90":0.26,"a90":0.39,"ga90":0.65,"goals":2,"assists":3,"mins90":7.7},
{"r":93,"name":"Gonzalo García","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Real Madrid","g90":0.56,"a90":0.09,"ga90":0.65,"goals":6,"assists":1,"mins90":10.7},
{"r":94,"name":"Santiago Hidalgo","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Toulouse","g90":0.26,"a90":0.39,"ga90":0.64,"goals":4,"assists":6,"mins90":15.5},
{"r":95,"name":"Nuno Mendes","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"DF","squad":"Paris Saint-Germain","g90":0.29,"a90":0.36,"ga90":0.64,"goals":4,"assists":5,"mins90":14.0},
{"r":96,"name":"Pedro","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Lazio","g90":0.46,"a90":0.18,"ga90":0.64,"goals":5,"assists":2,"mins90":10.9},
{"r":97,"name":"Wesley Saïd","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Lens","g90":0.54,"a90":0.09,"ga90":0.63,"goals":12,"assists":2,"mins90":22.1},
{"r":98,"name":"Florian Thauvin","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Lens","g90":0.41,"a90":0.22,"ga90":0.63,"goals":11,"assists":6,"mins90":27.1},
{"r":99,"name":"Iago Aspas","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Celta Vigo","g90":0.39,"a90":0.24,"ga90":0.63,"goals":5,"assists":3,"mins90":12.7},
{"r":100,"name":"Igor Thiago","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Brentford","g90":0.6,"a90":0.03,"ga90":0.63,"goals":22,"assists":1,"mins90":36.5},
{"r":101,"name":"Mikel Oyarzabal","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Real Sociedad","g90":0.5,"a90":0.13,"ga90":0.63,"goals":15,"assists":4,"mins90":30.1},
{"r":102,"name":"Mahmoud Dahoud","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Eintracht Frankfurt","g90":0.25,"a90":0.38,"ga90":0.63,"goals":2,"assists":3,"mins90":8.0},
{"r":103,"name":"Gabriel Jesus","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Arsenal","g90":0.63,"a90":0.0,"ga90":0.63,"goals":3,"assists":0,"mins90":4.8},
{"r":104,"name":"Ethan Mbappé","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Lille","g90":0.48,"a90":0.16,"ga90":0.63,"goals":3,"assists":1,"mins90":6.3},
{"r":105,"name":"Arnaud Nordin","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Rennes","g90":0.16,"a90":0.47,"ga90":0.63,"goals":1,"assists":3,"mins90":6.3},
{"r":106,"name":"Bradley Barcola","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Paris Saint-Germain","g90":0.57,"a90":0.05,"ga90":0.62,"goals":11,"assists":1,"mins90":19.4},
{"r":107,"name":"Julian Brandt","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Dortmund","g90":0.39,"a90":0.22,"ga90":0.62,"goals":7,"assists":4,"mins90":17.8},
{"r":108,"name":"Martial Godo","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Strasbourg","g90":0.57,"a90":0.06,"ga90":0.62,"goals":10,"assists":1,"mins90":17.6},
{"r":109,"name":"Jamie Leweling","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Stuttgart","g90":0.27,"a90":0.34,"ga90":0.61,"goals":7,"assists":9,"mins90":26.3},
{"r":110,"name":"Ernest Poku","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"MF","squad":"Leverkusen","g90":0.3,"a90":0.3,"ga90":0.61,"goals":5,"assists":5,"mins90":16.5},
{"r":111,"name":"Viktor Gyökeres","nat":"SWE","flag":"🇸🇪","country":"Sweden","pos":"FW","squad":"Arsenal","g90":0.57,"a90":0.04,"ga90":0.61,"goals":14,"assists":1,"mins90":24.7},
{"r":112,"name":"Keinan Davis","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"Udinese","g90":0.44,"a90":0.17,"ga90":0.61,"goals":10,"assists":4,"mins90":22.9},
{"r":113,"name":"Mikel Merino","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Arsenal","g90":0.35,"a90":0.26,"ga90":0.61,"goals":4,"assists":3,"mins90":11.5},
{"r":114,"name":"Julian Ryerson","nat":"NOR","flag":"🇳🇴","country":"Norway","pos":"MF","squad":"Dortmund","g90":0.0,"a90":0.6,"ga90":0.6,"goals":0,"assists":15,"mins90":25.2},
{"r":115,"name":"Haris Tabaković","nat":"BIH","flag":"🇧🇦","country":"Bosnia-Herzegovina","pos":"FW","squad":"Gladbach","g90":0.49,"a90":0.11,"ga90":0.6,"goals":13,"assists":3,"mins90":26.5},
{"r":116,"name":"Ollie Watkins","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"Aston Villa","g90":0.51,"a90":0.1,"ga90":0.6,"goals":16,"assists":3,"mins90":31.5},
{"r":117,"name":"Nicolas Pépé","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Villarreal","g90":0.3,"a90":0.3,"ga90":0.6,"goals":8,"assists":8,"mins90":26.6},
{"r":118,"name":"Nadiem Amiri","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Mainz 05","g90":0.52,"a90":0.09,"ga90":0.6,"goals":12,"assists":2,"mins90":23.1},
{"r":119,"name":"Bilal Nadir","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Marseille","g90":0.0,"a90":0.6,"ga90":0.6,"goals":0,"assists":4,"mins90":6.6},
{"r":120,"name":"Gonçalo Guedes","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Real Sociedad","g90":0.39,"a90":0.2,"ga90":0.59,"goals":8,"assists":4,"mins90":20.3},
{"r":121,"name":"Alexander Sørloth","nat":"NOR","flag":"🇳🇴","country":"Norway","pos":"FW","squad":"Atlético Madrid","g90":0.59,"a90":0.0,"ga90":0.59,"goals":13,"assists":0,"mins90":22.0},
{"r":122,"name":"Mohamed Salah","nat":"EGY","flag":"🇪🇬","country":"Egypt","pos":"MF","squad":"Liverpool","g90":0.29,"a90":0.29,"ga90":0.59,"goals":7,"assists":7,"mins90":23.8},
{"r":123,"name":"Corentin Tolisso","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Lyon","g90":0.43,"a90":0.16,"ga90":0.59,"goals":11,"assists":4,"mins90":25.6},
{"r":124,"name":"David Neres","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Napoli","g90":0.29,"a90":0.29,"ga90":0.59,"goals":3,"assists":3,"mins90":10.2},
{"r":125,"name":"Elye Wahi","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"FW","squad":"Nice","g90":0.49,"a90":0.1,"ga90":0.59,"goals":5,"assists":1,"mins90":10.2},
{"r":126,"name":"Ragnar Ache","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Köln","g90":0.37,"a90":0.21,"ga90":0.58,"goals":7,"assists":4,"mins90":19.1},
{"r":127,"name":"Breel Embolo","nat":"SUI","flag":"🇨🇭","country":"Switzerland","pos":"FW","squad":"Rennes","g90":0.43,"a90":0.14,"ga90":0.58,"goals":9,"assists":3,"mins90":20.8},
{"r":128,"name":"Arda Güler","nat":"TUR","flag":"🇹🇷","country":"Turkey","pos":"MF","squad":"Real Madrid","g90":0.18,"a90":0.4,"ga90":0.58,"goals":4,"assists":9,"mins90":22.4},
{"r":129,"name":"Callum Wilson","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"West Ham United","g90":0.5,"a90":0.07,"ga90":0.58,"goals":7,"assists":1,"mins90":13.9},
{"r":130,"name":"Rafael Leão","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"FW","squad":"Milan","g90":0.44,"a90":0.15,"ga90":0.58,"goals":9,"assists":3,"mins90":20.6},
{"r":131,"name":"Lukas Nmecha","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Leeds United","g90":0.5,"a90":0.08,"ga90":0.58,"goals":6,"assists":1,"mins90":12.0},
{"r":132,"name":"Afonso Moreira","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Lyon","g90":0.21,"a90":0.37,"ga90":0.57,"goals":4,"assists":7,"mins90":19.1},
{"r":133,"name":"Rayan","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Bournemouth","g90":0.41,"a90":0.16,"ga90":0.57,"goals":5,"assists":2,"mins90":12.3},
{"r":134,"name":"Jesus Rodríguez","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Como","g90":0.1,"a90":0.47,"ga90":0.57,"goals":2,"assists":9,"mins90":19.2},
{"r":135,"name":"Julián Álvarez","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"FW","squad":"Atlético Madrid","g90":0.38,"a90":0.19,"ga90":0.57,"goals":8,"assists":4,"mins90":21.1},
{"r":136,"name":"Gauthier Hein","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Metz","g90":0.31,"a90":0.27,"ga90":0.57,"goals":8,"assists":7,"mins90":26.1},
{"r":137,"name":"Sambou Soumano","nat":"SEN","flag":"🇸🇳","country":"Senegal","pos":"FW","squad":"Lorient","g90":0.38,"a90":0.19,"ga90":0.57,"goals":4,"assists":2,"mins90":10.5},
{"r":138,"name":"Armand Lauriente","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Sassuolo","g90":0.24,"a90":0.31,"ga90":0.56,"goals":7,"assists":9,"mins90":28.8},
{"r":139,"name":"Nicolás Paz","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Como","g90":0.38,"a90":0.19,"ga90":0.56,"goals":12,"assists":6,"mins90":32.0},
{"r":140,"name":"Toni Martínez","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Alavés","g90":0.46,"a90":0.1,"ga90":0.56,"goals":14,"assists":3,"mins90":30.2},
{"r":141,"name":"Danny Welbeck","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"Brighton","g90":0.52,"a90":0.04,"ga90":0.56,"goals":13,"assists":1,"mins90":25.1},
{"r":142,"name":"Zian Flemming","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"FW","squad":"Burnley","g90":0.56,"a90":0.0,"ga90":0.56,"goals":11,"assists":0,"mins90":19.6},
{"r":143,"name":"Jeremie Boga","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Nice","g90":0.28,"a90":0.28,"ga90":0.56,"goals":2,"assists":2,"mins90":7.2},
{"r":144,"name":"Rayan Fofana","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Lens","g90":0.56,"a90":0.0,"ga90":0.56,"goals":5,"assists":0,"mins90":8.9},
{"r":145,"name":"Lucas Vázquez","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Leverkusen","g90":0.19,"a90":0.37,"ga90":0.56,"goals":1,"assists":2,"mins90":5.3},
{"r":146,"name":"Fares Chaïbi","nat":"ALG","flag":"🇩🇿","country":"Algeria","pos":"MF","squad":"Eintracht Frankfurt","g90":0.1,"a90":0.45,"ga90":0.55,"goals":2,"assists":9,"mins90":19.9},
{"r":147,"name":"Bazoumana Touré","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Hoffenheim","g90":0.19,"a90":0.35,"ga90":0.55,"goals":5,"assists":9,"mins90":25.6},
{"r":148,"name":"Morgan Gibbs-White","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Nottingham Forest","g90":0.44,"a90":0.12,"ga90":0.55,"goals":15,"assists":4,"mins90":34.4},
{"r":149,"name":"Lucas Boyé","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"FW","squad":"Alavés","g90":0.51,"a90":0.05,"ga90":0.55,"goals":11,"assists":1,"mins90":21.8},
{"r":150,"name":"Ludovic Ajorque","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Brest","g90":0.26,"a90":0.29,"ga90":0.54,"goals":8,"assists":9,"mins90":31.3},
{"r":151,"name":"Konrad Laimer","nat":"AUT","flag":"🇦🇹","country":"Austria","pos":"DF","squad":"Bayern Munich","g90":0.14,"a90":0.41,"ga90":0.54,"goals":3,"assists":9,"mins90":22.2},
{"r":152,"name":"Alberto Moleiro","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Villarreal","g90":0.36,"a90":0.18,"ga90":0.54,"goals":10,"assists":5,"mins90":27.5},
{"r":153,"name":"Leandro Trossard","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"FW","squad":"Arsenal","g90":0.27,"a90":0.27,"ga90":0.54,"goals":6,"assists":6,"mins90":22.2},
{"r":154,"name":"Álex Grimaldo","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Leverkusen","g90":0.29,"a90":0.25,"ga90":0.54,"goals":8,"assists":7,"mins90":28.0},
{"r":155,"name":"Kevin De Bruyne","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"MF","squad":"Napoli","g90":0.39,"a90":0.15,"ga90":0.54,"goals":5,"assists":2,"mins90":12.9},
{"r":156,"name":"Alessio Castro-Montes","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"MF","squad":"Köln","g90":0.13,"a90":0.4,"ga90":0.54,"goals":1,"assists":3,"mins90":7.5},
{"r":157,"name":"Paulo Dybala","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Roma","g90":0.13,"a90":0.4,"ga90":0.53,"goals":2,"assists":6,"mins90":15.0},
{"r":158,"name":"Rômulo","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"RB Leipzig","g90":0.37,"a90":0.16,"ga90":0.53,"goals":9,"assists":4,"mins90":24.3},
{"r":159,"name":"Jarrod Bowen","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"West Ham United","g90":0.24,"a90":0.29,"ga90":0.53,"goals":9,"assists":11,"mins90":37.8},
{"r":160,"name":"Ilan Kebbal","nat":"ALG","flag":"🇩🇿","country":"Algeria","pos":"MF","squad":"Paris FC","g90":0.36,"a90":0.16,"ga90":0.53,"goals":9,"assists":4,"mins90":24.7},
{"r":161,"name":"Simon Adingra","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Monaco","g90":0.32,"a90":0.21,"ga90":0.53,"goals":3,"assists":2,"mins90":9.5},
{"r":162,"name":"Jeremie Boga","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Juventus","g90":0.53,"a90":0.0,"ga90":0.53,"goals":4,"assists":0,"mins90":7.5},
{"r":163,"name":"Rodrygo","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Real Madrid","g90":0.13,"a90":0.39,"ga90":0.53,"goals":1,"assists":3,"mins90":7.6},
{"r":164,"name":"Osame Sahraoui","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Lille","g90":0.18,"a90":0.36,"ga90":0.53,"goals":1,"assists":2,"mins90":5.6},
{"r":165,"name":"Junior Messias","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Genoa","g90":0.39,"a90":0.13,"ga90":0.53,"goals":3,"assists":1,"mins90":7.6},
{"r":166,"name":"Martin Baturina","nat":"CRO","flag":"🇭🇷","country":"Croatia","pos":"MF","squad":"Como","g90":0.34,"a90":0.17,"ga90":0.52,"goals":6,"assists":3,"mins90":17.4},
{"r":167,"name":"Phil Foden","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Manchester City","g90":0.3,"a90":0.22,"ga90":0.52,"goals":7,"assists":5,"mins90":23.2},
{"r":168,"name":"Noah Okafor","nat":"SUI","flag":"🇨🇭","country":"Switzerland","pos":"FW","squad":"Leeds United","g90":0.46,"a90":0.06,"ga90":0.52,"goals":8,"assists":1,"mins90":17.3},
{"r":169,"name":"Antoine Semenyo","nat":"GHA","flag":"🇬🇭","country":"Ghana","pos":"MF","squad":"Manchester City","g90":0.45,"a90":0.06,"ga90":0.52,"goals":7,"assists":1,"mins90":15.5},
{"r":170,"name":"Mohamed Amoura","nat":"ALG","flag":"🇩🇿","country":"Algeria","pos":"FW","squad":"Wolfsburg","g90":0.38,"a90":0.14,"ga90":0.52,"goals":8,"assists":3,"mins90":21.3},
{"r":171,"name":"Nick Woltemade","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Newcastle United","g90":0.38,"a90":0.14,"ga90":0.52,"goals":8,"assists":3,"mins90":21.1},
{"r":172,"name":"Ludovic Blas","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Rennes","g90":0.29,"a90":0.23,"ga90":0.52,"goals":5,"assists":4,"mins90":17.2},
{"r":173,"name":"Ante Budimir","nat":"CRO","flag":"🇭🇷","country":"Croatia","pos":"FW","squad":"Osasuna","g90":0.52,"a90":0.0,"ga90":0.52,"goals":17,"assists":0,"mins90":32.6},
{"r":174,"name":"Alexander Isak","nat":"SWE","flag":"🇸🇪","country":"Sweden","pos":"FW","squad":"Liverpool","g90":0.39,"a90":0.13,"ga90":0.52,"goals":3,"assists":1,"mins90":7.8},
{"r":175,"name":"Antony","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Real Betis","g90":0.29,"a90":0.22,"ga90":0.51,"goals":8,"assists":6,"mins90":27.2},
{"r":176,"name":"Marius Bülter","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Köln","g90":0.28,"a90":0.23,"ga90":0.51,"goals":5,"assists":4,"mins90":17.7},
{"r":177,"name":"Jonathan David","nat":"CAN","flag":"🇨🇦","country":"Canada","pos":"FW","squad":"Juventus","g90":0.3,"a90":0.2,"ga90":0.51,"goals":6,"assists":4,"mins90":19.8},
{"r":178,"name":"Javi Rueda","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Celta Vigo","g90":0.13,"a90":0.38,"ga90":0.51,"goals":2,"assists":6,"mins90":15.6},
{"r":179,"name":"Kenan Yıldız","nat":"TUR","flag":"🇹🇷","country":"Turkey","pos":"MF","squad":"Juventus","g90":0.32,"a90":0.19,"ga90":0.51,"goals":10,"assists":6,"mins90":31.4},
{"r":180,"name":"Ruben Vargas","nat":"SUI","flag":"🇨🇭","country":"Switzerland","pos":"MF","squad":"Sevilla","g90":0.17,"a90":0.34,"ga90":0.51,"goals":3,"assists":6,"mins90":17.7},
{"r":181,"name":"Bruno Guimarães","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Newcastle United","g90":0.33,"a90":0.18,"ga90":0.51,"goals":9,"assists":5,"mins90":27.3},
{"r":182,"name":"Largie Ramazani","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"MF","squad":"Valencia","g90":0.44,"a90":0.07,"ga90":0.51,"goals":6,"assists":1,"mins90":13.7},
{"r":183,"name":"Cole Palmer","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Chelsea","g90":0.46,"a90":0.05,"ga90":0.51,"goals":10,"assists":1,"mins90":21.7},
{"r":184,"name":"Cristian Volpato","nat":"AUS","flag":"🇦🇺","country":"Australia","pos":"FW","squad":"Sassuolo","g90":0.17,"a90":0.34,"ga90":0.51,"goals":2,"assists":4,"mins90":11.8},
{"r":185,"name":"Brahim Díaz","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Real Madrid","g90":0.07,"a90":0.43,"ga90":0.5,"goals":1,"assists":6,"mins90":14.0},
{"r":186,"name":"Jeremy Doku","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"MF","squad":"Manchester City","g90":0.25,"a90":0.25,"ga90":0.5,"goals":5,"assists":5,"mins90":19.8},
{"r":187,"name":"Bilal El Khannouss","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Stuttgart","g90":0.22,"a90":0.28,"ga90":0.5,"goals":4,"assists":5,"mins90":18.1},
{"r":188,"name":"Igor Paixão","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Marseille","g90":0.27,"a90":0.23,"ga90":0.5,"goals":6,"assists":5,"mins90":21.9},
{"r":189,"name":"Gorka Guruzeta","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Athletic Club","g90":0.38,"a90":0.11,"ga90":0.5,"goals":10,"assists":3,"mins90":26.3},
{"r":190,"name":"Dominic Calvert-Lewin","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"Leeds United","g90":0.46,"a90":0.03,"ga90":0.5,"goals":14,"assists":1,"mins90":30.2},
{"r":191,"name":"Quentin Ndjantou Mbitcha","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Paris Saint-Germain","g90":0.25,"a90":0.25,"ga90":0.5,"goals":1,"assists":1,"mins90":4.0},
{"r":192,"name":"Abdallah Sima","nat":"SEN","flag":"🇸🇳","country":"Senegal","pos":"MF","squad":"Lens","g90":0.25,"a90":0.25,"ga90":0.5,"goals":2,"assists":2,"mins90":8.0},
{"r":193,"name":"José Luis Morales","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Levante","g90":0.25,"a90":0.25,"ga90":0.5,"goals":1,"assists":1,"mins90":4.0},
{"r":194,"name":"Dženan Pejčinović","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Wolfsburg","g90":0.49,"a90":0.0,"ga90":0.49,"goals":8,"assists":0,"mins90":16.2},
{"r":195,"name":"Álvaro Rodríguez","nat":"URU","flag":"🇺🇾","country":"Uruguay","pos":"FW","squad":"Elche","g90":0.29,"a90":0.2,"ga90":0.49,"goals":7,"assists":5,"mins90":24.5},
{"r":196,"name":"Musa Al-Taamari","nat":"JOR","flag":"🇯🇴","country":"Jordan","pos":"MF","squad":"Rennes","g90":0.24,"a90":0.24,"ga90":0.49,"goals":6,"assists":6,"mins90":24.6},
{"r":197,"name":"Cucho","nat":"COL","flag":"🇨🇴","country":"Colombia","pos":"FW","squad":"Real Betis","g90":0.38,"a90":0.1,"ga90":0.49,"goals":11,"assists":3,"mins90":28.7},
{"r":198,"name":"Bukayo Saka","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"FW","squad":"Arsenal","g90":0.28,"a90":0.2,"ga90":0.49,"goals":7,"assists":5,"mins90":24.7},
{"r":199,"name":"Fabio Vieira","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Hamburger SV","g90":0.29,"a90":0.2,"ga90":0.49,"goals":7,"assists":5,"mins90":24.5},
{"r":200,"name":"Matias Fernandez-Pardo","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"FW","squad":"Lille","g90":0.3,"a90":0.19,"ga90":0.49,"goals":8,"assists":5,"mins90":26.3},
{"r":201,"name":"André Silva","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"FW","squad":"Elche","g90":0.49,"a90":0.0,"ga90":0.49,"goals":10,"assists":0,"mins90":20.5},
{"r":202,"name":"Raúl Jiménez","nat":"MEX","flag":"🇲🇽","country":"Mexico","pos":"FW","squad":"Fulham","g90":0.37,"a90":0.12,"ga90":0.49,"goals":9,"assists":3,"mins90":24.3},
{"r":203,"name":"Jean-Philippe Mateta","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Crystal Palace","g90":0.49,"a90":0.0,"ga90":0.49,"goals":12,"assists":0,"mins90":24.6},
{"r":204,"name":"Benjamín Domínguez","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Bologna","g90":0.0,"a90":0.49,"ga90":0.49,"goals":0,"assists":3,"mins90":6.1},
{"r":205,"name":"Wael Mohya","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Gladbach","g90":0.33,"a90":0.16,"ga90":0.49,"goals":2,"assists":1,"mins90":6.1},
{"r":206,"name":"Maxence Caqueret","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Como","g90":0.12,"a90":0.36,"ga90":0.48,"goals":2,"assists":6,"mins90":16.5},
{"r":207,"name":"Roberto Navarro","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Athletic Club","g90":0.41,"a90":0.07,"ga90":0.48,"goals":6,"assists":1,"mins90":14.5},
{"r":208,"name":"Nico Williams","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Athletic Club","g90":0.32,"a90":0.16,"ga90":0.48,"goals":6,"assists":3,"mins90":18.6},
{"r":209,"name":"Gonçalo Ramos","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"FW","squad":"Paris Saint-Germain","g90":0.41,"a90":0.07,"ga90":0.48,"goals":6,"assists":1,"mins90":14.6},
{"r":210,"name":"Josan","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Elche","g90":0.0,"a90":0.48,"ga90":0.48,"goals":0,"assists":3,"mins90":6.3},
{"r":211,"name":"Takumi Minamino","nat":"JPN","flag":"🇯🇵","country":"Japan","pos":"MF","squad":"Monaco","g90":0.29,"a90":0.19,"ga90":0.48,"goals":3,"assists":2,"mins90":10.5},
{"r":212,"name":"Rio Ngumoha","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Liverpool","g90":0.32,"a90":0.16,"ga90":0.48,"goals":2,"assists":1,"mins90":6.2},
{"r":213,"name":"Jude Bellingham","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Real Madrid","g90":0.28,"a90":0.19,"ga90":0.47,"goals":6,"assists":4,"mins90":21.3},
{"r":214,"name":"Pablo Fornals","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Real Betis","g90":0.28,"a90":0.19,"ga90":0.47,"goals":9,"assists":6,"mins90":31.6},
{"r":215,"name":"Jean Mattéo Bahoya","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Eintracht Frankfurt","g90":0.2,"a90":0.27,"ga90":0.47,"goals":3,"assists":4,"mins90":14.8},
{"r":216,"name":"Martim Neto","nat":"POR","flag":"🇵🇹","country":"Portugal","pos":"MF","squad":"Elche","g90":0.13,"a90":0.33,"ga90":0.47,"goals":2,"assists":5,"mins90":15.0},
{"r":217,"name":"Tijjani Noslin","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"FW","squad":"Lazio","g90":0.31,"a90":0.16,"ga90":0.47,"goals":4,"assists":2,"mins90":12.8},
{"r":218,"name":"Pedri","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Barcelona","g90":0.09,"a90":0.38,"ga90":0.47,"goals":2,"assists":9,"mins90":23.4},
{"r":219,"name":"Kiké","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Espanyol","g90":0.42,"a90":0.05,"ga90":0.47,"goals":8,"assists":1,"mins90":19.3},
{"r":220,"name":"Godson Kyeremeh","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Le Havre","g90":0.24,"a90":0.24,"ga90":0.47,"goals":1,"assists":1,"mins90":4.2},
{"r":221,"name":"Wilson Isidor","nat":"HAI","flag":"🇭🇹","country":"Haiti","pos":"FW","squad":"Sunderland","g90":0.46,"a90":0.0,"ga90":0.46,"goals":6,"assists":0,"mins90":12.9},
{"r":222,"name":"Grischa Prömel","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"MF","squad":"Hoffenheim","g90":0.36,"a90":0.1,"ga90":0.46,"goals":7,"assists":2,"mins90":19.5},
{"r":223,"name":"Matìas Soulé","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Roma","g90":0.25,"a90":0.21,"ga90":0.46,"goals":6,"assists":5,"mins90":23.8},
{"r":224,"name":"Martin Ødegaard","nat":"NOR","flag":"🇳🇴","country":"Norway","pos":"MF","squad":"Arsenal","g90":0.07,"a90":0.39,"ga90":0.46,"goals":1,"assists":6,"mins90":15.2},
{"r":225,"name":"Tim Lemperle","nat":"GER","flag":"🇩🇪","country":"Germany","pos":"FW","squad":"Hoffenheim","g90":0.37,"a90":0.09,"ga90":0.46,"goals":8,"assists":2,"mins90":21.6},
{"r":226,"name":"Dennis Johnsen","nat":"NOR","flag":"🇳🇴","country":"Norway","pos":"MF","squad":"Cremonese","g90":0.23,"a90":0.23,"ga90":0.46,"goals":1,"assists":1,"mins90":4.3},
{"r":227,"name":"Maghnes Akliouche","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Monaco","g90":0.23,"a90":0.23,"ga90":0.45,"goals":6,"assists":6,"mins90":26.7},
{"r":228,"name":"Emersonn","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"FW","squad":"Toulouse","g90":0.34,"a90":0.11,"ga90":0.45,"goals":6,"assists":2,"mins90":17.7},
{"r":229,"name":"Eberechi Eze","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Arsenal","g90":0.35,"a90":0.1,"ga90":0.45,"goals":7,"assists":2,"mins90":20.1},
{"r":230,"name":"Pablo Torre","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Mallorca","g90":0.23,"a90":0.23,"ga90":0.45,"goals":4,"assists":4,"mins90":17.8},
{"r":231,"name":"Hugo Duro","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"FW","squad":"Valencia","g90":0.45,"a90":0.0,"ga90":0.45,"goals":10,"assists":0,"mins90":22.0},
{"r":232,"name":"Olivier Giroud","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Lille","g90":0.39,"a90":0.06,"ga90":0.45,"goals":7,"assists":1,"mins90":17.9},
{"r":233,"name":"Caleb Ekuban","nat":"GHA","flag":"🇬🇭","country":"Ghana","pos":"FW","squad":"Genoa","g90":0.36,"a90":0.09,"ga90":0.45,"goals":4,"assists":1,"mins90":11.0},
{"r":234,"name":"Ibrahim Mbaye","nat":"SEN","flag":"🇸🇳","country":"Senegal","pos":"FW","squad":"Paris Saint-Germain","g90":0.27,"a90":0.18,"ga90":0.45,"goals":3,"assists":2,"mins90":11.2},
{"r":235,"name":"Jack Grealish","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Everton","g90":0.11,"a90":0.33,"ga90":0.44,"goals":2,"assists":6,"mins90":18.1},
{"r":236,"name":"Javier Guerra","nat":"ESP","flag":"🇪🇸","country":"Spain","pos":"MF","squad":"Valencia","g90":0.17,"a90":0.26,"ga90":0.44,"goals":4,"assists":6,"mins90":22.9},
{"r":237,"name":"Arnaud Kalimuendo","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Eintracht Frankfurt","g90":0.38,"a90":0.06,"ga90":0.44,"goals":6,"assists":1,"mins90":15.7},
{"r":238,"name":"Diego Moreira","nat":"BEL","flag":"🇧🇪","country":"Belgium","pos":"MF","squad":"Strasbourg","g90":0.18,"a90":0.27,"ga90":0.44,"goals":4,"assists":6,"mins90":22.6},
{"r":239,"name":"Morgan Rogers","nat":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","country":"England","pos":"MF","squad":"Aston Villa","g90":0.27,"a90":0.16,"ga90":0.44,"goals":10,"assists":6,"mins90":36.4},
{"r":240,"name":"Giovanni Simeone","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"FW","squad":"Torino","g90":0.44,"a90":0.0,"ga90":0.44,"goals":11,"assists":0,"mins90":24.8},
{"r":241,"name":"Sofiane Boufal","nat":"MAR","flag":"🇲🇦","country":"Morocco","pos":"MF","squad":"Le Havre","g90":0.09,"a90":0.35,"ga90":0.44,"goals":1,"assists":4,"mins90":11.3},
{"r":242,"name":"Thijs Dallinga","nat":"NED","flag":"🇳🇱","country":"Netherlands","pos":"FW","squad":"Bologna","g90":0.22,"a90":0.22,"ga90":0.44,"goals":2,"assists":2,"mins90":9.0},
{"r":243,"name":"Thiago Fernández","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Oviedo","g90":0.0,"a90":0.44,"ga90":0.44,"goals":0,"assists":4,"mins90":9.1},
{"r":244,"name":"Hamed Junior Traorè","nat":"CIV","flag":"🇨🇮","country":"Ivory Coast","pos":"MF","squad":"Marseille","g90":0.29,"a90":0.15,"ga90":0.44,"goals":2,"assists":1,"mins90":6.9},
{"r":245,"name":"Willem Geubbels","nat":"FRA","flag":"🇫🇷","country":"France","pos":"FW","squad":"Paris FC","g90":0.44,"a90":0.0,"ga90":0.44,"goals":5,"assists":0,"mins90":11.3},
{"r":246,"name":"Oliver Burke","nat":"SCO","flag":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","country":"Scotland","pos":"FW","squad":"Union Berlin","g90":0.32,"a90":0.11,"ga90":0.43,"goals":6,"assists":2,"mins90":18.5},
{"r":247,"name":"Matheus Cunha","nat":"BRA","flag":"🇧🇷","country":"Brazil","pos":"MF","squad":"Manchester Utd","g90":0.36,"a90":0.07,"ga90":0.43,"goals":10,"assists":2,"mins90":27.7},
{"r":248,"name":"Senny Mayulu","nat":"FRA","flag":"🇫🇷","country":"France","pos":"MF","squad":"Paris Saint-Germain","g90":0.22,"a90":0.22,"ga90":0.43,"goals":4,"assists":4,"mins90":18.6},
{"r":249,"name":"Giuliano Simeone","nat":"ARG","flag":"🇦🇷","country":"Argentina","pos":"MF","squad":"Atlético Madrid","g90":0.17,"a90":0.26,"ga90":0.43,"goals":4,"assists":6,"mins90":23.3},
{"r":250,"name":"Federico Valverde","nat":"URU","flag":"🇺🇾","country":"Uruguay","pos":"MF","squad":"Real Madrid","g90":0.16,"a90":0.26,"ga90":0.43,"goals":5,"assists":8,"mins90":30.4}
];

const FBREF_NONWC=[
{"r": 1, "name": "Robert Lewandowski", "nat": "POL", "flag": "🇵🇱", "country": "Poland", "pos": "FW", "squad": "Barcelona", "reason": {"nl": "Polen niet gekwalificeerd", "en": "Poland not qualified"}},
{"r": 2, "name": "Victor Osimhen", "nat": "NGA", "flag": "🇳🇬", "country": "Nigeria", "pos": "FW", "squad": "Galatasaray", "reason": {"nl": "Nigeria niet gekwalificeerd", "en": "Nigeria not qualified"}},
{"r": 3, "name": "Gianluigi Donnarumma", "nat": "ITA", "flag": "🇮🇹", "country": "Italy", "pos": "GK", "squad": "Man City", "reason": {"nl": "Italië niet gekwalificeerd", "en": "Italy not qualified"}},
{"r": 4, "name": "Dušan Vlahović", "nat": "SRB", "flag": "🇷🇸", "country": "Serbia", "pos": "FW", "squad": "Juventus", "reason": {"nl": "Servië niet gekwalificeerd", "en": "Serbia not qualified"}},
{"r": 5, "name": "Federico Chiesa", "nat": "ITA", "flag": "🇮🇹", "country": "Italy", "pos": "FW", "squad": "Liverpool", "reason": {"nl": "Italië niet gekwalificeerd", "en": "Italy not qualified"}},
{"r": 6, "name": "Mykhailo Mudryk", "nat": "UKR", "flag": "🇺🇦", "country": "Ukraine", "pos": "FW", "squad": "Chelsea", "reason": {"nl": "Oekraïne niet gekwalificeerd", "en": "Ukraine not qualified"}},
{"r": 7, "name": "Sergej Milinković-Savić", "nat": "SRB", "flag": "🇷🇸", "country": "Serbia", "pos": "MF", "squad": "Al-Hilal", "reason": {"nl": "Servië niet gekwalificeerd", "en": "Serbia not qualified"}},
{"r": 8, "name": "Dominik Szoboszlai", "nat": "HUN", "flag": "🇭🇺", "country": "Hungary", "pos": "MF", "squad": "Liverpool", "reason": {"nl": "Hongarije niet gekwalificeerd", "en": "Hungary not qualified"}},
{"r": 9, "name": "Aurélien Tchouaméni", "nat": "FRA", "flag": "🇫🇷", "country": "France", "pos": "MF", "squad": "Real Madrid", "reason": {"nl": "Blessure (twijfelachtig)", "en": "Injury (doubtful)"}},
{"r": 10, "name": "Gavi", "nat": "ESP", "flag": "🇪🇸", "country": "Spain", "pos": "MF", "squad": "Barcelona", "reason": {"nl": "Blessure (twijfelachtig)", "en": "Injury (doubtful)"}}
];

// Prominent, recent injuries with current status (curated, most relevant first)
const INJURIES=[
  {name:"Neymar",flag:"🇧🇷",country:"Brazil",pos:"FW",club:"Santos",
   status:{nl:"Kuitblessure (sinds 17 mei)",en:"Calf injury (since May 17)"},
   note:{nl:"Twijfelgeval voor de opener vs Marokko; arts: 'tot drie weken'.",en:"Doubtful for the opener vs Morocco; doctor: 'up to three weeks'."},sev:"doubt"},
  {name:"Gavi",flag:"🇪🇸",country:"Spain",pos:"MF",club:"Barcelona",
   status:{nl:"Knie — twijfelachtig",en:"Knee — doubtful"},
   note:{nl:"Race tegen de klok om de selectie te halen.",en:"Race against time to make the squad."},sev:"doubt"},
  {name:"Aurélien Tchouaméni",flag:"🇫🇷",country:"France",pos:"MF",club:"Real Madrid",
   status:{nl:"Blessure — twijfelachtig",en:"Injury — doubtful"},
   note:{nl:"Sleutelspeler op het middenveld; fitheid onzeker.",en:"Key midfield anchor; fitness uncertain."},sev:"doubt"},
  {name:"Santiago Giménez",flag:"🇲🇽",country:"Mexico",pos:"FW",club:"AC Milan",
   status:{nl:"Mist het toernooi",en:"Misses the tournament"},
   note:{nl:"Significant aanvalsverlies voor het gastland.",en:"Significant attacking loss for the host."},sev:"out"},
  {name:"Alisson",flag:"🇧🇷",country:"Brazil",pos:"GK",club:"Liverpool",
   status:{nl:"Fit (na eerdere recidief)",en:"Fit (after earlier relapse)"},
   note:{nl:"Hersteld en beschikbaar als eerste keeper.",en:"Recovered and available as first-choice keeper."},sev:"fit"},
  {name:"Tyler Adams",flag:"🇺🇸",country:"United States",pos:"MF",club:"Crystal Palace",
   status:{nl:"Fit (na enkelblessure)",en:"Fit (after ankle injury)"},
   note:{nl:"Hersteld, verwacht te starten voor het gastland.",en:"Recovered, expected to start for the host."},sev:"fit"},
];


// ── INJURIES SECTION COMPONENT ───────────────────────────────────────────────
function InjuriesSection(){
  const T=useTheme();
  const lang=useLang();
  const red=T.id==="dark"?"#FF5544":"#C0392B";
  const amber=T.id==="dark"?"#E0A030":"#C77700";
  const green=T.id==="dark"?"#3DBE6E":"#1E7A40";
  const sevColor={out:red,doubt:amber,fit:green};
  const sevLabel={
    out:{nl:"Mist toernooi",en:"Out"},
    doubt:{nl:"Twijfel",en:"Doubt"},
    fit:{nl:"Fit",en:"Fit"},
  };
  return(
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden"}}>
      {INJURIES.map((p,i)=>(
        <div key={p.name} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",
          borderTop:i>0?`1px solid ${T.border}`:"none"}}>
          <span style={{fontSize:18,lineHeight:1,flexShrink:0,marginTop:1}}>{p.flag}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:FS.body,fontWeight:700,color:T.text}}>{p.name}</span>
              <span style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.3,textTransform:"uppercase",
                color:sevColor[p.sev],border:`1px solid ${sevColor[p.sev]}`,borderRadius:3,padding:"1px 5px"}}>
                {sevLabel[p.sev][lang]}
              </span>
            </div>
            <div style={{fontSize:FS.caption,color:T.textSub,marginTop:2}}>
              {p.pos} · {p.club} · {p.status[lang]}
            </div>
            <div style={{fontSize:FS.caption,color:T.textFaint,marginTop:2,lineHeight:1.4}}>
              {p.note[lang]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── FBREF STATS SECTION COMPONENT ────────────────────────────────────────────
function FBrefStatsSection(){
  const T=useTheme();
  const lang=useLang();
  const [limit,setLimit]=React.useState(10);
  const [natFilter,setNatFilter]=React.useState("");
  const [sortKey,setSortKey]=React.useState("ga90");  // ga90 | g90 | a90
  const orange=T.id==="dark"?"#FF5500":"#E07000";
  const blue=T.id==="dark"?"#909090":T.blue;
  const green=T.id==="dark"?"#3DBE6E":"#1E7A40";
  const posColor=(pos)=>{
    if(!pos) return T.textFaint;
    const p=pos.split(",")[0];
    if(p==="FW") return orange; if(p==="MF") return blue; if(p==="DF") return green;
    return T.textFaint;
  };
  const nations=[...new Set(FBREF_WC.map(p=>p.country))].sort();
  const base=natFilter?FBREF_WC.filter(p=>p.country===natFilter):FBREF_WC;
  const filtered=[...base].sort((a,b)=>b[sortKey]-a[sortKey]);
  const visible=filtered.slice(0,limit);
  const COLS="26px 1fr 30px 24px 54px 36px 36px 42px";
  const HDR=lang==="nl"
    ?["#","Speler","Nat","Pos","Club","G/90","A/90","G+A/90"]
    :["#","Player","Nat","Pos","Club","G/90","A/90","G+A/90"];
  const Row=({p,rank,accentColor})=>(
    <div style={{display:"grid",gridTemplateColumns:COLS,gap:0,padding:"6px 10px",
      borderBottom:`1px solid ${T.border}`}}>
      <div style={{fontSize:FS.caption,color:accentColor||T.textFaint,textAlign:"center",alignSelf:"center",fontWeight:700}}>{rank}</div>
      <div style={{minWidth:0,alignSelf:"center"}}>
        <div style={{fontSize:FS.small,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
        <div style={{fontSize:9,color:T.textFaint}}>{p.flag} {p.country}</div>
      </div>
      <div style={{fontSize:FS.caption,color:T.textSub,alignSelf:"center"}}>{p.nat}</div>
      <div style={{alignSelf:"center"}}>
        <span style={{fontSize:FS.micro,fontWeight:700,color:posColor(p.pos),background:`${posColor(p.pos)}18`,borderRadius:3,padding:"1px 4px"}}>{p.pos}</span>
      </div>
      <div style={{fontSize:FS.caption,color:T.textSub,alignSelf:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.squad}</div>
      <div style={{fontSize:FS.caption,fontWeight:600,color:orange,textAlign:"right",alignSelf:"center"}}>{p.g90.toFixed(2)}</div>
      <div style={{fontSize:FS.caption,fontWeight:600,color:blue,textAlign:"right",alignSelf:"center"}}>{p.a90.toFixed(2)}</div>
      <div style={{fontSize:FS.small,fontWeight:800,color:accentColor||T.text,textAlign:"right",alignSelf:"center"}}>{p.ga90.toFixed(2)}</div>
    </div>
  );
  return(
    <React.Fragment>
      {/* WC Players table */}
      <div style={{marginTop:28}}>
        <div style={{fontSize:FS.small,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:T.textSub,marginBottom:12,paddingLeft:13}}>
          {lang==="nl"?"xGA per 90":"xGA per 90"}
        </div>
        {/* Nation filter */}
        <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",flexWrap:"wrap",paddingLeft:13}}>
          <span style={{fontSize:FS.caption,color:T.textSub}}>{lang==="nl"?"Land:":"Nation:"}</span>
          <select value={natFilter} onChange={e=>{setNatFilter(e.target.value);setLimit(10);}}
            style={{fontSize:FS.caption,padding:"3px 8px",borderRadius:4,border:`1px solid ${T.border}`,
              background:T.card,color:T.text}}>
            <option value="">{lang==="nl"?"Alle landen":"All nations"} ({FBREF_WC.length})</option>
            {nations.map(n=>(<option key={n} value={n}>{n}</option>))}
          </select>
          {natFilter&&(<span style={{fontSize:FS.caption,color:T.textFaint}}>
            {filtered.length} {lang==="nl"?"spelers":"players"}
          </span>)}
        </div>
        {/* Table */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden",marginBottom:8}}>
          <div style={{display:"grid",gridTemplateColumns:COLS,gap:0,padding:"8px 12px",
            borderBottom:`2px solid ${T.border}`,background:T.id==="dark"?"#161616":T.bg}}>
            {HDR.map((h,i)=>{
              const sortable=i>=5;
              const keyFor=["","","","","","g90","a90","ga90"][i];
              const active=sortable&&sortKey===keyFor;
              return(
              <div key={h} onClick={sortable?()=>{setSortKey(keyFor);setLimit(l=>l);}:undefined}
                style={{fontSize:FS.micro,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",
                  color:active?orange:T.textFaint,textAlign:i>=5?"right":"left",
                  cursor:sortable?"pointer":"default",userSelect:"none"}}>
                {h}{active?" ↓":""}
              </div>
              );
            })}
          </div>
          {visible.map((p,i)=>(<Row key={p.name+i} p={p} rank={i+1}/>))}
        </div>
        {/* Expand */}
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          {[10,100,250].map(n=>(
            <button key={n} onClick={()=>setLimit(n)}
              style={{fontSize:FS.caption,padding:"4px 10px",borderRadius:4,cursor:"pointer",
                border:`1px solid ${limit===n?orange:T.border}`,
                background:limit===n?orange:"transparent",
                color:limit===n?"#fff":T.textSub}}>
              Top {n}
            </button>
          ))}
        </div>
      </div>
      {/* Missed out */}
      <div style={{marginTop:28}}>
        <div style={{fontSize:FS.small,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:T.textSub,marginBottom:12,paddingLeft:13}}>
          {lang==="nl"?"Grote afwezigen":"Notable absentees"}
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden",marginBottom:20}}>
          {FBREF_NONWC.map((p,i,arr)=>(
            <div key={p.name} style={{display:"flex",alignItems:"center",gap:9,
              padding:"9px 12px",
              borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:18,lineHeight:1,flexShrink:0}}>{p.flag}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:FS.small,fontWeight:600,color:T.text,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:FS.caption,color:T.textFaint,marginTop:1}}>{p.pos} · {p.squad}</div>
              </div>
              <span style={{fontSize:FS.caption,fontWeight:600,flexShrink:0,textAlign:"right",
                color:p.reason[lang].toLowerCase().includes(lang==="nl"?"blessure":"injury")?(T.id==="dark"?"#FF5544":"#C0392B"):T.textSub}}>
                {p.reason[lang]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function PlayersTab(){
  const T=useTheme();
  const lang=useLang();
  const [openSpotlight,setOpenSpotlight]=useState({});
  const [spotlightMore,setSpotlightMore]=useState(false);
  const [darkMore,setDarkMore]=useState(false);
  const [openDark,setOpenDark]=useState({});
  const [openXI,setOpenXI]=useState({});
  const toggle=(setter,key)=>setter(p=>({...p,[key]:!p[key]}));
  return(
    <div>
      {/* Onder de radar (was Talenten) — placed above the spotlight */}
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,paddingLeft:13}}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.textSub} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <span style={{fontSize:FS.small,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:T.textSub}}>
          {lang==="nl"?"Onder de Radar":"Under the Radar"}
        </span>
      </div>
      <ChampionCard p={DARK_HORSES[0]}/>
      <div onClick={()=>setDarkMore(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",
          background:T.card,border:`1px solid ${T.border}`,borderTop:"none",
          borderBottomLeftRadius:darkMore?0:8,borderBottomRightRadius:darkMore?0:8,
          padding:"9px 13px",marginBottom:darkMore?0:24}}>
        <Chevron open={darkMore} color={T.textSub}/>
        <span style={{fontSize:FS.caption,fontWeight:600,color:T.textSub}}>
          {lang==="nl"?`Bekijk overige talenten (${DARK_HORSES.length-1})`:`View other talents (${DARK_HORSES.length-1})`}
        </span>
      </div>
      {darkMore&&(
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderTop:"none",
          borderBottomLeftRadius:8,borderBottomRightRadius:8,overflow:"hidden",marginBottom:24}}>
          {DARK_HORSES.slice(1).map(p=><DarkHorseCard key={p.name} p={p} open={openDark[p.name]} onToggle={()=>toggle(setOpenDark,p.name)}/>)}
        </div>
      )}

      {/* Spotlight — featured star champion card attached to a subtle foldout */}
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,paddingLeft:13}}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill={T.textSub} stroke="none" style={{flexShrink:0}}>
          <path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.4 6.7L12 17.8 6 20.6l1.4-6.7L2.3 9l6.8-.7z"/>
        </svg>
        <span style={{fontSize:FS.small,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:T.textSub}}>
          {lang==="nl"?"Sterspelers":"Spotlight"}
        </span>
      </div>
      <ChampionCard p={SPOTLIGHT[0]}/>
      <div onClick={()=>setSpotlightMore(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",
          background:T.card,border:`1px solid ${T.border}`,borderTop:"none",
          borderBottomLeftRadius:spotlightMore?0:8,borderBottomRightRadius:spotlightMore?0:8,
          padding:"9px 13px",marginBottom:spotlightMore?0:24}}>
        <Chevron open={spotlightMore} color={T.textSub}/>
        <span style={{fontSize:FS.caption,fontWeight:600,color:T.textSub}}>
          {lang==="nl"?"Bekijk top 10":"View top 10"}
        </span>
      </div>
      {spotlightMore&&(
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderTop:"none",
          borderBottomLeftRadius:8,borderBottomRightRadius:8,overflow:"hidden",marginBottom:24}}>
          {SPOTLIGHT.slice(1).map(p=><PlayerCard key={p.name} p={p} open={openSpotlight[p.name]} onToggle={()=>toggle(setOpenSpotlight,p.name)}/>)}
        </div>
      )}

      {/* Best XI */}
      <div style={{fontSize:FS.small,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:T.textSub,marginTop:4,marginBottom:10,paddingLeft:13}}>
        {lang==="nl"?"Beste Elftal van het Toernooi":"Tournament Best XI"}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",paddingLeft:13}}>
        <span style={{fontSize:FS.caption,fontWeight:700,color:T.green}}>{lang==="nl"?"xG = verwachte doelpunten":"xG = expected goals"}</span>
        <span style={{fontSize:FS.caption,fontWeight:700,color:T.blue}}>{lang==="nl"?"xA = verwachte assists":"xA = expected assists"}</span>
      </div>
      <PitchViz/>
      {/* Player list */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",marginBottom:10}}>
        <div style={{padding:"8px 13px",background:T.orangeFaint,borderBottom:`1px solid ${T.border}`,fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.orange}}>
          {lang==="nl"?"Basiselftal":"Starting XI"} · {BEST_XI.formation}
        </div>
        {BEST_XI.players.map(p=>(
          <div key={p.name} style={{borderBottom:`1px solid ${T.border}`}}>
            <div onClick={()=>toggle(setOpenXI,p.name)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",cursor:"pointer",background:openXI[p.name]?T.orangeFaint:T.card}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#E07000",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,flexShrink:0}}>
                <span style={{color:"#fff",fontSize:FS.micro,fontWeight:700}}>{p.pos==="CB1"||p.pos==="CB2"?"CB":p.pos}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:FS.body,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
                  {p.value&&<span style={{fontSize:FS.micro,fontWeight:700,color:T.green,background:`${T.green}14`,border:`1px solid ${T.green}33`,borderRadius:4,padding:"1px 5px",whiteSpace:"nowrap"}}>{p.value}</span>}
                  {p.xG>0&&<span style={{fontSize:FS.micro,fontWeight:700,color:T.green,background:`${T.green}1A`,border:`1px solid ${T.green}4D`,borderRadius:4,padding:"1px 5px",whiteSpace:"nowrap"}}>~{p.xG} xG</span>}
                  {p.xA>0&&<span style={{fontSize:FS.micro,fontWeight:700,color:T.blue,background:`${T.blue}1A`,border:`1px solid ${T.blue}4D`,borderRadius:4,padding:"1px 5px",whiteSpace:"nowrap"}}>~{p.xA} xA</span>}
                </div>
              </div>
              <span style={{fontSize:11,color:T.textSub,flexShrink:0}}>{p.flag} {p.age} {lang==="nl"?"jr":"yrs"}</span>
              <Chevron open={openXI[p.name]} color={T.orange}/>
            </div>
            {openXI[p.name]&&(
              <div style={{padding:"8px 13px 10px",background:T.orangeFaint,borderLeft:`3px solid ${T.orange}`,fontSize:FS.small,color:T.textSub,lineHeight:1.5}}>
                {p.note[lang]}
                <StatBar st={p.st}/>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Subs */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"8px 13px",background:T.blueFaint,borderBottom:`1px solid ${T.border}`,fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.id==="dark"?"#909090":T.blue}}>
          {lang==="nl"?"Wissels":"Substitutes"}
        </div>
        {BEST_XI.subs.map(p=>(
          <div key={p.name} style={{borderBottom:`1px solid ${T.border}`}}>
            <div onClick={()=>toggle(setOpenXI,"sub_"+p.name)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",cursor:"pointer",background:openXI["sub_"+p.name]?T.blueFaint:T.card}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:T.blueFaint,border:"1px solid #1A5296",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:T.id==="dark"?"#909090":T.blue,fontSize:FS.micro,fontWeight:700}}>{p.pos}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:FS.body,fontWeight:500,color:T.text}}>{p.name}</div>
                <div style={{display:"flex",gap:4,marginTop:2}}>
                  {p.value&&<span style={{fontSize:FS.micro,fontWeight:700,color:T.green,background:`${T.green}14`,border:`1px solid ${T.green}33`,borderRadius:4,padding:"1px 5px"}}>{p.value}</span>}
                  {p.xG>0&&<span style={{fontSize:FS.micro,fontWeight:700,color:T.green,background:`${T.green}1A`,border:`1px solid ${T.green}4D`,borderRadius:4,padding:"1px 5px"}}>~{p.xG} xG</span>}
                  {p.xA>0&&<span style={{fontSize:FS.micro,fontWeight:700,color:T.blue,background:`${T.blue}1A`,border:`1px solid ${T.blue}4D`,borderRadius:4,padding:"1px 5px"}}>~{p.xA} xA</span>}
                </div>
              </div>
              <span style={{fontSize:11,color:T.textSub,flexShrink:0}}>{p.flag} {p.age} {lang==="nl"?"jr":"yrs"}</span>
              <Chevron open={openXI["sub_"+p.name]} color={T.id==="dark"?T.orange:T.blue}/>
            </div>
            {openXI["sub_"+p.name]&&p.note&&(
              <div style={{padding:"6px 12px 8px",background:T.blueFaint,borderLeft:`3px solid ${T.id==="dark"?T.orange:T.blue}`,fontSize:FS.small,color:T.textSub,lineHeight:1.5}}>
                {p.note[lang]}
              </div>
            )}
          </div>
        ))}
      <FBrefStatsSection/>
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [lang,setLang]=useState("nl");
  const [theme,setTheme]=useState("default");
  const [tab,setTab]=useState("bracket");
  const [newsOpen,setNewsOpen]=useState(false);
  const [injuriesOpen,setInjuriesOpen]=useState(false);
  const [srcOpen,setSrcOpen]=useState(false);
  const [openGroup,setOpenGroup]=useState(null);
  const [nationsOpen,setNationsOpen]=useState(null);
  const [openMatches,setOpenMatches]=useState({});
          const koCardRefs=React.useRef({});
          const scrollToMatch=(key)=>{
            const el=koCardRefs.current[key];
            if(el){el.scrollIntoView({behavior:"smooth",block:"start"});if(!openMatches[key])toggleMatch(key);}
          };
  const [openOutlook,setOpenOutlook]=useState({});

  const T=THEMES[theme];
  const toggleMatch=key=>setOpenMatches(p=>({...p,[key]:!p[key]}));
  const toggleOutlook=team=>setOpenOutlook(p=>({...p,[team]:!p[team]}));
  const fWin=fsA>fsB?FINAL_TEAMS[0]:FINAL_TEAMS[1];
  const tr=LANG[lang];

  return(
    <ThemeCtx.Provider value={T}>
    <LangCtx.Provider value={lang}>
    <NavCtx.Provider value={{setTab,setNationsOpen}}>
      <div style={{minHeight:"100vh",background:T.bg,fontSize:FS.body,color:T.text,overflowX:"hidden"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;}button{font-family:inherit;cursor:pointer;}`}</style>
        <Nav tab={tab} setTab={setTab}/>

        <div style={{padding:"14px 16px 80px",width:"100%",boxSizing:"border-box"}}>

          {/* TOURNAMENT */}
          {tab==="bracket"&&(
            <React.Fragment>
              {T.id==="default"
                ? <div style={{background:"linear-gradient(135deg,#0D1B3E 0%,#1A3A6A 60%,#0D3060 100%)",borderRadius:6,padding:"14px",marginBottom:12,borderLeft:`4px solid ${T.orange}`,position:"relative",overflow:"hidden"}}>
                    {/* WK2026 decorative stripes */}
                    <div style={{position:"absolute",top:0,right:0,width:80,height:"100%",background:"linear-gradient(90deg,transparent,rgba(224,112,0,0.10))",pointerEvents:"none"}}/>
                    <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:2,color:T.orange,textTransform:"uppercase",marginBottom:2}}>{tr.tournamentLabel}</div>
                    <div style={{fontSize:FS.micro,fontWeight:600,letterSpacing:1,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",marginBottom:8}}>USA · Canada · Mexico 2026</div>
                    <div style={{fontSize:FS.h1,fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:10}}>{tr.appTitle}</div>
                    <div onClick={()=>setTab("knockout")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.12)",border:`1px solid rgba(224,112,0,0.55)`,borderRadius:4,padding:"8px 12px",cursor:"pointer",backdropFilter:"blur(4px)"}}>
                      <span style={{fontSize:20}}>🏆</span>
                      <div>
                        <div style={{fontSize:FS.caption,color:"rgba(255,255,255,0.6)",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{tr.predictedChampion}</div>
                        <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{FLAGS[fWin]} {tName(fWin,lang)}</div>
                      </div>
                      <span style={{marginLeft:4,color:"#fff",fontSize:FS.small,fontWeight:600}}>{tr.knockoutLink} →</span>
                    </div>
                  </div>
                : <div style={{background:"#1A3A6A",borderRadius:4,padding:"14px",marginBottom:12,borderLeft:`4px solid #FF5500`}}>
                    <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1.5,color:"#FF5500",textTransform:"uppercase",marginBottom:4}}>{tr.tournamentLabel}</div>
                    <div style={{fontSize:FS.h1,fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:8}}>{tr.appTitle}</div>
                    <div onClick={()=>setTab("knockout")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.1)",border:`1.5px solid #FF5500`,borderRadius:4,padding:"8px 12px",cursor:"pointer"}}>
                      <span style={{fontSize:20}}>🏆</span>
                      <div>
                        <div style={{fontSize:FS.caption,color:"rgba(255,255,255,0.6)",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{tr.predictedChampion}</div>
                        <div style={{fontSize:14,fontWeight:700,color:"#FF5500"}}>{FLAGS[fWin]} {tName(fWin,lang)}</div>
                      </div>
                      <span style={{marginLeft:4,color:"#fff",fontSize:FS.small,fontWeight:600}}>{tr.knockoutLink} →</span>
                    </div>
                  </div>
              }
              <div style={{marginBottom:14}}>
                <div onClick={()=>setNewsOpen(o=>!o)}
                  style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                    background:T.id==="dark"?"#1a1408":(newsOpen?T.orangeFaint:T.bg),
                    border:`1px solid ${T.id==="dark"?"#3a2e18":(newsOpen?T.orange+"55":T.border)}`,
                    borderRadius:6,
                    padding:"10px 12px"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={T.id==="dark"?T.orange:T.blue} strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                    <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
                  </svg>
                  <span style={{flex:1,fontSize:FS.small,fontWeight:700,letterSpacing:1.2,
                    textTransform:"uppercase",color:T.id==="dark"?T.orange:T.blue}}>
                    {lang==="nl"?"Nieuws":"News"}
                  </span>
                  <Chevron open={newsOpen} color={T.textSub}/>
                </div>
                {newsOpen&&<div style={{marginTop:10}}><NewsSection/></div>}
              </div>
              <div style={{marginBottom:14}}>
                <div onClick={()=>setInjuriesOpen(o=>!o)}
                  style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                    background:T.id==="dark"?"#1a1408":(injuriesOpen?T.orangeFaint:T.bg),
                    border:`1px solid ${T.id==="dark"?"#3a2e18":(injuriesOpen?T.orange+"55":T.border)}`,
                    borderRadius:6,
                    padding:"10px 12px"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={T.id==="dark"?T.orange:T.blue} strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  <span style={{flex:1,fontSize:FS.small,fontWeight:700,letterSpacing:1.2,
                    textTransform:"uppercase",color:T.id==="dark"?T.orange:T.blue}}>
                    {lang==="nl"?"Blessures":"Injuries"}
                  </span>
                  <Chevron open={injuriesOpen} color={T.textSub}/>
                </div>
                {injuriesOpen&&<div style={{marginTop:10}}><InjuriesSection/></div>}
              </div>
              <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textSub,marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${T.border}`}}>
                {lang==="nl"?"Groepsfase":"Group Stage"}
              </div>
              {GROUP_DATA.map(g=>(
                <GroupAccordion key={g.id} g={g} openGroup={openGroup} setOpenGroup={setOpenGroup} openMatches={openMatches} toggleMatch={toggleMatch}/>
              ))}
            </React.Fragment>
          )}



          {/* KNOCKOUT */}
          {tab==="knockout"&&(
            <React.Fragment>
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:FS.h2,fontWeight:700,color:T.text}}>{tr.knockoutTitle}</div>
                    </div>
                    <KnockoutBracket scrollToMatch={scrollToMatch}/>
                    {[{label:tr.qf,rounds:QF},{label:tr.sf,rounds:SF}].map(({label,rounds})=>(
                      <div key={label} style={{marginBottom:14}}>
                        <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:T.id==="dark"?T.orange:T.blue,marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${T.border}`}}>{label}</div>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {rounds.map(([a,b])=>(
                            <div key={`${a}-${b}`} ref={el=>koCardRefs.current[`${a}-${b}`]=el}>
                              <KOCard a={a} b={b} openMatches={openMatches} toggleMatch={toggleMatch}/>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div ref={el=>koCardRefs.current[`${FINAL_TEAMS[0]}-${FINAL_TEAMS[1]}`]=el}>
                      <div style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:T.id==="dark"?T.orange:T.blue,marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${T.border}`}}>{tr.final}</div>
                <div style={{background:T.card,border:`1px solid ${T.orange}`,borderTop:`3px solid ${T.orange}`,borderRadius:4,overflow:"hidden"}}>
                  <div style={{padding:14}}>
                    {[{team:FINAL_TEAMS[0],score:fsA,win:fsA>fsB},{team:FINAL_TEAMS[1],score:fsB,win:fsB>fsA}].map(({team,score,win},i)=>(
                      <div key={team}>
                        {i===1&&<div style={{height:1,background:T.border,margin:"8px 0"}}/>}
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <TeamLink team={team}><span style={{fontSize:20,cursor:"pointer"}}>{FLAGS[team]}</span></TeamLink>
                          <span style={{flex:1,fontSize:FS.body,fontWeight:win?700:400,color:win?T.text:T.textSub}}>{tName(team,lang)}</span>
                          <span style={{fontSize:FS.h1,fontWeight:700,color:win?T.orange:T.textSub}}>{score}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8,background:T.id==="lion"?"rgba(0,0,0,0.15)":T.blueFaint,margin:"12px -14px -14px",padding:"10px 14px"}}>
                      <span style={{fontSize:16}}>🏆</span>
                      <div>
                        <div style={{fontSize:FS.caption,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",color:T.textSub}}>{tr.predictedChampionLabel}</div>
                        <div style={{fontSize:14,fontWeight:700,color:T.id==="dark"?"#909090":T.blue}}>{FLAGS[fWin]} {tName(fWin,lang)}</div>
                      </div>
                    </div>
                  </div>
                <FinalExplainer openMatches={openMatches} toggleMatch={toggleMatch}/>
                </div>
              </div>
            </React.Fragment>
          )}

          {/* MODEL */}
                    {tab==="model"&&(
            <React.Fragment>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:FS.h2,fontWeight:700,color:T.text}}>{tr.modelTitle}</div>
              </div>

              {/* ── MODEL EXPLANATION + VISUALISATIONS (sections 1-4) ── */}
              <ModelViz/>

              {/* ── OVER / UNDERPERFORMERS (section 5) ── */}
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,marginTop:16,
                paddingBottom:5,borderBottom:`2px solid ${T.border}`}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textSub}
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>
                </svg>
                <span style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textSub}}>
                  {lang==="nl"?"Stap 6 · Waar het model afwijkt van FIFA":"Step 6 · Where the model differs from FIFA"}
                </span>
              </div>
              <div style={{fontSize:FS.small,color:T.textSub,marginBottom:10,lineHeight:1.6}}>
                {lang==="nl"
                  ?"Welke landen schat het model hoger of lager in dan hun FIFA-positie? Tik een land aan voor de onderbouwing."
                  :"Which countries does the model rate higher or lower than their FIFA position? Tap a country for the reasoning."}
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  <span style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.green}}>{tr.overTitle}</span>
                </div>
                {OUTLOOK.over.map(d=><OutlookRow key={d.team} d={d} type="over" open={openOutlook[d.team]} onToggle={()=>toggleOutlook(d.team)}/>)}
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                  <span style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.red}}>{tr.underTitle}</span>
                </div>
                {OUTLOOK.under.map(d=><OutlookRow key={d.team} d={d} type="under" open={openOutlook[d.team]} onToggle={()=>toggleOutlook(d.team)}/>)}
              </div>

              {/* ── DATA SOURCES (bottom of page) ── */}
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,marginTop:16,
                paddingBottom:5,borderBottom:`2px solid ${T.border}`}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textSub}
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span style={{fontSize:FS.caption,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.textSub}}>
                  {lang==="nl"?"Databronnen":"Data sources"}
                </span>
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
                padding:"12px",marginBottom:20}}>
                {[
                  {label:"Elo",src:"eloratings.net",desc:{nl:"Officiële Elo-ratings, geverifieerd juni 2026. Gastlanden (VS, Mexico, Canada) krijgen een correctie voor de gemiste kwalificatiecyclus.",en:"Official Elo ratings, verified June 2026. Hosts (USA, Mexico, Canada) receive a correction for the missed qualifying cycle."}},
                  {label:lang==="nl"?"Selectiekwaliteit":"Squad quality",src:"Transfermarkt",desc:{nl:"Totale marktwaarde per selectie (€ mln), mei 2026",en:"Total squad market value (€ mln), May 2026"}},
                  {label:"xG / xGc",src:lang==="nl"?"Per selectie":"Per squad",desc:{nl:"Verwachte goals voor/tegen per land, gebaseerd op recente interlandprestaties. Vult de hoogte van de uitslag in.",en:"Expected goals for/against per country, based on recent international performance. Fills the height of the scoreline."}},
                  {label:lang==="nl"?"Toernooi-ervaring":"Tournament experience",src:"results.csv",desc:{nl:"Grote toernooien laatste 10 jaar (WK, EK, Copa, Afrika Cup, Azië Cup, Gold Cup); ronde × zwaarte × recentheid",en:"Major tournaments last 10 years (WC, Euro, Copa, Africa/Asian Cup, Gold Cup); round × weight × recency"}},
                  {label:"Coach",src:lang==="nl"?"results.csv + erelijsten":"results.csv + honours",desc:{nl:"65% recent puntengemiddelde sinds aanstelling + 35% gewogen prijzenbonus per categorie; per coach geverifieerd en vastgelegd",en:"65% recent points-per-game since appointment + 35% weighted honours bonus by category; verified and documented per coach"}},
                  {label:lang==="nl"?"Recente vorm":"Recent form",src:"results.csv",desc:{nl:"½ punten laatste 12 interlands + ½ punten WK-kwalificatie; gastlanden gecompenseerd",en:"½ points last 12 internationals + ½ points WC qualifying; hosts compensated"}},
                  {label:lang==="nl"?"G+A/90 spelers":"G+A/90 players",src:"FBref",desc:{nl:"Big 5 Europa 2025-26, min. 4×90 min.",en:"Big 5 Europe 2025-26, min. 4×90 min."}},
                ].map((row,i,arr)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",
                    paddingBottom:i<arr.length-1?9:0,marginBottom:i<arr.length-1?9:0,
                    borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                    <div style={{minWidth:104,flexShrink:0}}>
                      <div style={{fontSize:FS.small,fontWeight:700,color:T.text}}>{row.label}</div>
                      <div style={{fontSize:FS.caption,fontWeight:600,color:T.id==="dark"?T.orange:"#E07000",marginTop:1}}>{row.src}</div>
                    </div>
                    <div style={{fontSize:FS.caption,color:T.textSub,lineHeight:1.5}}>{row.desc[lang]}</div>
                  </div>
                ))}
                <div style={{marginTop:11,paddingTop:11,borderTop:`1px solid ${T.border}`}}>
                  <div style={{fontSize:FS.caption,color:T.textSub,lineHeight:1.5,marginBottom:7}}>
                    {lang==="nl"
                      ?"De ruwe brondata is volledig in te zien en te downloaden:"
                      :"The raw source data is fully viewable and downloadable:"}
                  </div>
                  {[
                    {t:lang==="nl"?"Alle interlanduitslagen (49.365 wedstrijden, CSV)":"All international results (49,365 matches, CSV)",u:"https://github.com/sten-b/wk2026-voorspellingen/blob/main/data/results.csv"},
                    {t:lang==="nl"?"Ruwe modelinvoer per land (JSON)":"Raw per-country model inputs (JSON)",u:"https://github.com/sten-b/wk2026-voorspellingen/blob/main/data/source_inputs.json"},
                    {t:lang==="nl"?"Alle databestanden":"All data files",u:"https://github.com/sten-b/wk2026-voorspellingen/tree/main/data"},
                  ].map((l,i)=>(
                    <a key={i} href={l.u} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",gap:6,fontSize:FS.caption,fontWeight:600,
                        color:T.id==="dark"?T.orange:T.blue,textDecoration:"none",padding:"3px 0"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                      </svg>
                      {l.t}
                    </a>
                  ))}
                </div>
              </div>

              {/* Per-country raw source inputs — full transparency */}
              <div style={{marginBottom:20}}>
                <div onClick={()=>setSrcOpen(o=>!o)}
                  style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                    background:T.id==="dark"?"#1a1408":(srcOpen?T.orangeFaint:T.bg),
                    border:`1px solid ${T.id==="dark"?"#3a2e18":(srcOpen?T.orange+"55":T.border)}`,
                    borderRadius:6,padding:"10px 12px"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={T.id==="dark"?T.orange:T.blue} strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                    <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/>
                  </svg>
                  <span style={{flex:1,fontSize:FS.small,fontWeight:700,letterSpacing:1.2,
                    textTransform:"uppercase",color:T.id==="dark"?T.orange:T.blue}}>
                    {lang==="nl"?"Brondata per land":"Source data per country"}
                  </span>
                  <Chevron open={srcOpen} color={T.textSub}/>
                </div>
                {srcOpen&&(
                  <div style={{marginTop:10,background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:6,overflow:"hidden"}}>
                    <div style={{fontSize:FS.caption,color:T.textSub,lineHeight:1.5,padding:"10px 12px",
                      borderBottom:`1px solid ${T.border}`,background:T.bg}}>
                      {lang==="nl"
                        ?"De ruwe invoerwaarden waarmee elke sterktescore is berekend. Vorm = % punten (laatste 12 / WK-kwalificatie)."
                        :"The raw input values behind every strength score. Form = % points (last 12 / WC qualifying)."}
                    </div>
                    <div style={{overflowX:"auto"}}>
                      <div style={{minWidth:340}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 44px 40px 36px 38px 38px 52px",
                          gap:4,padding:"6px 10px",borderBottom:`2px solid ${T.border}`,background:T.bg,
                          fontSize:FS.micro,fontWeight:700,letterSpacing:0,textTransform:"uppercase",color:T.textFaint}}>
                          <span>{lang==="nl"?"Land":"Country"}</span>
                          <span style={{textAlign:"right"}}>Elo</span>
                          <span style={{textAlign:"right"}}>€mln</span>
                          <span style={{textAlign:"right"}}>xG</span>
                          <span style={{textAlign:"right"}}>xGc</span>
                          <span style={{textAlign:"right"}}>{lang==="nl"?"Erv.":"Exp."}</span>
                          <span style={{textAlign:"right"}}>{lang==="nl"?"Vorm":"Form"}</span>
                        </div>
                        {MODEL_ORDER.map((t,i)=>{
                          const s=SOURCE_INPUTS[t]; if(!s) return null;
                          return(
                            <div key={t} style={{display:"grid",gridTemplateColumns:"1fr 44px 40px 36px 38px 38px 52px",
                              gap:4,padding:"6px 10px",borderTop:i>0?`1px solid ${T.border}`:"none",
                              fontSize:FS.caption,alignItems:"center"}}>
                              <span style={{fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tName(t,lang)}</span>
                              <span style={{textAlign:"right",color:T.textSub}}>{s.elo}</span>
                              <span style={{textAlign:"right",color:T.textSub}}>{s.sv}</span>
                              <span style={{textAlign:"right",color:T.textSub}}>{s.xg}</span>
                              <span style={{textAlign:"right",color:T.textSub}}>{s.xgc}</span>
                              <span style={{textAlign:"right",color:T.textSub}}>{s.exp}</span>
                              <span style={{textAlign:"right",color:T.textSub}}>{s.f12}/{s.fq}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </React.Fragment>
          )}

          {/* NATIONS */}
          {tab==="nations"&&<NationsTab preOpen={nationsOpen}/>}

          {/* PLAYERS */}
          {tab==="players"&&<PlayersTab/>}
        </div>

        {/* FOOTER */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,borderTop:`1px solid ${T.border}`,background:T.nav,padding:"8px 12px",paddingBottom:"max(8px,env(safe-area-inset-bottom))",display:"flex",alignItems:"center",gap:8,zIndex:10}}>
          <div style={{lineHeight:1.3,flex:1,minWidth:0}}>
            <div style={{fontSize:FS.small,fontWeight:600,color:T.text}}>Sten Bossong</div>
            <div style={{fontSize:FS.caption,color:T.textSub}}>{tr.footerSub}</div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme}/>

          {/* Language toggle */}
          <div style={{display:"flex",border:`1px solid ${T.id==="default"?"#E07000":T.border}`,borderRadius:4,overflow:"hidden",flexShrink:0,height:34}}>
            {["nl","en"].map((l,i)=>(
              <button key={l} onClick={()=>setLang(l)} style={{
                width:34,height:34,fontSize:FS.small,fontWeight:lang===l?700:400,
                background:lang===l?(T.id==="default"?"#E07000":T.orange):"transparent",
                color:lang===l?"#fff":(T.id==="default"?"#E07000":T.textSub),
                border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                borderLeft:i>0?`1px solid ${T.id==="default"?"#E07000":T.border}`:"none",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
    </NavCtx.Provider>
    </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
