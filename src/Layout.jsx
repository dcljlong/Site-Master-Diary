import React from "react";
import { ThemeProvider } from "./components/ui/ThemeContent";

export default function Layout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
