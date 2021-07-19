// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_ENDPOINT: 'https://api.siter.eu/v1',
  API_PROJECT: '60f56d59e282c',
  BASE_URL: 'http://localhost:4200',
  MIN_PW_LENGTH: 6,
  MAX_PW_LENGTH: 32,
  collectionMap: {'activities': '60f56d83ebeae', 'timetracked': '60f5aa93afe18'}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
