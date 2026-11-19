# local-antispam: stop form spam without CAPTCHA, no cloud, no API key

[![npm version](https://img.shields.io/npm/v/local-antispam)](https://www.npmjs.com/package/local-antispam)
[![npm downloads](https://img.shields.io/npm/dm/local-antispam)](https://www.npmjs.com/package/local-antispam)
[![bundle size](https://img.shields.io/bundlephobia/minzip/local-antispam)](https://bundlephobia.com/package/local-antispam)
[![license](https://img.shields.io/npm/l/local-antispam)](LICENSE)

A 1 KB script plus a one-line backend check that rejects form submissions from bots that never run JavaScript. Works with any form, any framework and any backend: Node.js, PHP, Python, Go, Ruby, Java, C#, Kotlin, Rust, Perl. Nothing leaves your server.

Most spam bots post straight to your form handler. They do not load the page, do not run JavaScript and do not keep cookies. `local-antispam` ships `ct_checkjs`: a script that sets a cookie in real browsers, and a check in your handler that rejects requests without it.

## Quick start

### 1. Add the script to the page with the form

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

Node.js / Express:

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

Next.js route handler (`app/api/contact/route.ts`):

```ts
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const year = Number((await cookies()).get('ct_checkjs')?.value);
    if (!year || Math.abs(year - new Date().getFullYear()) > 1) {
        return new Response('Bot', { status: 403 });
    }
    // Process the form.
    return new Response('OK');
}
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

Snippets for Python (Flask), Go, Ruby (Rails), Java (Spring), C# (ASP.NET Core), Kotlin (Ktor), Rust (axum) and Perl are in [BACKENDS.md](BACKENDS.md).

## How it works

1. `ct_checkjs` stores the current year in a cookie named `ct_checkjs`.
2. The browser sends the cookie with the form.
3. Your backend accepts the current year, or one year either side to allow for time zones and wrong device clocks.

The check has to run on your backend: a script in the browser cannot stop a bot that posts directly to your form handler.

## Honeypot vs cookie check vs cloud anti-spam

| | Honeypot field | local-antispam (cookie check) | CleanTalk Anti-Spam (cloud) |
|---|---|---|---|
| Stops bots that post directly without a browser | Partly, bots learn to skip hidden fields | Yes | Yes |
| Stops bots driving a real browser | No | No | Yes, by IP and email reputation and behaviour |
| Stops human spam (manual submissions) | No | No | Yes, by content and sender reputation |
| Visitor has to do anything | No | No | No |
| Needs an account or API key | No | No | Yes, 7-day free trial |
| Works with any form markup | Needs an extra field | Yes | Yes |

## What it does not do

- It only catches bots that do not run JavaScript. Bots driving a real browser, and bots written to send this cookie, get through.
- Visitors with JavaScript or cookies turned off are rejected, so tell them why on your error page.

## FAQ

**Is this a CAPTCHA alternative?**
For the simplest bots, yes: nothing to click, nothing to solve. Against headless browsers and human spammers it is not enough on its own.

**Does it work with React, Vue, Next.js, Nuxt, Astro?**
Yes. Import the package once in the client bundle (or add the script tag) and validate the cookie in your API route or server action.

**Does it need a cookie consent banner?**
The cookie stores only the current year, contains no identifier and is used to protect the form, which is a strictly necessary purpose under GDPR and ePrivacy. Mention it in your cookie policy.

**Can I rename the cookie?**
Not in v1. Open an issue if you need it.

## Need stronger protection?

When bots start running a real browser, or the spam is written by people, use [CleanTalk Anti-Spam](https://cleantalk.org/antispam?utm_source=github&utm_medium=readme&utm_campaign=local-antispam): every submission is checked in the cloud against IP and email reputation from 1,100,000+ websites, plus message content. No CAPTCHA for visitors, plugins for WordPress, Joomla, Drupal and 15+ platforms, or one API call. 7-day free trial, no card.

## License

[MIT](LICENSE)
