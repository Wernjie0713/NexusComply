@component('mail::message')
# Welcome to NexusComply, {{ $user->name }}!

An account has been created for you with the following details:

- **Email:** {{ $user->email }}
- **Assigned Role:** {{ $roleTitle }}
- **Your System ID:** {{ $user->role_id }}
@if($outletName)
- **Assigned Outlet:** {{ $outletName }}
@endif
- **Temporary Password:** {{ $defaultPassword }}

@component('mail::panel')
**Important:** Please change your password immediately after your first login for security.
@endcomponent

@component('mail::button', ['url' => config('app.url') . '/login'])
Login to NexusComply
@endcomponent

If you have any questions or need assistance, please contact your administrator.

Thanks,<br>
The NexusComply Team
@endcomponent 