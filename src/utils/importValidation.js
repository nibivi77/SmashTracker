import { characters } from "../data/characters";
import { DATA_VERSION } from "../data/schema";
import { createDuoKey } from "./duoKey";

const characterIdMap = new Map();
const characterNameMap = new Map();

for (const character of characters) {
  characterIdMap.set(character.id, character.id);
  characterIdMap.set(character.id.toLowerCase(), character.id);
  characterNameMap.set(character.name.toLowerCase(), character.id);
}

function normalizeCharacterValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return (
    characterIdMap.get(trimmed) ||
    characterIdMap.get(trimmed.toLowerCase()) ||
    characterNameMap.get(trimmed.toLowerCase()) ||
    null
  );
}

function normalizeTimestamp(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

export function normalizeImportedData(parsed) {
  let records;
  let version = DATA_VERSION;

  if (Array.isArray(parsed)) {
    records = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.records)
  ) {
    records = parsed.records;
    version =
      typeof parsed.version === "number" ? parsed.version : DATA_VERSION;
  } else {
    return null;
  }

  const normalizedRecords = records.map((record) => {
    const p1Character = normalizeCharacterValue(record.p1Character);
    const p2Character = normalizeCharacterValue(record.p2Character);

    return {
      ...record,
      p1Character,
      p2Character,
      duoKey:
        p1Character && p2Character
          ? createDuoKey(p1Character, p2Character)
          : record.duoKey,
      timestamp: normalizeTimestamp(record.timestamp)
    };
  });

  return {
    version,
    records: normalizedRecords
  };
}

export function validateImportedRecord(record, index) {
  if (!record || typeof record !== "object") {
    return `Record ${index + 1} is invalid.`;
  }

  const requiredStringFields = ["duoKey", "p1Character", "p2Character"];
  const requiredNumberFields = [
    "p1DamageGiven",
    "p1DamageTaken",
    "p2DamageGiven",
    "p2DamageTaken"
  ];

  for (const field of requiredStringFields) {
    if (typeof record[field] !== "string" || record[field].trim() === "") {
      return `Record ${index + 1}: ${field} must be a non-empty string.`;
    }
  }

  for (const field of requiredNumberFields) {
    if (typeof record[field] !== "number" || Number.isNaN(record[field])) {
      return `Record ${index + 1}: ${field} must be a valid number.`;
    }

    if (record[field] < 1) {
      return `Record ${index + 1}: ${field} must be at least 1.`;
    }
  }

  if (!characterIdMap.has(record.p1Character)) {
    return `Record ${index + 1}: p1Character is not a valid character id.`;
  }

  if (!characterIdMap.has(record.p2Character)) {
    return `Record ${index + 1}: p2Character is not a valid character id.`;
  }

  const expectedDuoKey = createDuoKey(record.p1Character, record.p2Character);

  if (record.duoKey !== expectedDuoKey) {
    return `Record ${index + 1}: duoKey does not match p1Character and p2Character.`;
  }

  if (
    record.timestamp !== null &&
    (
      typeof record.timestamp !== "number" ||
      Number.isNaN(record.timestamp)
    )
  ) {
    return `Record ${index + 1}: timestamp must be a number or null.`;
  }

  return null;
}

export function validateImportedRecords(records) {
  if (!Array.isArray(records)) {
    return "Imported records must be an array.";
  }

  for (let i = 0; i < records.length; i += 1) {
    const error = validateImportedRecord(records[i], i);

    if (error) {
      return error;
    }
  }

  return null;
}
