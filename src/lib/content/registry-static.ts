// Version sans base de données (tests unitaires, scripts).
import * as MC from "./maths-college";
import * as ML from "./maths-lycee";
import * as PC from "./physique";
import type { Generator } from "../engine/types";
import { ALL_CHAPTERS, chapterGenerators } from "../chapters";
/** Tous les générateurs, y compris ceux des chapitres non publiés (pour les tests). */
export const STATIC_GENERATORS: Generator[] = [...Object.values(MC), ...Object.values(ML), ...Object.values(PC), ...chapterGenerators(ALL_CHAPTERS)];
