# Dive ERP MiniApp Risk Register v1

## 1. WeChat Review Delay

- **Risk**: Review rejection or delay due to compliance gaps.
- **Mitigation**:
  - Prepare privacy policy and demo account early.
  - Keep v1 features concise and clearly documented.

## 2. Binding Conflicts

- **Risk**: Wrong user binds to wrong ERP identity.
- **Mitigation**:
  - Require ERP credential verification at first bind.
  - Provide controlled rebind workflow with audit logging.

## 3. Permission Leakage

- **Risk**: Staff/guest can access owner APIs by URL probing.
- **Mitigation**:
  - Enforce role verification in backend middleware.
  - Add endpoint-level integration tests for forbidden access.

## 4. Weak Network User Experience

- **Risk**: Timeouts and duplicate submissions on mobile.
- **Mitigation**:
  - Add idempotency-safe write patterns.
  - Add retry hints and clear error prompts in miniapp UI.

## 5. Scope Creep

- **Risk**: v1 expands to web parity and misses timeline.
- **Mitigation**:
  - Lock MVP at week 1.
  - Move additional asks to v2 backlog.

