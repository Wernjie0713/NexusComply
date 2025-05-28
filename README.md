# NexusComply

A comprehensive compliance management system designed to streamline and automate compliance processes for multi-outlet businesses, particularly in the food and beverage industry.

## Overview

NexusComply is a modern, full-stack application that helps businesses manage their compliance requirements across multiple locations. The system consists of two main components:

1. **Web Application (Admin & Manager Portal)**: A Laravel/React-based web interface for administrators and regional managers to oversee compliance, manage users, and handle audit processes.
2. **Mobile Application**: A React Native app for outlet staff to submit compliance documentation and handle day-to-day compliance tasks.

## Architecture Overview

NexusComply follows a unified backend architecture where a single Laravel application serves both the web interface and mobile application:

### Backend (app_laravel/)
- **Dual Role Architecture**:
  1. Serves the web interface using Laravel with Inertia.js + React
  2. Functions as a REST API backend for the mobile application
- **Single Source of Truth**: All business logic and data management is centralized in one codebase
- **API Integration**: Dedicated API routes (prefixed with /api/mobile/) handle mobile app communications
- **Shared Authentication**: Unified authentication system serving both platforms

### Client Applications
- **Web Interface**: Direct integration with Laravel through Inertia.js
- **Mobile App**: Communicates with Laravel backend via REST API endpoints
- **Data Flow**:
  - Admins/Regional Managers → Web Interface → Laravel Backend
  - Outlet Staff → Mobile App → Laravel API → Laravel Backend

## Key Features

### Admin Portal Features
- **Dynamic Form Builder**: Create custom compliance forms with multiple field types (text, checkbox, radio, file upload, etc.)
- **Compliance Framework Management**: Define and manage compliance categories, requirements, and associated forms
- **User & Role Management**: Comprehensive control over user roles, permissions, and access levels
- **Audit Management & Oversight**: 
  - Review and approve submitted compliance documentation
  - Track audit progress across all outlets
  - Generate compliance reports and analytics
  - Share form access with external auditors
- **System Configuration**: Manage system-wide settings and customize the platform

### Regional Manager Features
- **Regional Dashboard**: Monitor compliance metrics and activities for assigned outlets
- **Team Management**: 
  - Oversee outlet managers in the assigned region
  - Track staff performance and activity
  - Manage user access and permissions within the region
- **Audit Review & Reporting**:
  - Review submitted compliance forms from outlets
  - Track audit progress and compliance status
  - Generate regional compliance reports
  - Share audit forms with external stakeholders

### Mobile App Features (Outlet Staff)
- Offline-capable form submission
- Photo and document upload capabilities
- Real-time compliance task notifications
- Digital checklist completion
- Instant submission of compliance documentation

## User Roles

### Administrator
- Full system access and configuration capabilities
- Manage compliance frameworks and form templates
- Oversee all users and role assignments
- Access system-wide analytics and reporting

### Regional Manager
- Manage and monitor multiple outlets in assigned region
- Review and approve compliance submissions
- Handle staff management for regional outlets
- Generate regional compliance reports

### Outlet Manager
- Submit compliance documentation
- Manage outlet-level staff
- Track outlet compliance status
- Handle day-to-day compliance tasks

### External Auditor
- Review assigned compliance documents
- Provide feedback and approvals
- Access specific shared forms and reports

## Technology Stack

### Web Application (Admin & Manager Portal)
- **Backend**: Laravel (PHP)
- **Frontend**: React with Inertia.js
- **UI Framework**: Tailwind CSS
- **State Management**: React Hooks
- **Authentication**: Laravel Sanctum with Bouncer for roles/permissions
- **API**: RESTful endpoints for mobile app integration

### Mobile Application
- React Native
- Redux for state management
- Offline storage capabilities
- Native device feature integration

## Project Structure

```
NexusComply/
├── app_laravel/                 # Web application & API Backend
│   ├── resources/
│   │   └── js/
│   │       ├── Pages/          # React components for web interface
│   │       │   ├── Admin/      # Admin-specific pages
│   │       │   └── Manager/    # Regional Manager pages
│   │       ├── Components/     # Shared React components
│   │       └── Layouts/        # Layout components
│   ├── routes/
│   │   ├── web.php            # Web interface routes
│   │   └── api.php            # Mobile app API endpoints
│   └── ...
├── app_mobile/                 # React Native mobile application
│   ├── src/                   # Mobile app source code
│   ├── android/               # Android-specific files
│   └── ios/                   # iOS-specific files
└── ...
```

## Key Designed Pages (Admin/Manager)

### Admin Portal
- **Authentication**: Login, password reset, and account recovery
- **Dashboard**: Key metrics, activity monitoring, and quick actions
- **User Management**: User creation, role assignment, and activity tracking
- **Compliance Framework**: Category setup and form template management
- **Form Builder**: Dynamic form creation with multiple field types
- **Audit Management**: Review submissions, track progress, generate reports
- **Settings**: Role permissions, system configuration, and customization

### Regional Manager Portal
- **Dashboard**: Regional metrics and outlet performance overview
- **Team Management**: Outlet manager oversight and staff activity tracking
- **Audit Review**: Form submission review and approval workflow
- **Reports**: Regional compliance status and audit history

## Technology Stack

### Backend & Web Application (`app_laravel/`)
- **Backend Framework:** Laravel 11
- **Frontend:** React.js integrated via Inertia.js
- **Database:** MySQL
- **Authentication:** Laravel Breeze (with Inertia.js React stack)
- **Development Environment:** Laragon
- **Role-Based Access Control:** silber/bouncer

### Mobile Application (`app_mobile/`)
- **Framework:** React Native (developed using Expo)
- **API Integration:** RESTful API communication with the Laravel backend

## Project Structure
The NexusComply project is organized into two main components:

- **`app_laravel/`** - Contains the core web application and API backend. Serves as the main interface for Managers, Admins, and External Auditors while also providing the API endpoints for the mobile application.

- **`app_mobile/`** - Houses the React Native mobile application primarily designed for Outlet Staff to perform on-site tasks such as filling audit forms, viewing compliance checklists, and submitting documentation.

## Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js and npm/yarn
- MySQL
- Laragon (or alternative local development environment)
- Expo CLI
- Git

## Getting Started / Installation

### Clone the repository
```bash
git clone https://your-repository-url/NexusComply.git
cd NexusComply
```

### Backend & Web Application Setup (`app_laravel/`)
```bash
cd app_laravel
cp .env.example .env
```

Configure your database credentials and APP_URL in the `.env` file, then run:

```bash
composer install
php artisan key:generate
php artisan migrate --seed  # This will create the default admin user
npm install
```

> **Note:** When running the `php artisan migrate --seed` command, a default administrator user will be created with the following credentials:
> - Email: admin@example.com
> - Password: password
>
> It is strongly recommended to change this password after your first login.

### Mobile Application Setup (`app_mobile/`)
```bash
cd app_mobile  # From the NexusComply root
npm install  # or yarn install
```

Inside the mobile app's configuration, set the API base URL to point to your running `app_laravel` instance (e.g., http://localhost:8000 or your Laragon virtual host URL for the `app_laravel/public` directory).

## Running the Application

### Backend & Web Application (`app_laravel/`)
1. Ensure your Laragon services (Apache/Nginx, MySQL) are running.
2. In one terminal (inside `app_laravel/`): 
   ```bash
   npm run dev  # For Vite asset compilation
   ```
3. If not using a Laragon virtual host, in another terminal (inside `app_laravel/`):
   ```bash
   php artisan serve
   ```
4. Access the web application via your Laragon virtual host URL (e.g., http://nexuscomply.test) or http://localhost:8000.

### Mobile Application (`app_mobile/`)
1. In a terminal (inside `app_mobile/`):
   ```bash
   npx expo start
   ```
2. Follow the instructions provided by Expo CLI to open the app on an emulator, simulator, or physical device using the Expo Go app.

## Contributing

[Contribution guidelines to be added]

## License

[License information to be added]

## Deployment Strategy

NexusComply follows a monorepo approach for simplified deployment and maintenance:

### Repository Structure
- Single Git repository containing both `app_laravel` and `app_mobile`
- No duplication of backend code or separate repositories needed

### Backend Deployment (app_laravel)
- **Environment**: Standard PHP web server (VPS, PaaS, etc.)
- **Single Instance**: Serves both web interface and API endpoints
- **URLs**:
  - Web Interface: `https://yourprojectdomain.com`
  - Mobile API: `https://yourprojectdomain.com/api/mobile`
- **Configuration**: Environment-specific settings via `.env` file

### Mobile App Deployment (app_mobile)
- **Build Process**: 
  - Android: Generate signed APK/App Bundle
  - iOS: Create signed IPA file
- **API Configuration**: Mobile builds configured to target production API URL
- **Distribution**:
  - Development: Direct installation for testing
  - Production: Distribution through app stores

### Benefits
- Single source of truth for business logic
- Simplified maintenance and updates
- Consistent data handling across platforms
- Streamlined deployment process 