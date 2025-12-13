# FPL Authentication Feature - Feasibility Analysis

## Current State

**Current Implementation:**
- Uses public FPL API endpoints (no authentication)
- Users manually enter Manager ID
- Fetches team via `/api/entry/{id}/event/{gameweek}/picks/` (historical data)
- Problem: Shows last week's formation because it uses a specific gameweek endpoint

**Desired State:**
- Google authentication
- Auto-detect user's FPL account
- Fetch current team via `/api/my-team/{entry_id}/` (always latest)
- No manual Manager ID entry needed

---

## API Analysis

### Authenticated Endpoints Discovered

1. **`GET /api/me/`** - Returns user info
   - Requires: `x-api-authorization: Bearer {JWT_TOKEN}` header
   - Requires: Session cookies (multiple cookies including `global_sso_id`, `datadome`, etc.)
   - Returns: `{ player: { entry: 1746390, email, sso_id, ... }, watched: [] }`

2. **`GET /api/my-team/{entry_id}/`** - Returns current team
   - Requires: Same authentication as above
   - Returns: Current picks, chips, transfers, bank value
   - **Key advantage**: Always returns latest formation (not historical)

### Authentication Requirements

From the curl examples, FPL requires:
- **JWT Token**: In `x-api-authorization` header
- **Session Cookies**: Multiple cookies including:
  - `global_sso_id` (UUID)
  - `datadome` (bot protection)
  - Various tracking/analytics cookies
- **CSRF Token**: In `x-csrftoken` header (for POST requests)

---

## Feasibility Assessment

### ✅ **Feasible Approaches**

#### **Option 1: Browser Extension / Cookie Proxy (Most Feasible)**

**How it works:**
- User logs into FPL website in their browser
- Browser extension or proxy captures cookies/token
- App uses these credentials to make authenticated requests

**Pros:**
- No need to reverse-engineer FPL's SSO
- Uses existing user session
- Can work with current architecture

**Cons:**
- Requires browser extension or proxy server
- Security concerns (handling sensitive cookies)
- Token expiration handling needed

**Implementation:**
- Create a browser extension that:
  1. Intercepts FPL API requests
  2. Extracts JWT token and cookies
  3. Provides them to the web app via message passing
- OR create a proxy server that:
  1. User authenticates via FPL website
  2. Proxy stores session
  3. App makes requests through proxy

---

#### **Option 2: Manual Token Entry (Simplest)**

**How it works:**
- User logs into FPL website
- User copies JWT token from browser DevTools
- User pastes token into app
- App stores token and uses it for requests

**Pros:**
- Simplest to implement
- No reverse engineering needed
- Works immediately

**Cons:**
- Poor UX (manual copy/paste)
- Token expires (user needs to refresh)
- Security risk if token stored insecurely

**Implementation:**
- Add "Connect FPL Account" button
- Show instructions: "Open DevTools → Network → Copy token from request"
- Store token in localStorage (encrypted)
- Add token refresh mechanism

---

#### **Option 3: OAuth Proxy Server (Most Secure, Complex)**

**How it works:**
- Create backend server
- Server handles FPL authentication flow
- User authenticates via server
- Server provides API to app

**Pros:**
- Secure (credentials never in frontend)
- Can handle token refresh automatically
- Can cache user data

**Cons:**
- Requires backend infrastructure
- Need to reverse-engineer FPL auth flow
- Ongoing maintenance

**Implementation:**
- Backend server (Node.js/Python)
- Implements FPL login flow
- Provides REST API to frontend
- Handles token refresh

---

### ❌ **Not Feasible Approaches**

#### **Direct Google OAuth → FPL**
- FPL doesn't provide Google OAuth integration
- FPL uses their own SSO system
- Cannot directly authenticate with Google

#### **Direct Browser Cookie Access**
- CORS prevents reading cookies from `fantasy.premierleague.com`
- Same-origin policy blocks cross-domain cookie access
- Cannot access FPL cookies from your domain

---

## Recommended Approach: **Hybrid Solution**

### Phase 1: Manual Token Entry (Quick Win)
1. Add "Connect FPL Account" feature
2. User copies JWT token from browser
3. App stores token securely
4. Use token for authenticated requests
5. Show clear instructions with screenshots

**Timeline:** 2-3 days

### Phase 2: Browser Extension (Better UX)
1. Create Chrome/Firefox extension
2. Extension extracts token automatically
3. Sends token to web app
4. Auto-refresh when token expires

**Timeline:** 1-2 weeks

### Phase 3: Backend Proxy (Production Ready)
1. Build Node.js backend
2. Handle FPL authentication
3. Provide secure API
4. Auto-refresh tokens

**Timeline:** 2-3 weeks

---

## Technical Challenges

### 1. **CORS Issues**
- FPL API likely blocks cross-origin requests
- **Solution:** Use proxy server or browser extension

### 2. **Token Expiration**
- JWT tokens expire (seen: `exp: 1765603048`)
- **Solution:** Implement refresh mechanism or re-authentication flow

### 3. **Cookie Management**
- Multiple cookies required
- Some cookies may be HttpOnly (not accessible via JS)
- **Solution:** Use proxy server to handle cookies server-side

### 4. **Security**
- Storing tokens in localStorage is risky
- **Solution:** 
  - Encrypt tokens before storage
  - Use httpOnly cookies (if using backend)
  - Implement token rotation

### 5. **FPL Rate Limiting**
- Authenticated endpoints may have stricter rate limits
- **Solution:** Implement request throttling and caching

---

## Implementation Plan (Phase 1: Manual Token)

### Step 1: Update API Service
- Add authenticated request functions
- Support `x-api-authorization` header
- Handle token storage/retrieval

### Step 2: Create Auth Context
- Store authentication state
- Handle token refresh
- Provide auth status to components

### Step 3: Update Team Context
- Use `/api/my-team/{entry_id}/` instead of gameweek endpoint
- Auto-fetch entry ID from `/api/me/`
- Remove manual Manager ID requirement

### Step 4: Create Auth UI
- "Connect FPL Account" button
- Token input form
- Instructions modal with screenshots
- Token validation

### Step 5: Update My Team Page
- Auto-load team on auth
- Show connection status
- Handle auth errors gracefully

---

## Code Structure Changes

```
src/
├── services/
│   ├── api.ts (add authenticated endpoints)
│   └── auth.ts (new - token management)
├── context/
│   ├── AuthContext.tsx (new - auth state)
│   └── TeamContext.tsx (update to use auth)
├── components/
│   └── FPLAuth.tsx (new - auth UI)
└── lib/
    └── tokenStorage.ts (new - secure token storage)
```

---

## Security Considerations

1. **Token Storage:**
   - Encrypt tokens before storing in localStorage
   - Consider using sessionStorage for better security
   - Implement token expiration checks

2. **Token Transmission:**
   - Always use HTTPS
   - Never log tokens in console (production)
   - Validate token format before use

3. **Error Handling:**
   - Don't expose token in error messages
   - Handle 401/403 gracefully
   - Clear invalid tokens automatically

---

## Alternative: Keep Current + Add "Latest" Option

If authentication proves too complex, consider:
- Keep current manual Manager ID approach
- Add option to fetch "latest gameweek" instead of specific gameweek
- Use `/api/entry/{id}/` to get current_event
- Then fetch picks for that gameweek

**Pros:** No auth needed, simpler
**Cons:** Still shows last completed gameweek, not "live" team

---

## Recommendation

**Start with Phase 1 (Manual Token Entry):**
- Quick to implement (2-3 days)
- Validates the approach
- Provides immediate value
- Can iterate to Phase 2/3 based on user feedback

**Key Success Metrics:**
- Users can connect their FPL account
- Team data is always up-to-date
- Token refresh works smoothly
- No security incidents

---

## Questions to Answer

1. **Do you want to build a backend?** (affects approach)
2. **Are you comfortable with browser extension?** (better UX)
3. **What's the priority: speed vs. security?** (manual token vs. proxy)
4. **How important is auto-refresh?** (affects complexity)

---

## Next Steps

1. ✅ Review this analysis
2. Decide on approach (recommend Phase 1)
3. Create implementation plan
4. Start with token storage and API updates
5. Build auth UI
6. Test with real FPL account
7. Iterate based on feedback
