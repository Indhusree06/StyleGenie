# Design Document

## Overview

This design addresses critical user interface and authentication improvements for the Style Genie application. The solution focuses on fixing React Hooks ordering issues, implementing proper logout functionality, establishing robust image storage with Supabase buckets, and enhancing error handling throughout the application.

## Architecture

### Component Structure
- **Fixed HomePage Component**: Restructured to follow React Hooks rules with all hooks declared at the top level
- **Enhanced Navigation Component**: Consistent navigation with user context and logout functionality
- **Image Upload Service**: Dedicated service for handling Supabase storage operations
- **Error Boundary Components**: Centralized error handling and user feedback

### Authentication Flow
```
User Login → Session Management → Navigation Updates → Logout Option Available
     ↓                ↓                    ↓                      ↓
Auth Context → Persistent Storage → UI State Updates → Session Cleanup
```

### Image Storage Flow
```
Image Upload → Validation → Supabase Storage → URL Generation → Database Update
     ↓             ↓              ↓               ↓               ↓
File Check → Size/Type → Bucket Storage → Public URL → Item Association
```

## Components and Interfaces

### 1. Fixed HomePage Component
```typescript
interface HomePageProps {
  // No props needed - uses auth context
}

// All hooks declared at component top level before any conditional logic
const HomePage = () => {
  // Auth hooks
  const { user, loading, signOut } = useAuth()
  
  // State hooks
  const [selectedLocation, setSelectedLocation] = useState("chicago-il")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  // ... other state hooks
  
  // Effect hooks
  useEffect(() => {
    // Weather and initialization logic
  }, [selectedLocation])
  
  // Conditional rendering after all hooks
  if (loading) return <LoadingScreen />
  if (!user) return <AuthForm />
  
  return <MainInterface />
}
```

### 2. Enhanced Navigation Component
```typescript
interface NavigationProps {
  user: User | null
  onSignOut: () => Promise<void>
  currentPage?: string
}

const Navigation = ({ user, onSignOut, currentPage }: NavigationProps) => {
  return (
    <nav className="navigation-container">
      <div className="nav-brand">Style Genie</div>
      <div className="nav-items">
        <span className="user-email">{user?.email}</span>
        <Link href="/wardrobe">My Wardrobe</Link>
        <Button onClick={onSignOut}>
          <LogOut className="icon" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
```

### 3. Image Storage Service
```typescript
interface ImageStorageService {
  uploadImage(file: File, userId: string, itemId: string): Promise<ImageUploadResult>
  deleteImage(imagePath: string): Promise<void>
  getImageUrl(imagePath: string): string
}

interface ImageUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

class SupabaseImageService implements ImageStorageService {
  private readonly bucketName = 'wardrobe-images'
  private readonly maxFileSize = 5 * 1024 * 1024 // 5MB
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  async uploadImage(file: File, userId: string, itemId: string): Promise<ImageUploadResult>
  async deleteImage(imagePath: string): Promise<void>
  getImageUrl(imagePath: string): string
}
```

### 4. Error Handling Components
```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class AppErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState>

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  type: 'auth' | 'network' | 'upload' | 'general'
}

const ErrorDisplay = ({ error, onRetry, type }: ErrorDisplayProps) => {
  // Render appropriate error UI based on type
}
```

## Data Models

### Enhanced User Context
```typescript
interface AuthContextType {
  user: { id: string; email: string } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  // New additions
  isAuthenticated: boolean
  lastError: string | null
  clearError: () => void
}
```

### Image Storage Models
```typescript
interface StoredImage {
  id: string
  wardrobe_item_id: string
  file_path: string
  public_url: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

interface ImageUploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  generateThumbnail?: boolean
}
```

## Error Handling

### Authentication Errors
- **Network Errors**: Retry mechanism with exponential backoff
- **Invalid Credentials**: Clear messaging with password reset option
- **Session Expired**: Automatic redirect to login with context preservation

### Image Upload Errors
- **File Too Large**: Clear size limit messaging with compression suggestions
- **Invalid File Type**: List of supported formats
- **Storage Quota**: Upgrade prompts or cleanup suggestions
- **Network Failures**: Retry mechanism with progress indication

### General Application Errors
- **React Error Boundary**: Graceful fallback UI with error reporting
- **API Failures**: Retry mechanisms with user feedback
- **State Corruption**: Reset mechanisms with data preservation where possible

## Testing Strategy

### Unit Tests
- **Hook Order Validation**: Test component rendering with different auth states
- **Authentication Flow**: Test sign in, sign out, and session management
- **Image Upload Service**: Test file validation, upload, and error scenarios
- **Error Handling**: Test error boundary and error display components

### Integration Tests
- **Authentication Integration**: Test full auth flow with Supabase
- **Image Storage Integration**: Test upload, retrieval, and deletion with Supabase Storage
- **Navigation Flow**: Test user navigation between authenticated and unauthenticated states

### User Acceptance Tests
- **Login/Logout Flow**: Verify complete authentication cycle
- **Image Upload Flow**: Verify image upload, display, and management
- **Error Recovery**: Verify error handling and user recovery paths
- **Navigation Consistency**: Verify navigation works across all pages

## Implementation Phases

### Phase 1: React Hooks Fix
1. Restructure HomePage component to move all hooks to top level
2. Implement proper conditional rendering after hooks
3. Test component with different authentication states

### Phase 2: Logout Implementation
1. Add signOut function to navigation
2. Implement logout button in UI
3. Add session cleanup and redirect logic
4. Test logout flow across different pages

### Phase 3: Image Storage Setup
1. Configure Supabase storage bucket
2. Implement image upload service
3. Add image upload UI components
4. Integrate with wardrobe item management

### Phase 4: Error Handling Enhancement
1. Implement error boundary components
2. Add specific error handling for auth and uploads
3. Implement retry mechanisms
4. Add user feedback and recovery options

## Security Considerations

### Authentication Security
- Secure session management with automatic cleanup
- Proper token handling and refresh
- Protection against session fixation

### Image Storage Security
- File type validation to prevent malicious uploads
- Size limits to prevent storage abuse
- User-specific storage paths to prevent unauthorized access
- Automatic cleanup of orphaned images

### Error Handling Security
- Sanitized error messages to prevent information leakage
- Secure error logging without exposing sensitive data
- Rate limiting on error-prone operations