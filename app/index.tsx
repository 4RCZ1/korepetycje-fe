import { Redirect, usePathname } from "expo-router";

import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  console.log("current pathname:", pathname);
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/resetPassword") ||
    pathname.startsWith("/data-removal") ||
    pathname === "/" // Temporary state during navigation
  ) {
    return <Redirect href="/schedule" />;
  }
}
