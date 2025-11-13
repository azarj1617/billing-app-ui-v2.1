// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const host = window.location.hostname; 
export const environment = {
  production: true,
  // baseUrl : "http://localhost:9097",
  // baseUrl : "http://localhost:8080",
     baseUrl:`//${host}:8100`
  // baseUrl : "http://192.168.43.123:8080"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
