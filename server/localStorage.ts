import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, ".local_storage.json");

function loadData(): Record<string, unknown> {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load local storage file:", e);
    return {};
  }
}

function saveData(data: Record<string, unknown>) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write local storage file:", e);
  }
}

export class FileLocalStorage {
  private data: Record<string, unknown>;

  constructor() {
    this.data = loadData();
  }

  getItem(key: string): string | null {
    const v = this.data[key];
    return typeof v === "string" ? v : v === undefined ? null : JSON.stringify(v);
  }

  setItem(key: string, value: string): void {
    try {
      this.data[key] = JSON.parse(value);
    } catch {
      this.data[key] = value;
    }
    saveData(this.data);
  }

  removeItem(key: string): void {
    delete this.data[key];
    saveData(this.data);
  }

  // Helpers for structured values
  getObject<T = unknown>(key: string, fallback: T): T {
    const v = this.data[key];
    return (v === undefined ? fallback : (v as T));
  }

  setObject(key: string, obj: unknown): void {
    this.data[key] = obj;
    saveData(this.data);
  }
}

export default new FileLocalStorage();
