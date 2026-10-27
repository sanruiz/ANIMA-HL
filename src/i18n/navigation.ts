import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// <Link>, useRouter, etc. wrappers that respect the active locale.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
