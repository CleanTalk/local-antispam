# local-antispam

Stop spam bots on any website form. No captcha, no cloud service, no API key.

Most spam bots post forms directly and never run JavaScript. `local-antispam` ships `ct_checkjs`: a tiny script that sets a cookie of the same name in real browsers, plus a one-line check in your form handler that rejects requests without it. Nothing leaves your server.

## Quick start

### 1. Add the script to the page with the form

With a bundler:

```bash
npm install local-antispam
```

```ts
import 'local-antispam';
```

Or with a script tag, in `<head>` and without `defer`, so the cookie is set before the visitor can submit the form:

```html
<script src="https://cdn.jsdelivr.net/npm/local-antispam@1/dist/ct_checkjs.js"></script>
```

To serve it yourself, copy `node_modules/local-antispam/dist/ct_checkjs.js` to your public directory.

### 2. Check the cookie in your form handler

Node.js / TypeScript (Express):

```ts
function ctValidateCheckjs(cookieHeader: string = ''): boolean {
    const match = /(?:^|;\s*)ct_checkjs=(\d{4})(?:;|$)/.exec(cookieHeader);
    return match !== null && Math.abs(Number(match[1]) - new Date().getFullYear()) <= 1;
}

app.post('/contact', (req, res) => {
    if (!ctValidateCheckjs(req.headers.cookie)) {
        return res.status(403).send('Bot');
    }
    // Process the form.
});
```

PHP:

```php
function ct_validate_checkjs($value)
{
    return is_string($value) && ctype_digit($value) && abs((int) $value - (int) date('Y')) <= 1;
}

if (!ct_validate_checkjs($_COOKIE['ct_checkjs'] ?? null)) {
    http_response_code(403);
    exit('Bot');
}
```

Snippets for Node.js, PHP, Python, Go, Ruby, Java, C#, Kotlin, Rust and Perl are in [BACKENDS.md](BACKENDS.md).

## How it works

1. The `ct_checkjs` script stores the current year in the `ct_checkjs` cookie.
2. The browser sends the cookie with the form.
3. Your backend accepts the current year, or one year either side to allow for time zones and wrong device clocks.

The check has to run on your backend: a script in the browser cannot stop a bot that posts directly to your form handler.

## What it does not do

- It only catches bots that do not run JavaScript. Bots driving a real browser, and bots written to send this cookie, get through.
- Visitors with JavaScript or cookies turned off are rejected, so tell them why on your error page.

## Need stronger protection?

[CleanTalk Anti-Spam](https://cleantalk.org) checks every submission in the cloud, against IP and email reputation and message content.

## License

[MIT](LICENSE)
