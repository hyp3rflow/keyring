import { keyring as darwinImpl } from "./darwin.ts";
import { KeyringError } from "./error.ts";

export interface KeyringInterface {
  get(service: string, username: string): Promise<string>;
  set(service: string, username: string, password: string): Promise<void>;
}

export const keyring: KeyringInterface = (() => {
  switch (Deno.build.os) {
    case "darwin":
      return darwinImpl;
    default:
      throw new KeyringError("Unsupported arch");
  }
})();

export { KeyringError } from "./error.ts";
