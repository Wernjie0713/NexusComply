# NexusComply

## Overview
NexusComply is a comprehensive compliance management and audit readiness system designed to streamline the adherence to multiple compliance standards for business outlets. The platform efficiently manages document submission, review, audit tracking, and reporting processes for both internal staff and external auditors, enabling businesses to maintain regulatory compliance with standards such as ISO 22000, HALAL, GMP, HACCP, OSH, and Food Safety regulations.

## Key Features
- **Role-Based Access Control** - Customized interfaces and permissions for Outlet Staff, Managers, Admins, and External Auditors
- **Dynamic Dashboard** - Role-specific analytics, compliance status overviews, and exportable reports
- **Comprehensive Audit Management**
  - Selection of compliance standards and checklists
  - Document upload and management system
  - Dynamic form filling with various input types (text, checkbox, radio, photo upload)
  - Automatic compliance level verification and issue flagging
  - Follow-up audit tracking
  - QR code generation for quick form access
- **User Management** - Add, edit, delete users and manage roles/permissions
- **Compliance Framework Setup** - Tools to customize compliance categories and checklists
- **Dynamic Form Builder** - Create and modify custom forms with various field types
- **Document Repository** - Centralized storage with advanced filtering and search capabilities
- **Mobile Application** - On-site form filling and document submission with offline support

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

## User Management

NexusComply implements a role-based access control system using the silber/bouncer package. The application does not have a public registration page - all users must be created by an administrator through the application's user management interface.

The system supports the following user roles:
- **Admin**: Full system access with user management capabilities
- **Manager**: Oversees multiple outlets, reviews submissions, and generates reports
- **Outlet Staff**: Primary users who upload compliance documents and fill forms
- **External Auditor**: Read-only access to review submitted compliance documentation

## Main User Flows

### Outlet Staff Monthly Compliance Check
1. Outlet Staff logs into the mobile application
2. Selects the required compliance standard (e.g., HACCP)
3. Opens the monthly checklist form
4. Completes all required fields, attaching photos where needed
5. Submits the form for review
6. Receives notification when the submission is approved or requires corrections

### Manager Compliance Review
1. Manager logs into the web application
2. Views the dashboard showing pending reviews across multiple outlets
3. Selects a submission to review
4. Examines all submitted documentation and form responses
5. Approves the submission or returns it with comments for correction
6. Generates compliance reports for their region 