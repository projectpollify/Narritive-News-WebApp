# Section 3: Testing & Quality Assurance

**Time Estimate:** 2-3 hours
**Complexity:** MEDIUM
**Dependencies:** Section 1 complete, Section 2 recommended
**Risk Level:** Low (additive only, no breaking changes)

---

## 🎯 Objectives

Establish testing infrastructure and quality assurance processes:

1. **Unit Testing** - Test individual functions and services
2. **Integration Testing** - Test API endpoints and workflows
3. **E2E Testing** - Test critical user flows (optional)
4. **Code Quality** - Linting, formatting, type checking
5. **CI/CD Pipeline** - Automated testing on commits

---

## 🧪 Testing Strategy

### Current Status
- ❌ **Zero test coverage** currently
- ✅ Jest already configured in `package.json`
- ✅ Testing libraries installed (`@testing-library/react`, `@testing-library/jest-dom`)

### Target Coverage
- **Critical paths:** 80%+ coverage
- **Service layer:** 90%+ coverage
- **API routes:** 70%+ coverage
- **UI components:** 60%+ coverage (nice-to-have)

---

## 📋 Tasks Checklist

### Task 3.1: Configure Testing Environment
**Time: 30 minutes**

- [ ] Create `jest.config.js`:
  ```javascript
  const nextJest = require('next/jest')

  const createJestConfig = nextJest({
    dir: './',
  })

  const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
      'lib/**/*.ts',
      'app/api/**/*.ts',
      '!**/*.d.ts',
    ],
  }

  module.exports = createJestConfig(customJestConfig)
  ```

- [ ] Create `jest.setup.js`:
  ```javascript
  import '@testing-library/jest-dom'

  // Mock environment variables
  process.env.DATABASE_URL = 'file:./test.db'
  process.env.OPENAI_API_KEY = 'test-key'
  ```

- [ ] Add test scripts to `package.json`:
  ```json
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage"
  }
  ```

- [ ] Create `.gitignore` entries for test files:
  ```
  coverage/
  test.db
  *.test.db
  ```

**Files to create:**
- `jest.config.js`
- `jest.setup.js`

**Files to modify:**
- `package.json` (test scripts)
- `.gitignore` (test artifacts)

---

### Task 3.2: Unit Tests for Service Layer
**Time: 1-1.5 hours**

Create tests for critical service functions:

#### A. Test AI Service (`lib/services/ai.test.ts`)
- [ ] Test `analyzeArticles()` with mock OpenAI response
- [ ] Test fallback when API fails
- [ ] Test `generateSummary()`
- [ ] Test `generateHeadline()`
- [ ] Test confidence score calculation

**Example test:**
```typescript
import { AIService } from './ai'

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: { content: JSON.stringify({
              analysis: 'Test analysis',
              keyDifferences: ['Diff 1'],
              possibleMotives: ['Motive 1']
            })}
          }]
        })
      }
    }
  }))
}))

describe('AIService', () => {
  it('should analyze articles successfully', async () => {
    const result = await AIService.analyzeArticles(
      { title: 'Left', content: 'Content', outlet: 'CNN', summary: 'Sum' },
      { title: 'Right', content: 'Content', outlet: 'Fox', summary: 'Sum' }
    )

    expect(result.analysis).toBeDefined()
    expect(result.keyDifferences).toHaveLength(1)
  })

  it('should use fallback when API fails', async () => {
    // Mock API failure
    const result = await AIService.analyzeArticles(mockLeft, mockRight)
    expect(result.confidenceScore).toBeLessThan(1)
  })
})
```

#### B. Test Scraper Service (`lib/services/scraper.test.ts`)
- [ ] Test `calculateSimilarity()` function
- [ ] Test `findMatchingStories()` logic
- [ ] Test `generateUnifiedTitle()`
- [ ] Test `determineCategory()`
- [ ] Test `extractTags()`

**Example:**
```typescript
describe('NewsScraper', () => {
  describe('calculateSimilarity', () => {
    it('should return 1 for identical texts', () => {
      const text = 'This is a test article'
      expect(NewsScraper.calculateSimilarity(text, text)).toBe(1)
    })

    it('should return 0 for completely different texts', () => {
      const result = NewsScraper.calculateSimilarity(
        'Apple banana cherry',
        'Dog elephant fish'
      )
      expect(result).toBeLessThan(0.1)
    })
  })
})
```

#### C. Test Database Service (`lib/db/index.test.ts`)
- [ ] Test article creation
- [ ] Test article retrieval
- [ ] Test subscriber management
- [ ] Test analytics recording

---

### Task 3.3: Integration Tests for API Routes
**Time: 45 minutes - 1 hour**

Test API endpoints with mocked database:

#### A. Test Articles API (`app/api/articles/route.test.ts`)
```typescript
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

describe('/api/articles', () => {
  it('GET should return articles with pagination', async () => {
    const request = new NextRequest('http://localhost:3000/api/articles?limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.pagination).toBeDefined()
  })

  it('POST should create article with valid data', async () => {
    const body = {
      title: 'Test Article',
      category: 'Politics',
      aiAnalysis: 'Test analysis',
      leftSource: { /* ... */ },
      rightSource: { /* ... */ }
    }

    const request = new NextRequest('http://localhost:3000/api/articles', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

#### B. Test Other APIs
- [ ] `/api/newsletter` - Subscription flow
- [ ] `/api/automation` - Automation trigger
- [ ] `/api/analytics` - Analytics tracking
- [ ] `/api/search` - Search functionality

---

### Task 3.4: E2E Tests (Optional - Nice to Have)
**Time: 1 hour**

Install Playwright for E2E testing:
```bash
npm install -D @playwright/test
npx playwright install
```

Create critical flow tests:
- [ ] Homepage loads correctly
- [ ] Can view article detail page
- [ ] Newsletter signup works
- [ ] Admin login flow (after Section 2)

**Example E2E test:**
```typescript
import { test, expect } from '@playwright/test'

test('homepage displays articles', async ({ page }) => {
  await page.goto('http://localhost:3000')

  await expect(page.locator('h1')).toContainText('Narrative News')
  await expect(page.locator('article')).toHaveCount(3) // Mock articles
})

test('can view article detail', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('article:first-child a')

  await expect(page).toHaveURL(/\/article\//)
})
```

---

### Task 3.5: Code Quality Tools
**Time: 30 minutes**

#### A. ESLint Configuration
Already configured! Just verify:
```bash
npm run lint
```

Add custom rules if needed in `.eslintrc.json`

#### B. Prettier Setup (if not already)
```bash
npm install -D prettier
```

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Add script:
```json
"format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
```

#### C. Husky for Pre-commit Hooks (optional)
```bash
npm install -D husky lint-staged
npx husky init
```

Add pre-commit hook to run tests and linting

---

### Task 3.6: CI/CD Pipeline Setup
**Time: 30 minutes**

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run type check
      run: npm run type-check

    - name: Run linter
      run: npm run lint

    - name: Run tests
      run: npm run test:ci

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
```

**Files to create:**
- `.github/workflows/test.yml`

---

## 📁 Files Summary

### New Files (8-12):
1. `jest.config.js` - Jest configuration
2. `jest.setup.js` - Test setup
3. `lib/services/ai.test.ts` - AI service tests
4. `lib/services/scraper.test.ts` - Scraper tests
5. `lib/db/index.test.ts` - Database tests
6. `app/api/articles/route.test.ts` - API tests
7. `.github/workflows/test.yml` - CI/CD pipeline
8. `playwright.config.ts` - E2E config (optional)
9. `e2e/*.spec.ts` - E2E tests (optional)
10. `.prettierrc` - Code formatting (if needed)

### Modified Files (2-3):
1. `package.json` - Test scripts
2. `.gitignore` - Test artifacts
3. `.eslintrc.json` - Custom rules (if needed)

---

## 🧪 Testing Checklist

### Unit Tests:
- [ ] AI service functions tested
- [ ] Scraper functions tested
- [ ] Database operations tested
- [ ] Utility functions tested
- [ ] Edge cases covered

### Integration Tests:
- [ ] All API routes tested
- [ ] Database integration tested
- [ ] Error responses tested
- [ ] Validation tested

### E2E Tests (Optional):
- [ ] Homepage flow tested
- [ ] Article view tested
- [ ] Newsletter signup tested
- [ ] Admin flows tested

### Code Quality:
- [ ] Linter passes
- [ ] Formatter configured
- [ ] Type checking passes
- [ ] No console warnings

### CI/CD:
- [ ] GitHub Actions configured
- [ ] Tests run on push
- [ ] Coverage reported
- [ ] Build succeeds

---

## 📊 Success Criteria

After completing Section 3:

✅ **Test Coverage:**
- Service layer: 80%+ coverage
- API routes: 70%+ coverage
- Critical paths tested

✅ **Quality Tools:**
- Linting configured
- Formatting standardized
- Type checking enforced
- Pre-commit hooks (optional)

✅ **CI/CD:**
- Automated testing on commits
- Coverage reporting
- Build verification
- Deployment blocked if tests fail

✅ **Confidence:**
- Can refactor without fear
- Regressions caught automatically
- Code quality maintained

---

## 🔄 Next Steps

After Section 3 is complete:

**You have quality assurance!** Your codebase now:
- Has test coverage for critical paths
- Catches bugs before production
- Maintains code quality automatically
- Can be refactored safely

**Move to Section 4:** Performance Optimizations

---

## 💡 Tips

1. **Start with service layer tests** - Easiest to test, highest impact
2. **Mock external dependencies** - Don't call real OpenAI API in tests
3. **Use test databases** - Separate from development data
4. **Write tests for bugs** - Every bug fix gets a test
5. **Don't aim for 100% coverage** - Focus on critical paths

---

## ⏱️ Time Breakdown

| Task | Estimated Time |
|------|----------------|
| 3.1 Configure Environment | 30 minutes |
| 3.2 Unit Tests | 1-1.5 hours |
| 3.3 Integration Tests | 45 min - 1 hour |
| 3.4 E2E Tests (optional) | 1 hour |
| 3.5 Code Quality | 30 minutes |
| 3.6 CI/CD Pipeline | 30 minutes |
| **Total** | **3-4.5 hours** |

---

**Testing isn't optional for production apps - invest time here to save time later!**
