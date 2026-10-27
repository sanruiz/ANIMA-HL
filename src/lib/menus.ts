/**
 * Native WordPress nav menus (Appearance → Menus in wp-admin), assigned to
 * the `primary` and `footer` locations registered by the theme (see
 * `register_nav_menus` in sanruiz-mall-blank-theme/functions.php). Editors
 * manage labels, links, order, and submenus entirely from wp-admin — nothing
 * about the menu structure is hardcoded here.
 */

import { cache } from "react";
import { collectionTag } from "@/lib/cache-tags";
import { MENUS_QUERY } from "@/lib/queries";
import type { MenuItemNode, MenusResponse } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

export type NavMenuItem = {
  id: string;
  label: string;
  href: string;
  /** Set from WP's "Link Target" field (e.g. "_blank") when the editor opts in. */
  target: string | null;
  children: NavMenuItem[];
};

export type SiteMenus = {
  primary: NavMenuItem[];
  footer: NavMenuItem[];
};

const EMPTY_MENUS: SiteMenus = { primary: [], footer: [] };

/**
 * WP's `path` is relative (e.g. "/marcas/"); external/custom links only get a `uri`.
 * WP Multilang prefixes non-default-language paths ("/en/conocenos/"), but the
 * locale-aware <Link> adds the prefix itself, so it's stripped here.
 */
export function toHref(node: Pick<MenuItemNode, "path" | "uri">, locale: string): string {
  const href = node.path || node.uri || "#";
  const prefix = `/${locale}`;
  if (href === prefix || href.startsWith(`${prefix}/`)) {
    return href.slice(prefix.length) || "/";
  }
  return href;
}

/** Nests items under their parent using WP's `parentId`, preserving each level's menu order. */
function buildTree(nodes: MenuItemNode[], locale: string): NavMenuItem[] {
  const byParent = new Map<string, MenuItemNode[]>();

  for (const node of nodes) {
    const key = node.parentId ?? "";
    const siblings = byParent.get(key) ?? [];
    siblings.push(node);
    byParent.set(key, siblings);
  }

  const toNavItem = (node: MenuItemNode): NavMenuItem => ({
    id: node.id,
    label: node.label ?? "",
    href: toHref(node, locale),
    target: node.target || null,
    children: (byParent.get(node.id) ?? [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(toNavItem),
  });

  return (byParent.get("") ?? [])
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(toNavItem);
}

/** Fetches and caches (per request) the `primary` and `footer` wp-admin menus for a locale. */
export const getMenus = cache(async (locale: string): Promise<SiteMenus> => {
  try {
    const data = await fetchGraphQL<MenusResponse>({
      query: MENUS_QUERY,
      locale,
      revalidate: 3600,
      tags: [collectionTag("menu")],
    });

    return {
      primary: buildTree(data.primaryMenuItems.nodes, locale),
      footer: buildTree(data.footerMenuItems.nodes, locale),
    };
  } catch (err) {
    console.error("[menus] error loading WP nav menus:", err);
    return EMPTY_MENUS;
  }
});
