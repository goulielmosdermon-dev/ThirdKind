"""Copy the supplied Domo static site into the Next.js public directory."""
from pathlib import Path
import re
import shutil

site = Path(__file__).resolve().parents[1]
source = site.parent / 'Domo'
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
    text = re.sub(r'''(["'`])/(?!/|>)''', r'\1/DOMO/', text)
    text = re.sub(r'url\(/(?!/)', 'url(/DOMO/', text)
    path.write_text(text)

# Match paths across Next.js trailing-slash redirects during navigation.
for name in ['page-transition.js', 'nav-transition.js']:
    path = target / 'scripts' / name
    text = path.read_text()
    if 'const canonicalPath' not in text:
        text = text.replace('(() => {', "(() => {\n  const canonicalPath = path => path.replace(/\\/+$/, '') || '/';", 1)
        text = text.replace('incoming.path === location.pathname', 'canonicalPath(incoming.path) === canonicalPath(location.pathname)')
        text = text.replace('previous.path === location.pathname', 'canonicalPath(previous.path) === canonicalPath(location.pathname)')
        text = text.replace('target.pathname === location.pathname', 'canonicalPath(target.pathname) === canonicalPath(location.pathname)')
    if name == 'nav-transition.js' and '{capture:true}' not in text:
        text = text.replace('  });\n})();', '  }, {capture:true});\n})();')
    path.write_text(text)

# Resolve the menu artwork relative to its stylesheet under /DOMO.
menu_css = target / 'styles' / 'site.css'
menu_css.write_text(menu_css.read_text().replace('/DOMO/Graphics/Wood-smooth.svg', '../Graphics/Wood-smooth.svg'))
