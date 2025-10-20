declare module 'weather-js' {
  interface Weather {
    location: {
      name: string;
      country: string;
      lat: string;
      long: string;
      timezone: string;
      alert: string;
      degreetype: 'C' | 'F';
      imagerelativeurl: string;
    };
    current: {
      temperature: string;
      imageUrl: string;
      skytext: string;
      feelslike: string;
      humidity: string;
      windspeed: string;
    };
    forecast: Array<{
      low: string;
      high: string;
      skycodeday: string;
      skytextday: string;
      date: string;
      day: string;
      shortday: string;
      precip: string;
    }>;
  }

  export function find(
    options: { search: string; degreeType: 'C' | 'F' },
    callback: (err: Error | null, result: Weather[]) => void,
  ): void;
}
