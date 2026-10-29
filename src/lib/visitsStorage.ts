import fs from "fs";
import path from "path";

export interface DemoVisitEvent {
  id: string;
  timestamp: string;
  formattedDate: string;
  device: string;
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Unknown";
  referrer: string;
  screen: string;
  ip: string;
  userAgent: string;
  isFirstVisit: boolean;
}

export interface LeadVisitRecord {
  slug: string;
  companyName: string;
  totalVisits: number;
  uniqueSessions: number;
  firstVisitAt: string;
  lastVisitAt: string;
  lastDevice: string;
  lastDeviceType: "Mobile" | "Desktop" | "Tablet" | "Unknown";
  visits: DemoVisitEvent[];
}

function getVisitsFilePath(): string {
  const primaryPath = path.join(process.cwd(), "src", "data", "demo-visits.json");
  return primaryPath;
}

export function getAllVisits(): Record<string, LeadVisitRecord> {
  const filePath = getVisitsFilePath();
  if (!fs.existsSync(filePath)) {
    // Prova percorso fallback in /tmp
    const tmpPath = path.join("/tmp", "techpyre-demo-visits.json");
    if (fs.existsSync(tmpPath)) {
      try {
        return JSON.parse(fs.readFileSync(tmpPath, "utf-8"));
      } catch {
        return {};
      }
    }
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

export function saveVisits(visits: Record<string, LeadVisitRecord>): void {
  const filePath = getVisitsFilePath();
  const jsonContent = JSON.stringify(visits, null, 2);
  try {
    fs.writeFileSync(filePath, jsonContent, "utf-8");
  } catch {
    // In ambienti serverless read-only salva in /tmp
    try {
      fs.writeFileSync(path.join("/tmp", "techpyre-demo-visits.json"), jsonContent, "utf-8");
    } catch {}
  }
}

export function parseDeviceFromUA(ua: string): {
  device: string;
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Unknown";
} {
  const lower = ua.toLowerCase();
  if (lower.includes("ipad") || (lower.includes("tablet") && !lower.includes("mobile"))) {
    return { device: "iPad / Tablet", deviceType: "Tablet" };
  }
  if (lower.includes("iphone")) {
    const match = lower.match(/os (\d+[._]\d+)/);
    const osVer = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
    return { device: `iPhone (${osVer})`, deviceType: "Mobile" };
  }
  if (lower.includes("android")) {
    if (lower.includes("mobile")) {
      return { device: "Smartphone Android", deviceType: "Mobile" };
    }
    return { device: "Tablet Android", deviceType: "Tablet" };
  }
  if (lower.includes("macintosh") || lower.includes("mac os")) {
    return { device: "Apple Mac (Desktop)", deviceType: "Desktop" };
  }
  if (lower.includes("windows")) {
    return { device: "PC Windows (Desktop)", deviceType: "Desktop" };
  }
  if (lower.includes("linux")) {
    return { device: "Linux (Desktop)", deviceType: "Desktop" };
  }
  return { device: "Browser Web", deviceType: "Unknown" };
}

export function formatItalianDate(date: Date): string {
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function recordDemoVisit(params: {
  slug: string;
  companyName: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  userAgent?: string;
  ip?: string;
  isFirstVisit?: boolean;
}): { visitRecord: LeadVisitRecord; newVisit: DemoVisitEvent } {
  const { slug, companyName, referrer, screenWidth, screenHeight, userAgent = "", ip = "0.0.0.0", isFirstVisit = false } = params;
  
  const visits = getAllVisits();
  const now = new Date();
  const isoTime = now.toISOString();
  const formattedDate = formatItalianDate(now);
  const { device, deviceType } = parseDeviceFromUA(userAgent);
  
  const screenStr = screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : "N/D";
  
  // Maschera parzialmente l'IP per riservatezza (mantiene la geolocalizzabilità generale)
  const cleanIp = ip.includes(":") ? ip : ip.split(".").map((part, i) => (i >= 2 ? "xxx" : part)).join(".");
  
  const newVisit: DemoVisitEvent = {
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: isoTime,
    formattedDate,
    device,
    deviceType,
    referrer: referrer || "diretto / email",
    screen: screenStr,
    ip: cleanIp,
    userAgent,
    isFirstVisit,
  };

  const existing = visits[slug] || {
    slug,
    companyName: companyName || slug,
    totalVisits: 0,
    uniqueSessions: 0,
    firstVisitAt: isoTime,
    lastVisitAt: isoTime,
    lastDevice: device,
    lastDeviceType: deviceType,
    visits: [],
  };

  existing.totalVisits += 1;
  if (isFirstVisit) {
    existing.uniqueSessions += 1;
  } else if (existing.uniqueSessions === 0) {
    existing.uniqueSessions = 1;
  }
  existing.lastVisitAt = isoTime;
  existing.lastDevice = device;
  existing.lastDeviceType = deviceType;
  if (companyName && (!existing.companyName || existing.companyName === slug)) {
    existing.companyName = companyName;
  }

  // Conserva fino alle ultime 50 visite per ogni lead per non appesantire il file
  existing.visits.unshift(newVisit);
  if (existing.visits.length > 50) {
    existing.visits = existing.visits.slice(0, 50);
  }

  visits[slug] = existing;
  saveVisits(visits);

  return { visitRecord: existing, newVisit };
}
