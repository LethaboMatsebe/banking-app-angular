import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'auth-mfe',
  exposes: {
    './AuthComponent': './projects/auth-mfe/src/app/app.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: [
    '@angular/router',
    '@angular/router/upgrade',
  ]
});
