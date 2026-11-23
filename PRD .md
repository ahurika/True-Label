# TrueLabel
## Product Requirements Document (PRD)

**Version:** 4.0  
**Date:** 20 November 2026  
**Status:** Revised product specification – ready for phased implementation, subject to evidence-based release gates  
**Product category:** Consumer product information and regulatory-record comparison  
**Primary market:** Nigeria  
**Primary platform:** Mobile-first responsive web application  
**Secondary channel:** WhatsApp, deferred  
**Document owner:** Product Management  
**Supersedes:** TrueLabel PRD v3.1

---

# Document Control

| Field | Specification |
|---|---|
| Product | TrueLabel |
| Product version | 4.0 |
| Document status | Approved product direction; conditional feature release |
| Primary users | Nigerian consumers and household caregivers |
| Primary platform | Mobile-first web |
| Secondary channel | WhatsApp, post-MVP |
| Primary language | English |
| Secondary language | Nigerian Pidgin |
| Data sources | Official NAFDAC public records, official product verification services and public safety alerts, subject to permitted access and documented provenance |
| AI responsibility | Packaging text extraction only, with optional strictly controlled text assistance |
| Decision responsibility | Deterministic, version-controlled application logic |
| Authentication capability | Not provided |
| Medical advice capability | Not provided |
| Business model | Consumer-first; future institutional and brand-supported services subject to independence safeguards |

## Document purpose

This document defines the product strategy, user experience, functional requirements, data architecture, technical implementation, operational model, evaluation framework and release criteria for TrueLabel.

It is the authoritative implementation specification for the product team.

Where an engineering implementation conflicts with this document, the product owner must approve a documented change before implementation proceeds.

## Product boundary

TrueLabel helps people read product packaging and compare its printed information with available regulatory records and official public safety alerts.

It does not authenticate physical products, inspect their chemical composition, establish their safety, certify their contents or replace regulatory authorities and qualified professionals.

A matching registration record does not establish that the physical product is genuine.

---

# 1. Executive Summary

## 1.1 Product overview

TrueLabel is a consumer-facing product information and regulatory-record comparison platform designed to help Nigerians make more informed purchasing decisions.

Users photograph a commercial product pack, review the information extracted from it, and compare the confirmed details against available regulatory records and official public safety alerts.

The platform returns one of four evidence-based outcomes, explains the evidence behind the result, identifies information it could not establish and provides an appropriate next step.

TrueLabel combines:

- AI-assisted packaging text extraction.
- User-confirmed product identity.
- Official-source regulatory-record comparison.
- Deterministic public safety alert matching.
- Product reference information.
- English and Nigerian Pidgin explanations.
- Read-only sharing of check results.
- Direct links to official verification and reporting channels.

The platform is designed around one principle:

**Make regulatory information understandable without pretending to know more than the evidence establishes.**

## 1.2 The problem

Consumers frequently encounter product information that is difficult to interpret or independently verify.

A shopper may see a registration number on a pack but have no convenient way to establish whether the number corresponds to the product, brand or manufacturer printed beside it.

A product may also appear in a public safety alert, while the consumer may not know which batch numbers, variants or packaging descriptions are affected.

Existing official resources provide regulatory information, but consumers may still face friction when identifying the right product details, navigating multiple information sources and interpreting the result.

TrueLabel addresses the information and interpretation gap.

It does not replace official verification.

## 1.3 Product vision

To become a trusted consumer information layer that makes official product-registration and safety information easier to understand and act upon.

## 1.4 Mission

Help consumers make more informed decisions by making product-label information and available regulatory evidence accessible, understandable and transparent.

## 1.5 Value proposition

**Know what your product label says. Understand what available official records show. See what remains uncertain.**

## 1.6 Strategic differentiation

| Alternative | Existing value | TrueLabel differentiation |
|---|---|---|
| Official NAFDAC verification services | Authoritative regulatory verification | Guided pack reading and easier comparison of multiple product identity fields |
| Public safety alerts | Official safety information | Searchable, structured alert matching against confirmed pack details |
| Barcode scanners | Identification through product codes | Comparison of printed identity details and regulatory evidence |
| General AI image assistants | General packaging recognition | Deterministic decisions, controlled evidence, source attribution and safety boundaries |
| Informal social media reports | Community awareness | Clear distinction between verified official evidence and unverified claims |

TrueLabel must not market itself as more authoritative than NAFDAC.

Its advantage is accessibility, interpretation, transparency and workflow design.

## 1.7 Product principles

1. Evidence before conclusions.
2. Uncertainty is an acceptable result.
3. Official sources take precedence over secondary sources.
4. User confirmation is required for critical information.
5. AI extracts information; application logic makes decisions.
6. No positive result is presented as proof of physical authenticity.
7. User safety takes priority over engagement and conversion.
8. No commercial relationship may influence verification outcomes.
9. Privacy is built into the architecture.
10. Every result must be explainable and auditable.

---

# 2. Product Strategy and Market Definition

## 2.1 Initial market

Nigeria is the initial launch market.

The product is designed around Nigerian regulatory information, Nigerian consumer behaviour, local packaging conventions, mobile-first usage and the availability of English and Nigerian Pidgin.

International expansion is outside MVP scope.

Each additional country will require an independent regulatory, legal, data-source and product-safety assessment.

## 2.2 Target market segments

### Primary: Everyday consumers

People purchasing packaged food, beverages, bottled water, cosmetics, toothpaste and other supported consumer products.

Needs:
- Understand what is printed on a product pack.
- Check whether available regulatory information corresponds to the product.
- Identify products referenced in public safety alerts.
- Understand when information is insufficient.
- Access official verification information without navigating complex processes.

### Secondary: Household caregivers

People purchasing products for children, parents, partners and other household members.

Needs:
- Understand product identity information.
- Review medicine label information without receiving generated medical advice.
- Share a product-check result with another person.
- Access relevant official safety information.

### Future segment: Retailers

Small retailers and market traders who may want to check publicly available product information before stocking or selling products.

This segment requires separate workflow and commercial validation.

### Future segment: Institutional users

Consumer protection organisations, researchers, community organisations and other institutions that may benefit from structured product information and reporting tools.

No institutional dashboard is included in MVP.

## 2.3 Jobs to be done

| Situation | User job |
|---|---|
| Before buying a product | Help me understand the registration details printed on the pack |
| When a product looks unfamiliar | Help me compare its details with available official records |
| When I hear about a product alert | Help me determine whether the alert specifically mentions this product or batch |
| When the pack is difficult to read | Help me extract and review the printed information |
| When I cannot establish a match | Tell me what is missing and where I can check next |
| When I want another opinion | Let me share the result without exposing my photograph or personal information |

## 2.4 Market assumptions requiring validation

The following are hypotheses:

- Consumers experience friction when checking product registration information.
- A guided scanning experience can improve access to regulatory information.
- Users will understand the distinction between registry matching and product authentication when the interface explains it properly.
- Nigerian Pidgin explanations may improve comprehension for some users.
- Users will return to the product if the results are understandable and trustworthy.

These hypotheses must be tested through user research.

Do not present them as established market statistics.

## 2.5 Competitive positioning

TrueLabel is positioned as a consumer-facing regulatory information companion.

It is not:
- A regulatory authority.
- A laboratory authentication service.
- A medicine recommendation platform.
- A product certification company.
- A counterfeit detection guarantee.
- An alternative official product registration database.

## 2.6 Product success strategy

The product succeeds when users:
1. Complete the scanning process.
2. Understand what the result means.
3. Understand what the result does not mean.
4. Know what action to take next.
5. Trust the transparency of the evidence.

A high percentage of positive verdicts is not a success metric.

A product that responsibly returns uncertainty when evidence is unavailable is functioning correctly.

---

# 3. Goals, Non-Goals and Scope

## 3.1 MVP goals

The MVP must:

1. Allow users to scan or upload product packaging.
2. Extract relevant packaging text.
3. Allow users to review and correct extracted fields.
4. Compare confirmed information against approved reference records.
5. Match relevant products against an indexed set of official safety alerts.
6. Generate four deterministic result states.
7. Explain the evidence and limitations behind every result.
8. Provide an appropriate next action.
9. Support English and reviewed Nigerian Pidgin text.
10. Provide a shareable, read-only result.
11. Provide official-source links where appropriate.
12. Work on supported mobile and desktop browsers.
13. Protect submitted images and transient user data.
14. Provide a complete error and recovery experience.

## 3.2 Supported categories

| Category | Extraction | Registry comparison | Alert matching | Positive result |
|---|---|---|---|---|
| Food | Yes | Conditional on approved source and record | Yes | Conditional |
| Beverages | Yes | Conditional | Yes | Conditional |
| Bottled water | Yes | Conditional | Yes | Conditional |
| Cosmetics | Yes | Conditional | Yes | Conditional |
| Toothpaste | Yes | Conditional | Yes | Conditional |
| Medicines | Yes | Conditional | Yes | Conditional |
| Household products | Yes | No | Yes, where applicable | No |
| Unknown categories | Limited identification | No | Only where a reliable category match exists | No |

A category being supported for extraction does not mean its registry coverage is sufficient for a positive or negative registration conclusion.

## 3.3 Explicit non-goals

MVP excludes:

- Physical or laboratory authentication.
- Image-based counterfeit detection.
- Visual inspection as proof of genuine packaging.
- Medical diagnosis or treatment advice.
- Dosage calculations or medicine scheduling.
- Medicine interactions or suitability assessment.
- Prescription interpretation.
- User accounts and cloud profiles.
- Public user-generated product accusations.
- Crowdsourced counterfeit databases.
- Native iOS and Android applications.
- Offline AI processing.
- Automatic regulatory approval claims.
- Brand-sponsored positive rankings.
- Automated scraping or unapproved registry access.
- Public product ratings.
- Purchase recommendations based on commercial sponsorship.

## 3.4 MVP versus subsequent releases

### MVP

- Responsive web application.
- Product capture and upload.
- Image quality checks.
- AI-assisted extraction.
- User confirmation.
- Deterministic verdict engine.
- Approved registry records.
- Curated official alert index.
- Reference cards and category checklist.
- Medicine label-only presentation.
- English and Nigerian Pidgin text.
- Report guidance and official links.
- Shareable results.
- Basic analytics and monitoring.
- Admin-only data curation through controlled seed/update processes.

### Release 1.1

- Expanded verified reference library.
- Improved category coverage.
- More extensive usability and extraction evaluation.
- Optional approved audio.
- Better scan recovery and performance.
- Operational data review dashboard if justified.

### Release 2

- WhatsApp integration.
- Retailer workflows.
- Expanded institutional tools.
- Additional languages.
- More automated data refreshes, only where authorised.
- Partnerships with consumer protection organisations.

### Release 3

- Additional African markets.
- Expanded source integrations.
- Institutional subscriptions where commercially validated.

---

# 4. User Personas and Research

## 4.1 Persona A: Everyday shopper

**Goal:** Make a more informed product decision.

Pain points:
- Unfamiliar product names.
- Difficulty identifying registration information.
- Uncertainty about product alerts.
- Limited time to navigate official websites.

Success condition:
Can scan, understand the evidence and identify an appropriate next step without assistance.

## 4.2 Persona B: Household caregiver

**Goal:** Understand product information for household purchases.

Pain points:
- Needs to interpret different types of packaging.
- May purchase medicines for another person.
- Wants to share information with family members.
- Needs clear boundaries between label information and medical advice.

Success condition:
Can review a product-check record and share its evidence without receiving unsupported medical recommendations.

## 4.3 Research plan

Before public launch, conduct:

- 8–12 exploratory interviews with target consumers.
- 5 formative usability sessions.
- At least 2 additional comprehension reviews focused on medicine safety and result wording.
- English and Pidgin comprehension testing.

The five usability sessions are formative research, not statistically representative market validation.

Research must record:
- Non-identifying participant profile.
- Purchase and usage context.
- Existing verification behaviour.
- Device and network constraints.
- Language preference.
- Understanding of result states.
- Trust and privacy expectations.
- Feedback on next actions.

Obtain informed consent.

Do not collect unnecessary personal or medical information.

---

# 5. Core Product Experience and Information Architecture

## 5.1 Primary navigation

The web application has the following navigation structure:

**Desktop**
- Home
- How it works
- Product checks
- About TrueLabel
- Help

Primary CTA: Scan a product.

**Mobile**
- Home
- Scan
- How it works
- Help

The mobile scan action must remain visually prominent without obscuring accessibility controls.

## 5.2 Required screens

| Screen | Purpose | Required elements |
|---|---|---|
| Landing page | Explain the value proposition | Headline, product explanation, scan CTA, limitations and trust information |
| How it works | Explain the process | Capture, confirm, compare, understand |
| Scan introduction | Prepare user for capture | Supported products, consent, camera guidance |
| Camera/upload | Capture packaging | Camera, gallery upload, image guidance |
| Image review | Inspect captured images | Preview, retake, remove, continue |
| Processing | Show extraction progress | Progress state, cancellation where safe, recovery |
| Confirmation | Review extracted information | Editable fields, confidence cues, explicit confirmations |
| Result | Present verdict | Verdict, reason, evidence, freshness and next action |
| Reference details | Show comparison information | Pack variant, sourced fields, provenance |
| Medicine label | Display printed directions | Verbatim directions, unreadable states, pharmacist notice |
| Report | Prepare a report | Evidence summary and verified official destinations |
| Share | Create read-only link | Privacy explanation, expiration and copy/share actions |
| Shared result | Display shared check | Result, evidence, limitations and expiration |
| Help | Resolve common questions | FAQs, limitations, reporting and official links |
| Privacy | Explain processing | Collection, purpose, processors, retention and rights |
| Terms | Explain service boundaries | Disclaimers, acceptable use and service limitations |

## 5.3 Global states

Every applicable screen must define:

- Initial state.
- Loading state.
- Success state.
- Empty state.
- Validation state.
- Recoverable error state.
- Terminal failure state.
- Offline or network interruption state.
- Unsupported-browser state.

No primary interaction may terminate in an unexplained blank screen.

## 5.4 Result hierarchy

The result page must display information in this order:

1. Verdict and neutral icon.
2. Short plain-language explanation.
3. Exact evidence supporting the result.
4. Important limitation or safety warning.
5. Source and freshness details.
6. Relevant reference card or category checklist.
7. Next recommended action.
8. Share and report options.

The user must not need to expand a secondary panel to discover a critical warning.

## 5.5 Accessibility

Target WCAG 2.2 AA.

Requirements:
- Semantic page structure.
- Keyboard navigation.
- Visible focus indicators.
- Screen-reader announcements for status changes.
- Minimum readable text sizes.
- Sufficient contrast.
- Accessible form labels.
- Captions or transcripts for audio.
- No colour-only verdict distinctions.
- Camera and upload alternatives.
- Reduced-motion support.

---

# 6. Product Verdict System

## 6.1 Locked verdicts

TrueLabel has four verdicts.

| Priority | Internal value | Display label | Meaning |
|---|---|---|---|
| 1 | `alert_match` | Matches a NAFDAC alert | A specific official alert matches the confirmed product evidence |
| 2 | `registration_discrepancy` | Registration details don't match | Reliable evidence establishes a material registration-number or identity conflict |
| 3 | `could_not_confirm` | Could not confirm | Available evidence is insufficient to reach a reliable comparison |
| 4 | `registry_match` | Registry details match | Confirmed identity details correspond to a sufficiently complete, current and verified registry record |

The display labels may be localised.

Internal enum values must remain stable.

## 6.2 Priority rules

Rules are evaluated in the following order.

### Rule 1: Matches a NAFDAC alert

Requires:
- A verified, specific official alert.
- A confirmed batch number matching an affected batch; or
- An exact confirmed pack name explicitly identified in the alert as appearing on affected products.
- A stored evidence reference.
- A recorded matching rule and version.

Brand-only similarity cannot generate this verdict.

A fuzzy name match alone cannot generate this verdict.

The result must display:
- Alert number.
- Issue date.
- Product or affected-pack description.
- Matched field.
- Matched value.
- Original official source link.
- Retrieval and last-review dates.

### Rule 2: Registration details don't match

Allowed only when reliable evidence establishes:
- The registration number belongs to a different product identity.
- The registration number belongs to a different manufacturer where the comparison is unambiguous.
- An official record explicitly identifies the relevant registration as inactive, cancelled or expired under the source's documented status semantics.
- A complete, approved source supports a reliable absence conclusion within its documented scope.

A missing or unreadable number is not proof of non-registration.

A failed lookup is not proof of non-registration.

An incomplete source cannot support an absence-based discrepancy verdict.

The result must explain the exact conflict.

### Rule 3: Could not confirm

This is the safe fallback.

Use when:
- Critical information is missing.
- A critical field is unreadable.
- The user has not confirmed required fields.
- The lookup fails.
- The source is inaccessible.
- The source is partial and the product is not found.
- The record lacks required provenance.
- The record is stale where freshness is material.
- The category is unsupported for registry comparison.
- The identity comparison is ambiguous.
- The extraction process fails.

The result must explain what information is missing and what the user can do next.

### Rule 4: Registry details match

This verdict is permitted only when every condition below passes:

1. The source is official or otherwise explicitly approved for the applicable comparison.
2. The source and retrieval date are recorded.
3. The record has complete required identity fields.
4. The registration number was explicitly confirmed by the user.
5. The registration number matches after only permitted format normalisation.
6. Brand, product name and manufacturer are present and confirmed.
7. The comparison rules are satisfied.
8. The record status is sufficiently clear and current.
9. The category is eligible for positive matching.
10. The alert index has been checked under the declared coverage policy.
11. No applicable alert match exists.
12. The decision engine returns a valid, auditable result.

For medicines, active ingredient, strength and dosage form must also be confirmed wherever those fields are available and required for the identity comparison.

The result must always display:

**A matching registration record does not prove that the physical contents of this pack are genuine or safe.**

## 6.3 Source coverage and record completeness

These are separate concepts.

**Source coverage**
- `complete`
- `partial`
- `none`

**Record completeness**
- `complete`
- `incomplete`

A partial source may support a positive comparison against an individually verified complete record.

A partial source cannot support a category-wide absence conclusion.

A complete source designation requires documented evidence of scope, access method, data completeness and review date. It must never be inferred from the number of records collected.

## 6.4 Additional flags

Flags are independent of the primary verdict.

| Flag | Trigger | Behaviour |
|---|---|---|
| Lookalike name | Tested resemblance to another name | Informational warning only |
| Alert on this brand | Alert mentions the brand but no affected batch/name match exists | Display alert context without changing verdict |
| Missing registration number | Number not found or unreadable on pack | Explain that comparison is limited |
| Date issue | Ambiguous or inconsistent printed dates | Display warning |
| Expired product | Confirmed expiry before current server date | Prominent notice |
| Seller concern | User-reported selling-context concern | Label explicitly as user-reported |
| Incomplete source | Source cannot support a comprehensive conclusion | Disclose limitation |

Flags cannot override the primary verdict.

## 6.5 Date rules

- Server UTC time is the authoritative calculation source.
- Display dates in Africa/Lagos local time where relevant.
- Month-only expiry means expiry at the end of that month, provided the date format is unambiguous.
- Ambiguous dates require user confirmation.
- Manufacture after expiry creates a date issue.
- Future manufacture dates create a date issue.
- Expiry notices do not independently change registration verdicts.

## 6.6 Visual treatment

- Use neutral, distinct icons.
- Never use a green approval tick or certification seal.
- Never use red/green alone to communicate meaning.
- Display the verdict label in text.
- Keep the non-authentication reminder visible.
- Use consistent result hierarchy across categories.

---

# 7. End-to-End User Journeys

## 7.1 Journey A: First-time scan

1. User opens the landing page.
2. User selects Scan a product.
3. Product displays supported categories and the service limitation.
4. User accepts the relevant image-processing notice.
5. User chooses camera or image upload.
6. User captures the front of the pack.
7. User may add back and batch-area images.
8. Client checks image quality.
9. User reviews images.
10. Images are compressed.
11. Server extracts packaging information.
12. Server validates extraction output.
13. User reviews extracted information.
14. User explicitly confirms the registration number.
15. User confirms brand, product name and manufacturer.
16. For medicines, user also confirms strength and relevant identity details.
17. Server executes the deterministic comparison.
18. Result page displays verdict and evidence.
19. User may inspect the reference, report a concern or share the result.

## 7.2 Journey B: Poor image quality

1. Image quality check identifies blur, glare, low brightness or unreadable text.
2. User sees the specific issue.
3. The app provides capture guidance.
4. User retakes the image.
5. If the second attempt fails, manual entry or official-source link-out is offered where appropriate.
6. The app does not generate a confident verdict from unreadable information.

## 7.3 Journey C: Manual registration entry

1. User chooses Type details manually.
2. User enters the registration number.
3. User enters brand, product name and manufacturer where required.
4. User confirms the values.
5. The same source, coverage, alert and verdict rules run.
6. The result discloses that the details were manually supplied.

Manual input cannot bypass the positive evidence gate.

## 7.4 Journey D: Alert match

1. User submits a pack.
2. Critical details are extracted and confirmed.
3. The alert matcher compares exact batch or approved affected-pack-name evidence.
4. A specific alert is identified.
5. The result displays the original alert and matched details.
6. The user receives a cautious next step and official source link.

## 7.5 Journey E: Report concern

1. User selects Report a concern.
2. The app displays the evidence available.
3. User may optionally provide purchase location and date.
4. User reviews the report content.
5. User selects a verified official reporting channel.
6. User chooses copy, email or call.
7. TrueLabel does not claim that the regulator received the report unless an authorised integration confirms delivery.

## 7.6 Journey F: Share result

1. User selects Share result.
2. Server validates the current scan result.
3. Server creates a separate share record.
4. A high-entropy token is generated.
5. Only approved confirmed fields, verdict and evidence metadata are copied.
6. User receives a share URL.
7. Recipient opens a read-only page.
8. The page checks expiry and validity.
9. Expired records show a clear unavailable state.

Original images and personal data are never included.

---

# 8. Reference Library and Product Data

## 8.1 Purpose

The Reference Library provides comparison context for known product variants.

It is not an authentication database.

It must not imply that a pack is genuine simply because it resembles a reference card.

## 8.2 Required reference fields

- Category.
- Brand.
- Product name.
- Manufacturer.
- Applicant, where available.
- Registration number.
- Product variant.
- Pack size.
- Market/region.
- Source tier.
- Field-level provenance.
- Verification status.
- Last checked date.
- Original source URL.
- Reference schematic.
- Relevant official alerts.

Medicine cards may additionally contain:
- Active ingredients.
- Strength.
- Dosage form.
- Route, where sourced.
- Officially sourced registration details.

## 8.3 Source tiers

**Tier 1: Official regulatory source**

NAFDAC records, official NAFDAC notices and other authorised regulatory publications.

**Tier 2: Brand-provided information**

Written permission is required. Clearly identify the information as brand-provided.

Brand information cannot override official records or influence verdict logic.

**Tier 3: Team-observed packaging**

Physical products purchased through a documented channel. Use only for observable packaging information.

**Excluded:** Unverified marketplace photographs, anonymous community submissions and unsupported social media claims.

## 8.4 Initial library target

Target: 8–12 verified cards.

Suggested composition:
- 3 toothpaste products.
- 3 food or beverage products.
- 2 bottled-water products.
- 2 cosmetics.
- 1 medicine.

These are targets, not a requirement to invent records to meet a quota.

A card is not published until its source and provenance requirements pass.

## 8.5 No-card fallback

When no verified card exists, show:
- What information was extracted.
- What the available source can establish.
- What remains unknown.
- A category-appropriate checklist.
- An official-source link.

Never present an incomplete reference library as comprehensive.

---

# 9. Data Sources and Source Governance

## 9.1 Official source landscape

The initial source investigation identifies:

1. NAFDAC iRIMS product verification services.
2. NAFDAC NAPAMS verification services.
3. NAFDAC Greenbook registered-product database.
4. NAFDAC public recalls and safety alerts.

These are distinct services and datasets.

The product team must document each source's actual accessible fields, category coverage, terms, verification behaviour and permissible storage before using it.

## 9.2 Source register

| Source | Intended use | Initial policy |
|---|---|---|
| [NAFDAC iRIMS](https://services.nafdac.gov.ng/) | Official product and certificate verification | Manual link-out; integration only with documented permission |
| [NAFDAC NAPAMS](https://registration.nafdac.gov.ng/) | Product verification and category-specific information | Manual link-out and approved manual review |
| [NAFDAC Greenbook](https://greenbook.nafdac.gov.ng/) | Registered-product reference | Official source for records explicitly available within its scope |
| [NAFDAC alerts](https://nafdac.gov.ng/category/recalls-and-alerts/) | Public alert index | Curated alert records with original notice links |

The presence of a public page does not automatically grant permission for automated extraction, redistribution or bulk storage.

## 9.3 Source ingestion

For each imported record, store:

- Source identifier.
- Source name.
- Source URL.
- Source category.
- Retrieved timestamp.
- Last verified timestamp.
- Verification method.
- Verifier.
- Source scope.
- Permitted use status.
- Data version.
- Field-level provenance.

No source may be represented as complete without a documented coverage assessment.

## 9.4 Alert curation

Each alert must be reviewed against the original NAFDAC publication.

Store:
- Alert number.
- Title.
- Issue date.
- Original URL.
- Product category.
- Affected product names.
- Genuine brand names, where explicitly stated.
- Affected batch numbers.
- Manufacturer, where available.
- Exact affected-pack descriptions.
- Alert status and subsequent updates.
- Retrieval date.
- Reviewer.
- Review notes.

Historical alerts remain historical evidence; they do not automatically become irrelevant after 14 days.

The 14-day rule from v3.1 is replaced with a review-service-level target:

- Review the official alert index at least weekly.
- Record every successful review.
- Alert users when the last successful review exceeds the declared freshness target.
- Never imply that an old index proves no newer alert exists.

## 9.5 Freshness policy

| Data | Review target | Behaviour when stale |
|---|---|---|
| Registry records | Within 90 days, unless the source requires more frequent review | Display stale notice; block positive matching where current status cannot be established |
| Alert index | Weekly | Disclose last review and inability to guarantee newer alerts are included |
| Reference cards | Within 90 days | Display stale notice |
| Official URLs | Link-check periodically | Remove or disable broken links pending review |

A refresh attempt does not update the last-verified timestamp unless it succeeds.

---

# 10. Functional Requirements

## 10.1 Capture and upload

Requirements:
- Browser camera and file input.
- Rear-camera preference where supported.
- JPEG, PNG and supported modern mobile image formats.
- Up to three images per scan.
- Front, back and batch-area capture guidance.
- Image quality checks.
- Client-side compression.
- Maximum 4 MB request body.
- Long-edge target of 1600 pixels.
- Target image size below 500 KB.
- Maximum 800 KB per image where evaluation supports the need.
- No upload when compression fails.
- Retry and retake controls.

Acceptance criteria:
- User can capture or upload an image.
- User can preview and remove an image.
- Poor image quality produces a meaningful explanation.
- Compression failure prevents upload.
- Unsupported file types are rejected.
- Request-size limits are enforced server-side.
- Upload progress and recoverable errors are visible.

## 10.2 AI extraction

The extraction service must:
- Accept only approved images and a fixed extraction schema.
- Return structured JSON.
- Preserve original printed text.
- Return a separate normalised candidate.
- Return model-reported confidence.
- Return extraction status.
- Return image readability information.
- Reject malformed output.
- Perform at most one controlled retry.
- Never return a verdict.

Acceptance criteria:
- Every model response is validated using Zod.
- Unknown fields are rejected or safely discarded according to the versioned schema.
- Critical extraction failures require user correction or manual entry.
- Model output cannot execute tools or application actions.
- Prompt injection in packaging text is treated as untrusted data.

## 10.3 Confirmation

Required review fields:
- Category.
- Brand.
- Product name.
- Registration number.
- Manufacturer.
- Batch number.
- Manufacture date.
- Expiry date.
- Product-specific fields.

The user must explicitly confirm:
- Registration number.
- Brand.
- Product name.
- Manufacturer.

For medicines:
- Strength.
- Active ingredient, where present and relevant.
- Dosage form, where present and relevant.

An extraction confidence score cannot substitute for confirmation.

## 10.4 Comparison

The comparison service:
- Retrieves approved registry records.
- Retrieves approved alert records.
- Validates source coverage.
- Validates individual record completeness.
- Applies field-specific normalisation.
- Applies documented matching rules.
- Applies freshness policy.
- Generates a deterministic decision object.

The service must not use an LLM to determine whether records match.

## 10.5 Reference Library

- Structured data, not free-form model output.
- Versioned records.
- Explicit pack variants.
- Field-level provenance.
- Source and freshness metadata.
- No-card fallback.

## 10.6 Reporting

- Prefill only confirmed information.
- Clearly distinguish extracted facts from user-supplied information.
- Provide official contact details only after verification.
- Avoid automatic accusation wording.
- Never claim report delivery without confirmation.

## 10.7 Sharing

- Server-side share creation.
- Random high-entropy token.
- Store token hash, not plaintext token.
- 30-day expiry.
- Read-only public page.
- No original images.
- No personal information.
- Noindex and nofollow.
- Generic link preview.
- Expiry checked on every request.
- Cleanup job for expired records.

## 10.8 Local state

- No persistent original photographs.
- No IndexedDB image storage by default.
- Local state only for necessary short-lived workflow recovery.
- Clear scan action.
- Automatic transient-state expiry.
- No cloud-synced personal history in MVP.

## 10.9 Analytics

Track only defined events.

Events:
- `scan_started`
- `image_uploaded`
- `extraction_completed`
- `field_confirmed`
- `field_edited`
- `verdict_generated`
- `reference_opened`
- `report_started`
- `share_created`
- `dispute_submitted`
- `scan_failed`

Do not log:
- Images.
- Raw OCR payloads.
- Phone numbers.
- Personal medical information.
- Unnecessary user-entered free text.

---

# 11. Medicine Module and Safety Boundaries

## 11.1 Scope

The medicine module is a label-reading feature only.

It helps users view what is printed on the pack.

It does not determine how a person should use the medicine.

## 11.2 Permitted functionality

- Extract printed medicine name.
- Extract active ingredient.
- Extract printed strength.
- Extract dosage form.
- Display printed directions.
- Display manufacturer and registration information.
- Display relevant official alerts.
- Provide a fixed pharmacist escalation notice.

## 11.3 Prohibited functionality

- Dose calculations.
- Dose conversion.
- Dosing schedules.
- Reminder schedules.
- Drug interaction analysis.
- Missed-dose guidance.
- Treatment duration recommendations.
- Prescription interpretation.
- Pregnancy or breastfeeding suitability advice.
- Child-specific dosing.
- Symptom assessment.
- Personalised medical recommendations.

## 11.4 Printed directions

Original printed directions must appear first.

The app must preserve:
- All numbers.
- Units.
- Medicine names.
- Frequency terms.
- Route.
- Duration.
- Warnings.

Do not interpret OD, BD, TDS, QDS, PRN or similar shorthand.

If the directions are unreadable or ambiguous, display:

**These directions could not be read clearly. Please ask a pharmacist to explain them.**

## 11.5 Fixed safety notice

"For questions about using this medicine, speak with a pharmacist or qualified healthcare professional. TrueLabel does not prescribe or change medicine directions."

## 11.6 Medicine release gate

Before medicine label interpretation or any future rewrite functionality:
- Obtain qualified pharmacist review.
- Approve the exact templates.
- Review all test fixtures.
- Test number and unit preservation.
- Test unreadable and ambiguous directions.
- Confirm that no dosing recommendation can be generated.

Verbatim display may be enabled independently once extraction and privacy gates pass.

---

# 12. AI Architecture and Model Governance

## 12.1 Responsibility separation

| Layer | Responsibility |
|---|---|
| Image processing | Compression and quality checks |
| AI extraction | Read printed packaging information |
| Schema validation | Reject invalid model output |
| Normalisation | Produce field-specific comparison values |
| Source retrieval | Retrieve approved records |
| Matching engine | Compare confirmed values |
| Verdict engine | Determine one of four verdicts |
| Explanation layer | Render fixed, approved language |
| Optional audio | Read approved result text aloud |

## 12.2 Model constraints

- Pin exact provider and model IDs.
- Record model version.
- Record prompt version.
- Record schema version.
- Record latency and outcome.
- No tools for extraction.
- No registry information in the extraction prompt.
- No AI-generated verdict.
- No AI-generated alert match.
- No model authority to alter user-confirmed fields.

## 12.3 Confidence handling

Model-reported confidence is not a calibrated probability.

It must:
- Be evaluated per field.
- Be compared against labelled data.
- Never be represented as accuracy.
- Never replace explicit confirmation.
- Never independently authorise a positive verdict.

## 12.4 Extraction schema

The following is the canonical logical schema. Implement with Zod and generate the JSON schema from the same source definition.

```typescript
type ExtractionStatus =
  | "readable"
  | "uncertain"
  | "missing";

type ExtractedField = {
  value: string | null;
  printedText: string | null;
  confidence: number | null;
  status: ExtractionStatus;
};

type ProductExtraction = {
  schemaVersion: string;

  category:
    | "food"
    | "beverage"
    | "water"
    | "cosmetic"
    | "toothpaste"
    | "medicine"
    | "household"
    | "other";

  imageQuality: {
    readable: boolean;
    issues: string[];
  };

  fields: {
    brand: ExtractedField;
    productName: ExtractedField;
    registrationNumber: ExtractedField;
    manufacturer: ExtractedField;
    batchNumber: ExtractedField;
    manufactureDate: ExtractedField;
    expiryDate: ExtractedField;
    netContent: ExtractedField;
    ingredientsText: ExtractedField;
    activeIngredients: ExtractedField[];
    strength: ExtractedField;
    dosageForm: ExtractedField;
    printedDirections: ExtractedField;
  };
};
```

All values must be nullable where absence is possible.

Confidence must be constrained to 0–1 when provided.

Do not convert missing values into empty strings and then treat them as valid identity data.

---

# 13. Evaluation and Quality Assurance

## 13.1 Evaluation dataset

Version 1 uses an 80-image labelled prototype dataset.

| Dataset | Count | Purpose |
|---|---:|---|
| Clear genuine product images | 30 | Extraction and false-positive testing |
| Difficult packaging images | 20 | Blur, glare, curved surfaces and multiple sides |
| Non-product images | 10 | Correct rejection |
| Synthetic lookalikes | 10 | Similarity flag testing |
| Prompt-injection labels | 10 | Untrusted text handling |
| **Total** | **80** | |

Dataset membership must be fixed and versioned.

Store image hashes and labels.

Do not describe this dataset as statistically representative of the Nigerian market.

## 13.2 Evaluation gates

| Test | Acceptance requirement |
|---|---|
| Critical field confirmation | Zero unconfirmed critical fields shown as confirmed |
| Clear-image extraction | At least 90% for brand, product and registration number |
| Difficult-image extraction | At least 75% for applicable readable fields |
| Manufacturer and expiry | At least 85% on clear images |
| Non-product rejection | 10/10 correctly rejected or routed to an unsupported state |
| Alert matching | 100% of seeded exact-match fixtures |
| Clean alert fixtures | Zero unsupported alert verdicts |
| Partial registry source | Zero absence-based discrepancy verdicts |
| Prompt injection | Zero successful instruction-following cases |
| Medicine text preservation | 100% preservation of required values in approved test cases |
| Prohibited wording | Zero prohibited TrueLabel-authored claims in audited output |
| Share privacy | Zero original image or personal data exposure |
| Verdict consistency | Identical inputs and engine version produce identical results |

For synthetic lookalikes, report the number detected and the number of false flags separately.

Do not use a synthetic detection rate as a real-world counterfeit detection claim.

## 13.3 Automated tests

Unit:
- Every verdict rule.
- Every source coverage state.
- Record completeness.
- Alert matching.
- Number normalisation.
- Date parsing.
- Expiry.
- Stale records.
- User confirmation.
- Manual entry.

Integration:
- Extraction API.
- Registry retrieval.
- Alert retrieval.
- Share creation.
- Share expiry.
- Rate limiting.
- Database failures.

End-to-end:
- Complete scan.
- Poor-quality image.
- Manual entry.
- Registry match.
- Registration discrepancy.
- Alert match.
- Could not confirm.
- Medicine label.
- Share result.
- Expired share.
- Network interruption.

## 13.4 Usability acceptance

At least 4 of 5 formative participants must:
- Complete the core scan without assistance.
- Understand the result.
- Identify the relevant next step.
- Explain that a registry match is not proof of authenticity or safety.

Any recurring misunderstanding involving safety or verdict meaning must be fixed before public release.

---

# 14. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Home-page LCP below 3 seconds on the agreed mobile test profile |
| JavaScript | Initial home-route JavaScript target below 150 KB gzipped |
| Capture | Median below 8 seconds and p95 below 12 seconds from photo submission to confirmation screen on the agreed test profile |
| Verdict | p95 below 3 seconds from confirmed submission to rendered result, excluding separately disclosed exceptional provider failures |
| Accessibility | WCAG 2.2 AA target |
| Security | Server-side validation, rate limiting, secure secrets and least privilege |
| Reliability | Explicit error and retry states |
| Privacy | No intentional original-photo persistence |
| Scalability | Stateless web request handling with bounded processing |
| Observability | Redacted logs and measurable service health |
| Cost | Measured AI and infrastructure cost per scan |
| Freshness | Visible source timestamps |
| Compatibility | Current supported mobile and desktop browsers |

## 14.1 Failure behaviour

**AI unavailable:** Provide retry and manual entry.

**Registry unavailable:** Return Could not confirm and show official-source link.

**Alert service unavailable:** Do not claim no alert exists. Disclose that alert matching could not be completed.

**Database unavailable:** Do not generate a fabricated verdict or share URL.

**TTS unavailable:** Keep the full text experience functional.

**Share creation failure:** Keep the original result visible and explain that sharing is temporarily unavailable.

**Network interruption:** Preserve only safe transient workflow state.

**Spend cap reached:** Stop expensive processing safely and display a retry-later state.

---

# 15. Privacy, Security and Legal Requirements

## 15.1 Data protection

TrueLabel must comply with applicable Nigerian data protection requirements, including the Nigeria Data Protection Act 2023.

Before release:
- Determine controller and processor responsibilities.
- Identify lawful bases for each processing activity.
- Prepare a privacy notice.
- Identify processors and subprocessors.
- Document cross-border transfer arrangements.
- Assess whether a Data Protection Impact Assessment is required.
- Establish data subject request handling.
- Define breach response procedures.
- Review retention and deletion obligations.
- Obtain qualified legal/privacy review.

Consent must not be treated as a universal solution for every processing risk.

## 15.2 Image privacy

Product photographs may incidentally contain:
- People.
- Faces.
- Locations.
- Receipts.
- Personal identifiers.
- Other unrelated content.

The application must discourage unnecessary capture.

Images must be processed transiently.

TrueLabel must not intentionally persist original product photographs to:
- Database tables.
- Application logs.
- Analytics.
- User history.
- Object storage.
- Public share records.

Provider-side retention must be reviewed separately.

## 15.3 AI provider gate

Before any photograph is sent to an AI provider, document:
- Provider identity.
- Contract and applicable terms.
- Input retention.
- Model training usage.
- Human review.
- Subprocessors.
- Data residency.
- Cross-border transfer basis.
- Deletion mechanism.
- Security controls.
- Relevant account settings.

A privacy notice must accurately describe actual provider behaviour.

If processing cannot be justified and disclosed, photo processing remains disabled.

## 15.4 Retention policy

| Data | Retention |
|---|---|
| Original photographs | Transient processing only; no intentional TrueLabel persistence |
| Temporary extraction state | Maximum 30 minutes |
| Confirmed scan data | Current session only unless a separately approved purpose requires retention |
| Share record | 30 days |
| Share token | Hash only; associated record deleted at expiry |
| WhatsApp session | 30 minutes when introduced |
| Webhook deduplication | Minimum operational period, explicitly documented |
| Audio cache | Fixed TTL; approved non-personal content only |
| Analytics | Proposed 90-day operational window, subject to legal review |
| Error logs | Platform retention policy with redaction and documented access |

Retention periods must be implemented, not merely stated in the privacy notice.

## 15.5 Security controls

- HTTPS.
- Secure HTTP headers.
- Server-side secrets.
- Input validation.
- Request-size limits.
- Rate limiting.
- CSRF and origin protection where applicable.
- Secure random tokens.
- Hashed share tokens.
- Least-privilege database access.
- Dependency scanning.
- Authentication for administrative operations.
- Audit logs for source changes.
- PII-redacted error reporting.
- Backup and recovery procedures.
- Automated deletion jobs.
- Production/staging environment separation.

## 15.6 Legal boundaries

Before public launch, obtain review of:
- Consumer-facing claims.
- Regulatory-source use.
- Intellectual property.
- Brand and trademark availability.
- Privacy notice and terms.
- Medical and pharmaceutical wording.
- Liability and complaint handling.
- Reporting workflow.

Do not use NAFDAC's logo or imply official partnership without permission.

Do not imply that NAFDAC endorses TrueLabel.

---

# 16. Technical Architecture

## 16.1 Application stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS |
| Components | Accessible Radix/shadcn primitives with project-specific design system components |
| Validation | Zod |
| Internationalisation | next-intl |
| Local state | Minimal client-side state |
| Database | PostgreSQL |
| ORM | Prisma |
| Hosting | Vercel |
| Database hosting | Neon |
| Rate limiting/cache | Upstash Redis |
| AI | Approved vision provider through an adapter |
| Image processing | Browser-side compression |
| Testing | Vitest and Playwright |
| CI/CD | GitHub Actions |
| Monitoring | Sentry or equivalent with PII redaction |

## 16.2 Architecture principles

- Keep the verdict engine provider-independent.
- Keep domain logic outside React components.
- Use explicit data-access boundaries.
- Keep AI provider calls server-side.
- Never expose API secrets to the browser.
- Use schema validation at every external boundary.
- Use versioned source datasets.
- Keep optional channels isolated from the core web workflow.
- Do not build infrastructure that is unnecessary for MVP.

## 16.3 High-level architecture

```text
Mobile / Desktop Browser
          |
          v
     Next.js App
          |
          v
     Scan API
          |
          v
   Image Processing
          |
          v
   Extraction Adapter
          |
          v
    Schema Validation
          |
          v
  User Confirmation
          |
          v
   Domain Decision Layer
       /          \
      v            v
Registry Data   Alert Index
      \            /
       \          /
          v
    Verdict Engine
          |
          v
  Explanation Templates
          |
          v
     Result Screen
          |
          v
   Optional Share API
```

## 16.4 API specification

### `POST /api/scans`

Accepts product images and a processing consent reference.

Returns a temporary scan identifier and extraction state.

### `GET /api/scans/:id`

Returns the current processing state.

### `PATCH /api/scans/:id/confirm`

Accepts user-reviewed fields and explicit confirmation states.

Runs the deterministic comparison after validation.

### `GET /api/scans/:id/result`

Returns the validated result and evidence metadata.

### `POST /api/shares`

Creates a share record from a server-held validated result.

### `GET /api/shares/:token`

Returns a read-only share record if valid and unexpired.

### `DELETE /api/scans/:id`

Clears eligible transient scan state.

### `POST /api/feedback`

Records a controlled feedback event without unnecessary free-form personal information.

All endpoints require:
- Request schema validation.
- Appropriate rate limits.
- Explicit error contracts.
- Structured, redacted logging.

## 16.5 Standard error contract

```typescript
type ApiError = {
  code:
    | "INVALID_INPUT"
    | "UNSUPPORTED_FILE"
    | "FILE_TOO_LARGE"
    | "IMAGE_UNREADABLE"
    | "EXTRACTION_FAILED"
    | "SOURCE_UNAVAILABLE"
    | "CONFIRMATION_REQUIRED"
    | "SCAN_EXPIRED"
    | "SHARE_EXPIRED"
    | "RATE_LIMITED"
    | "INTERNAL_ERROR";

  message: string;
  retryable: boolean;
  requestId: string;
};
```

Never return internal stack traces or provider credentials.

## 16.6 Domain library

The following must be pure TypeScript modules:

- `normalization`
- `registration-validation`
- `date-validation`
- `record-completeness`
- `source-coverage`
- `identity-matching`
- `alert-matching`
- `verdict-engine`
- `reason-codes`
- `evidence-validation`

Every module must have unit tests.

## 16.7 Database design

Core entities:

- `RegistrySource`
- `RegistryRecord`
- `RegistryRecordField`
- `ReferenceProduct`
- `ReferenceProductVariant`
- `Alert`
- `AlertAffectedProduct`
- `AlertAffectedBatch`
- `Scan`
- `Extraction`
- `ConfirmedScanField`
- `VerdictResult`
- `VerdictEvidence`
- `ShareRecord`
- `Event`
- `SourceReview`
- `AdminAuditLog`

Required relationships:

- A registry record belongs to one registry source.
- A reference product can link to multiple relevant registry records through an explicit relationship.
- A product has separately identifiable pack variants.
- An alert can contain multiple affected products and batches.
- A verdict can reference multiple evidence records.
- A share record references one validated result.
- Source updates are versioned and auditable.

## 16.8 Database constraints

- Scoped uniqueness for registration numbers.
- Explicit foreign keys.
- Enumerated verdict and status values.
- Indexed expiry fields.
- Indexed source and category fields.
- Unique share-token hashes.
- Unique alert numbers.
- Controlled event types.
- Schema-validated JSON fields.
- No orphaned evidence.
- Idempotent seed imports.

Do not use a single generic JSON field as a substitute for relationships required for matching or auditability.

---

# 17. Admin and Data Operations

## 17.1 MVP operational requirements

Even without a full admin dashboard, the product must have a controlled way to:
- Add registry records.
- Update source provenance.
- Review alert records.
- Disable incorrect records.
- Update reference cards.
- Inspect source freshness.
- View import failures.
- Record data-review decisions.

## 17.2 Data-change workflow

1. Import or propose a source record.
2. Validate required fields.
3. Confirm original source.
4. Review field-level provenance.
5. Assign category and coverage.
6. Approve or reject.
7. Record reviewer and timestamp.
8. Publish through a versioned import.
9. Run matching regression tests.
10. Maintain rollback capability.

No unreviewed alert or registry record may silently enter production.

## 17.3 Operational ownership

| Responsibility | Owner |
|---|---|
| Product requirements and release | Product owner |
| Technical architecture and deployment | Engineering lead |
| Registry and alert curation | Data owner |
| AI evaluation | Engineering/AI owner |
| Medicine safety review | Qualified pharmacist |
| Privacy and legal review | Qualified privacy/legal reviewer |
| User research | Product/design owner |
| Incident handling | Engineering lead and product owner |

The same person may hold multiple roles in the capstone, but each responsibility must have an identified owner.

---

# 18. Business Model and Commercial Strategy

## 18.1 Commercial principle

TrueLabel must not sell favourable verdicts.

The commercial model must not undermine the independence of product comparisons.

## 18.2 Initial model

MVP is consumer-first and free to use during validation.

The first release is intended to validate:
- Consumer demand.
- Scan completion.
- Comprehension.
- Return usage.
- Infrastructure costs.
- Data coverage.
- Operational feasibility.

Do not introduce paywalls before these assumptions have been tested.

## 18.3 Future revenue hypotheses

Potential future models include:

**Institutional subscriptions**
- Access to structured product information.
- Research tools.
- Aggregate reporting.
- Operational dashboards.

**Consumer protection partnerships**
- Funded access to public-interest product information.
- Community education.
- Supported reporting initiatives.

**Brand-supported reference management**
- Paid submission and review of brand-provided reference material.
- Explicit source labelling.
- Independent verification.
- No control over verdicts or result placement.

**Enterprise integrations**
- Approved data services for organisations.
- Documented access permissions.
- Service-level agreements.

## 18.4 Revenue restrictions

No payment may:
- Change verdicts.
- Remove alerts.
- Hide negative evidence.
- Improve a brand's matching score.
- Change result ordering.
- Purchase a positive label.
- Suppress official information.

All commercial relationships must be disclosed.

## 18.5 Unit economics

Track:
- AI cost per scan.
- Infrastructure cost per scan.
- Storage and processing costs.
- Cost of data curation.
- Operational review time.
- Support cost.
- Cost per returning user.

A sustainable public service requires a documented monthly operating budget.

---

# 19. Product Analytics and Success Metrics

## 19.1 North Star metric

**Successful evidence-understood checks per week.**

A successful evidence-understood check is a completed check in which the user reaches a result and demonstrates or indicates comprehension of the result's meaning and limitation.

This is a better measure of value than raw scan volume.

## 19.2 Product metrics

| Metric | Definition |
|---|---|
| Scan starts | Number of scan workflows initiated |
| Scan completion rate | Completed scans divided by started scans |
| Extraction success | Successful valid extraction responses divided by extraction attempts |
| Confirmation completion | Confirmed scans divided by confirmation-screen arrivals |
| Field correction rate | Confirmed scans containing one or more edits |
| Verdict distribution | Counts by the four verdicts |
| Evidence coverage | Results with complete source evidence divided by completed results |
| Reference coverage | Eligible scans with an available reference card |
| Share rate | Share records created divided by completed scans |
| Report actions | Initiated official-report actions per 100 completed scans |
| Dispute rate | User feedback indicating disagreement, not ground-truth error |
| Repeat usage | Pseudonymous returning use within the disclosed measurement window |
| Cost per scan | Total processing cost divided by completed scans |
| Comprehension rate | Participants correctly interpreting the result |

## 19.3 Guardrail metrics

- False alert verdicts.
- Unsupported discrepancy verdicts.
- Positive verdicts on incomplete records.
- Critical extraction errors.
- Medicine text-preservation failures.
- Privacy incidents.
- Failed deletion jobs.
- Stale source disclosure failures.
- User misunderstanding of authenticity claims.

Any safety-critical guardrail failure blocks the affected feature.

## 19.4 Reporting

Metrics must be broken down by:
- Product category.
- Verdict.
- Language.
- Device class.
- Source coverage.
- Extraction outcome.

Do not use small sample sizes to claim market-wide accuracy.

---

# 20. Risk Management

| Priority | Risk | Mitigation |
|---|---|---|
| P0 | AI extraction changes critical information | Explicit confirmation and labelled evaluation |
| P0 | Registry match interpreted as authentication | Persistent non-authentication warning |
| P0 | Partial data produces false discrepancy | Coverage and completeness separation |
| P0 | Incorrect alert match | Exact evidence requirements and reviewed alert data |
| P0 | Medicine text changes meaning | Verbatim display and strict preservation |
| P0 | Provider retention is unacceptable | Provider gate before image processing |
| P0 | Unauthorised regulatory-data use | Source-specific permission and terms review |
| P0 | Personal information leaks through images or logs | Transient processing, redaction and deletion tests |
| P0 | Public claims misrepresent regulatory endorsement | Legal review and controlled copy |
| P1 | Stale records | Freshness notices and review operations |
| P1 | Lookalike false positives | Conservative matcher and regression fixtures |
| P1 | Model availability changes | Provider adapter and pinned supported model |
| P1 | Infrastructure cost grows unexpectedly | Spend caps and rate limits |
| P1 | Share URL leakage | High-entropy tokens and hashed storage |
| P1 | Data seed corruption | Checksums, validation and rollback |
| P1 | Poor mobile network | Compression, retry and graceful failure |
| P2 | Incomplete reference library | Honest no-card fallback |
| P2 | Poor Pidgin comprehension | Native-speaker review |
| P2 | Low return usage | Research-led improvements |
| P2 | Weak commercial viability | Validate unit economics before scale |

---

# 21. Release Strategy and Delivery Plan

## 21.1 Delivery approach

The original seven-day plan is retained only as a possible capstone implementation sprint, not as a market-launch commitment.

TrueLabel will use phased delivery.

### Phase 0: Product and evidence readiness

Deliverables:
- Final scope.
- Source register.
- Source terms assessment.
- Provider privacy assessment.
- Privacy and legal requirements.
- Research plan.
- Evaluation dataset.
- Data model.
- Approved verdict rules.

Exit:
No unresolved internal specification ambiguity. External source and provider restrictions are documented.

### Phase 1: Domain foundation

Deliverables:
- Domain types.
- Zod schemas.
- Normalisation.
- Record completeness.
- Source coverage.
- Alert matching.
- Verdict engine.
- Unit tests.

Exit:
Every verdict branch and safety-critical rule passes automated tests.

### Phase 2: Core web experience

Deliverables:
- Landing page.
- Capture and upload.
- Compression.
- Image quality.
- Extraction adapter.
- Confirmation.
- Manual entry.
- Result page.
- Error handling.

Exit:
A complete web scan journey works with controlled test fixtures.

### Phase 3: Data and trust layer

Deliverables:
- Approved registry records.
- Curated alerts.
- Reference cards.
- Provenance.
- Freshness.
- Official links.
- Source coverage disclosure.

Exit:
Every enabled verdict can be traced to approved evidence.

### Phase 4: Safety and supporting features

Deliverables:
- Medicine label-only display.
- Report guidance.
- Share lifecycle.
- Pidgin text.
- Privacy controls.
- Analytics.

Exit:
Safety, privacy and usability acceptance tests pass.

### Phase 5: Restricted pilot

Deliverables:
- Production-like deployment.
- Monitoring.
- Limited user access.
- Support process.
- Incident response.
- Evaluation report.

Exit:
All mandatory pilot gates pass.

### Phase 6: Public launch

Requires:
- Pilot findings reviewed.
- Legal and privacy approvals.
- Source-use permissions.
- Domain and trademark clearance.
- Operational ownership.
- Sustainable cost controls.
- Public support and reporting procedures.

## 21.2 One-week capstone priority

If the implementation must fit into approximately one week, the deliverable is a restricted, evidence-bounded prototype.

Day 1:
- Architecture.
- Source inventory.
- Provider assessment.
- Data model.
- Verdict specification.

Day 2:
- Domain library.
- Normalisation.
- Verdict engine.
- Unit tests.

Day 3:
- Capture.
- Compression.
- Extraction.
- Confirmation.

Day 4:
- Result screen.
- Approved fixture data.
- Alert matching.
- Reference fallback.

Day 5:
- Share.
- Privacy.
- Pidgin text.
- Error states.

Day 6:
- Evaluation.
- Accessibility.
- Usability.
- Regression.

Day 7:
- Restricted deployment.
- Demo.
- Documentation.
- Known limitations.

If the provider gate is not resolved, use approved offline fixtures or a mock extraction adapter. Do not send real user images to an unapproved provider to meet the deadline.

## 21.3 Cut order

Cut in this order:
1. WhatsApp.
2. Audio.
3. Additional reference cards.
4. Local history.
5. Non-essential animations and polish.
6. Additional category coverage.

Never cut:
- Deterministic verdict logic.
- Source provenance.
- Privacy controls.
- Critical-field confirmation.
- Medicine safety boundaries.
- Alert evidence.
- Error handling.
- Accessibility.
- Evaluation.

---

# 22. Release Gates and Decision Register

A release gate applies to a feature, not automatically to every other part of the product.

| ID | Gate | Required evidence | Owner |
|---|---|---|---|
| G-01 | AI provider approval | Terms, settings, subprocessors, retention and transfer assessment | Product owner |
| G-02 | Regulatory source approval | Source terms, scope and permitted use | Product/data owner |
| G-03 | Registry record approval | Provenance and completeness review | Data owner |
| G-04 | Alert approval | Original official notice and exact matching fields | Data owner |
| G-05 | Verdict engine approval | Passing unit and integration tests | Engineering |
| G-06 | Medicine approval | Pharmacist review and preservation tests | Product/pharmacist |
| G-07 | Privacy approval | Notice, retention, transfer and deletion review | Privacy owner |
| G-08 | Security approval | Security and privacy test results | Engineering |
| G-09 | Evaluation approval | Versioned dataset and complete results | Engineering/product |
| G-10 | Usability approval | Formative comprehension and usability findings | Product/design |
| G-11 | Reporting approval | Verified official destinations | Product owner |
| G-12 | Branding approval | Trademark and domain assessment | Product owner |
| G-13 | Operational approval | Monitoring, incident and data-review ownership | Engineering/product |
| G-14 | Public launch approval | Legal, source, privacy, safety and operational sign-offs | Product owner |

## 22.1 Release states

**Development:** Fixtures and mock data may be used.

**Internal testing:** Approved test records and approved provider configurations only.

**Restricted pilot:** Approved features available to a limited group.

**Public launch:** All applicable legal, privacy, source and safety gates approved.

A feature must remain disabled when its specific release gate has not passed.

---

# 23. Open Decisions and Defaults

The following items are explicitly assigned rather than left as vague questions.

| ID | Decision | Default |
|---|---|---|
| D-01 | AI provider | No image processing until approval |
| D-02 | Registry source integration | Official link-out and manually approved records |
| D-03 | Registry coverage | Partial until documented otherwise |
| D-04 | Alert matching | Exact batch or exact approved affected-pack name |
| D-05 | Fuzzy name matching | Informational only; no automatic alert verdict |
| D-06 | Medicine rewrite | Disabled; verbatim display only |
| D-07 | Pidgin audio | Disabled until native-speaker approval |
| D-08 | WhatsApp | Deferred |
| D-09 | User accounts | Excluded |
| D-10 | Local history | Off |
| D-11 | Positive verdict | Only from complete, approved individual evidence |
| D-12 | Missing registration number | Could not confirm with missing-number flag |
| D-13 | Failed source lookup | Could not confirm |
| D-14 | Stale alert index | Disclose limitation; never imply comprehensive absence |
| D-15 | Public branding | Subject to trademark and domain clearance |
| D-16 | Commercial model | Free consumer validation initially |

Every change to these defaults requires a recorded product decision.

---

# 24. Final Acceptance Criteria

TrueLabel MVP is complete when:

1. A user can complete the supported web scanning journey.
2. The application can extract and validate packaging information.
3. The user can review and confirm critical fields.
4. Manual entry uses the same domain logic.
5. Every verdict is generated deterministically.
6. Every verdict has a traceable reason and evidence record.
7. Partial registry coverage cannot create an absence-based discrepancy.
8. Brand-only matches cannot create alert verdicts.
9. Positive results cannot be issued from incomplete identity records.
10. Source freshness is visible.
11. No-card fallback works.
12. Medicine directions are displayed within the label-only boundary.
13. No generated medical recommendation is possible.
14. The report workflow uses verified official destinations.
15. Share links contain no original image or personal information.
16. Expired shares are inaccessible.
17. All primary and failure states are implemented.
18. Privacy controls match actual processing behaviour.
19. Critical evaluation gates pass.
20. Accessibility checks are complete.
21. Operational monitoring is enabled.
22. No unresolved safety-critical release issue remains.

---

# 25. Product Disclaimer and User-Facing Trust Language

The following language must be available across the product.

**About TrueLabel**

TrueLabel helps you read product packaging and compare the information with available regulatory records and public safety alerts.

**Important**

A matching registration record does not prove that the product in your hand is genuine or safe. Registration numbers can be copied, and product contents cannot be authenticated through a photograph.

**When information is incomplete**

We could not establish a reliable comparison using the information currently available. This does not necessarily mean that the product is unregistered.

**When an alert matches**

An official safety alert appears to match the confirmed details you provided. Review the original alert and follow the instructions from the relevant authority.

**About medicines**

TrueLabel displays information printed on medicine packaging. It does not prescribe medicines, recommend doses or replace advice from a pharmacist or qualified healthcare professional.

**About data freshness**

Regulatory information and safety alerts can change. Always consult the original official source for the latest information.

---

# 26. Source Register

Primary sources:

1. NAFDAC iRIMS – https://services.nafdac.gov.ng/
2. NAFDAC NAPAMS – https://registration.nafdac.gov.ng/
3. NAFDAC Greenbook – https://greenbook.nafdac.gov.ng/
4. NAFDAC Recalls and Safety Alerts – https://nafdac.gov.ng/category/recalls-and-alerts/
5. NAFDAC Recalls and Alerts Procedure – https://nafdac.gov.ng/our-services/pharmacovigilance-post-market-surveillance/recalls-safety-alerts/
6. Nigeria Data Protection Act 2023 – https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf
7. Nigeria Data Protection Act General Application and Implementation Directive 2025 – https://ndpc.gov.ng/wp-content/uploads/2025/03/NDP-ACT-GAID-2025-MARCH-20TH.pdf

All external sources must be rechecked before public release.

For every source used in production, retain the exact page or document URL, retrieval date, reviewer, applicable scope and permitted-use decision.

Secondary news sources may be used to discover potential alerts but never replace the original regulatory publication.

---

# Appendix A: Changes from v3.1

| Area | v4.0 change |
|---|---|
| Strategy | Added market positioning, jobs to be done and commercial strategy |
| Target users | Defined primary, secondary and future segments |
| Scope | Established MVP and subsequent releases |
| Verdicts | Clarified missing number, failed lookup and material discrepancy semantics |
| Data sources | Incorporated the current NAFDAC iRIMS, NAPAMS and Greenbook landscape |
| Alert matching | Formalised exact affected-pack evidence requirements |
| User experience | Added screen inventory, hierarchy and global states |
| Functional requirements | Added implementable acceptance criteria |
| AI | Formalised responsibility separation and schema |
| Medicine | Retained strict label-only boundary |
| Architecture | Added API contracts, error contracts and domain boundaries |
| Database | Added explicit entities and relationships |
| Operations | Added controlled source-review workflow |
| Privacy | Expanded legal, processing and deletion requirements |
| Commercial strategy | Added revenue hypotheses and independence safeguards |
| Analytics | Added North Star metric and safety guardrails |
| Delivery | Replaced the one-week launch implication with phased release |
| Governance | Added explicit release gates and decision defaults |

# Appendix B: Implementation Rules

1. The PRD is the product source of truth.
2. The design system is the UI source of truth.
3. Domain logic must not be embedded inside UI components.
4. AI must never select a verdict.
5. No unverified external record may be presented as official evidence.
6. No critical field may be silently confirmed.
7. Every verdict must have an auditable explanation.
8. Every external dependency must have a documented failure state.
9. Every temporary data object must have a defined expiry.
10. Every new feature must pass its relevant acceptance and safety tests.
11. Do not introduce additional product scope without updating the PRD.
12. Never sacrifice trust, safety or evidence integrity for a demonstration deadline.

**End of document.**

