# Authentication Data Flow



```mermaid
flowchart TD
    A["User submits email + password"] --> B["Backend verifies credentials"]
    B --> C["Backend signs a JWT\npayload: userId, email\n(never password)"]
    C --> D["Backend responds with\nSet-Cookie: token=... HttpOnly; Secure; SameSite=Lax"]
    D --> E["Browser stores the cookie automatically\n(no frontend code needed)"]
 
    E --> F["Client makes a request\nBrowser automatically attaches the cookie"]
    F --> G["Backend reads token from the cookie\nVerifies it BEFORE the handler runs"]
 
    G --> H{"Token valid?"}
    H -->|"Yes"| I["Proceed to handler"]
    I --> J["Respond 200 + data"]
    J --> F
 
    H -->|"No"| K["Respond 401"]
    K --> L["Client clears session / redirects to login"]
    L --> A
 
    style C fill:#fde8e8,stroke:#c0392b
    style D fill:#e8f4fd,stroke:#2980b9
    style K fill:#fde8e8,stroke:#c0392b
```

## Notes on this flow

- **Token payload**: `userId`, `name`, `email` — never `password`. A JWT is signed,
  not encrypted, so anything in the payload is readable by whoever holds the
  token (including the user themselves, via DevTools).
- **Verification happens before every handler runs** — this is the "per
  request, before processing" rule: no protected route logic executes until
  the token passes verification.
- **On invalid/missing token**, the server doesn't try to "fix" or refresh
  anything itself — it responds `401`, and the *client* is responsible for
  reacting to that by sending the user back to login.