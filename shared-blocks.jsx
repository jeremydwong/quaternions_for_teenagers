import { colors as COLORS, fonts } from "./theme.js";

export function Prose({ children }) {
  return <div style={{ fontSize: 14, lineHeight: 1.75, color: COLORS.text, margin: "12px 0" }}>{children}</div>;
}

export function Callout({ children, color = COLORS.cyan }) {
  return (
    <div style={{
      borderLeft: `3px solid ${color}`, paddingLeft: 14, margin: "14px 0",
      color, fontSize: 13, fontStyle: "italic", lineHeight: 1.6,
    }}>{children}</div>
  );
}

export function Definition({ formal, playful }) {
  return (
    <div style={{
      margin: "14px 0",
      border: `1px solid ${COLORS.purple}40`,
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px",
        background: `${COLORS.purple}10`,
        borderBottom: `1px solid ${COLORS.purple}20`,
        fontSize: 13, fontStyle: "italic", color: COLORS.text, lineHeight: 1.65,
      }}>
        <span style={{
          color: COLORS.purple, fontFamily: fonts.mono,
          fontSize: 10, textTransform: "uppercase", letterSpacing: 2,
          fontStyle: "normal", marginRight: 10, fontWeight: 700,
        }}>Definition</span>
        {formal}
      </div>
      <div style={{
        padding: "10px 14px",
        fontSize: 13, color: COLORS.text, lineHeight: 1.65,
      }}>
        <span style={{
          color: COLORS.gold, fontFamily: fonts.mono,
          fontSize: 10, textTransform: "uppercase", letterSpacing: 2,
          marginRight: 10, fontWeight: 700,
        }}>In plain English</span>
        {playful}
      </div>
    </div>
  );
}

export function TakeHome({ major, minor, color = COLORS.gold }) {
  return (
    <div style={{
      marginTop: 28,
      padding: "16px 18px",
      background: `linear-gradient(135deg, ${color}0d, ${color}04)`,
      border: `1px solid ${color}40`,
      borderRadius: 10,
    }}>
      <div style={{
        fontSize: 10, color, textTransform: "uppercase", letterSpacing: 2.5,
        fontFamily: fonts.mono, fontWeight: 700, marginBottom: 12,
      }}>✦ Take-Home</div>

      {major && major.length > 0 && (
        <div style={{ marginBottom: minor && minor.length > 0 ? 14 : 0 }}>
          <div style={{
            fontSize: 11, color, textTransform: "uppercase", letterSpacing: 1.8,
            fontWeight: 700, marginBottom: 8, fontFamily: fonts.mono,
          }}>Major</div>
          <ul style={{ paddingLeft: 16, margin: 0, listStyle: "none" }}>
            {major.map((item, i) => (
              <li key={i} style={{
                fontSize: 13, color: COLORS.text, lineHeight: 1.65, marginBottom: 6,
                position: "relative",
              }}>
                <span style={{ position: "absolute", left: -14, color, fontWeight: 700 }}>▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {minor && minor.length > 0 && (
        <div>
          <div style={{
            fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1.8,
            fontWeight: 700, marginBottom: 8, fontFamily: fonts.mono,
          }}>Minor</div>
          <ul style={{ paddingLeft: 16, margin: 0, listStyle: "none" }}>
            {minor.map((item, i) => (
              <li key={i} style={{
                fontSize: 12, color: COLORS.muted, lineHeight: 1.6, marginBottom: 4,
                position: "relative",
              }}>
                <span style={{ position: "absolute", left: -12, color: COLORS.muted }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
