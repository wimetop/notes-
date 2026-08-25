# Notes+ Release Hardening Design

## Goal

Resolve the release-review findings without changing note ownership, API contracts, or visual language.

## Infrastructure and worker

Docker Compose receives credentials and Better Auth configuration from required environment variables. The migration service waits for healthy PostgreSQL and Redis. Worker startup is explicit: scheduling succeeds before the process enters steady state, and any startup failure closes resources and terminates non-zero.

## UI and client state

Search keeps immediate local input and clear behavior, but sends a query only after a 300 ms IME-safe debounce. Note mutations update compatible cached note lists optimistically, restore previous cache data on failure, and invalidate all note keys on settlement. Forms retain values and expose server/network errors through accessible live error text.

## FSD boundaries

The dashboard shell becomes a `pages-flat` composition. `src/app` only maps routes to page-level exports and passes route parameters.

## Validation

Add focused unit tests for debounce, optimistic rollback, worker bootstrap failure handling, Compose dependency/secret contract, and accessible form error states. Preserve the existing IDOR, cache, health, build, and worker tests.
