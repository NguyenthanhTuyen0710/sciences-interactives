// Arborescence Matière → Niveau → Chapitre → Notion, avec fiches de cours originales.
// Les intitulés de thèmes reprennent ceux des programmes officiels (cycle 3, cycle 4, lycée).
// ⚠ Les programmes du cycle 4 évoluent (nouveau programme de mathématiques publié au BO n° 10
// du 5 mars 2026, entrée progressive à partir de la rentrée 2026) : l'arborescence doit être
// validée par l'équipe pédagogique avant publication.
import type { LevelId, Subject } from "../engine/types";

export interface Fiche {
  definition: string;
  proprietes: string[];
  exemple?: string;
  methode?: string[];
}
export interface Notion { id: string; title: string; fiche?: Fiche }
export interface Chapter { id: string; title: string; theme: string; notions: Notion[] }
export interface Level { id: LevelId; label: string; cycle: "Collège" | "Lycée"; chapters: Chapter[] }

export const LEVELS: { id: LevelId; label: string; short: string; cycle: "Collège" | "Lycée" }[] = [
  { id: "6e", label: "Sixième", short: "6e", cycle: "Collège" },
  { id: "5e", label: "Cinquième", short: "5e", cycle: "Collège" },
  { id: "4e", label: "Quatrième", short: "4e", cycle: "Collège" },
  { id: "3e", label: "Troisième", short: "3e", cycle: "Collège" },
  { id: "2nde", label: "Seconde", short: "2nde", cycle: "Lycée" },
  { id: "1re", label: "Première (spécialité)", short: "1re", cycle: "Lycée" },
  { id: "Tle", label: "Terminale (spécialité)", short: "Tle", cycle: "Lycée" },
];

export const SUBJECTS: Record<Subject, { label: string; slug: string; color: string; emoji: string; description: string }> = {
  maths: { label: "Mathématiques", slug: "mathematiques", color: "indigo", emoji: "∑", description: "Nombres et calculs, géométrie, fonctions, statistiques et probabilités, algorithmique." },
  pc: { label: "Physique-Chimie", slug: "physique-chimie", color: "emerald", emoji: "⚛", description: "Matière et transformations, mouvements et interactions, énergie, ondes et signaux." },
};

export const subjectFromSlug = (slug: string): Subject | null => (slug === "mathematiques" ? "maths" : slug === "physique-chimie" ? "pc" : null);

const n = (id: string, title: string, fiche?: Fiche): Notion => ({ id, title, fiche });
const ch = (id: string, title: string, theme: string, notions: Notion[] = []): Chapter => ({ id, title, theme, notions });

// Thèmes officiels
const NC = "Nombres et calculs", GD = "Organisation et gestion de données, fonctions", GM = "Grandeurs et mesures", EG = "Espace et géométrie", AP = "Algorithmique et programmation";
const LY_NC = "Nombres et calculs", LY_F = "Fonctions / Analyse", LY_G = "Géométrie", LY_SP = "Statistiques et probabilités", LY_AL = "Algèbre", LY_AP = "Algorithmique et programmation";
const PM = "Organisation et transformations de la matière", PMI = "Mouvement et interactions", PE = "L'énergie et ses conversions", PS = "Des signaux pour observer et communiquer";
const LM = "Constitution et transformations de la matière", LMI = "Mouvement et interactions", LE = "L'énergie : conversions et transferts", LO = "Ondes et signaux";

export const CURRICULUM: Record<Subject, Level[]> = {
  maths: [
    { id: "6e", label: "Sixième", cycle: "Collège", chapters: [
      ch("m6-nombres", "Nombres entiers et décimaux", NC, [
        n("m6-nombres-comparer", "Comparer et ranger des décimaux", {
          definition: "Un nombre décimal s'écrit avec une partie entière et une partie décimale séparées par une virgule : dans $12{,}375$, 3 est le chiffre des dixièmes, 7 celui des centièmes, 5 celui des millièmes.",
          proprietes: ["On compare d'abord les parties entières.", "À partie entière égale, on compare les dixièmes, puis les centièmes, etc.", "Ajouter des zéros à la fin de la partie décimale ne change pas le nombre : $3{,}7 = 3{,}70$."],
          exemple: "$4{,}09 < 4{,}1$ car $4{,}09 = 4{,}09$ et $4{,}1 = 4{,}10$ : 9 centièmes < 10 centièmes.",
        }),
      ]),
      ch("m6-fractions", "Fractions", NC, [
        n("m6-fractions-comparer", "Comparer des fractions", {
          definition: "La fraction $\\dfrac{a}{b}$ ($b \\neq 0$) est le nombre qui, multiplié par $b$, donne $a$ : c'est le quotient $a \\div b$.",
          proprietes: ["Si deux fractions ont le même dénominateur, la plus grande est celle qui a le plus grand numérateur.", "On ne change pas une fraction en multipliant numérateur et dénominateur par un même nombre non nul : $\\dfrac{a}{b} = \\dfrac{a \\times k}{b \\times k}$.", "$\\dfrac{a}{b} > 1$ si $a > b$ ; $\\dfrac{a}{b} < 1$ si $a < b$."],
          methode: ["Écrire les deux fractions avec le même dénominateur.", "Comparer les numérateurs."],
          exemple: "$\\dfrac{2}{3}$ et $\\dfrac{7}{12}$ : $\\dfrac{2}{3} = \\dfrac{8}{12}$ et $8 > 7$ donc $\\dfrac{2}{3} > \\dfrac{7}{12}$.",
        }),
        n("m6-fractions-ecritures", "Fractions, décimaux et pourcentages", {
          definition: "Un même nombre peut avoir plusieurs écritures : fraction, écriture décimale, pourcentage.",
          proprietes: ["$\\dfrac{a}{b} = a \\div b$.", "$p\\,\\% = \\dfrac{p}{100}$.", "Un nombre est décimal s'il peut s'écrire avec un nombre fini de chiffres après la virgule ; $\\dfrac{1}{3}$ n'est pas décimal."],
          exemple: "$\\dfrac{3}{4} = 3 \\div 4 = 0{,}75 = \\dfrac{75}{100} = 75\\,\\%$.",
        }),
      ]),
      ch("m6-calculs", "Calculs", NC, [
        n("m6-calculs-vocabulaire", "Vocabulaire des opérations", {
          definition: "Le résultat d'une addition est une somme (de termes), d'une soustraction une différence, d'une multiplication un produit (de facteurs), d'une division un quotient.",
          proprietes: ["Dans $a + b$, $a$ et $b$ sont les termes.", "Dans $a \\times b$, $a$ et $b$ sont les facteurs."],
        }),
        n("m6-calculs-divisibilite", "Multiples, diviseurs, critères de divisibilité", {
          definition: "$a$ est divisible par $b$ si le reste de la division euclidienne de $a$ par $b$ est nul : $a$ est alors un multiple de $b$.",
          proprietes: ["Par 2 : chiffre des unités pair.", "Par 5 : chiffre des unités 0 ou 5.", "Par 10 : chiffre des unités 0.", "Par 3 (resp. 9) : somme des chiffres divisible par 3 (resp. 9).", "Par 4 : nombre formé par les deux derniers chiffres divisible par 4."],
          exemple: "$2\\,358$ : $2+3+5+8 = 18$, donc divisible par 3 et par 9.",
        }),
        n("m6-calculs-mental", "Calcul mental et calcul réfléchi", {
          definition: "Multiplier par 10, 100, 1 000 décale chaque chiffre de 1, 2, 3 rangs vers la gauche (la virgule « se déplace » vers la droite).",
          proprietes: ["Multiplier par $0{,}1$ revient à diviser par 10.", "Diviser par 10, 100… décale les chiffres vers la droite."],
        }),
      ]),
      ch("m6-proportionnalite", "Proportionnalité", GD, [
        n("m6-proportionnalite-tableau", "Tableaux de proportionnalité", {
          definition: "Deux grandeurs sont proportionnelles si l'on obtient les valeurs de l'une en multipliant celles de l'autre par un même nombre, le coefficient de proportionnalité.",
          proprietes: ["Coefficient : $k = \\dfrac{y}{x}$ pour n'importe quelle colonne complète.", "On peut aussi utiliser la linéarité : additionner ou multiplier des colonnes."],
          exemple: "3 kg coûtent 7,50 € : $k = 7{,}5 \\div 3 = 2{,}5$ €/kg, donc 5 kg coûtent $5 \\times 2{,}5 = 12{,}50$ €.",
        }),
      ]),
      ch("m6-geometrie", "Géométrie", EG),
      ch("m6-grandeurs", "Grandeurs et mesures", GM),
      ch("m6-donnees", "Organisation et gestion de données", GD),
    ] },
    { id: "5e", label: "Cinquième", cycle: "Collège", chapters: [
      ch("m5-relatifs", "Nombres relatifs", NC, [
        n("m5-relatifs-somme", "Addition et soustraction de relatifs", {
          definition: "Un nombre relatif est formé d'un signe et d'une distance à zéro.",
          proprietes: ["Même signe : on additionne les distances à zéro et on garde le signe.", "Signes contraires : on soustrait les distances à zéro et on prend le signe de celui qui a la plus grande distance à zéro.", "Soustraire un nombre revient à ajouter son opposé : $a - b = a + (-b)$."],
          exemple: "$(-7) - (-3) = (-7) + (+3) = -4$.",
        }),
        n("m5-relatifs-priorites", "Priorités opératoires", {
          definition: "Dans un calcul, on effectue dans l'ordre : les calculs entre parenthèses, puis multiplications et divisions (de gauche à droite), puis additions et soustractions.",
          proprietes: ["Les parenthèses les plus intérieures d'abord.", "En l'absence de parenthèses, × et ÷ sont prioritaires sur + et −."],
          exemple: "$5 + 2 \\times (7 - 3) = 5 + 2 \\times 4 = 5 + 8 = 13$.",
        }),
      ]),
      ch("m5-fractions", "Fractions", NC),
      ch("m5-calcul-litteral", "Calcul littéral", NC, [
        n("m5-litteral-reduire", "Réduire une expression", {
          definition: "Réduire une expression, c'est l'écrire avec le moins de termes possible en regroupant les termes semblables.",
          proprietes: ["$ax + bx = (a + b)x$.", "On ne peut pas regrouper un terme en $x$, un terme en $x^2$ et une constante.", "$x \\times x = x^2$."],
          exemple: "$3x + 5 - 7x + 2 = (3 - 7)x + (5 + 2) = -4x + 7$.",
        }),
      ]),
      ch("m5-proportionnalite", "Proportionnalité", GD),
      ch("m5-symetrie", "Symétrie centrale", EG),
      ch("m5-geometrie", "Géométrie et repérage", EG, [
        n("m5-geometrie-reperage", "Se repérer dans le plan", {
          definition: "Dans un repère, chaque point est repéré par un couple de nombres relatifs : son abscisse (axe horizontal) et son ordonnée (axe vertical).",
          proprietes: ["On note $A(x_A\\,;\\,y_A)$, l'abscisse toujours en premier.", "L'origine $O$ a pour coordonnées $(0\\,;\\,0)$."],
        }),
      ]),
      ch("m5-statistiques", "Statistiques", GD),
    ] },
    { id: "4e", label: "Quatrième", cycle: "Collège", chapters: [
      ch("m4-puissances", "Puissances", NC, [
        n("m4-puissances-regles", "Règles de calcul sur les puissances", {
          definition: "Pour $n$ entier positif, $a^n = a \\times a \\times \\dots \\times a$ ($n$ facteurs) et $a^{-n} = \\dfrac{1}{a^n}$ ($a \\neq 0$). Par convention $a^0 = 1$.",
          proprietes: ["$a^m \\times a^n = a^{m+n}$", "$\\dfrac{a^m}{a^n} = a^{m-n}$", "$(a^m)^n = a^{mn}$", "$10^n$ s'écrit avec un 1 suivi de $n$ zéros ; $10^{-n} = 0{,}0\\dots01$ ($n$ chiffres après la virgule)."],
        }),
      ]),
      ch("m4-calcul-litteral", "Calcul littéral", NC),
      ch("m4-equations", "Équations", NC, [
        n("m4-equations-resoudre", "Résoudre une équation du premier degré", {
          definition: "Résoudre une équation d'inconnue $x$, c'est trouver toutes les valeurs de $x$ pour lesquelles l'égalité est vraie.",
          proprietes: ["On peut ajouter ou soustraire un même nombre aux deux membres.", "On peut multiplier ou diviser les deux membres par un même nombre non nul."],
          methode: ["Regrouper les termes en $x$ dans un membre.", "Regrouper les constantes dans l'autre.", "Diviser par le coefficient de $x$.", "Vérifier en remplaçant $x$ par la solution."],
          exemple: "$5x - 3 = 2x + 9 \\iff 3x = 12 \\iff x = 4$.",
        }),
      ]),
      ch("m4-pythagore", "Théorème de Pythagore", EG, [
        n("m4-pythagore-calcul", "Calculer une longueur", {
          definition: "Dans un triangle rectangle, l'hypoténuse est le côté opposé à l'angle droit ; c'est le plus long côté.",
          proprietes: ["Théorème de Pythagore : si $ABC$ est rectangle en $B$, alors $AC^2 = AB^2 + BC^2$."],
          methode: ["Identifier l'angle droit et l'hypoténuse.", "Écrire l'égalité de Pythagore.", "Remplacer par les valeurs connues et isoler le carré cherché.", "Prendre la racine carrée (valeur exacte ou arrondie)."],
        }),
      ]),
      ch("m4-thales", "Théorème de Thalès", EG),
      ch("m4-proportionnalite", "Proportionnalité", GD),
      ch("m4-statistiques", "Statistiques et probabilités", GD, [
        n("m4-stats-indicateurs", "Moyenne, médiane, étendue", {
          definition: "La moyenne d'une série est la somme des valeurs divisée par l'effectif total. La médiane partage la série rangée en deux parties de même effectif.",
          proprietes: ["Effectif impair $N$ : la médiane est la valeur de rang $\\dfrac{N+1}{2}$.", "Effectif pair : la médiane est la moyenne des valeurs de rangs $\\dfrac{N}{2}$ et $\\dfrac{N}{2} + 1$.", "Étendue = plus grande valeur − plus petite valeur."],
        }),
      ]),
    ] },
    { id: "3e", label: "Troisième", cycle: "Collège", chapters: [
      ch("m3-fonctions", "Fonctions", GD, [
        n("m3-fonctions-affines", "Fonctions linéaires et affines", {
          definition: "Une fonction affine est de la forme $f(x) = ax + b$. Sa représentation graphique est une droite ; $a$ est le coefficient directeur et $b$ l'ordonnée à l'origine.",
          proprietes: ["$b = f(0)$.", "$a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$ : quand $x$ augmente de 1, $f(x)$ augmente de $a$.", "Si $b = 0$, la fonction est linéaire (droite passant par l'origine)."],
        }),
      ]),
      ch("m3-arithmetique", "Arithmétique : nombres premiers, diviseurs et multiples", NC),
      ch("m3-puissances", "Fractions, puissances et racines carrées", NC),
      ch("m3-pourcentages", "Ratios, pourcentages et évolutions", GD),
      ch("m3-equations", "Équations et inéquations", NC),
      ch("m3-thales", "Théorème de Thalès", EG),
      ch("m3-pythagore", "Théorème de Pythagore et réciproque", EG, [
        n("m3-pythagore-reciproque", "Démontrer qu'un triangle est rectangle", {
          definition: "La réciproque du théorème de Pythagore permet de prouver qu'un triangle est rectangle.",
          proprietes: ["Réciproque : si $XZ^2 = XY^2 + YZ^2$ (avec $[XZ]$ le plus long côté), alors le triangle $XYZ$ est rectangle en $Y$.", "Contraposée : si $XZ^2 \\neq XY^2 + YZ^2$, le triangle n'est pas rectangle."],
          methode: ["Repérer le plus long côté.", "Calculer séparément son carré et la somme des carrés des deux autres côtés.", "Comparer et conclure en citant la propriété utilisée."],
        }),
      ]),
      ch("m3-trigonometrie", "Trigonométrie", EG, [
        n("m3-trigo-calculs", "Cosinus, sinus, tangente", {
          definition: "Dans un triangle rectangle, pour un angle aigu : $\\cos = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$, $\\sin = \\dfrac{\\text{opposé}}{\\text{hypoténuse}}$, $\\tan = \\dfrac{\\text{opposé}}{\\text{adjacent}}$.",
          proprietes: ["Pour une longueur : on écrit le rapport adapté puis on isole l'inconnue.", "Pour un angle : on utilise $\\cos^{-1}$, $\\sin^{-1}$ ou $\\tan^{-1}$ de la calculatrice (en mode degrés)."],
        }),
      ]),
      ch("m3-probabilites", "Probabilités", GD, [
        n("m3-probas-calcul", "Calculer une probabilité", {
          definition: "Lors d'une expérience aléatoire, la probabilité d'un événement est un nombre entre 0 et 1.",
          proprietes: ["En situation d'équiprobabilité : $P(A) = \\dfrac{\\text{nombre d'issues favorables}}{\\text{nombre d'issues possibles}}$.", "$P(\\overline{A}) = 1 - P(A)$.", "La somme des probabilités de toutes les issues vaut 1."],
        }),
      ]),
      ch("m3-statistiques", "Statistiques", GD),
      ch("m3-algorithmique", "Algorithmique et programmation", AP),
    ] },
    { id: "2nde", label: "Seconde", cycle: "Lycée", chapters: [
      ch("m2-calculs", "Nombres et calculs", LY_NC, [
        n("m2-calculs-litteral", "Développer, factoriser, identités remarquables", {
          definition: "Développer, c'est transformer un produit en somme ; factoriser, c'est transformer une somme en produit.",
          proprietes: ["$(a+b)^2 = a^2 + 2ab + b^2$", "$(a-b)^2 = a^2 - 2ab + b^2$", "$(a+b)(a-b) = a^2 - b^2$", "Double distributivité : $(a+b)(c+d) = ac + ad + bc + bd$."],
        }),
      ]),
      ch("m2-fonctions", "Fonctions", LY_F, [
        n("m2-fonctions-lecture", "Images et antécédents", {
          definition: "Si $f(a) = b$, on dit que $b$ est l'image de $a$ par $f$ et que $a$ est un antécédent de $b$.",
          proprietes: ["Un nombre a une seule image ; il peut avoir zéro, un ou plusieurs antécédents.", "Graphiquement, les antécédents de $k$ sont les abscisses des points d'intersection de la courbe avec la droite $y = k$."],
        }),
      ]),
      ch("m2-geometrie", "Géométrie (vecteurs, repérage)", LY_G),
      ch("m2-statistiques", "Statistiques", LY_SP),
      ch("m2-probabilites", "Probabilités", LY_SP),
      ch("m2-algorithmique", "Algorithmique et programmation", LY_AP),
    ] },
    { id: "1re", label: "Première", cycle: "Lycée", chapters: [
      ch("m1-suites", "Suites", LY_AL, [
        n("m1-suites-arithmetiques", "Suites arithmétiques", {
          definition: "Une suite $(u_n)$ est arithmétique s'il existe un réel $r$ (la raison) tel que, pour tout $n$, $u_{n+1} = u_n + r$.",
          proprietes: ["$u_n = u_0 + nr$ et, plus généralement, $u_n = u_p + (n-p)r$.", "$1 + 2 + \\dots + n = \\dfrac{n(n+1)}{2}$.", "Somme de termes consécutifs : nombre de termes $\\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$."],
        }),
      ]),
      ch("m1-derivation", "Dérivation", LY_F, [
        n("m1-derivation-calcul", "Calcul de fonctions dérivées", {
          definition: "Le nombre dérivé $f'(a)$ est le coefficient directeur de la tangente à la courbe de $f$ au point d'abscisse $a$.",
          proprietes: ["$(k)' = 0$, $(x)' = 1$, $(x^n)' = nx^{n-1}$, $\\left(\\dfrac{1}{x}\\right)' = -\\dfrac{1}{x^2}$, $(\\sqrt{x})' = \\dfrac{1}{2\\sqrt{x}}$.", "$(u+v)' = u' + v'$, $(ku)' = ku'$, $(uv)' = u'v + uv'$."],
        }),
      ]),
      ch("m1-fonctions", "Fonction exponentielle et second degré", LY_F),
      ch("m1-trigonometrie", "Trigonométrie", LY_G),
      ch("m1-probabilites", "Probabilités conditionnelles", LY_SP),
      ch("m1-geometrie", "Géométrie repérée, produit scalaire", LY_G),
    ] },
    { id: "Tle", label: "Terminale", cycle: "Lycée", chapters: [
      ch("mT-limites", "Limites de fonctions", LY_F, [
        n("mT-limites-fonctions", "Limites en l'infini", {
          definition: "On note $\\lim_{x \\to +\\infty} f(x) = \\ell$ si $f(x)$ devient aussi proche que l'on veut de $\\ell$ pour $x$ assez grand.",
          proprietes: ["En $\\pm\\infty$, un polynôme a la limite de son terme de plus haut degré.", "Une fonction rationnelle a la limite du quotient des termes de plus haut degré."],
        }),
      ]),
      ch("mT-continuite", "Continuité", LY_F),
      ch("mT-derivation", "Dérivation et convexité", LY_F),
      ch("mT-integration", "Primitives et intégrales", LY_F, [
        n("mT-integration-calcul", "Calculer une intégrale", {
          definition: "$F$ est une primitive de $f$ sur $I$ si $F' = f$ sur $I$. Deux primitives diffèrent d'une constante.",
          proprietes: ["Une primitive de $x^n$ ($n \\neq -1$) est $\\dfrac{x^{n+1}}{n+1}$.", "$\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x = F(b) - F(a)$."],
        }),
      ]),
      ch("mT-suites", "Suites et récurrence", LY_AL),
      ch("mT-probabilites", "Probabilités (loi binomiale)", LY_SP),
      ch("mT-combinatoire", "Combinatoire et dénombrement", LY_AL),
      ch("mT-espace", "Géométrie dans l'espace", LY_G),
    ] },
  ],
  pc: [
    { id: "6e", label: "Sixième", cycle: "Collège", chapters: [
      ch("p6-matiere", "Matière, mouvement, énergie, information", "Sciences et technologie (cycle 3)", [
        n("p6-matiere-mesures", "Mesurer et convertir", {
          definition: "Une grandeur physique s'exprime avec une valeur et une unité. Convertir, c'est exprimer la même grandeur dans une autre unité.",
          proprietes: ["1 L = 1 000 mL = 100 cL ; 1 cm³ = 1 mL ; 1 dm³ = 1 L.", "1 kg = 1 000 g ; 1 t = 1 000 kg.", "1 h = 60 min = 3 600 s (système non décimal)."],
        }),
      ]),
    ] },
    { id: "5e", label: "Cinquième", cycle: "Collège", chapters: [
      ch("p5-matiere", "Matière et transformations", PM, [
        n("p5-matiere-etats", "États physiques et changements d'état", {
          definition: "La matière existe principalement sous trois états physiques : solide, liquide, gazeux.",
          proprietes: ["Fusion (solide → liquide), solidification (liquide → solide), vaporisation (liquide → gaz), liquéfaction (gaz → liquide), sublimation (solide → gaz), condensation (gaz → solide).", "Au cours d'un changement d'état, la masse se conserve, le volume peut varier.", "Pour un corps pur, la température reste constante pendant le changement d'état (ex. : l'eau pure fond à 0 °C)."],
        }),
        n("p5-matiere-melanges", "Mélanges et solutions", {
          definition: "Un corps pur ne contient qu'une seule espèce chimique ; un mélange en contient plusieurs.",
          proprietes: ["Mélange homogène : on ne distingue qu'une seule phase à l'œil nu (eau salée).", "Mélange hétérogène : on distingue plusieurs phases (eau + huile).", "Une solution est obtenue en dissolvant un soluté dans un solvant."],
        }),
      ]),
      ch("p5-mouvement", "Mouvement", PMI),
      ch("p5-energie", "Énergie", PE),
      ch("p5-signaux", "Lumière et son", PS),
    ] },
    { id: "4e", label: "Quatrième", cycle: "Collège", chapters: [
      ch("p4-matiere", "Atomes et molécules", PM, [
        n("p4-matiere-molecules", "Formules chimiques", {
          definition: "Une molécule est un assemblage d'atomes. Sa formule chimique indique la nature et le nombre de chaque type d'atome.",
          proprietes: ["Chaque atome est représenté par un symbole (C, H, O, N…).", "L'indice en bas à droite indique le nombre d'atomes ; pas d'indice = 1."],
          exemple: "$\\mathrm{C_2H_6O}$ (éthanol) : 2 atomes de carbone, 6 d'hydrogène, 1 d'oxygène.",
        }),
      ]),
      ch("p4-mouvement", "Mouvement et vitesse", PMI, [
        n("p4-mouvement-vitesse", "Vitesse moyenne", {
          definition: "La vitesse moyenne est le quotient de la distance parcourue par la durée du parcours : $v = \\dfrac{d}{t}$.",
          proprietes: ["Unité SI : m/s ; usuelle : km/h.", "$1\\ \\text{m/s} = 3{,}6\\ \\text{km/h}$."],
        }),
      ]),
      ch("p4-electricite", "Électricité et circuits", PE, [
        n("p4-electricite-lois", "Lois des circuits", {
          definition: "La tension (en V) se mesure avec un voltmètre branché en dérivation ; l'intensité (en A) avec un ampèremètre branché en série.",
          proprietes: ["Série : l'intensité est la même partout ; la tension du générateur est la somme des tensions des autres dipôles.", "Dérivation : la tension est la même aux bornes des branches ; l'intensité de la branche principale est la somme des intensités des branches dérivées (loi des nœuds)."],
        }),
        n("p4-electricite-ohm", "Loi d'Ohm", {
          definition: "Pour une résistance (conducteur ohmique), la tension à ses bornes est proportionnelle à l'intensité qui la traverse.",
          proprietes: ["$U = R \\times I$ avec $U$ en V, $R$ en Ω, $I$ en A.", "$I = \\dfrac{U}{R}$ et $R = \\dfrac{U}{I}$."],
        }),
      ]),
      ch("p4-signaux", "Lumière et son", PS, [
        n("p4-signaux-propagation", "Propagation de la lumière et du son", {
          definition: "Le son est une vibration qui se propage dans un milieu matériel ; la lumière peut se propager dans le vide.",
          proprietes: ["Vitesse du son dans l'air ≈ 340 m/s ; dans l'eau ≈ 1 500 m/s.", "Vitesse de la lumière dans le vide ≈ 300 000 km/s.", "Fréquences audibles : environ 20 Hz à 20 000 Hz."],
        }),
      ]),
    ] },
    { id: "3e", label: "Troisième", cycle: "Collège", chapters: [
      ch("p3-matiere", "Transformations chimiques, ions", PM),
      ch("p3-mouvement", "Forces et interactions", PMI, [
        n("p3-mouvement-poids", "Poids et masse", {
          definition: "Le poids est la force d'attraction gravitationnelle exercée par un astre sur un objet ; il se mesure en newtons (N) avec un dynamomètre.",
          proprietes: ["$P = m \\times g$ ($g$ en N/kg).", "Sur Terre $g \\approx 9{,}81$ N/kg ; sur la Lune $g \\approx 1{,}62$ N/kg.", "La masse (en kg) ne dépend pas du lieu."],
        }),
      ]),
      ch("p3-energie", "Énergie et puissance", PE, [
        n("p3-energie-puissance", "Énergie électrique et puissance", {
          definition: "L'énergie consommée par un appareil dépend de sa puissance et de sa durée de fonctionnement.",
          proprietes: ["$E = P \\times t$.", "$P$ en W et $t$ en s : $E$ en J ; $P$ en kW et $t$ en h : $E$ en kWh.", "$1\\ \\text{kWh} = 3{,}6 \\times 10^6\\ \\text{J}$."],
        }),
      ]),
      ch("p3-signaux", "Signaux", PS),
    ] },
    { id: "2nde", label: "Seconde", cycle: "Lycée", chapters: [
      ch("p2-matiere", "Constitution de la matière", LM, [
        n("p2-matiere-atome", "Structure de l'atome", {
          definition: "Un atome est constitué d'un noyau (protons et neutrons, les nucléons) et d'électrons. Notation : $^{A}_{Z}\\mathrm{X}$.",
          proprietes: ["$Z$ : nombre de protons ; $A$ : nombre de nucléons ; $N = A - Z$ neutrons.", "Atome neutre : $Z$ électrons. Ion $\\mathrm{X}^{n+}$ : $Z - n$ électrons ; ion $\\mathrm{X}^{n-}$ : $Z + n$ électrons."],
        }),
        n("p2-matiere-mole", "Quantité de matière", {
          definition: "La mole est l'unité de quantité de matière : une mole contient $N_A = 6{,}02 \\times 10^{23}$ entités.",
          proprietes: ["$n = \\dfrac{m}{M}$ ($m$ en g, $M$ en g·mol⁻¹).", "$n = \\dfrac{N}{N_A}$."],
        }),
        n("p2-matiere-concentration", "Solutions : concentration, dilution", {
          definition: "La concentration en masse d'un soluté est $C_m = \\dfrac{m}{V}$ (g·L⁻¹).",
          proprietes: ["Lors d'une dilution, la masse (ou quantité) de soluté se conserve : $C_0 V_0 = C_1 V_1$.", "Facteur de dilution : $F = \\dfrac{C_0}{C_1} = \\dfrac{V_1}{V_0}$."],
        }),
      ]),
      ch("p2-transformations", "Transformations de la matière", LM, [
        n("p2-transformations-equations", "Équations de réaction", {
          definition: "Une équation de réaction modélise une transformation chimique : réactifs → produits.",
          proprietes: ["Elle doit respecter la conservation des éléments et des charges.", "On ajuste avec les plus petits nombres stœchiométriques entiers, sans modifier les formules."],
        }),
      ]),
      ch("p2-mouvement", "Mouvements et forces", LMI),
      ch("p2-ondes", "Ondes et signaux", LO, [
        n("p2-ondes-refraction", "Réfraction de la lumière", {
          definition: "La réfraction est le changement de direction de la lumière lorsqu'elle traverse la surface de séparation entre deux milieux transparents.",
          proprietes: ["Loi de Snell-Descartes : $n_1 \\sin i_1 = n_2 \\sin i_2$ (angles mesurés par rapport à la normale).", "Indices : air 1,00 ; eau 1,33 ; verre ≈ 1,5."],
        }),
        n("p2-ondes-signaux", "Signaux périodiques", {
          definition: "Un signal périodique se répète identique à lui-même à intervalles de temps égaux : la période $T$.",
          proprietes: ["$f = \\dfrac{1}{T}$ ($T$ en s, $f$ en Hz).", "L'amplitude est la valeur maximale du signal."],
        }),
      ]),
    ] },
    { id: "1re", label: "Première", cycle: "Lycée", chapters: [
      ch("p1-matiere", "Suivi d'une transformation", LM),
      ch("p1-mouvement", "Mouvement et forces", LMI),
      ch("p1-energie", "Énergie mécanique", LE, [
        n("p1-energie-mecanique", "Conservation de l'énergie mécanique", {
          definition: "L'énergie mécanique est la somme de l'énergie cinétique et de l'énergie potentielle de pesanteur : $E_m = E_c + E_{pp}$.",
          proprietes: ["$E_c = \\dfrac{1}{2} m v^2$ ; $E_{pp} = m g z$ (axe vertical vers le haut).", "En l'absence de frottements, $E_m$ se conserve."],
        }),
      ]),
      ch("p1-ondes", "Ondes mécaniques et lumière", LO),
    ] },
    { id: "Tle", label: "Terminale", cycle: "Lycée", chapters: [
      ch("pT-acide-base", "Acides et bases", LM, [
        n("pT-acide-base-ph", "pH d'une solution", {
          definition: "Le pH d'une solution aqueuse diluée est défini par $\\mathrm{pH} = -\\log\\left(\\dfrac{[\\mathrm{H_3O^+}]}{c^\\circ}\\right)$ avec $c^\\circ = 1$ mol·L⁻¹.",
          proprietes: ["$[\\mathrm{H_3O^+}] = c^\\circ \\times 10^{-\\mathrm{pH}}$.", "À 25 °C : pH < 7 acide, pH = 7 neutre, pH > 7 basique."],
        }),
      ]),
      ch("pT-oxydoreduction", "Oxydoréduction", LM),
      ch("pT-mecanique", "Lois de Newton", LMI),
      ch("pT-thermo", "Thermodynamique", LE),
      ch("pT-radioactivite", "Radioactivité", LM, [
        n("pT-radioactivite-demi-vie", "Décroissance radioactive", {
          definition: "La désintégration d'un noyau radioactif est aléatoire ; à l'échelle d'un grand nombre de noyaux, $N(t) = N_0 e^{-\\lambda t}$.",
          proprietes: ["Demi-vie : $t_{1/2} = \\dfrac{\\ln 2}{\\lambda}$.", "Après $n$ demi-vies, il reste $\\dfrac{N_0}{2^n}$ noyaux."],
        }),
      ]),
      ch("pT-ondes", "Ondes et lumière", LO),
    ] },
  ],
};

export function findLevel(subject: Subject, level: string) {
  return CURRICULUM[subject].find((l) => l.id === level);
}
export function findChapter(subject: Subject, chapterId: string) {
  for (const l of CURRICULUM[subject]) {
    const c = l.chapters.find((c) => c.id === chapterId);
    if (c) return { level: l, chapter: c };
  }
  return null;
}
export function findNotion(notionId: string) {
  for (const s of ["maths", "pc"] as Subject[])
    for (const l of CURRICULUM[s])
      for (const c of l.chapters) {
        const no = c.notions.find((x) => x.id === notionId);
        if (no) return { subject: s, level: l, chapter: c, notion: no };
      }
  return null;
}
export const levelLabel = (id: string) => LEVELS.find((l) => l.id === id)?.short ?? id;
