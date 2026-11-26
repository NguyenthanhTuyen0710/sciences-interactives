import Link from "next/link";
import { sql } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { allMetas } from "@/lib/content/registry";
import { LEVELS } from "@/lib/content/curriculum";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import { db, schema } from "@/lib/db";
import { userDashboard } from "@/lib/progress";
import { dailyItems, todayKey } from "@/lib/series";
import { Bar, ChapterCard, ExerciseCard, chapterSummary, countsLabel, levelCounts, levelTone, plural } from "@/components/ui";
import RecentList from "@/components/RecentList";
import { Fraunces } from "next/font/google";

export const dynamic = "force-dynamic";

/** Sections « Recommandés pour toi » et « Thèmes populaires » : masquées sur l'accueil (décision D5), code et données conservés. */
const SHOW_DISCOVERY = false;
const HERO_LEVELS = ["3e", "2nde", "1re", "Tle"];
const LATEST_COUNT = 6;
// Titre du bandeau : Fraunces (SIL Open Font License 1.1), auto-hébergée au build par next/font (aucun appel à Google côté navigateur).
const display = Fraunces({ subsets: ["latin"], weight: ["700"], display: "swap" });

export default async function Home() {
  const [user, metas] = await Promise.all([getUser(), allMetas()]);
  const byId = new Map(metas.map((m) => [m.id, m]));
  const chapters = ALL_CHAPTERS.map((c) => chapterSummary(c, isVisible(c)));
  // Ordre d'inscription dans le registre (src/lib/chapters/index.ts) : le dernier inscrit en premier.
  const latest = [...chapters].reverse().slice(0, LATEST_COUNT);
  const exampleChapter = [...ALL_CHAPTERS].reverse().find(isVisible) ?? null;
  const example = exampleChapter ? chapterSummary(exampleChapter, true) : null;
  const daily = dailyItems(metas);
  const dash = user ? await userDashboard(user.id, user.level) : null;
  const others = LEVELS.filter((l) => !HERO_LEVELS.includes(l.id));

  return (
    <div className="space-y-12">
      {/* Accroche et choix de la classe : fond crème clair (sombre : vert très foncé), motifs maths / chimie en marge */}
      <section aria-labelledby="accroche" className="relative overflow-hidden rounded-3xl border border-[#eee3cc] bg-[#fffaf0] px-5 pb-10 pt-20 text-[#14281d] shadow-sm [background-image:radial-gradient(ellipse_at_0%_0%,#ffefc4_0%,transparent_55%),radial-gradient(ellipse_at_100%_0%,#dcedfb_0%,transparent_55%)] sm:px-10 sm:pb-14 lg:pt-14 dark:border-[#20352a] dark:bg-[#0e1913] dark:text-[#eef7f1] dark:[background-image:radial-gradient(ellipse_at_0%_0%,#262712_0%,transparent_55%),radial-gradient(ellipse_at_100%_0%,#10283a_0%,transparent_55%)]">
        <HeroMotifs />
        <div className="relative max-w-2xl">
          <h1 id="accroche" className={`${display.className} text-4xl leading-tight sm:text-5xl`}>
            Comprendre{" "}
            <span className="relative inline-block pb-3 text-[#1e6b46] dark:text-[#8fdcb1]">
              en faisant
              <svg aria-hidden focusable="false" viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-3 w-full text-[#e0603f] dark:text-[#f59c80]">
                <path d="M3 8 C 40 3, 70 11, 105 6 S 170 2, 197 7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>
            , à ton rythme.
          </h1>
          <p className="mt-5 text-[#3a4a40] sm:text-lg dark:text-[#c4d4c9]">Des cours clairs, des exercices corrigés tout de suite, la plupart avec des valeurs renouvelées à chaque essai, et des jeux pour fixer les réflexes, en mathématiques et en physique-chimie.</p>
        </div>
        <nav aria-label="Choisir ta classe" className="relative mt-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#1e6b46] dark:text-[#8fdcb1]">Choisis ta classe</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HERO_LEVELS.map((id) => {
              const l = LEVELS.find((x) => x.id === id)!;
              const tone = levelTone(id);
              return (
                <li key={id}>
                  <Link href={`/chapitres?niveau=${id}`} className={`flex h-full flex-col gap-1 rounded-2xl border-2 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone.chip} ${tone.accent}`}>
                    <span className="text-2xl font-black">{l.short}</span>
                    <span className="text-sm font-medium">{countsLabel(levelCounts(chapters, id, null))}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-[#3a4a40] dark:text-[#c4d4c9]">
            Collège :{" "}
            {others.map((l, i) => <span key={l.id}>{i > 0 && " · "}<Link href={`/chapitres?niveau=${l.id}`} className="font-bold text-[#1e6b46] underline underline-offset-2 dark:text-[#8fdcb1]">{l.short}</Link></span>)}
          </p>
        </nav>
        <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/chapitres" className="inline-flex items-center rounded-xl border-b-4 border-[#b4472c] bg-[#f4845f] px-5 py-2.5 font-bold text-[#2a0d05] transition hover:bg-[#f6957a] active:translate-y-0.5 active:border-b-2">Explorer les chapitres</Link>
          <p className="text-sm font-medium text-[#3a4a40] dark:text-[#c4d4c9]">Gratuit et sans publicité. Un compte sert seulement à garder ta progression.</p>
        </div>
      </section>

      {/* Les trois formats, sur un chapitre réel */}
      {exampleChapter && example?.href && (
        <section aria-labelledby="formats">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="formats" className="text-2xl font-black">Chaque chapitre, en trois formats</h2>
              <p className="text-slate-600">Exemple : <Link href={example.href} className="font-semibold text-indigo-600 hover:underline">{example.title}</Link> ({example.level}).</p>
            </div>
            <Link href="/chapitres" className="text-sm font-semibold text-indigo-600 hover:underline">Tous les chapitres →</Link>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              { n: 1, title: "Le cours", href: "#cours", text: `${plural(exampleChapter.lesson.properties.length, "propriété", "propriétés")}, ${plural(exampleChapter.lesson.workedExamples.length, "exemple corrigé", "exemples corrigés")} et ${plural(exampleChapter.lesson.methods.length, "méthode", "méthodes")} pas à pas.` },
              { n: 2, title: "Les exercices", href: "#exercices", text: `${plural(example.exercises, "exercice", "exercices")} sur ${plural(new Set(exampleChapter.exercises.map((e) => e.niveau)).size, "niveau", "niveaux")} de difficulté, dont ${exampleChapter.exercises.filter((e) => e.vary).length} aux valeurs renouvelées à chaque essai, corrigés tout de suite.` },
              { n: 3, title: "Les jeux", href: "#activites", text: `${plural(example.games, "jeu", "jeux")} pour t'entraîner autrement : ${exampleChapter.games.map((g) => g.title).join(", ")}.` },
            ].map((s) => (
              <li key={s.n}>
                <Link href={`${example.href}${s.href}`} className="card group flex h-full gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-lg font-black text-white">{s.n}</span>
                  <span>
                    <span className="block text-lg font-bold group-hover:text-indigo-700">{s.title}</span>
                    <span className="mt-1 block text-sm text-slate-600">{s.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Derniers chapitres (les brouillons restent visibles et non cliquables) */}
      <section aria-labelledby="derniers">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 id="derniers" className="text-2xl font-black">Derniers chapitres</h2>
          <Link href="/chapitres" className="text-sm font-semibold text-indigo-600 hover:underline">Voir tout →</Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((c) => <li key={c.id}><ChapterCard c={c} /></li>)}
        </ul>
      </section>

      {/* Défi du jour + Reprendre */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="defi" className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 id="defi" className="text-lg font-bold">Défi du jour</h2>
            <span className="text-xs text-slate-600">{new Date(todayKey()).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{plural(daily.length, "exercice", "exercices")}, les mêmes pour tout le monde aujourd'hui.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm marker:text-slate-500">
            {daily.map((d, i) => <li key={i}>{byId.get(d.id)?.title}</li>)}
          </ol>
          <Link href="/revisions/defi-du-jour" className="btn-primary mt-4 w-full">Relever le défi</Link>
        </section>

        <section aria-labelledby="reprendre" className="card p-5">
          <h2 id="reprendre" className="text-lg font-bold">Reprendre</h2>
          {dash && dash.chapters.length > 0 && (
            <div className="mt-3 space-y-3">
              {dash.chapters.slice(0, 3).map((c) => (
                <div key={c.chapterId} className="text-sm"><div className="mb-1 flex justify-between gap-2"><span>{c.title}</span><span className="text-slate-600">{c.done}/{c.total}</span></div><Bar value={c.done / c.total} /></div>
              ))}
              <Link href="/mon-espace" className="text-sm font-semibold text-indigo-600 hover:underline">Ma progression complète →</Link>
            </div>
          )}
          <div className="mt-3"><RecentList /></div>
          {!user && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p>Crée un compte gratuit pour enregistrer tes résultats et suivre ta progression par chapitre.</p>
              <div className="flex flex-wrap gap-2"><Link href="/inscription" className="btn-primary">Créer un compte</Link><Link href="/connexion" className="btn-ghost">Connexion</Link></div>
            </div>
          )}
        </section>
      </div>

      {SHOW_DISCOVERY && <Discovery level={user?.level ?? null} byId={byId} recs={dash?.recs ?? []} />}
    </div>
  );
}

/** Ancienne partie « Recommandés » / « Populaires » de l'accueil, conservée telle quelle mais non affichée (SHOW_DISCOVERY). */
async function Discovery({ level, byId, recs }: { level: string | null; byId: Map<string, Awaited<ReturnType<typeof allMetas>>[number]>; recs: { exerciseId: string; difficulty: number; reason: string }[] }) {
  const metas = [...byId.values()];
  const popularRows = await db.select({ id: schema.attempts.exerciseId, n: sql<number>`count(*)::int` }).from(schema.attempts).groupBy(schema.attempts.exerciseId).orderBy(sql`count(*) desc`).limit(6);
  const fallback = ["m4-pythagore-longueur", "m6-comparer-fractions", "m4-equation-premier-degre", "p4-loi-ohm", "p2-equilibrer-equation", "m3-trigonometrie"];
  const popular = [...popularRows.map((r) => r.id), ...fallback].filter((id, i, a) => byId.has(id) && a.indexOf(id) === i).slice(0, 6).map((id) => byId.get(id)!);
  const recommended = recs.length ? recs.slice(0, 3) : null;
  const levelPicks = metas.filter((m) => !level || m.level === level).slice(0, 3);
  return (
    <>
      <section>
        <h2 className="mb-3 text-lg font-bold">Recommandés pour toi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended
            ? recommended.map((r) => byId.get(r.exerciseId) && <ExerciseCard key={r.exerciseId} m={byId.get(r.exerciseId)!} difficulty={r.difficulty} note={r.reason} />)
            : levelPicks.map((m) => <ExerciseCard key={m.id} m={m} />)}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Thèmes populaires</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((m) => <ExerciseCard key={m.id} m={m} />)}
        </div>
      </section>
    </>
  );
}

// ───────── Motifs du bandeau (SVG en ligne, décoratifs, sans animation) ─────────
// Géométrie calculée, pas dessinée à main levée : benzène de Kekulé (hexagone régulier, 3 doubles liaisons alternées),
// eau coudée (angle H–O–H = 104,5°), lithium selon Bohr (Z = 3 : 2 électrons puis 1), parabole y = x² (Bézier quadratique
// exacte), triangle rectangle avec son angle droit marqué au bon sommet.
const P = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`;

function Benzene({ x, y, r = 20 }: { x: number; y: number; r?: number }) {
  const v = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 180) * (60 * i - 90); return [x + r * Math.cos(a), y + r * Math.sin(a)] as const; });
  const inner = v.map(([vx, vy]) => [x + (vx - x) * 0.74, y + (vy - y) * 0.74] as const);
  const lerp = (a: readonly [number, number], b: readonly [number, number], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as const;
  return (
    <g>
      <path d={`M ${v.map(([a, b]) => P(a, b)).join(" L ")} Z`} />
      {[0, 2, 4].map((i) => { const a = lerp(inner[i], inner[(i + 1) % 6], 0.18), b = lerp(inner[i], inner[(i + 1) % 6], 0.82); return <path key={i} d={`M ${P(a[0], a[1])} L ${P(b[0], b[1])}`} />; })}
    </g>
  );
}

function Water({ x, y, l = 18 }: { x: number; y: number; l?: number }) {
  const half = (104.5 / 2) * (Math.PI / 180), gap = 6;
  const h = [-1, 1].map((sgn) => [x + sgn * l * Math.sin(half), y + l * Math.cos(half)] as const);
  return (
    <g>
      {h.map(([hx, hy], i) => { const ux = (hx - x) / l, uy = (hy - y) / l; return <path key={i} d={`M ${P(x + ux * gap, y + uy * gap)} L ${P(hx - ux * 4.5, hy - uy * 4.5)}`} />; })}
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">O</text>
      {h.map(([hx, hy], i) => <text key={i} x={hx} y={hy + 3.5} textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">H</text>)}
      <text x={x} y={y + 34} textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">H<tspan fontSize="7" dy="2.5">2</tspan><tspan dy="-2.5">O</tspan></text>
    </g>
  );
}

function Lithium({ x, y }: { x: number; y: number }) {
  const e = (r: number, deg: number) => <circle cx={x + r * Math.cos((deg * Math.PI) / 180)} cy={y + r * Math.sin((deg * Math.PI) / 180)} r="2" fill="currentColor" stroke="none" />;
  return (
    <g>
      <circle cx={x} cy={y} r="4.5" fill="currentColor" stroke="none" />
      <circle cx={x} cy={y} r="12" /><circle cx={x} cy={y} r="21" />
      {e(12, 0)}{e(12, 180)}{e(21, -50)}
      <text x={x} y={y + 36} textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">Li</text>
    </g>
  );
}

function Parabola({ x, y, u = 6 }: { x: number; y: number; u?: number }) {
  return (
    <g>
      <path d={`M ${P(x - 3.5 * u, y)} L ${P(x + 3.5 * u, y)} M ${P(x + 3.5 * u - 3, y - 2.5)} L ${P(x + 3.5 * u, y)} L ${P(x + 3.5 * u - 3, y + 2.5)}`} />
      <path d={`M ${P(x, y + 0.8 * u)} L ${P(x, y - 5 * u)} M ${P(x - 2.5, y - 5 * u + 3)} L ${P(x, y - 5 * u)} L ${P(x + 2.5, y - 5 * u + 3)}`} />
      <path d={`M ${P(x - 2 * u, y - 4 * u)} Q ${P(x, y + 4 * u)} ${P(x + 2 * u, y - 4 * u)}`} />
    </g>
  );
}

function RightTriangle({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${P(x, y)} L ${P(x + 34, y)} L ${P(x, y - 24)} Z`} />
      <path d={`M ${P(x + 6, y)} L ${P(x + 6, y - 6)} L ${P(x, y - 6)}`} />
    </g>
  );
}

const Glyph = ({ x, y, c }: { x: number; y: number; c: string }) => <text x={x} y={y} fontSize="22" fontFamily="Georgia, serif" fill="currentColor" stroke="none">{c}</text>;

/** Décor : petite bande en haut à droite sous 1024 px (3 motifs) ; grappe chimie en haut à droite dès 1024 px ; grappe maths en bas à droite dès 1280 px. Jamais sous le texte ni les boutons. */
function HeroMotifs() {
  const common = { "aria-hidden": true, focusable: "false" as const, fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, opacity: 0.4 };
  return (
    <div aria-hidden className="pointer-events-none select-none text-[#2a6f4c] dark:text-[#a3e0bf]">
      <svg data-motif {...common} viewBox="0 0 150 52" className="absolute right-4 top-3 h-12 w-auto lg:hidden">
        <Benzene x={22} y={24} r={17} /><Water x={78} y={14} l={15} /><Glyph x={120} y={34} c="π" />
      </svg>
      <svg data-motif {...common} viewBox="0 0 250 150" className="absolute right-6 top-6 hidden w-56 lg:block xl:w-72">
        <Benzene x={40} y={52} /><Lithium x={128} y={50} /><Water x={206} y={44} />
        <Glyph x={60} y={130} c="Σ" /><Glyph x={150} y={132} c="√" />
      </svg>
      <svg data-motif {...common} viewBox="0 0 250 84" className="absolute bottom-5 right-6 hidden w-64 xl:block">
        <Parabola x={44} y={72} u={8} /><RightTriangle x={112} y={72} /><Glyph x={182} y={72} c="π" />
      </svg>
    </div>
  );
}
