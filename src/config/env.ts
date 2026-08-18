export const ENV = {
  APP_NAME: 'Tookoo POS',
  APP_VERSION: '1.1.0',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  BASE_URL: import.meta.env.BASE_URL || '/',
  WEBRTC: {
    STUN_SERVERS: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
    ],
  },
} as const;

export default ENV;
