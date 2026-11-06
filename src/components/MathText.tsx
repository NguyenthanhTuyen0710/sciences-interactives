// Rendu de texte « riche » : LaTeX ($…$ et $$…$$), **gras**, *italique*, retours à la ligne.
import katex from "katex";
import "katex/contrib/mhchem";
import { Fragment, type ReactNode } from "react";

function renderTex(tex: string, display: boolean) {
  return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore", output: "html" });
}

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] !== undefined ? <strong key={`${key}b${i++}`}>{m[1]}</strong> : <em key={`${key}i${i++}`}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function MathInline({ text, className }: { text: string; className?: string }) {
  const nodes: ReactNode[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={k++}>{inline(text.slice(last, m.index), `t${k}`)}</Fragment>);
    const display = m[1] !== undefined;
    nodes.push(<span key={k++} className={display ? "block" : undefined} dangerouslySetInnerHTML={{ __html: renderTex(display ? m[1] : m[2], display) }} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(<Fragment key={k++}>{inline(text.slice(last), `t${k}`)}</Fragment>);
  return <span className={className}>{nodes}</span>;
}

/** Texte multi-paragraphes (les \n séparent les paragraphes). */
export default function MathText({ text, className }: { text: string; className?: string }) {
  const paras = text.split("\n");
  return (
    <div className={`rich ${className ?? ""}`}>
      {paras.map((p, i) => (
        <p key={i}>
          <MathInline text={p} />
        </p>
      ))}
    </div>
  );
}
