import type { ReactNode } from 'react';
import { externalLinkProps } from '../../lib/externalLink';

interface ButtonLinkProps {
  children: ReactNode;
  href: string;
  tone?: 'primary' | 'secondary';
}

export function ButtonLink({ children, href, tone = 'primary' }: ButtonLinkProps) {
  return (
    <a className={`button ${tone}`} href={href} {...externalLinkProps(href)}>
      {children}
    </a>
  );
}
