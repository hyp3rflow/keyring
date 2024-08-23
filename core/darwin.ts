import { decodeHex } from "@std/encoding/hex";
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { KeyringError } from "./error.ts";
import type { KeyringInterface } from "./mod.ts";

const keychainExecPath = "/usr/bin/security";

// https://github.com/zalando/go-keyring/blob/master/keyring_darwin.go#L32-L33
const encodingPrefix = "go-keyring-encoded:";
const base64EncodingPrefix = "go-keyring-base64:";

async function get(service: string, username: string) {
  const command = new Deno.Command(keychainExecPath, {
    args: [
      "find-generic-password",
      "-s",
      service,
      "-wa",
      username,
    ],
    stdout: "piped",
  });
  const { success, stdout: _stdout } = await command.output();
  const stdout = new TextDecoder().decode(_stdout);
  console.log({ stdout });
  if (!success) {
    if (stdout.includes("could not be found")) {
      throw new KeyringError("Not Found");
    }
    throw new KeyringError();
  }
  const trim = stdout.trim();
  if (trim.startsWith(encodingPrefix)) {
    const sliced = trim.slice(encodingPrefix.length);
    return new TextDecoder().decode(decodeHex(sliced));
  }
  if (trim.startsWith(base64EncodingPrefix)) {
    const sliced = trim.slice(base64EncodingPrefix.length);
    return new TextDecoder().decode(decodeBase64(sliced));
  }
  return trim;
}

async function set(service: string, username: string, password: string) {
  // if the added secret has multiple lines or some non ascii,
  // osx will hex encode it on return. To avoid getting garbage, we
  // encode all passwords
  const encoded = base64EncodingPrefix + encodeBase64(password);
  const command = new Deno.Command(
    keychainExecPath,
    {
      args: ["-i"],
      stdin: "piped",
      stdout: "piped",
    },
  );
  const child = command.spawn();
  const input =
    `add-generic-password -U -s ${service} -a ${username} -w ${encoded}\n`;
  if (input.length > 4096) {
    throw new KeyringError("Payload too large");
  }
  await child.stdin.getWriter().write(new TextEncoder().encode(input));
  await child.stdin.close();
  return void await child.output();
}

export const keyring = { get, set } satisfies KeyringInterface;
