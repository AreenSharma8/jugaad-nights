# Contributing to Jugaad Nights

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on the code, not the person
- Report issues privately to maintainers

---

## 🎯 Ways to Contribute

### 1. **Report Bugs**
- Use GitHub Issues
- Include steps to reproduce
- Provide system information
- Attach logs/screenshots if possible

### 2. **Request Features**
- Discuss in GitHub Discussions first
- Provide use case and benefits
- Consider backwards compatibility
- Link to related issues

### 3. **Submit Code**
- Fork repository
- Create feature branch
- Write tests
- Follow code style
- Submit pull request

### 4. **Improve Documentation**
- Fix typos
- Clarify unclear sections
- Add examples
- Update outdated info

---

## 🔧 Development Setup

### Prerequisites
```bash
Node.js 20+
PostgreSQL 15+
Redis 7+
Docker Desktop
```

### Local Setup
```bash
# Clone repository
git clone https://github.com/AreenSharma8/jugaad-nights.git
cd jugaad-nights

# Install dependencies
npm install
cd backend && npm install

# Start services
docker-compose up -d

# Setup environment (copy .env.example and update)
cp backend/.env.example backend/.env.development

# Run migrations
docker exec jugaad-nights-backend npm run migration:run

# Seed data
docker exec jugaad-nights-backend npm run seed
```

---

## 💻 Coding Standards

### Frontend (React/TypeScript)

```typescript
// ✅ Good
const handleUserLogin = async (credentials: LoginCredentials): Promise<void> => {
  try {
    const response = await authService.login(credentials);
    setUser(response.user);
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};

// ❌ Avoid
const handleLogin = async (c) => {
  const r = await login(c);
  setUser(r.user);
};
```

**Guidelines**:
- Use TypeScript (no `any` types)
- Functional components with hooks
- One component per file
- Meaningful variable names
- Add JSDoc comments for complex logic
- Props interfaces for all components

### Backend (NestJS/TypeScript)

```typescript
// ✅ Good
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

  async findByEmail(email: string): Promise<User> {
    this.logger.debug(`Searching for user: ${email}`);
    return this.userRepository.findOne({ where: { email } });
  }
}

// ❌ Avoid
export class UserService {
  findByEmail(email) {
    return db.query(`SELECT * FROM users WHERE email = '${email}'`);
  }
}
```

**Guidelines**:
- Use decorators (@Injectable, @Controller, etc.)
- Dependency injection
- No SQL injection vulnerabilities
- Proper error handling
- Add JSDoc for public methods
- Use enums for constants

### General

- **Indentation**: 2 spaces
- **Line Length**: Max 100 characters
- **Semicolons**: Always use
- **Quotes**: Double quotes (TypeScript)
- **Imports**: Alphabetical order
- **Comments**: Clear and concise

---

## 📝 Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `test`: Tests
- `chore`: Build/dependencies

**Example**:
```
feat(auth): add two-factor authentication

- Implement TOTP support
- Add SMS verification fallback
- Store encrypted backup codes

Closes #123
```

---

## 🔄 Pull Request Process

### Before Submitting

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm test
npm run lint

# Commit changes
git add .
git commit -m "feat(module): description"

# Push to fork
git push origin feature/your-feature-name
```

### PR Description Template

```markdown
## Description
Short description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## How to Test
Steps to verify functionality:
1. ...
2. ...

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated Checks**:
   - Tests must pass
   - Linting must pass
   - Build must succeed

2. **Code Review**:
   - At least 1 approval required
   - Address reviewer comments
   - Rebase on conflicts

3. **Merge**:
   - Squash commits if needed
   - Use meaningful merge commit message
   - Delete feature branch

---

## 🧪 Testing

### Frontend Tests

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

**Testing Library**: Vitest + React Testing Library

```typescript
// ✅ Good test
describe('LoginForm', () => {
  it('submits credentials when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'password123'
    );
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Backend Tests

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e
```

**Test Framework**: Jest

```typescript
// ✅ Good test
describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('test@example.com');
    expect(user).toBeDefined();
  });
});
```

---

## 📚 Documentation

### Files to Update

When adding features, update:

1. **Code**: Add JSDoc comments
2. **README.md**: Add feature to features list
3. **API_GUIDE.md**: Document endpoints
4. **ARCHITECTURE.md**: Update architecture if needed
5. **QUICK_REFERENCE.md**: Add relevant commands

### Documentation Style

```markdown
# Heading 1

Use clear, concise descriptions.

## Heading 2

### Subsection

Use examples:

\`\`\`typescript
// Code examples
\`\`\`

- Bullet points
- For lists
- Are helpful
```

---

## 🔍 Code Review Checklist

When reviewing PRs, check:

- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Error handling is proper
- [ ] No security vulnerabilities
- [ ] Performance implications considered
- [ ] No hardcoded values
- [ ] DRY principle followed
- [ ] No unused imports

---

## 🚀 Deployment

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature branches
- **fix/***: Bugfix branches
- **docs/***: Documentation branches

### Release Process

1. Create release branch: `release/1.1.0`
2. Update version numbers
3. Update CHANGELOG
4. Create GitHub Release
5. Tag commit: `v1.1.0`
6. Merge to main

---

## 🆘 Getting Help

- **GitHub Issues**: For bugs/features
- **Discussions**: For questions
- **Email**: maintainer@example.com

---

## 📞 Community

- **Discord**: [Invite Link]
- **Twitter**: [@jugaad_nights]
- **Email**: community@jugaadnights.com

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**

