import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'overview' }
  | { name: 'list' }
  | { name: 'asset'; id: string }
  | { name: 'new' }
  | { name: 'check'; id: string };

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'assets' && parts[1] === 'new') return { name: 'new' };
  if (parts[0] === 'assets' && parts[1] && parts[2] === 'check') return { name: 'check', id: parts[1] };
  if (parts[0] === 'assets' && parts[1]) return { name: 'asset', id: parts[1] };
  if (parts[0] === 'assets') return { name: 'list' };
  if (parts[0] === 'overview') return { name: 'overview' };
  return { name: 'home' };
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'overview':
      return '#/overview';
    case 'list':
      return '#/assets';
    case 'new':
      return '#/assets/new';
    case 'asset':
      return `#/assets/${route.id}`;
    case 'check':
      return `#/assets/${route.id}/check`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = href(route);
}

/** Hash-based routing: works inside the Power Apps host iframe with no server config. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
