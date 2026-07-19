export type Mood = "struggling" | "tired" | "okay" | "alright";

export type Moment = {
  id: string;
  situation: string;
  response: string;
  timestamp: string;
};

export type NewMoment = Omit<Moment, "id">;

export type Checkin = {
  mood: Mood;
  timestamp: string;
  momentId: string;
};

export type NewCheckin = Checkin;

export type Note = {
  id: string;
  imageDataUrl: string;
  explanation: string;
  timestamp: string;
};

export type NewNote = Omit<Note, "id">;

const MOMENTS_KEY = "besideyou_moments";
const CHECKINS_KEY = "besideyou_checkins";
const NOTES_KEY = "besideyou_notes";

function readStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(key);
    const value: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function writeStoredArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keeping a moment is best-effort when browser storage is unavailable.
  }
}

export function saveMoment({ situation, response, timestamp }: NewMoment): Moment {
  const moment: Moment = { id: crypto.randomUUID(), situation, response, timestamp };
  writeStoredArray(MOMENTS_KEY, [moment, ...getMoments()]);
  return moment;
}

export function getMoments(): Moment[] {
  return readStoredArray<Moment>(MOMENTS_KEY).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getMomentById(id: string): Moment | null {
  return getMoments().find((moment) => moment.id === id) ?? null;
}

export function saveCheckin(checkin: NewCheckin): Checkin {
  writeStoredArray(CHECKINS_KEY, [checkin, ...getCheckins()]);
  return checkin;
}

export function getCheckins(): Checkin[] {
  return readStoredArray<Checkin>(CHECKINS_KEY).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getRecentMoodPattern(): "struggling" | "stable" {
  const recent = getCheckins().slice(0, 3);
  return recent.length === 3 && recent.every(({ mood }) => mood === "struggling" || mood === "tired")
    ? "struggling"
    : "stable";
}

export function saveNote({ imageDataUrl, explanation, timestamp }: NewNote): Note {
  const note: Note = { id: crypto.randomUUID(), imageDataUrl, explanation, timestamp };
  writeStoredArray(NOTES_KEY, [note, ...getNotes()]);
  return note;
}

export function getNotes(): Note[] {
  return readStoredArray<Note>(NOTES_KEY).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
