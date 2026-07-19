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

function isWithinLastNDays(timestamp: string, days: number): boolean {
  return new Date(timestamp).getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export function getMomentsInLastNDays(days: number): Moment[] {
  return getMoments().filter(({ timestamp }) => isWithinLastNDays(timestamp, days));
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

export function getCheckinsInLastNDays(days: number): Checkin[] {
  return getCheckins().filter(({ timestamp }) => isWithinLastNDays(timestamp, days));
}

export type MoodPattern = {
  pattern: "flourishing" | "steady" | "carrying" | "struggling";
  recentCheckins: number;
  lastCheckinAt: number | null;
};

export function getRecentMoodPattern(): MoodPattern {
  const checkins = getCheckins();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentCheckins = checkins.filter(({ timestamp }) => new Date(timestamp).getTime() >= sevenDaysAgo).length;
  const lastCheckinAt = checkins[0] ? new Date(checkins[0].timestamp).getTime() : null;

  if (checkins.length < 3) return { pattern: "steady", recentCheckins, lastCheckinAt };

  const lastThree = checkins.slice(0, 3);
  if (lastThree.every(({ mood }) => mood === "okay" || mood === "alright")) {
    return { pattern: "flourishing", recentCheckins, lastCheckinAt };
  }

  const harderCheckins = checkins.slice(0, 5).filter(({ mood }) => mood === "struggling" || mood === "tired").length;
  const pattern = harderCheckins >= 3 ? "struggling" : harderCheckins === 2 ? "carrying" : "steady";
  return { pattern, recentCheckins, lastCheckinAt };
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
