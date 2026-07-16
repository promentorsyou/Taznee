/**
 * Category navigation links, shared by the desktop nav (server components)
 * and the mobile drawer (client component). Lives in a plain module —
 * exporting this from a "use client" file would turn it into a client
 * reference proxy when imported by server components, not a real array.
 */
export const NAV_LINKS = [
  { href: "/category/sarees", label: "Sarees" },
  { href: "/category/salwar-kameez", label: "Salwar Kameez" },
  { href: "/category/panjabi", label: "Panjabi" },
  { href: "/category/wedding", label: "Wedding" },
  { href: "/category/jewelry", label: "Jewelry" },
];
