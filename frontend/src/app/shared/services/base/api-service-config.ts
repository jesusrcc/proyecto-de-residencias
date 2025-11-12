// src/app/shared/services/api-service-config.ts
export class ApiServiceConfig {
  readonly #api: string = 'http://localhost:3000/api'; // o usa environment.apiBaseUrl

  protected get api(): string {
    return this.#api;
  }
}
