// Static shell prerenders; all interactive (socket/window/localStorage) code is
// guarded inside onMount.
export const prerender = true;
export const ssr = true;
