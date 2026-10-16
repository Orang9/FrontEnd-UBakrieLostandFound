# Integration follow-ups

- Add backend support for lost-item reports and an authenticated endpoint for a student's report history. The current UI intentionally supports found-item reports only.
- Add admin API endpoints for managing pickup slots if slot configuration needs to be editable; the current admin page is read-only.
- Confirm whether `GET /api/slots` and `GET /api/slots/:id` should be public. They currently have no authentication middleware and expose read-only slot data; scheduling a claim is separately protected by claim authentication. If public availability is not intended, protect these routes and update the OpenAPI security requirements.
- Run an end-to-end check against a running backend with the intended MySQL/MongoDB configuration, covering CORS, authentication, item reporting, claims, scheduling, and QR handover. Current frontend tests use mocked API responses.
- Triage the dependency vulnerabilities reported during the Docker build with a fresh audit and review compatible upgrades before changing dependency versions.
- Move the root Docker Compose configuration into a tracked repository (or a tracked deployment repository); it currently lives outside the frontend and backend Git repositories.
