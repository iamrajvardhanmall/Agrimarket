import React from "react";

export const Glyph = ({ children, className = "", style }) => (
  <span aria-hidden="true" className={className} style={style}>
    {children}
  </span>
);

export const IconHome     = (p) => <Glyph {...p}>🏠</Glyph>;
export const IconSeed     = (p) => <Glyph {...p}>🌾</Glyph>;
export const IconChart    = (p) => <Glyph {...p}>📊</Glyph>;
export const IconHelp     = (p) => <Glyph {...p}>❓</Glyph>;
export const IconLeaf     = (p) => <Glyph {...p}>🌿</Glyph>;
export const IconPin      = (p) => <Glyph {...p}>📍</Glyph>;
export const IconTruck    = (p) => <Glyph {...p}>🚛</Glyph>;
export const IconRupee    = (p) => <Glyph {...p}>💰</Glyph>;
export const IconUp       = (p) => <Glyph {...p}>↑</Glyph>;
export const IconDown     = (p) => <Glyph {...p}>↓</Glyph>;
export const IconCheck    = (p) => <Glyph {...p}>✅</Glyph>;
export const IconWarn     = (p) => <Glyph {...p}>⚠️</Glyph>;
export const IconStar     = (p) => <Glyph {...p}>⭐</Glyph>;
export const IconWhatsApp = (p) => <Glyph {...p}>💬</Glyph>;
export const IconClose    = (p) => <Glyph {...p}>✕</Glyph>;
export const IconMenu     = (p) => <Glyph {...p}>☰</Glyph>;
export const IconCalendar = (p) => <Glyph {...p}>📅</Glyph>;
export const IconArrow    = (p) => <Glyph {...p}>→</Glyph>;

