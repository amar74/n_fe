declare module 'zipcodes' {
  interface ZipCodeInfo {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }

  function lookup(zip: string | number): ZipCodeInfo | undefined;
  function lookupByName(city: string, state?: string): ZipCodeInfo[];
  function lookupByCoords(latitude: number, longitude: number, radius?: number): ZipCodeInfo[];
  function distance(zip1: string | number, zip2: string | number): number;
  function toMiles(kilometers: number): number;
  function toKilometers(miles: number): number;
  function radius(zip: string | number, miles: number, full?: boolean): string[] | ZipCodeInfo[];
  function random(): string;
  function states(): { [key: string]: string };

  export = {
    lookup,
    lookupByName,
    lookupByCoords,
    distance,
    toMiles,
    toKilometers,
    radius,
    random,
    states,
  };
}
