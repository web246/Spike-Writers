import io
import os
import re

META_SNIPPET = '''  <meta name="google-site-verification" content="oGrGdaVJcJlIf3UBFDAkUccRJT3hrdd592WGs6c6fSI" />
  <meta name="description" content="SpikeWriters — Hire verified writers for essays, blog posts, marketing copy and more. Fast turnaround, secure payments, and quality-checked talent." />
  <meta name="keywords" content="SpikeWriters, writers for hire, freelance writers, essay writers, blog writers, copywriting, content writing, verified writers, hire writers, writing services" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="/" />
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
  <meta property="og:title" content="SpikeWriters — Find trusted writers, fast" />
  <meta property="og:description" content="Hire verified writers for essays, marketing copy, blog posts and more. Secure payments and on-time delivery." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="/" />
  <meta property="og:site_name" content="SpikeWriters" />
'''

EXCLUDE_DIRS = {"assets", "includes", "scripts"}


def should_exclude(path):
    parts = set(path.replace('\\', '/').split('/'))
    return bool(parts & EXCLUDE_DIRS)


def inject_into_file(path):
    with io.open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'google-site-verification' in content:
        return False

    head_open = re.search(r'<head[^>]*>', content, re.IGNORECASE)
    if not head_open:
        return False

    insert_pos = head_open.end()

    # Prefer to insert after viewport meta if present
    viewport = re.search(r'(<meta[^>]*name=["\']viewport["\'][^>]*>)', content, re.IGNORECASE)
    if viewport:
        insert_pos = viewport.end()

    new_content = content[:insert_pos] + '\n' + META_SNIPPET + content[insert_pos:]

    # Update title text 'Spark Writers' -> 'SpikeWriters'
    new_content = new_content.replace('Spark Writers', 'SpikeWriters')
    new_content = new_content.replace('Spark Writers â€”', 'SpikeWriters —')

    with io.open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return True


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    updated = []
    for fname in os.listdir(root):
        if not fname.lower().endswith('.html'):
            continue
        fpath = os.path.join(root, fname)
        if should_exclude(fpath):
            continue
        try:
            if inject_into_file(fpath):
                updated.append(fname)
        except Exception as e:
            print(f'Error updating {fname}: {e}')

    if updated:
        print('Updated files:', ', '.join(updated))
    else:
        print('No files updated (already contained verification meta or none matched).')


if __name__ == '__main__':
    main()
