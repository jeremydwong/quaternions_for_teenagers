import { Definition, Callout, TakeHome, Prose } from "./shared-blocks.jsx";
import { colors, fonts, accentMap } from "./theme.js";

// =============================================================================
// Lightweight Markdown renderer for chapter intro/outro text.
// Supports:
//   - Paragraphs (blank-line separated)
//   - **bold** *italic* `code`
//   - [link text](url)
//   - Unordered lists (- item) and ordered lists (1. item)
//   - Inline math via {{ ... }} for things like {{x̂}}, {{cos θ}}, etc. (just styled)
//   - Custom block directives:
//       :::definition
//       formal text...
//       :::playful
//       playful text...
//       :::end
//
//       :::callout color=orange
//       text...
//       :::end
//
//       :::takehome color=cyan
//       :::major
//       - item 1
//       - item 2
//       :::minor
//       - item 3
//       :::end
//
// Two-line directive separators (:::xxx) are markers and don't appear in output.
// =============================================================================

// ---- Inline parser: turns a string into an array of React nodes ---------------
function renderInline(text, keyPrefix = "i") {
  const nodes = [];
  let i = 0, k = 0;

  // Helper: push plain text segment up to position
  let buf = "";
  const flushBuf = () => {
    if (buf.length) { nodes.push(buf); buf = ""; }
  };

  while (i < text.length) {
    // Bold **...**
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flushBuf();
        nodes.push(<strong key={`${keyPrefix}-${k++}`}>{renderInline(text.slice(i + 2, end), `${keyPrefix}b${k}`)}</strong>);
        i = end + 2;
        continue;
      }
    }
    // Italic *...*  (require non-whitespace next to *)
    if (text[i] === "*" && text[i + 1] !== "*" && text[i + 1] && text[i + 1] !== " ") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1 && text[end - 1] !== " ") {
        flushBuf();
        nodes.push(<em key={`${keyPrefix}-${k++}`}>{renderInline(text.slice(i + 1, end), `${keyPrefix}i${k}`)}</em>);
        i = end + 1;
        continue;
      }
    }
    // Inline code `...`
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flushBuf();
        nodes.push(
          <code key={`${keyPrefix}-${k++}`} style={{
            fontFamily: fonts.mono, fontSize: "0.92em",
            padding: "1px 5px", borderRadius: 3,
            background: `${colors.gold}1f`, color: colors.gold,
          }}>{text.slice(i + 1, end)}</code>
        );
        i = end + 1;
        continue;
      }
    }
    // Math-ish span {{...}}
    if (text.startsWith("{{", i)) {
      const end = text.indexOf("}}", i + 2);
      if (end !== -1) {
        flushBuf();
        nodes.push(
          <span key={`${keyPrefix}-${k++}`} style={{
            fontFamily: fonts.mono, color: colors.gold,
          }}>{text.slice(i + 2, end)}</span>
        );
        i = end + 2;
        continue;
      }
    }
    // Link [text](url)
    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flushBuf();
          const linkText = text.slice(i + 1, closeBracket);
          const url = text.slice(closeBracket + 2, closeParen);
          nodes.push(
            <a key={`${keyPrefix}-${k++}`} href={url}
              target={url.startsWith("http") ? "_blank" : undefined}
              rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ color: colors.cyan, textDecoration: "underline" }}>
              {renderInline(linkText, `${keyPrefix}l${k}`)}
            </a>
          );
          i = closeParen + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flushBuf();
  return nodes;
}

// ---- Block parser ------------------------------------------------------------
function parseDirectiveAttrs(line) {
  // e.g. ":::callout color=orange"
  const attrs = {};
  const m = line.match(/^:::(\w+)\s*(.*)$/);
  if (!m) return { name: null, attrs };
  attrs.name = m[1];
  const rest = m[2].trim();
  if (rest) {
    rest.split(/\s+/).forEach(pair => {
      const [k, v] = pair.split("=");
      if (k && v !== undefined) attrs[k] = v.replace(/^["']|["']$/g, "");
    });
  }
  return attrs;
}

// Splits the raw .md content into a sequence of blocks (paragraph, list,
// directive). Returns React nodes.
function parseBlocks(src, keyPrefix = "b") {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const nodes = [];
  let i = 0, k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (!line.trim()) { i++; continue; }

    // Directive block
    if (line.trimStart().startsWith(":::")) {
      const attrs = parseDirectiveAttrs(line.trim());
      if (attrs.name === "definition") {
        // Collect formal until :::playful, playful until :::end
        i++;
        const formalLines = [];
        while (i < lines.length && !lines[i].trim().startsWith(":::playful")) {
          formalLines.push(lines[i]); i++;
        }
        i++; // consume :::playful
        const playfulLines = [];
        while (i < lines.length && !lines[i].trim().startsWith(":::end")) {
          playfulLines.push(lines[i]); i++;
        }
        i++; // consume :::end
        nodes.push(
          <Definition key={`${keyPrefix}-${k++}`}
            formal={parseBlocks(formalLines.join("\n"), `${keyPrefix}fd${k}`)}
            playful={parseBlocks(playfulLines.join("\n"), `${keyPrefix}pd${k}`)} />
        );
        continue;
      }
      if (attrs.name === "callout") {
        i++;
        const inner = [];
        while (i < lines.length && !lines[i].trim().startsWith(":::end")) {
          inner.push(lines[i]); i++;
        }
        i++;
        nodes.push(
          <Callout key={`${keyPrefix}-${k++}`} color={accentMap[attrs.color] || accentMap.cyan}>
            {parseBlocks(inner.join("\n"), `${keyPrefix}co${k}`)}
          </Callout>
        );
        continue;
      }
      if (attrs.name === "takehome") {
        i++;
        const major = [], minor = [];
        let mode = null;
        while (i < lines.length && !lines[i].trim().startsWith(":::end")) {
          const l = lines[i].trim();
          if (l.startsWith(":::major")) { mode = "major"; i++; continue; }
          if (l.startsWith(":::minor")) { mode = "minor"; i++; continue; }
          if (mode && l.startsWith("- ")) {
            const item = l.slice(2);
            (mode === "major" ? major : minor).push(item);
          }
          i++;
        }
        i++;
        nodes.push(
          <TakeHome key={`${keyPrefix}-${k++}`}
            color={accentMap[attrs.color] || accentMap.gold}
            major={major.map((m, idx) => <span key={idx}>{renderInline(m, `mj${idx}`)}</span>)}
            minor={minor.map((m, idx) => <span key={idx}>{renderInline(m, `mn${idx}`)}</span>)}
          />
        );
        continue;
      }
      // Unknown directive — skip
      i++;
      continue;
    }

    // List block
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        const m = lines[i].match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
        if (m) items.push(m[1]);
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      nodes.push(
        <Tag key={`${keyPrefix}-${k++}`} style={{
          paddingLeft: 22, margin: "10px 0", color: colors.text,
          fontSize: 14, lineHeight: 1.7,
        }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>{renderInline(item, `li${idx}`)}</li>
          ))}
        </Tag>
      );
      continue;
    }

    // Heading: # through ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = { 1: 24, 2: 20, 3: 17, 4: 15, 5: 14, 6: 13 };
      const Tag = `h${level}`;
      nodes.push(
        <Tag key={`${keyPrefix}-${k++}`} style={{
          fontSize: sizes[level], fontWeight: 600, color: colors.text,
          margin: `${level <= 2 ? 20 : 14}px 0 ${level <= 2 ? 10 : 6}px`,
          lineHeight: 1.3,
        }}>
          {renderInline(headingMatch[2], `${keyPrefix}h${k}`)}
        </Tag>
      );
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-blank, non-list, non-directive, non-heading lines
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trimStart().startsWith(":::") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^#{1,6}\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) {
      nodes.push(
        <Prose key={`${keyPrefix}-${k++}`}>
          {renderInline(para.join(" "), `${keyPrefix}p${k}`)}
        </Prose>
      );
    }
  }
  return nodes;
}

// Public component
export default function Markdown({ src }) {
  if (!src) return null;
  return <>{parseBlocks(src)}</>;
}
