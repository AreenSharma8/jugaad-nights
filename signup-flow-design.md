# Signup Flow Design & Implementation

## Overview
A complete signup flow system supporting three user types (Admin, Staff, Customer) with controlled access, role assignment, and comprehensive validation.

## High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              Application Entry Point                         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌─────────────┐             ┌──────────────┐
    │   Login     │             │   Signup     │
    │   Page      │             │   Page       │
    └──────┬──────┘             └──────┬───────┘
           │                           │
           │                    ┌──────▼────────┐
           │                    │  Customer?    │
           │                    └──────┬────────┘
           │                           │
           │                    ┌──────▼──────────────┐
           │                    │  Public Signup      │
           │                    │  (No Restrictions)  │
           │                    └──────┬──────────────┘
           │                           │
           ├──────────────────────────────┐
           │                              │
           ▼                              ▼
    ┌─────────────┐           ┌──────────────────┐
    │   Backend   │           │   Role-Based     │
    │ Validation  │           │   Dashboard      │
    │  & Auth     │           │   Redirect       │
    └──────┬──────┘           └──────────────────┘
           │
           ├───────────────────┬──────────────┬──────────────┐
           │                   │              │              │
           ▼                   ▼              ▼              ▼
      ┌────────┐         ┌────────┐    ┌──────────┐   ┌─────────┐
      │ /admin │         │ /staff │    │/dashboard│   │ Error   │
      │        │         │        │    │          │   │ Page    │
      └────────┘         └────────┘    └──────────┘   └─────────┘
```

## User Type Signup Flows

### 1. Customer Signup (Public)

#### User Journey
1. **Entry Point**: User visits application, clicks "Sign Up"
2. **Form Display**: Customer signup form loads (`/signup`)
3. **Form Submission**: User fills and submits form
4. **Validation**: Frontend and backend validation
5. **Account Creation**: Account created with `user_type: customer`
6. **Authentication**: Auto-login with JWT token
7. **Redirect**: Redirect to `/dashboard`

#### Customer Signup Form Fields
```
Required:
├── Email (format validation)
├── Password (strength requirements)
├── Full Name (text input)
└── Confirm Password (match validation)

Optional:
├── Phone Number (format: +91-XXXXXXXXXX)
├── Gender (dropdown: Male, Female, Other)
└── Age (number: 0-120)
```

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

#### API Flow
```
POST /auth/signup/customer
Request Body:
{
  "email": "customer@email.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+91-9999999999",      // optional
  "gender": "male",                 // optional
  "age": 25                         // optional
}

Response (Success - 200):
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@email.com",
      "name": "John Doe",
      "user_type": "customer",
      "roles": ["customer"],
      "outlet_id": "default-outlet",
      ...
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "timestamp": "2026-03-25T18:07:15.967Z"
}

Response (Error - 409):
{
  "status": "error",
  "message": "User with email customer@email.com already exists",
  "code": "CONFLICT",
  "timestamp": "2026-03-25T18:07:15.967Z"
}

Response (Error - 400):
{
  "status": "error",
  "message": "Password does not meet security requirements",
  "errors": [
    "Password must contain at least one uppercase letter",
    ...
  ],
  "code": "BAD_REQUEST",
  "timestamp": "2026-03-25T18:07:15.967Z"
}
```

#### Frontend Implementation
```typescript
// src/pages/Signup.tsx
const handleSignup = async (formData) => {
  try {
    await signupCustomer({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || undefined,
      gender: formData.gender || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      user_type: 'customer',
    });
    
    // Auto-login and redirect
    navigate('/dashboard');
    showToast('Account created successfully!');
  } catch (error) {
    showToast(error.message, 'error');
  }
};
```

---

### 2. Staff Signup (Admin-Controlled)

#### User Journey
1. **Entry Point**: Admin logs in, navigates to Staff Management
2. **Staff Creation**:
   - Admin clicks "Add New Staff"
   - Admin fills staff creation form
   - Admin assigns roles and permissions
3. **Account Creation**: Backend creates account with `user_type: staff`
4. **Notification**: 
   - Confirmation shown to admin
   - Email sent to staff member (future feature)
5. **Staff Access**: Staff member can login with provided credentials

#### Staff Creation Form Fields
```
Required:
├── Email (unique email address)
├── Password (auto-generated or admin-provided)
├── Full Name
├── Phone Number
└── Department (dropdown)
    ├── Kitchen
    ├── Counter
    ├── Delivery
    └── Management

Optional:
├── Role (multiselect from available roles)
├── Permissions (granular permission selection)
└── Start Date
```

#### Department Options
- **Kitchen**: Inventory management, order preparation
- **Counter**: Customer service, order taking
- **Delivery**: Order delivery tracking
- **Management**: Staff management, reporting

#### API Flow
```
POST /auth/signup/staff
Authorization: Bearer <admin-token>
Request Body:
{
  "email": "staff@email.com",
  "password": "StaffPass123!",
  "name": "Staff Member",
  "phone": "+91-8888888888",
  "department": "kitchen",
  "role_id": "kitchen-role-uuid"
}

Response (Success - 200):
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "staff@email.com",
      "name": "Staff Member",
      "user_type": "staff",
      "department": "kitchen",
      "roles": ["staff", "kitchen-staff"],
      ...
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "timestamp": "2026-03-25T18:07:15.967Z"
}

Response (Error - 403):
{
  "status": "error",
  "message": "Only admins can create staff accounts",
  "code": "FORBIDDEN",
  "timestamp": "2026-03-25T18:07:15.967Z"
}
```

#### Backend Guard
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post('signup/staff')
async signupStaff(
  @Body() signupDto: StaffSignupDto,
  @Request() req: any,
): Promise<ApiResponse> {
  // Only authenticated users with 'admin' role can reach here
  return this.authService.signupStaff(signupDto, req.user.sub);
}
```

#### Admin Flow (Frontend)
```typescript
// src/pages/AdminStaffManagement.tsx
const handleCreateStaff = async (staffData) => {
  try {
    // First select department
    const department = await selectDepartment();
    
    // Then fill staff details
    const staff = {
      email: staffData.email,
      password: generateSecurePassword(),
      name: staffData.name,
      phone: staffData.phone,
      department: department,
      role_id: staffData.roleId,
      user_type: 'staff',
    };
    
    await signupStaff(staff);
    
    // Show confirmation
    showToast('Staff account created! Login credentials sent to email.');
    
    // Refresh staff list
    refreshStaffList();
  } catch (error) {
    showToast(error.message, 'error');
  }
};
```

---

### 3. Admin Signup (System Initialization)

#### User Journey
1. **System Initialization**: First admin account creation (system setup)
2. **Form Display**: Admin signup form loads
3. **Validation**: Email and password validation
4. **Account Creation**: Account created with `user_type: admin`
5. **Dashboard Access**: Redirect to `/admin`

#### Admin Signup Form Fields
```
Required:
├── Email (unique, admin email)
├── Password (strong password required)
├── Full Name (admin name)
└── Confirm Password

Optional:
├── Phone Number
├── Organization Name
└── Outlet Information
```

#### API Flow
```
POST /auth/signup/admin
Authorization: Bearer <existing-admin-token>
Request Body:
{
  "email": "admin@email.com",
  "password": "AdminPass123!",
  "name": "Admin User",
  "phone": "+91-7777777777"
}

Response (Success - 200):
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@email.com",
      "name": "Admin User",
      "user_type": "admin",
      "roles": ["admin"],
      ...
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

## Form Validation Strategy

### Frontend Validation (UX)
```typescript
interface FormValidator {
  email: {
    required: true,
    format: 'email',
    message: 'Enter a valid email'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/,
    message: 'Password must contain uppercase, lowercase, number, special character'
  },
  confirmPassword: {
    required: true,
    match: 'password',
    message: 'Passwords do not match'
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Enter a valid name'
  },
  phone: {
    required: false,
    format: 'tel',
    message: 'Enter a valid phone number'
  },
  age: {
    required: false,
    min: 0,
    max: 120,
    message: 'Enter a valid age'
  }
}
```

### Backend Validation (Security)
```typescript
// DTO with class-validator
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\-\(\)]{10,}$/)
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  age?: number;
}

// Service-level validation
async signup(signupDto: SignupDto) {
  // Check email uniqueness
  const existingUser = await this.userRepository.findByEmail(signupDto.email);
  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  // Validate password strength
  const passwordValidation = passwordService.validatePasswordStrength(
    signupDto.password
  );
  if (!passwordValidation.valid) {
    throw new BadRequestException({
      message: 'Password does not meet requirements',
      errors: passwordValidation.errors
    });
  }

  // Hash password
  const hashedPassword = await passwordService.hashPassword(signupDto.password);
  
  // Create user
  const user = await this.userRepository.save({
    ...signupDto,
    password: hashedPassword
  });

  return user;
}
```

---

## Error Handling

### Frontend Error Display
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const handleFieldError = (fieldName: string, error: string) => {
  setErrors(prev => ({
    ...prev,
    [fieldName]: error
  }));
};

const displayErrors = () => (
  <>
    {Object.entries(errors).map(([field, error]) => (
      <div key={field} className="text-red-600 text-sm mt-1">
        {error}
      </div>
    ))}
  </>
);
```

### Common Error Scenarios

| Error | Status | Message | Solution |
|-------|--------|---------|----------|
| Email taken | 409 | User with email already exists | Use different email |
| Weak password | 400 | Password does not meet requirements | Use stronger password |
| Invalid email | 400 | Invalid email format | Enter valid email |
| Missing field | 400 | Required field missing | Fill all fields |
| Unauthorized admin | 403 | Only admins can create staff | Use admin account |
| Server error | 500 | Internal server error | Retry or contact support |

---

## Security Considerations

### Password Security
- ✅ Minimum 8 characters enforced
- ✅ Complexity requirements enforced
- ✅ Bcrypt hashing (10 salt rounds)
- ✅ Never stored in plaintext
- ✅ Never returned in API responses

### Data Privacy
- ✅ HTTPS/TLS for all requests (production)
- ✅ Field-level validation
- ✅ No sensitive data in logs
- ✅ Proper error messages (don't leak user info)

### Account Security
- ✅ Email uniqueness enforced
- ✅ Admin-only staff account creation
- ✅ Role-based access control
- ✅ JWT token expiration
- ✅ Token refresh mechanism

---

## User Experience Flow

### Step-by-Step Customer Signup
```
1. User clicks "Sign Up" button
   ↓
2. Signup page loads with form
   ↓
3. User fills email, name, password
   ↓
4. Frontend validates inputs in real-time
   ↓
5. User reviews optional fields (phone, age, gender)
   ↓
6. User submits form
   ↓
7. Loading indicator shows
   ↓
8. Server processes registration
   ↓
9. Success toast notification
   ↓
10. Auto-redirect to /dashboard
```

### Step-by-Step Staff Creation (Admin)
```
1. Admin visits Staff Management page
   ↓
2. Admin clicks "Add New Staff"
   ↓
3. Modal opens with staff creation form
   ↓
4. Admin fills required fields
   ↓
5. Admin selects department
   ↓
6. Admin optionally assigns roles
   ↓
7. Admin submits form
   ↓
8. Loading indicator shows
   ↓
9. Server creates account
   ↓
10. Success notification with login details
   ↓
11. Staff list refreshes showing new staff
```

---

## Future Enhancements

1. **Email Verification**
   - Verify email before account activation
   - Resend verification email option

2. **Admin Invitation Flow**
   - Admin sends invitation link
   - Staff registers using link
   - Pre-filled email in registration

3. **Social Auth Integration**
   - Google Sign In
   - GitHub Sign In
   - Facebook Sign In

4. **Two-Factor Authentication**
   - SMS verification
   - Authenticator app support

5. **Password Reset Flow**
   - Forgot password feature
   - Email-based password reset
   - Security questions (optional)

6. **Bulk Staff Import**
   - CSV upload for multiple staff
   - Bulk account generation
   - Automated email notifications
