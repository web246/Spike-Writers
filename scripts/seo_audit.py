#!/usr/bin/env python3
import os
from html.parser import HTMLParser

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = None
        self.h1 = False
        self.meta = {}
        self.og = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            name = attrs.get('name') or attrs.get('property')
            if name:
                content = attrs.get('content','')
                if name.startswith('og:'):
                    self.og[name] = content
                else:
                    self.meta[name] = content
        if tag == 'title' and self.title is None:
            self._in_title = True
        if tag == 'h1':
            self.h1 = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False

    def handle_data(self, data):
        if getattr(self, '_in_title', False):
            if self.title is None:
                self.title = data.strip()


def check_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        txt = f.read()
    p = MetaParser()
    p.feed(txt)
    report = {
        'file': os.path.relpath(path),
        'title': p.title or '',
        'title_len': len(p.title or ''),
        'description': p.meta.get('description',''),
        'description_len': len(p.meta.get('description','')),
        'canonical': 'link rel="canonical"' in txt or 'rel="canonical"' in txt,
        'og_title': bool(p.og.get('og:title')),
        'google_verification': bool(p.meta.get('google-site-verification')),
        'h1': p.h1
    }
    return report


def run(root):
    html_files = [os.path.join(root,f) for f in os.listdir(root) if f.endswith('.html')]
    results = [check_file(f) for f in html_files]
    issues = []
    print('SEO Audit Summary:')
    for r in results:
        line = f"{r['file']}: title_len={r['title_len']} desc_len={r['description_len']} canonical={r['canonical']} og_title={r['og_title']} gsite_verif={r['google_verification']} h1={r['h1']}"
        print(line)
        if r['title_len'] == 0 or r['description_len'] == 0 or not r['canonical']:
            issues.append(r['file'])
    print('\nPages with missing basic SEO elements (title/description/canonical):')
    for i in issues:
        print(' -', i)


if __name__ == '__main__':
    run(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
