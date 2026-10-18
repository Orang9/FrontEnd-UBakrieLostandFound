export const paths = {
  home: '/',
  login: '/login',
  catalog: '/catalog',
  catalogItem: (itemId = ':itemId') => `/catalog/${itemId}`,
  reportItem: '/report',
  profile: '/profile',
  claim: (itemId = ':itemId') => `/items/${itemId}/claim`,
  scheduling: '/schedule',
  eticket: (ticketId) =>
    ticketId
      ? `/tickets/${encodeURIComponent(ticketId)}`
      : '/tickets/:ticketId',
  admin: {
    dashboard: '/admin',
    scanner: '/admin/scanner',
    intake: '/admin/intake',
    items: '/admin/items',
    claims: '/admin/claims',
    scheduling: '/admin/scheduling',
    audit: '/admin/audit',
  },
};
