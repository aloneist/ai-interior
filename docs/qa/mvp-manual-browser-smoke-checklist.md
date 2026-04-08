# MVP Manual Browser Smoke Checklist

## Purpose
This checklist is for real browser validation of the MVP user flow when browser capability is available.

It is separate from API-only validation. Passing API smoke does not prove the browser flow works.

## Environment Assumptions
- Run against a deployed staging URL or a local dev server opened in a real browser.
- Supabase and required service credentials must point at the intended test environment.
- The DB contract migration for canonical products must already be applied.
- Use test-safe product interactions; outbound clicks may open live retailer pages.
- If testing local dev, start the app with `npm run dev` and open `http://localhost:3000`.

## Browser-Only Smoke Flow

### 1. Open App
Steps:
1. Open the app URL in a browser.
2. Confirm the page title is `AI 인테리어 큐레이션`.
3. Confirm the first screen shows the MVP intro and `내 공간으로 시작하기`.

Expected result:
- Page loads without a framework error overlay.
- Main content is visible and not blank.

Failure examples:
- Blank page.
- Next.js error overlay.
- Browser tab still says `Create Next App`.

### 2. Image Input
Steps:
1. Click `내 공간으로 시작하기`.
2. Provide a public image URL, or upload a room image.
3. Select a room type.
4. Click `다음`.

Expected result:
- The selected/entered image preview is visible.
- The `다음` button remains disabled until image and room type are present.
- The flow advances to conditions after valid input.

Failure examples:
- Button enables before required inputs are present.
- Image preview disappears after room selection.
- Upload succeeds but the next step has no image context.

### 3. Conditions
Steps:
1. Select at least one mood.
2. Select one budget.
3. Select at least one furniture type.
4. Optionally edit the request text.
5. Click `추천 받기`.

Expected result:
- The button remains disabled until mood, budget, and furniture are selected.
- Loading state appears after submit.
- The page does not reset selected conditions unexpectedly.

Failure examples:
- Submit button is enabled with missing conditions.
- Loading gets stuck without an error message.
- Error message is too vague to tell whether image analysis, candidates, budget, or product data failed.

### 4. Recommendation Results
Steps:
1. Wait for recommendations.
2. Confirm result header shows current image/source and selected conditions.
3. Review recommendation groups or fallback product cards.

Expected result:
- Result context matches the inputs.
- Weak-result copy appears only when the API marks the result weak.
- Empty-result copy offers a clear retry path.
- Product cards use canonical product identity for actions internally; users should see stable save/compare/detail behavior.

Failure examples:
- Context summary shows stale conditions.
- Empty area appears with no explanation.
- Recommendation cards render without names, prices, or action buttons.

### 5. Save
Steps:
1. Click `저장` on a recommendation.
2. Confirm the card changes to `저장됨`.
3. Confirm the saved section includes the product.
4. Click save again or `저장 해제`.

Expected result:
- Save state changes deterministically.
- Saved section reflects the current state.
- Refresh persistence is out of scope unless a persisted user-save store exists.

Failure examples:
- Save state changes on the wrong product.
- Save appears selected but saved section remains empty.
- Save failure leaves the UI in a misleading state.

### 6. Compare
Steps:
1. Select `비교` on one recommendation.
2. Select `비교` on a second recommendation.
3. Try selecting a third recommendation.
4. Remove one compared item from the compare bar.

Expected result:
- Compare bar shows `0/2`, `1/2`, then `2/2`.
- At two items, comparison summary appears.
- Third selection is blocked by the shared max-selection rule.
- Removing an item updates the count and summary.

Failure examples:
- More than two compare items are allowed.
- Compare summary appears with fewer than two items.
- Removing one item removes the wrong product.

### 7. Product Detail
Steps:
1. Click `자세히 보기` on a recommendation.
2. Confirm the modal displays the same product name, price, score, save state, compare state, and recommendation reason.
3. Toggle save and compare in the modal.
4. Close with `닫기`, backdrop click, and Escape.

Expected result:
- Detail content matches the recommendation payload.
- Save/compare state remains synchronized with the card and compare bar.
- Modal can be closed without losing the current result context.

Failure examples:
- Modal opens for a different product.
- Save/compare toggles do not reflect outside the modal.
- Escape or backdrop close does not work.

### 8. Outbound Purchase Transition
Steps:
1. Click `상품 보기` from a product card.
2. Repeat from the detail modal.

Expected result:
- A new tab opens to the outbound product URL.
- If `affiliate_url` is present in the payload, it is the preferred outbound target.
- Click logging failure must not block opening the outbound page.

Failure examples:
- No tab opens for a product that has a URL.
- Outbound opens a search URL when an affiliate URL is present.
- Click logging failure blocks purchase transition.

## API-Only Operational Smoke
Use this when browser capability is unavailable:

```bash
npm run qa:mvp-operational-smoke
```

Required setup:
- The app must already be running.
- Default URL is `http://127.0.0.1:3000`.
- Override with `APP_BASE_URL=https://your-staging-url`.

API-only smoke covers:
- `/api/mvp` success response.
- Recommendation payload structure.
- Canonical UUID product IDs in recommendation payloads.
- Outbound URL preference for `affiliate_url`.
- `/api/log-save` with `canonical_product_id`.
- `/api/log-click` with `canonical_product_id`.
- Legacy DB column note that `recommendations.furniture_id` stores canonical `furniture_products.id`.

API-only smoke does not cover:
- Browser rendering.
- File picker behavior.
- Client-side disabled states.
- Modal focus and close behavior.
- New-tab behavior.
- Actual visual continuity.

## Out Of Scope
- Redesigning recommendation cards, ranking, or scoring.
- Building browser automation.
- Adding account-level saved products.
- Persisting compare selections.
- Retiring `furniture_vectors`.
- Publishing new products unless a safe test import job is explicitly prepared.
