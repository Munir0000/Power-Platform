import { useCallback, useEffect, useState } from 'react';
import { getCurrentUserId, listSites, listUsers, type Site, type User } from './data/assetRegister';
import { errorMessage } from './lib/format';
import { href, useRoute, type Route } from './lib/router';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { ConditionCheckForm } from './components/ConditionCheckForm';
import { Home } from './components/Home';
import { Landing } from './components/landing/Landing';
import { Alert } from './components/common';
import { Icon } from './components/Icon';
import './App.css';

const SITE_KEY = 'assetRegister.siteId';

function readStoredSite(): string {
  try {
    return localStorage.getItem(SITE_KEY) ?? '';
  } catch {
    return '';
  }
}

function routeKey(route: Route): string {
  return 'id' in route ? `${route.name}:${route.id}` : route.name;
}

function App() {
  const route = useRoute();
  const [sites, setSites] = useState<Site[]>([]);
  const [loadError, setLoadError] = useState<string>();
  const [siteId, setSiteIdState] = useState(readStoredSite);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    listSites()
      .then((loaded) => {
        setSites(loaded);
        // Drop a remembered site that no longer exists.
        setSiteIdState((id) => (id && !loaded.some((s) => s.cr_siteid === id) ? '' : id));
      })
      .catch((e) => setLoadError(errorMessage(e)));
    listUsers()
      .then(setUsers)
      .catch((e) => setLoadError(errorMessage(e)));
    // Best effort: only used to pre-fill "Checked by".
    getCurrentUserId()
      .then(setCurrentUserId)
      .catch(() => undefined);
  }, []);

  const setSiteId = useCallback((id: string) => {
    setSiteIdState(id);
    try {
      localStorage.setItem(SITE_KEY, id);
    } catch {
      /* storage unavailable – scoping still works for this session */
    }
  }, []);

  const scopeName = sites.find((s) => s.cr_siteid === siteId)?.cr_sitename;

  // A button, not href="#main": the hash drives routing.
  const skipLink = (
    <button type="button" className="skip-link" onClick={() => document.getElementById('main')?.focus()}>
      Skip to content
    </button>
  );

  if (route.name === 'home') {
    return (
      <>
        {skipLink}
        <Landing />
      </>
    );
  }

  return (
    <div className="app">
      {skipLink}
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href={href({ name: 'home' })}>
            <span className="brand-mark" aria-hidden="true">
              <Icon name="tag" size={15} />
            </span>
            <span className="brand-name">Asset Register</span>
          </a>
          <nav className="topnav" aria-label="Main">
            <a
              className="topnav-link"
              href={href({ name: 'overview' })}
              aria-current={route.name === 'overview' ? 'page' : undefined}
            >
              Overview
            </a>
            <a
              className="topnav-link"
              href={href({ name: 'list' })}
              aria-current={route.name !== 'overview' ? 'page' : undefined}
            >
              Assets
            </a>
          </nav>
          <span className="scope-chip" title="Current site scope (change it on the asset list)">
            <Icon name="pin" size={14} />
            <span className="sr-only">Site scope: </span>
            {scopeName ?? 'All sites'}
          </span>
        </div>
      </header>
      <main id="main" className="content" tabIndex={-1}>
        {loadError && (
          <Alert>
            <strong>Some lists didn’t load.</strong> {loadError}
          </Alert>
        )}
        <div className="route" key={routeKey(route)}>
          {route.name === 'overview' && (
            <Home
              sites={sites}
              users={users}
              currentUserId={currentUserId}
              siteId={siteId}
              onSiteChange={setSiteId}
            />
          )}
          {route.name === 'list' && (
            <AssetList sites={sites} users={users} siteId={siteId} onSiteChange={setSiteId} />
          )}
          {route.name === 'new' && <AssetDetail sites={sites} users={users} defaultSiteId={siteId} />}
          {route.name === 'asset' && (
            <AssetDetail assetId={route.id} sites={sites} users={users} defaultSiteId={siteId} />
          )}
          {route.name === 'check' && (
            <ConditionCheckForm assetId={route.id} users={users} currentUserId={currentUserId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
