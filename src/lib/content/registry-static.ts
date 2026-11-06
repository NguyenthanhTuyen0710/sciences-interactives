// Version sans base de données (tests unitaires, scripts).
import * as MC from "./maths-college";
import * as M6 from "./maths-6e";
import * as ML from "./maths-lycee";
import * as PC from "./physique";
import type { Generator } from "../engine/types";
export const STATIC_GENERATORS: Generator[] = [...Object.values(MC), ...Object.values(M6), ...Object.values(ML), ...Object.values(PC)];
