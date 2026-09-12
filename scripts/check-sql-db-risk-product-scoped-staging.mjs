import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SQL_DB_RISK_PRO_OPERATIONS,
  createSqlDbRiskProductScopedController
} from '../tools/sql-db-risk-checker/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.sql_db_risk.product';
const FEATURE_MAP = Object.freeze({
  safeExecutionPack: 'fixture.sql_db_risk.safe_execution_pack',
  reviewSummary: 'fixture.sql_db_risk.review_summary',
  dbChecklist: 'fixture.sql_db_risk.db_checklist',
  migrationReview: 'fixture.sql_db_risk.migration_review',
  teamHandoff: 'fixture.sql_db_risk.team_handoff',
  markdownExport: 'fixture.sql_db_risk.markdown_export',
  jsonExport: 'fixture.sql_db_risk.json_export'
});

assert.deepEqual(SQL_DB_RISK_PRO_OPERATIONS, [
  'safeExecutionPack',
  'reviewSummary',
  'dbChecklist',
  'migrationReview',
  'teamHandoff',
  'markdownExport',
  'jsonExport'
]);
assert.equal(new Set(SQL_DB_RISK_PRO_OPERATIONS).size, 7);

const clientFrom = (response) => ({
  calls: [],
  async refreshProState(input) {
    this.calls.push(input);
    if (response instanceof Error) throw response;
    return typeof response === 'function' ? response(input) : response;
  }
});

const verifiedClient = clientFrom({
  productId: PRODUCT_ID,
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: [
    FEATURE_MAP.safeExecutionPack,
    FEATURE_MAP.dbChecklist,
    FEATURE_MAP.teamHandoff,
    FEATURE_MAP.jsonExport
  ]
});
const controller = createSqlDbRiskProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('safeExecutionPack'), true);
assert.equal(controller.can('dbChecklist'), true);
assert.equal(controller.can('teamHandoff'), true);
assert.equal(controller.can('jsonExport'), true);
assert.equal(controller.can('reviewSummary'), false);
assert.equal(controller.can('migrationReview'), false);
assert.equal(controller.can('markdownExport'), false);
assert.throws(() => controller.can('unknown'), /Unknown SQL DB Risk Checker paid operation/);

const localOnly = createSqlDbRiskProductScopedController({
  entitlementClient: clientFrom({
    productId: PRODUCT_ID,
    active: true,
    source: 'local',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await localOnly.refresh()).active, false);
assert.equal(localOnly.getState().reason, 'non_server_authority');

const wrongProduct = createSqlDbRiskProductScopedController({
  entitlementClient: clientFrom({
    productId: 'fixture.other.product',
    active: true,
    source: 'server',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await wrongProduct.refresh()).active, false);
assert.equal(wrongProduct.getState().reason, 'wrong_product');

const failed = createSqlDbRiskProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(SQL_DB_RISK_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

const wrapperSource = fs.readFileSync(new URL('../tools/sql-db-risk-checker/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of [
  'NWPro',
  'nicheworks_pro',
  'localStorage',
  'buy.stripe.com',
  'sqlInput',
  'function normalizeProductId',
  'function normalizeFeatureMap',
  'function validateVerifiedResponse'
]) {
  assert.equal(wrapperSource.includes(forbidden), false, `SQL DB Risk staged wrapper must not contain legacy authority or SQL content dependency: ${forbidden}`);
}

const appSource = fs.readFileSync(new URL('../tools/sql-db-risk-checker/app-sdrc.js', import.meta.url), 'utf8');

// Free runtime evidence.
assert.match(appSource, /copyRiskSummaryBtn/);
assert.match(appSource, /copyChecklistBtn/);
assert.match(appSource, /copyRiskSummaryBtn\.addEventListener\("click", \(\) => copyText\(/);
assert.match(appSource, /copyChecklistBtn\.addEventListener\("click", \(\) => copyText\(/);

// Current paid output evidence: five copied artifacts + Markdown/JSON exports.
assert.match(appSource, /copySafePackBtn[^\n]*copyProText/);
assert.match(appSource, /copyReviewSummaryBtn[^\n]*copyProText/);
assert.match(appSource, /copyDbChecklistBtn[^\n]*copyProText/);
assert.match(appSource, /copyMigrationReviewBtn[^\n]*copyProText/);
assert.match(appSource, /copyTeamHandoffBtn[^\n]*copyProText/);
assert.match(appSource, /exportMarkdownBtn[^\n]*requirePro\(\)/);
assert.match(appSource, /exportJsonBtn[^\n]*requirePro\(\)/);
assert.match(appSource, /function copyProText\([^)]*\)\s*\{\s*if \(!requirePro\(\)\) return/);

const bridgeSource = fs.readFileSync(new URL('../tools/sql-db-risk-checker/pro-bridge.js', import.meta.url), 'utf8');

// Preserve the previous legacy-gate hardening: entitlement name alone is not active authority.
assert.match(bridgeSource, /const ENTITLEMENT = "nicheworks_pro"/);
assert.match(bridgeSource, /NWPro\.getLocalStatus/);
assert.match(bridgeSource, /buy\.stripe\.com/);
assert.match(bridgeSource, /const entitlementMatches = !status\.entitlement \|\| status\.entitlement === ENTITLEMENT/);
assert.match(bridgeSource, /const hasExplicitActiveState = status\.active === true \|\| status\.pro === true \|\| status\.unlocked === true \|\| status\.status === "active"/);
assert.match(bridgeSource, /Boolean\(entitlementMatches && hasExplicitActiveState\)/);

// Preserve the concurrent runtime safety guard: nested subquery WHERE must not suppress full-table UPDATE/DELETE warnings.
assert.match(bridgeSource, /function hasTopLevelWhere\(sql\)/);
assert.match(bridgeSource, /window\.hasTopWhere = hasTopLevelWhere/);
assert.match(bridgeSource, /window\.SQLDbRiskHasTopLevelWhere = hasTopLevelWhere/);
assert.match(bridgeSource, /depth !== 0/);
assert.match(bridgeSource, /\^where\\b\/i/);

console.log('SQL DB Risk product-scoped staging contracts: OK');
