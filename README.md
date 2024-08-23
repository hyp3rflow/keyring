# Deno Keyring library
Deno porting of [`go-keyring` library](https://github.com/zalando/go-keyring). `keyring` is an OS-agnostic library for setting, getting, and deleting secrets from the system keyring.

## Example Usage
```typescript
import keyring, {KeyringError} from 'keyring';

const service = "my-app"
const user = "anon"
const password = "secret"

try {
  keyring.set(service, user, password);
} catch (e) {
  if (e instanceof KeyringError) {
    console.error(e);
  }
}

let secret;
try {
  secret = keyring.get(service, user);
} catch (e) {
  if (e instanceof KeyringError) {
    console.error(e);
  }
}

console.log(secret);
```

## License
See [LICENSE](./LICENSE) file.
