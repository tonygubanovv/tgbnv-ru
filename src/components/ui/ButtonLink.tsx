import type { ReactNode } from 'react';

interface ButtonLinkProps {
  children: ReactNode;
  href: string;
  tone?: 'primary' | 'secondary';
}

export function ButtonLink({ children, href, tone = 'primary' }: ButtonLinkProps) {
  return (
    <a className={`button ${tone}`} href={href} rel={href.startsWith('http') ? 'noreferrer' : undefined}>
      {children}
    </a>
  );
}
