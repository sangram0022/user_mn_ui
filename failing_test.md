⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 46 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL src/hooks/**tests**/hooks.test.ts > useAsyncOperation > should handle successful async operation
AssertionError: expected null to deeply equal { id: 1, name: 'Test' }

Ignored nodes: comments, script, style

<html>
  <head />
  <body>
    <div />
  </body>
</html>

- Expected:
  {
  "id": 1,
  "name": "Test",
  }

* Received:
  null

❯ src/hooks/**tests**/hooks.test.ts:36:64
34| await waitFor(() => {
35| expect(result.current.isLoading).toBe(false);
36| expect(result.current.error /_ data not in interface _/).toEqual({ id: 1, name: 'Test' });
| ^
37| expect(result.current.error).toBeNull();
38| });
❯ runWithExpensiveErrorDiagnosticsDisabled node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:47:12
❯ checkCallback node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/wait-for.js:124:77
❯ Timeout.checkRealTimersCallback node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/wait-for.js:118:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/47]⎯

FAIL src/hooks/**tests**/hooks.test.ts > useAsyncOperation > should handle failed async operation
AssertionError: expected Error: Operation failed to be null

Ignored nodes: comments, script, style

<html>
  <head />
  <body>
    <div />
  </body>
</html>

- Expected:
  null

* Received:
  Error {
  "message": "Operation failed",
  }

❯ src/hooks/**tests**/hooks.test.ts:53:64
51| expect(result.current.isLoading).toBe(false);
52| expect(result.current.error).toBe(mockError);
53| expect(result.current.error /_ data not in interface _/).toBeNull();
| ^
54| });
55| });
❯ runWithExpensiveErrorDiagnosticsDisabled node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:47:12
❯ checkCallback node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/wait-for.js:124:77
❯ Timeout.checkRealTimersCallback node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/wait-for.js:118:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/47]⎯

FAIL src/hooks/**tests**/hooks.test.ts > usePagination > should initialize with correct values
AssertionError: expected NaN to be 10 // Object.is equality

- Expected

* Received

- 10

* NaN

❯ src/hooks/**tests**/hooks.test.ts:147:71
145|
146| expect(result.current.page).toBe(1);
147| expect(Math.ceil(result.current.total / result.current.pageSize)).toBe(10);
| ^
148| expect(result.current.skip).toBe(0);
149| expect((result.current.skip + result.current.limit)).toBe(10);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/47]⎯

FAIL src/hooks/**tests**/hooks.test.ts > usePagination > should go to next page
AssertionError: expected 1 to be 2 // Object.is equality

- Expected

* Received

- 2

* 1

❯ src/hooks/**tests**/hooks.test.ts:161:33
159| });
160|
161| expect(result.current.page).toBe(2);
| ^
162| expect(result.current.skip).toBe(10);
163| expect((result.current.skip + result.current.limit)).toBe(20);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/47]⎯

FAIL src/hooks/**tests**/hooks.test.ts > usePagination > should go to previous page
TypeError: result.current.previousPage is not a function
❯ src/hooks/**tests**/hooks.test.ts:172:22
170|
171| act(() => {
172| result.current.previousPage();
| ^
173| });
174|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/hooks/**tests**/hooks.test.ts:171:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/47]⎯

FAIL src/hooks/**tests**/hooks.test.ts > usePagination > should not go before first page
TypeError: result.current.previousPage is not a function
❯ src/hooks/**tests**/hooks.test.ts:196:22
194|
195| act(() => {
196| result.current.previousPage();
| ^
197| });
198|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/hooks/**tests**/hooks.test.ts:195:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/47]⎯

FAIL src/hooks/**tests**/hooks.test.ts > usePagination > should jump to specific page
TypeError: result.current.setPage is not a function
❯ src/hooks/**tests**/hooks.test.ts:208:22
206|
207| act(() => {
208| result.current.setPage(5);
| ^
209| });
210|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/hooks/**tests**/hooks.test.ts:207:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/47]⎯

FAIL src/hooks/**tests**/useErrorHandler.test.ts > useErrorHandler > flags authentication errors
AssertionError: expected false to be true // Object.is equality

Ignored nodes: comments, script, style

<html>
  <head />
  <body>
    <div />
  </body>
</html>

- Expected

* Received

- true

* false

❯ src/hooks/**tests**/useErrorHandler.test.ts:55:72
53| });
54|
55| await waitFor(() => { expect(result.current.isAuthenticationError).toBe(true);
| ^
56| expect(result.current.error?.code).toBe('INVALID_CREDENTIALS');
57| });
❯ runWithExpensiveErrorDiagnosticsDisabled node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:47:12
❯ checkCallback node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/wait-for.js:124:77
❯ Timeout.checkRealTimersCallback node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/wait-for.js:118:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > getErrorFromStatusCode() > should return unknown error for unmapped status code
AssertionError: expected 'HTTP_999' to be 'UNKNOWN_ERROR' // Object.is equality

Expected: "UNKNOWN_ERROR"
Received: "HTTP_999"

❯ src/shared/utils/**tests**/error.test.ts:173:27
171| it('should return unknown error for unmapped status code', () => {
172| const result = getErrorFromStatusCode(999);
173| expect(result.code).toBe('UNKNOWN_ERROR');
| ^
174| expect(result.category).toBe('unknown');
175| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > getErrorFromMessage() > should detect network error from message
AssertionError: expected 'unknown' to be 'network' // Object.is equality

Expected: "network"
Received: "unknown"

❯ src/shared/utils/**tests**/error.test.ts:196:31
194| it('should detect network error from message', () => {
195| const result = getErrorFromMessage('Network error occurred');
196| expect(result.category).toBe('network');
| ^
197| });
198|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > getErrorFromMessage() > should detect network error from fetch failed
AssertionError: expected 'unknown' to be 'network' // Object.is equality

Expected: "network"
Received: "unknown"

❯ src/shared/utils/**tests**/error.test.ts:201:31
199| it('should detect network error from fetch failed', () => {
200| const result = getErrorFromMessage('fetch failed');
201| expect(result.category).toBe('network');
| ^
202| });
203|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > parseError() > should parse Error with network message
AssertionError: expected 'unknown' to be 'network' // Object.is equality

Expected: "network"
Received: "unknown"

❯ src/shared/utils/**tests**/error.test.ts:248:31
246| const error = new Error('Network error');
247| const result = parseError(error);
248| expect(result.category).toBe('network');
| ^
249| });
250|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > isApiErrorResponse() > should return false for missing error field
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ src/shared/utils/**tests**/error.test.ts:305:41
303| statusCode: 400,
304| };
305| expect(isApiErrorResponse(error)).toBe(false);
| ^
306| });
307|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > isApiErrorResponse() > should return false for missing statusCode field
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ src/shared/utils/**tests**/error.test.ts:321:41
319| message: 'Message',
320| };
321| expect(isApiErrorResponse(error)).toBe(false);
| ^
322| });
323|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > getErrorMessage() > should return default message for unknown error code
AssertionError: expected 'Something went wrong. Please try agai…' to be 'An unexpected error occurred. Please …' // Object.is equality

Expected: "An unexpected error occurred. Please try again."
Received: "Something went wrong. Please try again later."

❯ src/shared/utils/**tests**/error.test.ts:350:22
348| it('should return default message for unknown error code', () => {
349| const result = getErrorMessage('UNKNOWN_CODE_XYZ');
350| expect(result).toBe('An unexpected error occurred. Please try again.');
| ^
351| });
352|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > getErrorMessage() > should handle empty error code
AssertionError: expected 'Something went wrong. Please try agai…' to be 'An unexpected error occurred. Please …' // Object.is equality

Expected: "An unexpected error occurred. Please try again."
Received: "Something went wrong. Please try again later."

❯ src/shared/utils/**tests**/error.test.ts:355:22
353| it('should handle empty error code', () => {
354| const result = getErrorMessage('');
355| expect(result).toBe('An unexpected error occurred. Please try again.');
| ^
356| });
357| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > parseApiError() > should parse ApiError instance
AssertionError: expected 'An unexpected error occurred. Please …' to be 'Test error' // Object.is equality

Expected: "Test error"
Received: "An unexpected error occurred. Please try again."

❯ src/shared/utils/**tests**/error.test.ts:368:30
366| const result = parseApiError(apiError);
367| expect(result.code).toBeTruthy();
368| expect(result.message).toBe('Test error');
| ^
369| });
370|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > parseApiError() > should parse Error with status property
AssertionError: expected 'An unexpected error occurred. Please …' to be 'Not found' // Object.is equality

Expected: "Not found"
Received: "An unexpected error occurred. Please try again."

❯ src/shared/utils/**tests**/error.test.ts:387:30
385| const result = parseApiError(error);
386| expect(result.code).toBeTruthy();
387| expect(result.message).toBe('Not found');
| ^
388| });
389|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > parseApiError() > should parse Error without status
AssertionError: expected 'An unexpected error occurred. Please …' to be 'Generic error' // Object.is equality

Expected: "Generic error"
Received: "An unexpected error occurred. Please try again."

❯ src/shared/utils/**tests**/error.test.ts:394:30
392| const result = parseApiError(error);
393| expect(result.code).toBeTruthy();
394| expect(result.message).toBe('Generic error');
| ^
395| });
396|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > formatErrorForDisplay() > should format Error object for display
AssertionError: expected 'An unexpected error occurred. Please …' to be 'Test error' // Object.is equality

Expected: "Test error"
Received: "An unexpected error occurred. Please try again."

❯ src/shared/utils/**tests**/error.test.ts:447:22
445| const error = new Error('Test error');
446| const result = formatErrorForDisplay(error);
447| expect(result).toBe('Test error');
| ^
448| });
449|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > isAuthError() > should return true for 401 error
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ src/shared/utils/**tests**/error.test.ts:464:34
462| it('should return true for 401 error', () => {
463| const error = new ApiError({ message: 'Unauthorized', status: 401 });
464| expect(isAuthError(error)).toBe(true);
| ^
465| });
466|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > isAuthError() > should return true for 403 error
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ src/shared/utils/**tests**/error.test.ts:469:34
467| it('should return true for 403 error', () => {
468| const error = new ApiError({ message: 'Forbidden', status: 403 });
469| expect(isAuthError(error)).toBe(true);
| ^
470| });
471|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > requiresUserAction() > should return true for validation errors
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ src/shared/utils/**tests**/error.test.ts:490:41
488| it('should return true for validation errors', () => {
489| const error = new ApiError({ message: 'Validation Error', status: 400 });
490| expect(requiresUserAction(error)).toBe(true);
| ^
491| });
492|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > requiresUserAction() > should return true for 422 errors
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ src/shared/utils/**tests**/error.test.ts:495:41
493| it('should return true for 422 errors', () => {
494| const error = new ApiError({ message: 'Unprocessable Entity', status: 422 });
495| expect(requiresUserAction(error)).toBe(true);
| ^
496| });
497|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > normalizeApiError() > should normalize ApiError
AssertionError: expected ApiError: Test error { …(9) } to be 400 // Object.is equality

- Expected:
  400

* Received:
  ApiError {
  "message": "Test error",
  "status": 400,
  "code": undefined,
  "detail": undefined,
  "errors": {
  "field": "email",
  },
  "headers": {},
  "retryAfterSeconds": undefined,
  "timestamp": "2025-10-11T09:58:17.367Z",
  "requestId": undefined,
  "payload": undefined,
  "name": "ApiError",
  }

❯ src/shared/utils/**tests**/error.test.ts:543:29
541| });
542| const result = normalizeApiError(apiError);
543| expect(result.status).toBe(400);
| ^
544| expect(result.message).toBe('Test error');
545| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > normalizeApiError() > should normalize Error with status
AssertionError: expected Error: Not found { status: 404 } to be 404 // Object.is equality

- Expected:
  404

* Received:
  Error {
  "message": "Not found",
  "status": 404,
  }

❯ src/shared/utils/**tests**/error.test.ts:551:29
549| (error as unknown as Record<string, number>).status = 404;
550| const result = normalizeApiError(error);
551| expect(result.status).toBe(404);
| ^
552| expect(result.message).toBe('Not found');
553| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[26/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > normalizeApiError() > should normalize string error
AssertionError: expected 'String error' to be 500 // Object.is equality

- Expected:
  500

* Received:
  "String error"

❯ src/shared/utils/**tests**/error.test.ts:557:29
555| it('should normalize string error', () => {
556| const result = normalizeApiError('String error');
557| expect(result.status).toBe(500);
| ^
558| expect(result.message).toBe('String error');
559| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[27/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > normalizeApiError() > should normalize ApiErrorResponse
AssertionError: expected { error: 'Error', …(2) } to be 422 // Object.is equality

- Expected:
  422

* Received:
  {
  "error": "Error",
  "message": "Test message",
  "statusCode": 422,
  }

❯ src/shared/utils/**tests**/error.test.ts:568:29
566| };
567| const result = normalizeApiError(errorResponse);
568| expect(result.status).toBe(422);
| ^
569| });
570|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[28/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > normalizeApiError() > should handle null  
AssertionError: expected null to be 500 // Object.is equality

- Expected:
  500

* Received:
  null

❯ src/shared/utils/**tests**/error.test.ts:573:29
571| it('should handle null', () => {
572| const result = normalizeApiError(null);
573| expect(result.status).toBe(500);
| ^
574| expect(result.message).toBeTruthy();
575| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[29/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > errorLogger > should have getRecentErrors method
AssertionError: expected undefined to be defined
❯ src/shared/utils/**tests**/error.test.ts:594:43
592|
593| it('should have getRecentErrors method', () => {
594| expect(errorLogger.getRecentErrors).toBeDefined();
| ^
595| expect(typeof errorLogger.getRecentErrors).toBe('function');
596| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[30/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > errorLogger > should return recent errors  
TypeError: errorLogger.getRecentErrors is not a function
❯ src/shared/utils/**tests**/error.test.ts:599:34
597|
598| it('should return recent errors', () => {
599| const errors = errorLogger.getRecentErrors();
| ^
600| expect(Array.isArray(errors)).toBe(true);
601| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[31/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > errorLogger > should have clear method
AssertionError: expected undefined to be defined
❯ src/shared/utils/**tests**/error.test.ts:604:33
602|
603| it('should have clear method', () => {
604| expect(errorLogger.clear).toBeDefined();
| ^
605| expect(typeof errorLogger.clear).toBe('function');
606| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[32/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > errorLogger > should clear errors without throwing
AssertionError: expected [Function] to not throw an error but 'TypeError: erro…' was thrown

- Expected:
  undefined

* Received:
  "TypeError: **vite_ssr_import_3**.errorLogger.clear is not a function"

❯ src/shared/utils/**tests**/error.test.ts:609:45
607|
608| it('should clear errors without throwing', () => {
609| expect(() => errorLogger.clear()).not.toThrow();
| ^
610| });
611| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[33/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should initialize with no error
AssertionError: expected undefined to be null

- Expected:
  null

* Received:
  undefined

❯ src/shared/utils/**tests**/error.test.ts:616:36
614| it('should initialize with no error', () => {
615| const { result } = renderHook(() => useErrorBoundary());
616| expect(result.current.error).toBeNull();
| ^
617| expect(result.current.hasError).toBe(false);
618| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[34/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should set error when showBoundary is called
TypeError: result.current.showBoundary is not a function
❯ src/shared/utils/**tests**/error.test.ts:625:24
623|
624| act(() => {
625| result.current.showBoundary(testError);
| ^
626| });
627|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/shared/utils/**tests**/error.test.ts:624:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[35/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should reset error when resetBoundary is called
TypeError: result.current.showBoundary is not a function
❯ src/shared/utils/**tests**/error.test.ts:637:24
635|
636| act(() => {
637| result.current.showBoundary(testError);
| ^
638| });
639|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/shared/utils/**tests**/error.test.ts:636:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[36/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should call onError callback when error is set
TypeError: result.current.showBoundary is not a function
❯ src/shared/utils/**tests**/error.test.ts:656:24
654|
655| act(() => {
656| result.current.showBoundary(testError);
| ^
657| });
658|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/shared/utils/**tests**/error.test.ts:655:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[37/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should call onReset callback when error is reset
TypeError: result.current.showBoundary is not a function
❯ src/shared/utils/**tests**/error.test.ts:668:24
666|
667| act(() => {
668| result.current.showBoundary(testError);
| ^
669| result.current.resetBoundary();
670| });
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/shared/utils/**tests**/error.test.ts:667:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[38/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should handle multiple error/reset cycles
TypeError: result.current.showBoundary is not a function
❯ src/shared/utils/**tests**/error.test.ts:681:24
679|
680| act(() => {
681| result.current.showBoundary(error1);
| ^
682| });
683| expect(result.current.error).toBe(error1);
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/shared/utils/**tests**/error.test.ts:680:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > useErrorBoundary hook > should handle null error passed to showBoundary
TypeError: result.current.showBoundary is not a function
❯ src/shared/utils/**tests**/error.test.ts:700:24
698|
699| act(() => {
700| result.current.showBoundary(null);
| ^
701| });
702|
❯ node_modules/@testing-library/react/dist/act-compat.js:48:24
❯ act node_modules/react/cjs/react.development.js:2512:16
❯ node_modules/@testing-library/react/dist/act-compat.js:47:25
❯ src/shared/utils/**tests**/error.test.ts:699:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[40/47]⎯

FAIL src/shared/utils/**tests**/error.test.ts > Error Utility - Complete Coverage > edge cases > should handle circular reference in error data
AssertionError: expected [Function] to not throw an error but 'TypeError: Converting circular struct…' was thrown

- Expected:
  undefined

* Received:
  "TypeError: Converting circular structure to JSON
  --> starting at object with constructor 'Object'
  --- property 'self' closes the circle"

❯ src/shared/utils/**tests**/error.test.ts:713:46
711|
712| const error = new ApiError({ message: 'Circular error', status: 400, errors: circular });
713| expect(() => parseApiError(error)).not.toThrow();
| ^
714| });
715|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[41/47]⎯

FAIL src/shared/utils/**tests**/performance-optimizations.test.ts > CleanupRegistry > should handle cleanup errors gracefully  
AssertionError: expected [Function] to not throw an error but 'Error: Cleanup failed' was thrown

- Expected:
  undefined

* Received:
  "Error: Cleanup failed"

❯ src/shared/utils/**tests**/performance-optimizations.test.ts:259:45
257|
258| // Should not throw
259| expect(() => registry.cleanupAll()).not.toThrow();
| ^
260|
261| // Both should be attempted

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[42/47]⎯

FAIL src/shared/utils/**tests**/performance-optimizations.test.ts > CleanupRegistry > should handle cleanup errors gracefully  
Error: Cleanup failed
❯ src/shared/utils/**tests**/performance-optimizations.test.ts:251:13
249| it('should handle cleanup errors gracefully', () => {
250| const cleanup1 = vi.fn(() => {
251| throw new Error('Cleanup failed');
| ^
252| });
253| const cleanup2 = vi.fn();
❯ src/shared/utils/performance-optimizations.ts:210:40
❯ CleanupRegistry.cleanupAll src/shared/utils/performance-optimizations.ts:210:19
❯ src/shared/utils/**tests**/performance-optimizations.test.ts:217:14

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[43/47]⎯

FAIL src/shared/utils/**tests**/performance-optimizations.test.ts > CleanupRegistry > should allow re-registering same name  
AssertionError: expected "spy" to be called +0 times, but got 1 times
❯ src/shared/utils/**tests**/performance-optimizations.test.ts:275:22
273| registry.cleanup('task');
274|
275| expect(cleanup1).toHaveBeenCalledTimes(0);
| ^
276| expect(cleanup2).toHaveBeenCalledTimes(1);
277| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[44/47]⎯

FAIL src/shared/utils/**tests**/performance-optimizations.test.ts > useRenderCount > should track render count
AssertionError: expected "log" to be called with arguments: [ …(2) ]

Number of calls: 0

❯ src/shared/utils/**tests**/performance-optimizations.test.ts:521:24
519| const { rerender } = renderHook(() => useRenderCount('TestComponent'));
520|
521| expect(consoleSpy).toHaveBeenCalledWith(
| ^
522| expect.stringContaining('TestComponent'),
523| expect.stringContaining('Render #1')

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[45/47]⎯

FAIL src/shared/utils/**tests**/performance-optimizations.test.ts > useWhyDidYouUpdate > should log changed props
AssertionError: expected "log" to be called with arguments: [ …(3) ]

Number of calls: 0

❯ src/shared/utils/**tests**/performance-optimizations.test.ts:560:24
558| rerender({ props: { count: 1, name: 'test' } });
559|
560| expect(consoleSpy).toHaveBeenCalledWith(
| ^
561| expect.stringContaining('TestComponent'),
562| expect.stringContaining('Changed props'),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[46/47]⎯

FAIL src/shared/utils/**tests**/utilities.test.ts > Utility Functions > validatePassword > should validate all password requirements
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ src/shared/utils/**tests**/utilities.test.ts:166:32
164| tests.forEach(({ password, shouldContain }) => {
165| const result = validatePassword(password);
166| expect(result.isValid).toBe(false);
| ^
167| expect(result.errors.some((err) => err.includes(shouldContain))).toBe(true);
168| });
❯ src/shared/utils/**tests**/utilities.test.ts:164:13

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[47/47]⎯

Test Files 5 failed | 2 passed (7)
Tests 46 failed | 230 passed (276)
Start at 15:28:12
Duration 12.56s (transform 657ms, setup 7.80s, collect 1.16s, tests 4.28s, environment 13.36s, prepare 1.89s)

HTML Report is generated
You can run npx vite preview --outDir coverage to see the test results.
PS D:\code\reactjs\user_mn_ui>
