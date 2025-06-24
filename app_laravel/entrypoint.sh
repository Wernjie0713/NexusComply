#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Run Laravel migrations. The --force flag is important in production.
echo "Running database migrations..."
php artisan migrate --force

# Start the Apache server in the foreground.
# This is the standard command for Debian-based images.
exec apache2-foreground 