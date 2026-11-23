# What is out there, and what TrueLabel takes from it

Research date: 18 November 2026. Method: eight web searches across product scanners, Nigerian drug-check services, accessibility camera apps, medicine pictogram studies, Nigerian fintech UX, device data and in-app browser limits. I read written sources and reviews. I did not open or screenshot the apps, so every visual note below comes from descriptions, not from looking at screens. Check the live apps yourself before copying any layout idea.

No product found does exactly what TrueLabel does: read a pack photo, check it against NAFDAC records, and answer in Pidgin audio. Every reference covers one slice. That is the opening.

---

## 1. Yuka (food and cosmetics scanner)

**What it does.** Scans a barcode and gives a 0 to 100 score with a green-to-red colour code, a detail sheet that explains the score, a history tab, search, and offline use.

**What to take**
- The tab bar opens with the centre tab active, and that tab is the camera. One tap from launch to scanning. TrueLabel: Scan is the centre item and the default.
- Every score comes with a detail sheet that says why. TrueLabel: a "What we checked" list on every result.
- Everything scanned stays in a History tab. TrueLabel: History of check receipts, kept on the device.

**What to avoid**
- The traffic-light score. It is a judgement. TrueLabel reports evidence, so no 0 to 100 score and no green or red.
- "Better alternatives". TrueLabel never recommends other brands.

Sources: https://fueled.com/blog/yuka-empowers-smart-shoppers/ , https://yuka.io/en/app , https://yuka.io/wp-content/uploads/presskit/us/yuka-presskit.pdf

## 2. NAFDAC Mobile Authentication Service (scratch code and SMS) with Sproxil and mPedigree

**What it does.** The shopper scratches a panel to reveal a one-time PIN, texts it to a short code, and gets a reply saying the product is genuine or suspected fake. NAFDAC lists five providers. The service launched in 2010 and covers selected medicines.

**What to take**
- The mental model is familiar. It feels like scratching an airtime card, and replies arrive within about 10 seconds. TrueLabel treats the registration number like a PIN: big, mono-feeling, typed or scanned, with a fast answer.
- It works on any phone and does not need reading skill. TrueLabel keeps audio and a typed path.
- Reply length. A result should be as short as an SMS before the detail.

**What to avoid**
- The binary "genuine or fake" reply. TrueLabel's stance is evidence only.

**Opportunity.** Reports say use stays low where drugs are bought at bus stops, markets and roadside stalls. That matches PRD risk: people may not scan in front of a seller. Design for scanning after the purchase and for sending a result to family.
**Idea:** for medicines, a small "Other ways to check" card that links to NAFDAC's MAS page instead of hard-coding short codes, because codes and providers can change.

Sources: https://nafdac.gov.ng/?p=2429 , https://www.pcworld.com/article/435515/mobile-technology-offers-option-to-combat-fake-drugs-in-west-africa.html , https://primeprogressng.com/prime-health/nigerias-digital-fight-against-deadly-fake-drugs/

## 3. Seeing AI (Microsoft) and Lookout (Google)

**What they do.** Talking-camera apps for blind and low-vision users. Simple channels (Short Text, Documents, Products). Audio beeps that speed up as the barcode gets closer. Spoken prompts to reposition the camera. Lookout adds real-time guidance for taking a good photo and a larger camera view for framing.

**What to take**
- Guidance while framing, not after failure. TrueLabel: a live hint line over the viewfinder ("Move closer", "More light"), spoken if audio is on.
- A larger camera view and fewer controls. TrueLabel: full-bleed viewfinder, three controls.
- One job per mode, named plainly.

**What to avoid**
- Continuous live scanning. Reviewers report phone heating and battery drain with always-on recognition. TrueLabel captures a photo, then reads it once.

Sources: https://sites.google.com/site/duskapesic/hawking/technologies-for-visual-impairments/seeing-ai , https://thenationalnews.com/lifestyle/google-s-lookout-app-can-help-read-food-labels-and-currency-for-blind-people-1.1063049 , https://applevis.com/comment/75112

## 4. Medicine pictogram research

**What it shows.** Pictograms help low-literacy readers, but comprehension is not guaranteed. In a South African study, locally developed pictograms met the 85% comprehension standard far more often than standard USP ones (20 of 23 versus 11 of 23). A Taiwan study found patients and medical staff understood time-of-day and meal pictographs differently.

**What to take**
- Our sun, moon and fork-knife icons are a hypothesis, not a fact. Test them with real Nigerian users. Target at least 85% correct without help.
- Never rely on an icon alone. Icon plus words plus audio.

Sources: https://core.ac.uk/download/145041976.pdf , https://pmc.ncbi.nlm.nih.gov/articles/PMC10437966

## 5. Nigerian fintech apps (OPay, Moniepoint, Kuda)

**What they teach.** Commentary on Nigerian fintech design stresses clarity, speed and trust: clear navigation, few steps, instant confirmation. Designers describe testing on phones with poor screens and networks. Transaction receipts (amount, status, date and time, type, details) are shared as images, and support teams ask for the transaction number and a screenshot when something goes wrong.

**What to take**
- **The check receipt.** Shoppers already know how to share a receipt image on WhatsApp and quote a reference number. TrueLabel's Share output is a "check receipt": a card with a short reference ID, date and time, product, the registration number, the verdict stamp and a plain disclaimer. The reference ID goes into the report message to NAFDAC.
- Instant, unambiguous feedback after the key tap (confirm), then one clear result.
- Low step count. Home to verdict in no more than four taps.

**What to avoid**
- A green "SUCCESS" style status. Our statuses are evidence labels.

Sources: https://www.thisdaylive.com/2026/01/22/nigerian-fintech-ux-offers-fresh-insight-into-the-future-of-global-digital-banking , https://www.vanguardngr.com/?p=2650912 , https://opayweb.com/faqs

## 6. Device and network reality in Nigeria

- KPMG and Orange (September 2026): smartphone penetration 75% in 2025, Android 88%, WhatsApp is how Nigeria communicates, build lightweight apps for mid-range phones.
- StatCounter (October 2026): Tecno 21.3%, Infinix 17.4%, Samsung 17.4%, Xiaomi 13.7%, Apple 13.3%, Itel 5.5%.

**What to take.** Android first. Test on a Tecno, an Infinix, a Samsung and an iPhone. Share through WhatsApp. Light pages. Do not rely on motion or heavy effects.

Sources: https://www.arise.tv/kpmg-nigerias-smartphone-penetration-climbs-to-75-as-economy-becomes-mobile-first/ , https://gs.statcounter.com/vendor-market-share/mobile-tabletconsole/nigeria/2025

## 7. In-app browsers and the camera

Verification vendors report that the Facebook and Messenger in-app browser on Android lacks the camera APIs a live viewfinder needs, and that some phone-maker browsers break them. When you send the person to another browser, open the system default browser, not an embedded view.

**What to take.** Detect camera failure. Offer "Open in your browser", the file-input photo path, and "Type the number instead". Never show a dead camera screen.

Sources: https://devdocs.veriff.com/docs/browser-support-platform-requirements , https://developers.argosidentity.com/en/idcheck/getting-started/webview-camera-troubleshooting

---

## Principles we derive

1. **Scan is home.** Centre tab, default, one tap.
2. **Explain every result.** A "What we checked" list, not a score.
3. **Evidence, not judgement.** No scores, no traffic lights, no brand advice.
4. **Short first, detail second.** An SMS-length answer, then depth on tap.
5. **Guide the photo while framing.** Hint line, optional spoken hint.
6. **Capture once, read once.** No live recognition. Protect battery and heat.
7. **Receipts travel.** A shareable check receipt with a reference ID.
8. **Test the icons.** 85% comprehension target on the medicine icons.
9. **Android first, WhatsApp native, light on data.**
10. **Never a dead end.** Camera fails: file input. Read fails: type the number. Offline: calm message.

## What no reference does (our opening)

Reads the pack and the registration number in one photo, checks the number against the register and alerts, explains each check in plain words, and speaks the result. Combines evidence-only wording with a design that is calm instead of alarming.

## What I could not verify

- I did not see the apps' screens. Yuka's layout notes come from a review and its own site.
- Nothing here proves our flow works for your users. Run five sessions.
- NAFDAC's MAS provider list and short codes may change. Link out, do not hard-code.
- I did not find a Nigerian-built pack checker beyond MAS and the providers named. Absence in a search is not proof of absence.
