#!/usr/bin/env bash
# Builds the GitHub Pages preview: a static export of only the browsable
# storefront pages (home, category, product detail), using the in-memory
# fixture in lib/static-data.ts instead of Postgres.
#
# Server-only routes (auth, cart, checkout, account, admin, API routes)
# cannot exist in a `next build --output export` at all — Next errors on
# any route that touches cookies()/auth()/server actions/route handlers.
# So this script temporarily moves those directories out of app/, swaps
# in the *.static.tsx variants of files that would otherwise still pull
# in that server-only code, builds, then always restores everything
# (even on failure) via the EXIT trap.
set -euo pipefail
cd "$(dirname "$0")/.."

EXCLUDE_DIRS=(app/api app/cart app/checkout app/login app/register app/account app/admin app/actions app/feed.xml app/search components/add-to-cart-form.tsx)
# pairs of "real path:static replacement path", swapped in for the build.
# Stash names are indexed (not basename-derived) since multiple real paths
# share a basename (every dynamic route is literally "page.tsx").
SWAP_FILES=(
  "app/product/[slug]/page.tsx:app/product/[slug]/page.static.tsx"
  "app/category/[slug]/page.tsx:app/category/[slug]/page.static.tsx"
  "app/occasions/[slug]/page.tsx:app/occasions/[slug]/page.static.tsx"
  "components/site-header.tsx:components/site-header.static.tsx"
  "app/sitemap.ts:app/sitemap.static.ts"
)
STASH_DIR=".static-build-stash"

cleanup() {
  if [ -d "$STASH_DIR" ]; then
    for d in "${EXCLUDE_DIRS[@]}"; do
      name="$(basename "$d")"
      if [ -e "$STASH_DIR/dir-$name" ]; then
        mkdir -p "$(dirname "$d")"
        mv "$STASH_DIR/dir-$name" "$d"
      fi
    done
    for i in "${!SWAP_FILES[@]}"; do
      real="${SWAP_FILES[$i]%%:*}"
      stashed="$STASH_DIR/swap-$i.orig"
      if [ -e "$stashed" ]; then
        mv "$stashed" "$real"
      fi
    done
    rmdir "$STASH_DIR" 2>/dev/null || true
  fi
}
trap cleanup EXIT

mkdir -p "$STASH_DIR"
for d in "${EXCLUDE_DIRS[@]}"; do
  if [ -e "$d" ]; then
    mv "$d" "$STASH_DIR/dir-$(basename "$d")"
  fi
done

for i in "${!SWAP_FILES[@]}"; do
  real="${SWAP_FILES[$i]%%:*}"
  static="${SWAP_FILES[$i]##*:}"
  mv "$real" "$STASH_DIR/swap-$i.orig"
  cp "$static" "$real"
done

STATIC_EXPORT=1 npx next build

echo "Static export complete: ./out"
