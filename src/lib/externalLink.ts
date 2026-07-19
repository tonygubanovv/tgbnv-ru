export function externalLinkProps(href: string) {
  const isExternal = /^https?:\/\//i.test(href);

  return {
    target: isExternal ? '_blank' : undefined,
    rel: isExternal ? 'noreferrer' : undefined
  };
}
