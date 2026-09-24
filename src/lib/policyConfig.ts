export const PRIVACY_POLICY_VERSION =
  process.env.NEXT_PUBLIC_PRIVACY_POLICY_VERSION ||
  (process.env.NODE_ENV === 'development' ? 'development-draft' : '');

export const PRIVACY_POLICY_CONFIGURED = PRIVACY_POLICY_VERSION.length > 0;
