import struct
def create_valid_png_with_metadata(filename):
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>I', 13) + b'IHDR' + struct.pack('>IIBBBBB', 1, 1, 8, 6, 0, 0, 0)
    ihdr += struct.pack('>I', 0x1f15c489)
    text_data = b'Software\x00NicheWorks'
    text_chunk = struct.pack('>I', len(text_data)) + b'tEXt' + text_data + b'\x00\x00\x00\x00'
    idat_data = b'\x08\xd7\x63\x60\x00\x00\x00\x02\x00\x01'
    idat = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + b'\xe2\x21\xbc\x33'
    iend = b'\x00\x00\x00\x00IEND\xaeB`\x82'
    with open(filename, 'wb') as f:
        f.write(sig + ihdr + text_chunk + idat + iend)
create_valid_png_with_metadata('test_with_meta.png')
