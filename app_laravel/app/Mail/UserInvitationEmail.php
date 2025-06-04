<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class UserInvitationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $roleTitle;
    public $defaultPassword;
    public $outletName;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $roleTitle, $defaultPassword, $outletName = null)
    {
        $this->user = $user;
        $this->roleTitle = $roleTitle;
        $this->defaultPassword = $defaultPassword;
        $this->outletName = $outletName;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your NexusComply Account Has Been Created!')
            ->markdown('emails.users.invitation')
            ->with([
                'user' => $this->user,
                'roleTitle' => $this->roleTitle,
                'defaultPassword' => $this->defaultPassword,
                'outletName' => $this->outletName,
            ]);
    }
} 