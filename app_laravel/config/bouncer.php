<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Models
    |--------------------------------------------------------------------------
    |
    | When you need to extend Bouncer's default models, you should define your
    | own models and specify their paths here. Remember that your models need
    | to extend Bouncer's default models to work correctly.
    |
    */

    'models' => [

        'ability' => Silber\Bouncer\Database\Ability::class,

        'role' => App\Models\Role::class,

    ],

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    |
    | The abilities that can be used for authorization. If you are extending
    | your own ability, you can override it here. Be sure to use its full
    | namespace.
    |
    */

    // 'permissions' => [
    //     'create', 'view', 'update', 'delete',
    // ],

    /*
    |--------------------------------------------------------------------------
    | Default Permissions
    |--------------------------------------------------------------------------
    |
    | These are the default permissions that will be automatically added to
    | all new roles. You can customize this list as needed for your application.
    |
    */

    // 'default_permissions' => [
    //     'view_dashboard', 'manage_own_profile',
    // ],

];
