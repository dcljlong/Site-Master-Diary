import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '../../api/base44Client';
import { pagesConfig } from '../../pages.config';
import { appParams } from './app-params';

export default function NavigationTracker() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];

  useEffect(() => {
    // Hard lock: no Base44 calls in LOCAL DEV MODE
    if (appParams?.localDevMode) return;

    const pathname = location.pathname;
    let pageName;

    if (pathname === '/' || pathname === '') {
      pageName = mainPageKey;
    } else {
      const pathSegment = pathname.replace(/^\//, '').split('/')[0];
      const pageKeys = Object.keys(Pages);
      const matchedKey = pageKeys.find((key) => key.toLowerCase() === pathSegment.toLowerCase());
      pageName = matchedKey || null;
    }

    if (isAuthenticated && pageName) {
      // optional chain: base44Client in local mode may not have appLogs
      base44?.appLogs?.logUserInApp?.(pageName).catch?.(() => {});
    }
  }, [location, isAuthenticated, Pages, mainPageKey]);

  return null;
}
