#!/usr/bin/env python3
"""Serve Project Y game locally (ES modules need http)."""
import http.server
import socketserver

PORT = 8765
DIR = __file__.rsplit("/", 1)[0] or "."


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Project Y → http://127.0.0.1:{PORT}")
        httpd.serve_forever()
