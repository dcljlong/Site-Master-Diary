/**
 * pages.config.js - Page routing configuration
 */
import Splash from "./components/pages/Splash";
import Dashboard from "./components/pages/Dashboard";
import JobDetail from "./components/pages/JobDetail";
import CalendarView from "./components/pages/CalendarViw";
import Reports from "./components/pages/Reports";
import Inventory from "./components/pages/Inventory";
import Crew from "./components/pages/Crew";
import SafetyChecklist from "./components/pages/SafetyChecklist";
import SettingsPage from "./components/pages/SettingsPage";
import __Layout from "./Layout.jsx";

export const PAGES = {
  Splash: Splash,
  Dashboard: Dashboard,
  JobDetail: JobDetail,
  CalendarView: CalendarView,
  Reports: Reports,
  Inventory: Inventory,
  Crew: Crew,
  SafetyChecklist: SafetyChecklist,
  SettingsPage: SettingsPage,
};

export const pagesConfig = {
  mainPage: "Splash",
  Pages: PAGES,
  Layout: __Layout,
};
