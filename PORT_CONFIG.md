# Port Configuration

**Project:** Narrative News
**Frontend Port:** 3002
**API Port:** 3002 (same as frontend - Next.js serves both)

---

## Why Port 3002?

This project uses **port 3002** to avoid conflicts with other projects running simultaneously on the default port 3000.

---

## Configuration Files Updated

### 1. package.json
```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "start": "next start -p 3002"
  }
}
```

### 2. .env
```bash
NEXTAUTH_URL="http://localhost:3002"
SITE_URL="http://localhost:3002"
```

### 3. next.config.js
```javascript
env: {
  SITE_URL: process.env.SITE_URL || 'http://localhost:3002',
}
```

### 4. Documentation Files
- README.md - All references updated to port 3002
- PROJECT.md - All references updated to port 3002

---

## Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3002 |
| Admin Panel | http://localhost:3002/admin |
| API Health | http://localhost:3002/api/health |
| Prisma Studio | http://localhost:5555 |

---

## Note on Port 3003

You mentioned port 3003 - if you need to use this port instead, update the following:

1. **package.json**: Change `-p 3002` to `-p 3003`
2. **.env**: Change `3002` to `3003` in NEXTAUTH_URL and SITE_URL
3. **next.config.js**: Change fallback from `3002` to `3003`

---

**Last Updated:** October 15, 2025
