"""Copy the supplied Domo static site into the Next.js public directory."""
from pathlib import Path
import re
import shutil

site = Path(__file__).resolve().parents[1]
source = site.parent / 'Domo_SITE'
target = site / 'public' / 'domo-site'
# Replace the generated copy so removed source files do not linger.
if target.exists():
    shutil.rmtree(target)

excluded = {'Site Reference', 'Colors', 'docs', 'templates', 'node_modules', '.git'}
for item in source.iterdir():
    if item.name in excluded or item.name.startswith('.') or item.name == 'package.json':
        continue
    destination = target / item.name
    if item.is_dir():
        shutil.copytree(item, destination, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.DS_Store', '*.py'))
    else:
        target.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, destination)
for path in target.rglob('*'):
    if path.suffix.lower() not in {'.html', '.css', '.js', '.json', '.svg'}:
        continue
    text = path.read_text()
    # Root-relative local URLs in markup, CSS, scripts and data.
    text = re.sub(r'''(["'`])/(?!/)''', r'\1/DOMO/', text)
    text = re.sub(r'url\(/(?!/)', 'url(/DOMO/', text)
    path.write_text(text)
