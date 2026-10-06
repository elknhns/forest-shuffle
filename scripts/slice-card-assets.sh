#!/bin/zsh

# Convert the supplied print sheets into web-ready individual cards. The source
# sheets are intentionally never changed; rerun this script after replacing one.
set -euo pipefail

project_root=${0:A:h:h}
assets_root="$project_root/public/assets/cards"
output_root="$assets_root/cut"
temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/forest-shuffle-card-slices.XXXXXX")

cleanup() {
  rm -rf "$temporary_directory"
}
trap cleanup EXIT

prepare_source() {
  local source_file=$1
  local converted_source source_width source_height padded_source

  if [[ "$source_file" == *.webp ]]; then
    converted_source="$temporary_directory/${source_file:t:r}.png"
    sips -s format png "$source_file" --out "$converted_source" >/dev/null
  else
    converted_source="$source_file"
  fi

  read -r source_width source_height <<< "$(sips -g pixelWidth -g pixelHeight "$converted_source" | awk '/pixelWidth/{width=$2} /pixelHeight/{height=$2} END{print width, height}')"
  padded_source="$temporary_directory/${source_file:t:r}-padded.png"

  # sips cannot crop a region ending at the source image's lower edge. The
  # padding adds one row above and below without changing any source pixels.
  sips --padToHeightWidth "$((source_height + 2))" "$source_width" \
    -s format png "$converted_source" --out "$padded_source" >/dev/null
  print -r -- "$padded_source"
}

slice_region() {
  local source_file=$1
  local destination_directory=$2
  local card_number=$3
  local source_x=$4
  local source_y=$5
  local columns=$6
  local rows=$7
  local card_width=$8
  local card_height=$9
  local prepared_source
  local row column

  prepared_source=$(prepare_source "$source_file")
  mkdir -p "$destination_directory"

  for ((row = 0; row < rows; row++)); do
    for ((column = 0; column < columns; column++)); do
      sips --cropToHeightWidth "$card_height" "$card_width" \
        --cropOffset $((source_y + row * card_height + 1)) $((source_x + column * card_width)) \
        -s format jpeg -s formatOptions 92 "$prepared_source" \
        --out "$destination_directory/$(printf '%03d' "$card_number").jpg" >/dev/null
      ((card_number++))
    done
  done
}

rm -rf "$output_root"
mkdir -p "$output_root"

# The base sheets use two card formats. hCards stores each portrait card in
# two stacked 150 × 233 panels, while vCards is a 300 × 233 landscape grid
# with seven unused pixels below it.
slice_region "$assets_root/base/hCards 2100x3262.webp" "$output_root/base-portrait" 1 0 0 14 6 150 466
slice_region "$assets_root/base/hCards 2100x3262.webp" "$output_root/base-portrait" 85 0 2796 4 1 150 466
slice_region "$assets_root/base/vCards 2100x3269.webp" "$output_root/base-landscape" 1 0 0 7 14 300 233

# The unused portion below the five base trees is rules text, not cards.
slice_region "$assets_root/base/Trees 1500x2330.webp" "$output_root/base-trees" 1 0 0 5 1 300 466

# Alpine combines two tall trees, portrait cards, and landscape cards in one
# atlas. Each region is sliced at its native card boundary.
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/tall" 1 0 0 2 1 300 466
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/portrait" 1 600 0 10 1 150 466
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/portrait" 11 0 466 8 1 150 466
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/portrait" 19 600 1398 2 1 150 466
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/landscape" 1 1200 466 3 2 300 233
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/landscape" 7 0 932 7 2 300 233
slice_region "$assets_root/alpine/Mountain 2100x1864.jpg" "$output_root/alpine/landscape" 21 0 1398 2 2 300 233

# Woodland Edge has the same three card formats, grouped by atlas rows. The
# first plant region occupies two source rows per tall card; the following
# region is landscape rather than portrait.
slice_region "$assets_root/woodland-edge/Woodlands (1).jpeg" "$output_root/woodland-edge/tall" 1 0 0 6 1 300 466
slice_region "$assets_root/woodland-edge/Woodlands (1).jpeg" "$output_root/woodland-edge/tall" 7 0 466 6 1 300 466
slice_region "$assets_root/woodland-edge/Woodlands (1).jpeg" "$output_root/woodland-edge/landscape" 1 0 932 6 2 300 233
slice_region "$assets_root/woodland-edge/Woodlands (1).jpeg" "$output_root/woodland-edge/landscape" 13 0 1398 6 2 300 233
slice_region "$assets_root/woodland-edge/Woodlands (1).jpeg" "$output_root/woodland-edge/portrait" 1 0 1864 12 2 150 466

print "Card assets written to $output_root"
