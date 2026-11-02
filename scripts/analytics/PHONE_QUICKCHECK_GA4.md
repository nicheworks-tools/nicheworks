# Phone QuickCheck first-party GA4 Sheets adapter

Already created and verified the new native Phone QuickCheck計測 tab, gid 1961130202, on:
https://docs.google.com/spreadsheets/d/173S9-lYe45_kLr0nFDX-s5WxH_T_k8sDYGrMorwG5bE/edit#gid=1961130202

STATUS (2026-11-02): Tab installed, but Apps Script importer NOT installed and daily updates NOT yet connected. The Google Sheets connector cannot edit an existing bound Apps Script project or its triggers. Do not claim automated data is already arriving.

First inspect the existing script project behind the current GSC/GA4 daily spreadsheet. Add the separate source file phone-quickcheck-ga4.gs without modifying existing functions. Call syncPhoneQuickCheckAnalytics() from the existing successful daily update function; do NOT add a second trigger. Existing ten sheets remain untouched.

OAuth scopes needed: https://www.googleapis.com/auth/analytics.readonly, https://www.googleapis.com/auth/spreadsheets, https://www.googleapis.com/auth/script.external_request. Check existing Apps Script manifest and permissions before activation. Confirm the GA4 numeric property ID with the existing script; this adapter uses GA4_PROPERTY_ID script property if set, otherwise 519938639.

The adapter fetches four separate 56-day GA4 Data API runReport reports: page_view event count on Phone QuickCheck pagePath; sessions on Phone QuickCheck landingPage; affiliate_outbound event count on Phone QuickCheck pagePath; manualfinder_phone_quickcheck_click events on ManualFinder pagePath. These are distinct GA4 reports, not third-party imports, Amazon orders or revenue.

All four reports must succeed before the fixed 56 x 7 rows A24:G79 are written. Failed authorization/API leaves existing daily rows and last-success date unchanged; no fake zeros. After successful reads, 28-day formulas in B9:D13 will calculate automatically.

Amazon ID nicheworks09-22 is shared with other tools, so Amazon cannot distinguish Phone QuickCheck commission without an additional officially registered ID. Do not change a tag without registration. GA4 event reporting likewise does not verify purchases or commissions.
