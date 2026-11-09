/**
 * Proves to the backend that the visitor's browser runs JavaScript:
 * stores the current year in the ct_checkjs cookie, which the form handler then checks.
 */
(function (): void {
    // Importing the package during server-side rendering must be harmless.
    if (typeof document === 'undefined') {
        return;
    }

    const secure: string = location.protocol === 'https:' ? '; secure' : '';

    document.cookie = 'ct_checkjs=' + new Date().getFullYear() + '; path=/; max-age=86400; samesite=lax' + secure;
})();
