# Changelog

## [0.1.13](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.12...v0.1.13) (2026-11-19)


### Reverts

* откат слияния PR [#60](https://github.com/volmax/ai-for-developers-project-386/issues/60) ([#61](https://github.com/volmax/ai-for-developers-project-386/issues/61)) ([4ded6aa](https://github.com/volmax/ai-for-developers-project-386/commit/4ded6aac1d5dd1c8de8628a939696c564e3f388f))

## [0.1.12](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.11...v0.1.12) (2026-11-17)


### Bug Fixes

* add PORT env var, fix README formatting, add data reset note ([#51](https://github.com/volmax/ai-for-developers-project-386/issues/51)) ([629adfd](https://github.com/volmax/ai-for-developers-project-386/commit/629adfd096b41fd5cdf4818a16f3f77ce7ff4bab))

## [0.1.11](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.10...v0.1.11) (2026-11-17)


### Bug Fixes

* **release-please:** include package-lock.json in extra-files ([#46](https://github.com/volmax/ai-for-developers-project-386/issues/46)) ([2421d74](https://github.com/volmax/ai-for-developers-project-386/commit/2421d7455c392b4630061a0019b65012e62dd330))

## [0.1.10](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.9...v0.1.10) (2026-11-16)


### Bug Fixes

* **controller:** return FreeSlotsCountResult object instead of plain integer ([#41](https://github.com/volmax/ai-for-developers-project-386/issues/41)) ([#42](https://github.com/volmax/ai-for-developers-project-386/issues/42)) ([3791260](https://github.com/volmax/ai-for-developers-project-386/commit/3791260663a4f902f65e782804e15d5d1c6c4acd))

## [0.1.9](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.8...v0.1.9) (2026-11-16)


### Bug Fixes

* **api:** align booking endpoints with TypeSpec contract ([#1](https://github.com/volmax/ai-for-developers-project-386/issues/1)) ([#39](https://github.com/volmax/ai-for-developers-project-386/issues/39)) ([3a4cfb6](https://github.com/volmax/ai-for-developers-project-386/commit/3a4cfb6b1d9c74f32caaac9da2808cd52b615ddc))

## [0.1.8](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.7...v0.1.8) (2026-11-16)


### Bug Fixes

* **booking:** очищает слот и рефетчит список после бронирования ([#36](https://github.com/volmax/ai-for-developers-project-386/issues/36)) ([#37](https://github.com/volmax/ai-for-developers-project-386/issues/37)) ([cc5ed90](https://github.com/volmax/ai-for-developers-project-386/commit/cc5ed907ba7df665e67d6b8ea8c1084dd7057a11))

## [0.1.7](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.6...v0.1.7) (2026-11-16)


### Bug Fixes

* Frontend uses generated SDK instead of hand-written api.ts ([#25](https://github.com/volmax/ai-for-developers-project-386/issues/25)) ([#34](https://github.com/volmax/ai-for-developers-project-386/issues/34)) ([5250da1](https://github.com/volmax/ai-for-developers-project-386/commit/5250da171a698afc8ae3fba1a4748653114ac41b))

## [0.1.6](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.5...v0.1.6) (2026-11-16)


### Bug Fixes

* **typespec:** change id fields from string to int64 + fix BookingPage tests ([#31](https://github.com/volmax/ai-for-developers-project-386/issues/31)) ([ba9b756](https://github.com/volmax/ai-for-developers-project-386/commit/ba9b756ff30b12ac61c0f683e763e9744777ba9a))

## [0.1.5](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.4...v0.1.5) (2026-11-16)


### Bug Fixes

* **test:** make BookingPage tests date-independent by freezing getMoscowToday ([#29](https://github.com/volmax/ai-for-developers-project-386/issues/29)) ([8f45cdb](https://github.com/volmax/ai-for-developers-project-386/commit/8f45cdbea75750073604973e81a27d7940c89ace))

## [0.1.4](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.3...v0.1.4) (2026-11-15)


### Bug Fixes

* **booking:** keep form visible on validation error ([#20](https://github.com/volmax/ai-for-developers-project-386/issues/20)) ([234e954](https://github.com/volmax/ai-for-developers-project-386/commit/234e9540847294c26b5cc1ba1e90521417e1e196))

## [0.1.3](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.2...v0.1.3) (2026-11-15)


### Bug Fixes

* **frontend:** fix TypeScript error in BookingPage test and remove duplicate E2E test ([#17](https://github.com/volmax/ai-for-developers-project-386/issues/17)) ([6001c32](https://github.com/volmax/ai-for-developers-project-386/commit/6001c32202238323a6e6747f1c8764e1bb5aff50))

## [0.1.2](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.1...v0.1.2) (2026-11-15)


### Bug Fixes

* **frontend:** sync booking window timezone with backend ([#15](https://github.com/volmax/ai-for-developers-project-386/issues/15)) ([b84c624](https://github.com/volmax/ai-for-developers-project-386/commit/b84c62410a6f6df609bc69fbbd8add9e8fe011be))

## [0.1.1](https://github.com/volmax/ai-for-developers-project-386/compare/v0.1.0...v0.1.1) (2026-11-15)


### Features

* add backend (Spring Boot) and frontend (React + Vite + shadcn/ui) with Docker Compose ([9961c05](https://github.com/volmax/ai-for-developers-project-386/commit/9961c05fc831c1aedeca52dd52531faec2bb1c30))
* add check-jsonschema for JSON config validation ([a58ea97](https://github.com/volmax/ai-for-developers-project-386/commit/a58ea9781dc8c0315226b8f44ca64ca629f2ca46))
* add Hadolint config for Dockerfile best practices ([2464ff3](https://github.com/volmax/ai-for-developers-project-386/commit/2464ff3a9024fe0daf3096e662c7df89327a080e))
* add HealthController with tests and API client tests ([90d03bb](https://github.com/volmax/ai-for-developers-project-386/commit/90d03bb1c17da34ce88d2ccc8d69fcab1057be35))
* add Matt Pocock engineering skills and agent configuration ([03e5d86](https://github.com/volmax/ai-for-developers-project-386/commit/03e5d860d751889561b7059ea3d50e8ac7ffb3db))
* add OSV-Scanner for vulnerability scanning ([687b6b4](https://github.com/volmax/ai-for-developers-project-386/commit/687b6b4bf3beac4077146219bd2d4ac7d9b08df4))
* add Vitest testing setup with unit tests ([90bbd1f](https://github.com/volmax/ai-for-developers-project-386/commit/90bbd1f84d39274a7ba7b70274af3daf6702e0e5))
* **backend:** add Error Prone for Java bug pattern detection ([4fc76a0](https://github.com/volmax/ai-for-developers-project-386/commit/4fc76a029cbe3bcfbcf97913230db99cd36cb2fd))
* **backend:** add Spotless for Java formatting ([0ade7dc](https://github.com/volmax/ai-for-developers-project-386/commit/0ade7dc67a6e4bdab86570e8cc03a8c5c87dc236))
* **calendar:** add event-types and bookings API with frontend page ([fbadb3c](https://github.com/volmax/ai-for-developers-project-386/commit/fbadb3c694ae3b5a6f149f3d4067369122a4e668))
* **calendar:** implement EventType, Booking, slot service, and booking UI ([eb82a39](https://github.com/volmax/ai-for-developers-project-386/commit/eb82a396aed5905d5597a390eddfefd941dd0cd2))
* **calendar:** добавить спецификацию системы бронирования и глоссарий ([b6ddfc8](https://github.com/volmax/ai-for-developers-project-386/commit/b6ddfc8e4c20be411b35241689f54c72337dc7c9))
* **ci:** add release-please for automated versioning ([1677c3f](https://github.com/volmax/ai-for-developers-project-386/commit/1677c3fcf5b5da093f316c4b9b611a5b76fb2e6b))
* **e2e:** add smoke test for full booking flow ([a1f2b3b](https://github.com/volmax/ai-for-developers-project-386/commit/a1f2b3bb226838f32206c832e4a7569eb9b679ef))
* **frontend:** add home page with header, features card, and routing ([167eab7](https://github.com/volmax/ai-for-developers-project-386/commit/167eab774e9e0aa406ab7c292d3642fbd9f3f989))
* **frontend:** add knip for unused code detection ([e8695b5](https://github.com/volmax/ai-for-developers-project-386/commit/e8695b5554fa9e91b402bf57ce59f7e4f3fe7286))
* **frontend:** add oxlint and oxfmt for JS/TS linting and formatting ([349de85](https://github.com/volmax/ai-for-developers-project-386/commit/349de85dcfd8e499765ab7c633c9587e04964b07))
* **typespec:** init TypeSpec project with contract generation pipeline ([bcc4c6d](https://github.com/volmax/ai-for-developers-project-386/commit/bcc4c6d2139d026a8e303163d86f6b0ee8536b6a))


### Bug Fixes

* **backend:** add JVM flags for ErrorProne with Java 21 ([0cc9a88](https://github.com/volmax/ai-for-developers-project-386/commit/0cc9a88f30aea8a85c9e287960a49b55a30a5c1e))
* **backend:** add server-side validation for guestName and guestEmail ([ff4c0c4](https://github.com/volmax/ai-for-developers-project-386/commit/ff4c0c49d2bb60aa2fd05017d5f94f62d59998e8))
* **backend:** improve Dockerfile for mise and Java 21 ([e0f544e](https://github.com/volmax/ai-for-developers-project-386/commit/e0f544ef38b8a59d3ccaf632301493f0b29f1f60))
* **ci:** add backend/pom.xml to release-please extra-files ([ba3fc8d](https://github.com/volmax/ai-for-developers-project-386/commit/ba3fc8d249d41564e21c5ada3cb47733d295672c))
* **ci:** add bump-minor-pre-major and debug logging to release-please ([5a6e045](https://github.com/volmax/ai-for-developers-project-386/commit/5a6e045bc1024f89f1b9e51b7295f510d5592980))
* **ci:** add install before check and fix missing dependencies ([b83de8e](https://github.com/volmax/ai-for-developers-project-386/commit/b83de8e64be158fc8c3564d6add3fc034746eeae))
* **ci:** add root package.json and use node release-type ([be33ada](https://github.com/volmax/ai-for-developers-project-386/commit/be33ada9dff38d49a023490dd13238c41bd7a533))
* **ci:** fetch full git history for release-please ([3b7e68c](https://github.com/volmax/ai-for-developers-project-386/commit/3b7e68c56e69f587e8096713ad4fe0d9cfd31e7b))
* **ci:** ignore commit hashes in typos linting ([e7bbce6](https://github.com/volmax/ai-for-developers-project-386/commit/e7bbce6ea3831ad64ab2fbdf52362ede013d176d))
* **ci:** improve GitHub Actions workflow per jactionlint ([b5c0d86](https://github.com/volmax/ai-for-developers-project-386/commit/b5c0d861c73177d9f4ad5b10e9d63ff4a4f129a9))
* **ci:** install mise directly via curl instead of mise-action ([74f2116](https://github.com/volmax/ai-for-developers-project-386/commit/74f21162a19b514c7640a7eec953ead8c50a080a))
* **ci:** migrate to release-please v5 config format ([8969b3d](https://github.com/volmax/ai-for-developers-project-386/commit/8969b3d39ec99d23668416f245764e5b30dab3e8))
* **ci:** remove non-existent maven-settings.xml from tasks ([3fb5123](https://github.com/volmax/ai-for-developers-project-386/commit/3fb51235979104772684024f8e7242965e14b188))
* **ci:** remove pom.xml from extra-files (XML not JSON) ([d672557](https://github.com/volmax/ai-for-developers-project-386/commit/d6725571b09bf734ff0c934e50f6d78070e89cc4))
* **ci:** reset manifest to 0.0.0 for initial release ([12a759a](https://github.com/volmax/ai-for-developers-project-386/commit/12a759a70f267e956ac789a42d054dba1222df5d))
* **ci:** skip PR creation, use direct release ([1a9d882](https://github.com/volmax/ai-for-developers-project-386/commit/1a9d882544fdfc96b2cce0cca4fcd5f04aec8508))
* **ci:** switch release-please to simple-bump release type ([cbd3356](https://github.com/volmax/ai-for-developers-project-386/commit/cbd3356ac44546ccb80cb5d7e51cdebe1ce0a4d8))
* **ci:** update mise-action to v5.2.6 for Node.js 24 compatibility ([057a509](https://github.com/volmax/ai-for-developers-project-386/commit/057a50975b1c60b5be33691da736182fcd937d7c))
* **ci:** update release-please-action to v5 ([f8303bb](https://github.com/volmax/ai-for-developers-project-386/commit/f8303bb129f13a7f5f5eefa5aef9e37957fd38d1))
* **ci:** use 'simple' release type (not 'simple-bump') ([fa71f7a](https://github.com/volmax/ai-for-developers-project-386/commit/fa71f7a1222c75198e7cb3e04c2f1c54104ca183))
* **ci:** use monorep config with explicit path ([ea1f50b](https://github.com/volmax/ai-for-developers-project-386/commit/ea1f50b1d6bdaad5ef194504c958edb00eeeb4a7))
* **ci:** use simple release-type instead of java ([9f674fb](https://github.com/volmax/ai-for-developers-project-386/commit/9f674fb531d7d7a260e2e7effe352f5841dc817a))
* **ci:** use single-package config for release-please ([abab522](https://github.com/volmax/ai-for-developers-project-386/commit/abab5222000b4c20faaf82a23408f65317bd707b))
* **ci:** use string format for extra-files in monorep config ([1e04256](https://github.com/volmax/ai-for-developers-project-386/commit/1e042564e51b9fc5dd1bff04ce648a2f0b290c26))
* **e2e:** update test to match current page structure ([7b5e48d](https://github.com/volmax/ai-for-developers-project-386/commit/7b5e48dbe4c4ec216f1b57c680b8a94208d8f38b))
* **frontend:** add playwright artifacts to .gitignore ([d90db2f](https://github.com/volmax/ai-for-developers-project-386/commit/d90db2ff43952badd961e194085487f78180b72b))
* **frontend:** booking window starts from tomorrow instead of today ([75012f1](https://github.com/volmax/ai-for-developers-project-386/commit/75012f1222827b1c5c8996418e92490c106de6a4))
* **frontend:** remove unused CardFooter and CardDescription exports ([c211e12](https://github.com/volmax/ai-for-developers-project-386/commit/c211e1216bbb3f3893b0bf65501ec67d86332d24))
* **frontend:** resolve TypeScript build errors ([b72e54b](https://github.com/volmax/ai-for-developers-project-386/commit/b72e54bcd687f9fc8611c0f2565087858aecca80))
* **homepage:** redirect 'Записаться' button to /events ([6e696b0](https://github.com/volmax/ai-for-developers-project-386/commit/6e696b0a81d7afc6764b24e0055f7638f43fe3c6))
* resolve TypeScript errors in frontend tests ([2bab0bc](https://github.com/volmax/ai-for-developers-project-386/commit/2bab0bc4ddc1298e3d775f6a5f8697ec62845b98))
* **test:** correct timezone in BookingControllerTest ([4cf11cf](https://github.com/volmax/ai-for-developers-project-386/commit/4cf11cfdb589c3ecff7a4b79d015f5cffb285769))
* **typespec:** add HTTP status codes, durationMinutes enum, and JSON response for free-slots-count ([871f061](https://github.com/volmax/ai-for-developers-project-386/commit/871f06127255681574b3bc1d55b0f837bd6a5e4c))
* **typespec:** make pagination query params optional in OpenAPI ([ab26c04](https://github.com/volmax/ai-for-developers-project-386/commit/ab26c045a12cb03692aec57143c0e67500154417))
* **typespec:** rewrite contract for calendar booking system ([f6abde3](https://github.com/volmax/ai-for-developers-project-386/commit/f6abde3e6a3d82a55b1f2a3619598ae622bc11f4))

## [Unreleased]

### Features

### Fixes

### Refactors

### Tests

### Docs

### Chore
