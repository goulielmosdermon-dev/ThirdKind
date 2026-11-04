"""Pack the original booth materials and textures for the web (2048px max)."""
import io
import json
import struct
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root.parent / 'MindTheHack/Booths Scene/MTHBoothBlender2_Short.glb'
data = source.read_bytes()
length = struct.unpack_from('<I', data, 12)[0]
doc = json.loads(data[20:20 + length])
binary = data[28 + length:]
images = {image['bufferView']: image for image in doc['images']}
packed = bytearray()
for index, view in enumerate(doc['bufferViews']):
    content = binary[view.get('byteOffset', 0):view.get('byteOffset', 0) + view['byteLength']]
    if index in images:
        image = Image.open(io.BytesIO(content))
        image.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        alpha = image.mode in ('RGBA', 'LA') and image.getextrema()[-1][0] < 255
        if alpha:
            image.save(output, format='PNG', optimize=True)
            images[index]['mimeType'] = 'image/png'
        else:
            image.convert('RGB').save(output, format='JPEG', quality=95)
            images[index]['mimeType'] = 'image/jpeg'
        content = output.getvalue()
    packed.extend(b'\0' * (-len(packed) % 4))
    view['byteOffset'] = len(packed)
    view['byteLength'] = len(content)
    packed.extend(content)
doc['buffers'][0]['byteLength'] = len(packed)
packed.extend(b'\0' * (-len(packed) % 4))
metadata = json.dumps(doc, separators=(',', ':')).encode()
metadata += b' ' * (-len(metadata) % 4)
result = struct.pack('<III', 0x46546C67, 2, 28 + len(metadata) + len(packed))
result += struct.pack('<II', len(metadata), 0x4E4F534A) + metadata
result += struct.pack('<II', len(packed), 0x004E4942) + packed
out = root / 'public/MTH-Booths/booth.glb'
out.write_bytes(result)
print(f'{len(data)/1024**2:.1f} MB → {len(result)/1024**2:.1f} MB: all original materials retained')
