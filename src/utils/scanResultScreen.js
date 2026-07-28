import Tesseract from "tesseract.js";
import { characters } from "../data/characters";

// Result screens list "Damage Given" / "Damage Taken" as two words each;
// OCR sometimes mangles the "Damage" half, so we key off the second word only.
const DAMAGE_LABEL_GIVEN = /given/i;
const DAMAGE_LABEL_TAKEN = /taken/i;
const NUMBER_PATTERN = /(\d{1,3})\s*%?/;

// How far below a "Given"/"Taken" label (in source-image pixels) we'll still
// look for its number. Result screens are photographed at very different
// resolutions, so this is a rough approximation, not an exact row height.
const LABEL_TO_VALUE_SEARCH_WINDOW = 140;

function normalizeForMatch(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

// tesseract.js v5 nests words under blocks -> paragraphs -> lines instead of
// returning a flat `data.words` array (which is what earlier versions did).
function flattenWords(blocks) {
  const words = [];

  for (const block of blocks || []) {
    for (const paragraph of block.paragraphs || []) {
      for (const line of paragraph.lines || []) {
        words.push(...(line.words || []));
      }
    }
  }

  return words;
}

// Longest names first so e.g. "DR MARIO" isn't matched as just "MARIO".
const charactersByLength = [...characters].sort(
  (a, b) => normalizeForMatch(b.name).length - normalizeForMatch(a.name).length
);

// Photos of the result screen are always taken with the (landscape) TV
// rotated 90deg CCW relative to the camera, so text comes in sideways.
// Rotating 90deg CW before OCR both makes the text upright for Tesseract
// and puts the player panels back in left-to-right order (P1, P2, CPU...).
async function rotateImage90Clockwise(imageFile) {
  const bitmap = await createImageBitmap(imageFile);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.height;
  canvas.height = bitmap.width;

  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(bitmap, 0, 0);

  bitmap.close?.();

  return canvas;
}

// Groups words into left-to-right panels by looking for horizontal gaps
// between them, rather than assuming a fixed number of equal-width columns —
// matches can have anywhere from 2 to 8 competitors sharing the screen.
function clusterIntoColumns(words) {
  if (words.length === 0) {
    return [];
  }

  const imageWidth = Math.max(...words.map((word) => word.bbox.x1));
  const gapThreshold = imageWidth * 0.06;

  const sorted = [...words].sort(
    (a, b) => (a.bbox.x0 + a.bbox.x1) / 2 - (b.bbox.x0 + b.bbox.x1) / 2
  );

  const columns = [[sorted[0]]];
  let previousCenter = (sorted[0].bbox.x0 + sorted[0].bbox.x1) / 2;

  for (let i = 1; i < sorted.length; i++) {
    const word = sorted[i];
    const center = (word.bbox.x0 + word.bbox.x1) / 2;

    if (center - previousCenter > gapThreshold) {
      columns.push([]);
    }

    columns[columns.length - 1].push(word);
    previousCenter = center;
  }

  return columns;
}

function findCharacterInWords(words) {
  const sortedByY = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
  const headerWords = sortedByY.slice(0, 6);
  const headerText = normalizeForMatch(headerWords.map((w) => w.text).join(""));

  if (!headerText) {
    return null;
  }

  const match = charactersByLength.find((character) =>
    headerText.includes(normalizeForMatch(character.name))
  );

  return match ? match.id : null;
}

function findDamageValue(words, labelPattern) {
  const labelWord = words.find((word) => labelPattern.test(word.text));

  if (!labelWord) {
    return "";
  }

  const nearbyWords = words
    .filter(
      (word) =>
        word !== labelWord &&
        word.bbox.y0 >= labelWord.bbox.y0 - 10 &&
        word.bbox.y0 <= labelWord.bbox.y0 + LABEL_TO_VALUE_SEARCH_WINDOW
    )
    .sort((a, b) => a.bbox.y0 - b.bbox.y0);

  for (const word of nearbyWords) {
    const match = word.text.match(NUMBER_PATTERN);

    if (match) {
      return match[1];
    }
  }

  return "";
}

function extractPlayerFromColumn(words) {
  const characterId = findCharacterInWords(words);
  const character = characterId
    ? characters.find((c) => c.id === characterId)
    : null;

  return {
    characterId,
    query: character ? character.name : "",
    damageGiven: findDamageValue(words, DAMAGE_LABEL_GIVEN),
    damageTaken: findDamageValue(words, DAMAGE_LABEL_TAKEN)
  };
}

export async function scanResultScreen(imageFile) {
  const rotatedImage = await rotateImage90Clockwise(imageFile);

  const {
    data: { blocks }
  } = await Tesseract.recognize(rotatedImage, "eng");

  const words = flattenWords(blocks);

  if (!words || words.length === 0) {
    throw new Error("No text detected in image.");
  }

  const columns = clusterIntoColumns(words);

  const player1 = extractPlayerFromColumn(columns[0] || []);
  const player2 = extractPlayerFromColumn(columns[1] || []);

  const missingSomething =
    !player1.characterId ||
    !player2.characterId ||
    !player1.damageGiven ||
    !player1.damageTaken ||
    !player2.damageGiven ||
    !player2.damageTaken;

  return {
    player1,
    player2,
    warning: missingSomething
      ? "Some fields couldn't be read confidently — please double-check before confirming."
      : null
  };
}