#!/usr/bin/env bash
# Régressions de portabilité vers l'hébergement (CageFS) : détection de Node, absence de dépendance à /dev/fd.
# Constat sur VinaHost : `done < <(commande)` échouait avec « /dev/fd/63: No such file or directory » et la détection de Node renvoyait « aucun exécutable trouvé »,
# alors que --node désignait un exécutable valide. Ce script reproduit cette situation avec un /dev minimal (espace de noms de montage) et ne dépend d'aucun accès au vrai compte.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
REAL_NODE=$(command -v node || true)
[ -n "$REAL_NODE" ] || { echo "node requis dans le PATH pour exécuter ces tests."; exit 2; }
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
NOK=0; NKO=0; NSK=0
pass() { NOK=$((NOK+1)); echo "  ok    $1"; }
nope() { NKO=$((NKO+1)); echo "  FAIL  $1"; }
skp()  { NSK=$((NSK+1)); echo "  SKIP  $1"; }

echo "== 1. Construits interdits dans les scripts d'exploitation (dépendent de /dev/fd)"
FILES=()
for f in "$HERE"/*.sh; do case "$(basename "$f")" in test-*) ;; *) FILES+=("$f");; esac; done
# Les lignes de commentaire qui expliquent l'interdiction ne comptent pas.
for pat in '<\(' '>\(' '/dev/fd' '/dev/stdin' '/proc/self/fd' 'coproc '; do
  if grep -nE -- "$pat" "${FILES[@]}" | grep -vE ':[0-9]+:[[:space:]]*#' >"$T/hits"; then nope "motif interdit « $pat » :"; sed 's/^/        /' "$T/hits"; else pass "aucun « $pat » dans ops/*.sh"; fi
done

echo "== 2. find_node : --node prioritaire, aucun repli silencieux, détection"
mkdir -p "$T/emptybin" "$T/fake22" "$T/fake20" "$T/home/nodevenv/app/22/bin" "$T/home0"
printf '#!/bin/sh\n[ "$1" = "-v" ] && echo v22.23.5\nexit 0\n' > "$T/fake22/node"
printf '#!/bin/sh\n[ "$1" = "-v" ] && echo v20.1.0\nexit 0\n' > "$T/fake20/node"
printf '#!/bin/sh\nexit 1\n' > "$T/broken-node"
cp "$T/fake22/node" "$T/home/nodevenv/app/22/bin/node"; printf 'pas exécutable\n' > "$T/not-exec"
chmod +x "$T/fake22/node" "$T/fake20/node" "$T/broken-node" "$T/home/nodevenv/app/22/bin/node"
fn() { # $1 = NODE_BIN ("" = non défini) ; $2 = PATH ; $3 = HOME ; $4 = version attendue ; affiche le résultat, code de retour de find_node
  ( [ -n "$1" ] && export NODE_BIN="$1"; export PATH="$2" HOME="$3"; . "$HERE/lib.sh"; find_node "$4" ); }
check() { # $1 libellé, $2 sortie attendue (ou "RC1"), reste = arguments de fn
  local label=$1 want=$2; shift 2; local out rc; out=$(fn "$@" 2>"$T/err"); rc=$?
  if [ "$want" = RC1 ]; then [ "$rc" -ne 0 ] && [ -z "$out" ] && pass "$label" || nope "$label (sortie « $out », code $rc)"
  else [ "$rc" -eq 0 ] && [ "$out" = "$want" ] && pass "$label" || nope "$label (sortie « $out », code $rc)"; fi
  [ -s "$T/err" ] && { nope "$label : message d'erreur inattendu"; sed 's/^/        /' "$T/err"; }; }
check "--node valide, aucun node dans le PATH : utilisé tel quel" "$T/fake22/node" "$T/fake22/node" "$T/emptybin" "$T/home0" 22.23.5
check "--node valide prime sur un autre node du PATH" "$T/fake22/node" "$T/fake22/node" "$T/fake20" "$T/home0" 22.23.5
check "--node valide prime même si une version exacte existe ailleurs" "$T/fake20/node" "$T/fake20/node" "$T/fake22" "$T/home" 22.23.5
check "--node inexistant : échec, sans repli sur le PATH" RC1 "$T/absent/node" "$T/fake22" "$T/home" 22.23.5
check "--node non exécutable : échec" RC1 "$T/not-exec" "$T/fake22" "$T/home" 22.23.5
check "--node qui ne répond pas à -v : échec" RC1 "$T/broken-node" "$T/fake22" "$T/home" 22.23.5
check "autodétection : node du PATH" "$T/fake22/node" "" "$T/fake22" "$T/home0" 22.23.5
check "autodétection : ~/nodevenv/*/*/bin/node" "$T/home/nodevenv/app/22/bin/node" "" "$T/emptybin" "$T/home" 22.23.5
check "autodétection : préfère la version exacte (nodevenv 22.23.5 contre PATH 20)" "$T/home/nodevenv/app/22/bin/node" "" "$T/fake20" "$T/home" 22.23.5
check "autodétection : sinon la première candidate" "$T/fake20/node" "" "$T/fake20" "$T/home0" 22.23.5
check "autodétection : aucune candidate : échec" RC1 "" "$T/emptybin" "$T/home0" 22.23.5

echo "== 3. Sans /dev/fd (/dev minimal, comme CageFS)"
# Lanceurs essayés dans l'ordre : espace de noms de montage en root, via sudo, puis en espace utilisateur.
SETUP='mount -t tmpfs tmpfs /dev 2>/dev/null || exit 97; mknod -m 666 /dev/null c 1 3 2>/dev/null; exec "$@"'
LAUNCH=""
for L in "unshare -m" "sudo -n unshare -m" "unshare -Urm"; do
  # shellcheck disable=SC2086
  if $L bash -c "$SETUP" _ true >/dev/null 2>&1 && ! $L bash -c "$SETUP" _ bash -c 'cat <(echo x)' >/dev/null 2>&1; then LAUNCH=$L; break; fi
done
if [ -z "$LAUNCH" ]; then skp "impossible de fabriquer un /dev sans /dev/fd (unshare indisponible) : tests de la section 3 non exécutés"
else
  echo "  info  simulation : « $LAUNCH » + /dev minimal ; la substitution de processus y échoue bien (« /dev/fd/63: No such file or directory »)"
  nodev() { # shellcheck disable=SC2086
    $LAUNCH bash -c "$SETUP" _ "$@"; }
  mkdir -p "$T/app/.next" "$T/app/.release/rollback"; echo '{}' > "$T/app/package.json"; echo x > "$T/app/server.js"
  clean() { grep -q "/dev/fd" "$1" && { nope "$2 : mention de /dev/fd"; sed 's/^/        /' "$1" | head -3; return 1; }; return 0; }
  OUT=$(nodev env PATH="$T/emptybin" HOME="$T/home0" NODE_BIN="$T/fake22/node" "$BASH" -c ". '$HERE/lib.sh'; find_node 22.23.5" 2>"$T/err"); clean "$T/err" "find_node --node" && [ "$OUT" = "$T/fake22/node" ] && pass "find_node avec --node valide sans /dev/fd" || nope "find_node avec --node valide sans /dev/fd (« $OUT »)"
  OUT=$(nodev env PATH="$T/fake22" HOME="$T/home0" "$BASH" -c ". '$HERE/lib.sh'; find_node 22.23.5" 2>"$T/err"); clean "$T/err" "find_node autodétection" && [ "$OUT" = "$T/fake22/node" ] && pass "find_node en autodétection sans /dev/fd" || nope "find_node en autodétection sans /dev/fd (« $OUT »)"
  OUT=$(nodev env HOME="$T/home0" bash "$HERE/preflight.sh" --app-dir "$T/app" --node "$REAL_NODE" 2>&1); echo "$OUT" > "$T/pf"
  clean "$T/pf" "preflight --node valide" && echo "$OUT" | grep -q "ok    Node " && ! echo "$OUT" | grep -q "aucun exécutable Node" && pass "preflight --node valide : Node reconnu sans /dev/fd" || { nope "preflight --node valide sans /dev/fd"; echo "$OUT" | grep -E "Node|FAIL" | head -5 | sed 's/^/        /'; }
  OUT=$(nodev env HOME="$T/home0" bash "$HERE/preflight.sh" --app-dir "$T/app" --node "$T/absent/node" 2>&1); echo "$OUT" > "$T/pf"
  clean "$T/pf" "preflight --node invalide" && echo "$OUT" | grep -q "FAIL  --node" && pass "preflight --node invalide : échec explicite, sans /dev/fd" || nope "preflight --node invalide"
  OUT=$(nodev env HOME="$T/home0" PATH="$(dirname "$REAL_NODE"):/usr/bin:/bin" bash "$HERE/preflight.sh" --app-dir "$T/app" 2>&1); echo "$OUT" > "$T/pf"
  clean "$T/pf" "preflight autodétection" && echo "$OUT" | grep -q "ok    Node " && pass "preflight en autodétection : Node reconnu sans /dev/fd" || nope "preflight en autodétection sans /dev/fd"
  for cmd in "disk-check.sh --app-dir $T/app --quota-mb 7168 --used-mb 100 --artifact-mb 3 --release-mb 11" "deploy-lock.sh status --app-dir $T/app" "cleanup.sh --app-dir $T/app" "verify.sh --base-url http://127.0.0.1:9 --app-dir $T/app"; do
    # shellcheck disable=SC2086
    nodev env HOME="$T/home0" timeout 60 bash "$HERE/"$cmd >"$T/o" 2>&1; clean "$T/o" "${cmd%% *}" && pass "${cmd%% *} s'exécute sans /dev/fd"
  done
fi
echo "== $NOK réussi(s), $NKO échec(s), $NSK non exécuté(s)"
[ "$NKO" -eq 0 ]
