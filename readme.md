# ProjectSprint Challenge
## TutupLapak Test Cases!

## Status
- ✅ Register
- ✅ Login
- ✅ Get Profile
- ✅ Put Profile
- ✅ Link Phone Profile
- ✅ Link Email Profile
- ✅ File Upload
- ✅ Post Product
- ✅ Get Product
- ✅ Patch Product
- ✅ Delete Product
- ✅ Post Purchase
- ✅ Post Purchase Proof

## Prerequisites
- [ k6 ](https://k6.io/docs/get-started/installation/)

## How to start
- Navigate to the folder where this is extracted / clone in terminal
- run
    ```bash
    BASE_URL=http://localhost:8080 make test
    ```
    ⚠️ Adjust the `BASE_URL` value to your backend path
## Cookbook 🍳
- How can I know what's the payload that k6 give and what it receives? Run in debug mode:
  ```bash
  BASE_URL=http://localhost:8080 make test-debug
  ```
- Searching at the log is hard, how to save it into a file?
  ```bash
  BASE_URL=http://localhost:8080 make test-debug-log
  ```
   now the test result will be at `output.txt`
## How to read the debug log?
When you run `make test-debug` you will see this
```
    ✗ Get Profile | success get profile | should return 200
```
`✗` means the test is faling, and if you search the "Get Profile | success get profile" part at the log, you will found these information

First, the request that k6 made:
```time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | request path: GET http://localhost:8080/v1/user?" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | request header: {\"Authorization\":\"Bearer 2aae0204e106af5902ab72a69ea61477b06f3bdd20f268db2d485da3423a3334\"}" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | request payload: " source=console
```

Second, the response of the backend that you send
```
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | response code: 401" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | response body (raw): {\"error\":\"Unauthorized\"}" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | response body (parsed): successfully parsed" source=console
```

Third, the assertion, these indicates which part of the backend response that is not right as the contract say
```
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | should return 200 | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | email should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | phone should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | fileId should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | fileUri should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | fileThumbnailUri should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | bankAccountName should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | bankAccountHolder should be string | assert result: false" source=console
time="2025-09-20T22:59:30+07:00" level=info msg="Get Profile | success get profile | bankAccountNumber should be string | assert result: false" source=console
```

By that information, fix your backend and reach 100% Completion! 🎉

### How to run load test?
> ⚠️ Do not run the load test to our server!
```bash
BASE_URL=http://localhost:8080 make load-test
```

### Environment Variables
- `BASE_URL` (string,url) sets the base url of the backend
- `DEBUG` (boolean) show what was sent to the backend, and what is the response
