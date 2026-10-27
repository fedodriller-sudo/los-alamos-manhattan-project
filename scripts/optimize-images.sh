#!/bin/sh
# Offline authoring utility; requires libwebp cwebp (verified with 1.6.0).
# Originals stay in img/*.png; build distributes only these WebP derivatives.
set -eu
cd "$(dirname "$0")/.."
cwebp -quiet -q 95 -m 6 -sharp_yuv -alpha_q 100 -exact -metadata all img/campus-night.png -o img/campus-night.webp
cwebp -quiet -lossless -z 9 -exact img/scientist-chibi.png -o img/scientist-chibi.webp
cwebp -quiet -lossless -z 9 -exact img/researcher-chibi.png -o img/researcher-chibi.webp
