<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Tambahkan ini

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // PENTING: Paksa HTTPS di lingkungan produksi agar link gambar dan API tidak rusak
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // Register security headers middleware to API and Web groups
        try {
            $router = $this->app->make(\Illuminate\Routing\Router::class);
            // Push middleware to api and web groups if they exist
            if (method_exists($router, 'pushMiddlewareToGroup')) {
                $router->pushMiddlewareToGroup('api', \App\Http\Middleware\SecurityHeaders::class);
                $router->pushMiddlewareToGroup('web', \App\Http\Middleware\SecurityHeaders::class);
            }
        } catch (\Throwable $e) {
            // Do not break boot on consoles or during install; fail silently
        }
    }
}
