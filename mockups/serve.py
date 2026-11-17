#!/usr/bin/env python3
"""Mockup dev server: static files (no-store) on :5180, and /api proxied to PocketBase on :8091,
so a single SSH tunnel (-L 5180:127.0.0.1:5180) is enough to view the mockups with live data."""
import functools, http.server, os, urllib.error, urllib.request

PB = os.environ.get('PB', 'http://127.0.0.1:8091')
HERE = os.path.dirname(os.path.abspath(__file__))


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if not self.path.startswith('/api/'):
            return super().do_GET()
        try:
            r = urllib.request.urlopen(PB + self.path, timeout=5)
            status, body, ctype = r.status, r.read(), r.headers.get('Content-Type', 'application/json')
        except urllib.error.HTTPError as e:
            status, body, ctype = e.code, e.read(), e.headers.get('Content-Type', 'application/json')
        except OSError:
            status, body, ctype = 502, b'{}', 'application/json'
        self.send_response(status)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


http.server.ThreadingHTTPServer(('127.0.0.1', 5180), functools.partial(H, directory=HERE)).serve_forever()
