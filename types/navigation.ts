export interface NavLink {
  label: string;
  href: string;
}

export interface BreadcrumbItem {
  label: string;
  /** Omitted for the current page, which is shown as plain text. */
  href?: string;
}
