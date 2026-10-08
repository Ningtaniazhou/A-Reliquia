// Shared capability query; safe to import in state/controller tests without a DOM.
export const phoneQuery=globalThis.matchMedia?.('(hover: none) and (pointer: coarse) and (max-width: 1000px)')||{matches:false};
export const isPhone=()=>phoneQuery.matches;
