<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Auth\AuthenticationException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     *
     * @throws \Exception
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Throwable $exception)
    {
        // Custom handling for throttle (rate limit) exceptions to return a friendly message for API clients
        if ($exception instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException) {
            // If API request, return JSON with a clear message and include Retry-After header if present
            if ($request->expectsJson() || $request->is('api/*')) {
                $headers = method_exists($exception, 'getHeaders') ? $exception->getHeaders() : [];
                $retryAfter = null;
                if (isset($headers['Retry-After'])) {
                    $retryAfter = (int) $headers['Retry-After'];
                } elseif (isset($headers['retry-after'])) {
                    $retryAfter = (int) $headers['retry-after'];
                }

                $minutes = $retryAfter ? ceil($retryAfter / 60) : null;
                $msg = $minutes ? "Terlalu banyak percobaan. Silakan coba lagi dalam {$minutes} menit." : 'Terlalu banyak percobaan. Silakan coba lagi nanti.';

                return response()->json(['message' => $msg], 429, $headers);
            }
        }

        return parent::render($request, $exception);
    }

    /**
     * Convert an authentication exception into an unauthenticated response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            // Return a plain Response with JSON body to match expected return type
            return response()->make(json_encode(['message' => 'Unauthenticated.']), 401, ['Content-Type' => 'application/json']);
        }

        // Fallback to default behavior for non-API requests: send redirect Location header
        return response()->make('', 302, ['Location' => route('login')]);
    }
}
