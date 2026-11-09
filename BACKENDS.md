# Backend snippets

Copy the snippet for your backend into your project. Each one reads the `ct_checkjs` cookie in the form handler and rejects the request if the cookie is missing or wrong.

- [Node.js](#nodejs)
- [PHP](#php)
- [Python](#python)
- [Go](#go)
- [Ruby](#ruby)
- [Java](#java)
- [C#](#c)
- [Kotlin](#kotlin)
- [Rust](#rust)
- [Perl](#perl)

## Node.js

Express:

```js
function ctValidateCheckjs(cookieHeader = '') {
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

## PHP

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

## Python

Flask:

```python
from datetime import date

from flask import abort, request


def ct_validate_checkjs(value):
    try:
        return abs(int(value) - date.today().year) <= 1
    except (TypeError, ValueError):
        return False


@app.post("/contact")
def contact():
    if not ct_validate_checkjs(request.cookies.get("ct_checkjs")):
        abort(403, "Bot")
    # Process the form.
```

## Go

`net/http`:

```go
import (
	"net/http"
	"strconv"
	"time"
)

func ctValidateCheckjs(r *http.Request) bool {
	cookie, err := r.Cookie("ct_checkjs")
	if err != nil {
		return false
	}
	year, err := strconv.Atoi(cookie.Value)
	if err != nil {
		return false
	}
	now := time.Now().Year()
	return year >= now-1 && year <= now+1
}

func contact(w http.ResponseWriter, r *http.Request) {
	if !ctValidateCheckjs(r) {
		http.Error(w, "Bot", http.StatusForbidden)
		return
	}
	// Process the form.
}
```

## Ruby

Rails controller:

```ruby
def ct_validate_checkjs(value)
  value.to_s.match?(/\A\d{4}\z/) && (value.to_i - Time.now.year).abs <= 1
end

def create
  return render(plain: "Bot", status: :forbidden) unless ct_validate_checkjs(cookies[:ct_checkjs])
  # Process the form.
end
```

## Java

Spring:

```java
import java.time.Year;

static boolean ctValidateCheckjs(String value) {
    try {
        int year = Integer.parseInt(value);
        int now = Year.now().getValue();
        return year >= now - 1 && year <= now + 1;
    } catch (NumberFormatException e) {
        return false;
    }
}

@PostMapping("/contact")
public ResponseEntity<String> contact(@CookieValue(name = "ct_checkjs", required = false) String checkjs) {
    if (!ctValidateCheckjs(checkjs)) {
        return ResponseEntity.status(403).body("Bot");
    }
    // Process the form.
}
```

## C#

ASP.NET Core:

```csharp
static bool CtValidateCheckjs(string? value)
{
    int now = DateTime.UtcNow.Year;
    return int.TryParse(value, out int year) && year >= now - 1 && year <= now + 1;
}

app.MapPost("/contact", (HttpRequest request) =>
{
    if (!CtValidateCheckjs(request.Cookies["ct_checkjs"]))
    {
        return Results.Text("Bot", statusCode: 403);
    }
    // Process the form.
});
```

## Kotlin

Ktor:

```kotlin
import java.time.Year

fun ctValidateCheckjs(value: String?): Boolean {
    val year = value?.toIntOrNull() ?: return false
    val now = Year.now().value
    return year in (now - 1)..(now + 1)
}

post("/contact") {
    if (!ctValidateCheckjs(call.request.cookies["ct_checkjs"])) {
        call.respond(HttpStatusCode.Forbidden, "Bot")
        return@post
    }
    // Process the form.
}
```

## Rust

axum, with the `chrono` crate and `axum_extra::extract::CookieJar`:

```rust
use chrono::{Datelike, Utc};

fn ct_validate_checkjs(value: Option<&str>) -> bool {
    let now = Utc::now().year();
    value
        .and_then(|v| v.parse::<i32>().ok())
        .is_some_and(|year| (now - 1..=now + 1).contains(&year))
}

async fn contact(jar: CookieJar) -> impl IntoResponse {
    if !ct_validate_checkjs(jar.get("ct_checkjs").map(|c| c.value())) {
        return (StatusCode::FORBIDDEN, "Bot");
    }
    // Process the form.
    (StatusCode::OK, "OK")
}
```

## Perl

CGI:

```perl
sub ct_validate_checkjs {
    my ($value) = @_;
    return 0 unless defined $value && $value =~ /\A\d{4}\z/;
    my $now = (localtime)[5] + 1900;
    return abs($value - $now) <= 1 ? 1 : 0;
}

my ($checkjs) = ($ENV{HTTP_COOKIE} // '') =~ /(?:^|;\s*)ct_checkjs=(\d+)/;
unless (ct_validate_checkjs($checkjs)) {
    print "Status: 403 Forbidden\r\nContent-Type: text/plain\r\n\r\nBot";
    exit;
}
```
