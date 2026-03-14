# M008 — Security Hardening

## Context
Following the shipment of M007 (Firebase Integration), a security and code quality audit was performed (see `.gsd/AUDIT.md`). The audit revealed several high and medium priority security vulnerabilities, mostly around unvalidated socket event payloads and lack of host authorization checks.

## Goal
Harden the server against common exploits (XSS via vote values, DoS via oversized bulk tasks, host takeover via userId spoofing) and improve general code robustness (async error handling, resource cleanup).

## Constraints
- Must not break the existing guest or authenticated user flows.
- Must preserve the real-time responsiveness of the application.
- Must keep changes local and pragmatic.
