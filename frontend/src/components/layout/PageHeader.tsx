import React from 'react';

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PageHeaderProps {
  icon: any;
  title: string;
  subtitle: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader(_props: PageHeaderProps) {
  return null;
}
