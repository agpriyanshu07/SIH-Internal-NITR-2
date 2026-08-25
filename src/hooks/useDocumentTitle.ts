import { useEffect } from 'react';

/**
 * What the browser tab says.
 *
 * The tab read "KESSLER — Orbital conjunction screening" on every screen, which
 * is a small thing until someone doing the work has four tabs open — an event,
 * the catalogue, the viewer, the thresholds they are about to change — and all
 * four are indistinguishable. It also means browser history is useless: every
 * entry has the same name, so ctrl-clicking back through a session tells you
 * nothing about where you were.
 *
 * The suffix is fixed and the page name leads, because a tab is truncated from
 * the right and the first ~15 characters are all anyone actually reads.
 *
 * The previous title is captured on mount and restored on unmount rather than
 * reset to a constant, so a route that sets a title over another route's title
 * (a detail page inside a section) unwinds correctly instead of flattening.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · KESSLER`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
