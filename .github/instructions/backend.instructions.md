---
applyTo: "src/**"
---
Use DDD and hexagonal layering.
Do not let domain code depend on framework, transport, or persistence details.
Do not introduce cross-context imports except through approved contracts or interfaces.
Prefer application services for use-case orchestration and adapters for infrastructure concerns.
