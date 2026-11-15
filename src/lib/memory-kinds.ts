import { Camera, Mic, PenLine, Video, type LucideIcon } from "lucide-react";

export type MemoryKindId = "fotograf" | "video" | "mesaj" | "ses";

type MemoryKindBase = {
  id: MemoryKindId;
  title: string;
  action: string;
  summary: string;
  icon: LucideIcon;
};

export type MediaKind = MemoryKindBase & {
  id: "fotograf" | "video" | "ses";
  noteLabel: string;
  accept: string[];
  extensions: string[];
  acceptAttr: string;
  typeLabel: string;
  maxBytes: number;
  maxLabel: string;
  maxSeconds?: number;
};

export type MessageKind = MemoryKindBase & {
  id: "mesaj";
  maxMessage: number;
};

export type MemoryKind = MediaKind | MessageKind;

export const memoryKinds: MemoryKind[] = [
  {
    id: "fotograf",
    title: "Fotoğraf",
    action: "Fotoğraf yükle",
    summary: "Bir kare, albümde sessiz bir sayfa.",
    icon: Camera,
    noteLabel: "Bu kareye kısa bir not",
    accept: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
    acceptAttr: "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif",
    typeLabel: "JPG, PNG, WEBP, HEIC",
    maxBytes: 15 * 1024 * 1024,
    maxLabel: "15 MB",
  },
  {
    id: "video",
    title: "Video",
    action: "Video yükle",
    summary: "Kısa bir hareket, o akşamın temposu.",
    icon: Video,
    noteLabel: "Bu videoya kısa bir not",
    accept: ["video/mp4", "video/quicktime", "video/webm"],
    extensions: [".mp4", ".mov", ".webm"],
    acceptAttr: "video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm",
    typeLabel: "MP4, MOV, WEBM",
    maxBytes: 100 * 1024 * 1024,
    maxLabel: "100 MB",
  },
  {
    id: "mesaj",
    title: "Yazılı mesaj",
    action: "Yazılı mesaj bırak",
    summary: "Birkaç cümle, yıllar sonra da okunacak.",
    icon: PenLine,
    maxMessage: 600,
  },
  {
    id: "ses",
    title: "Ses kaydı",
    action: "Ses kaydı bırak",
    summary: "Bir ses, bir kahkaha, kısa bir cümle.",
    icon: Mic,
    noteLabel: "Bu kayda kısa bir not",
    accept: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/x-wav",
      "audio/webm",
      "audio/m4a",
      "audio/x-m4a",
    ],
    extensions: [".mp3", ".m4a", ".wav", ".webm"],
    acceptAttr: "audio/mpeg,audio/mp4,audio/wav,audio/webm,.mp3,.m4a,.wav,.webm",
    typeLabel: "MP3, M4A, WAV, WEBM",
    maxBytes: 20 * 1024 * 1024,
    maxLabel: "20 MB",
    maxSeconds: 120,
  },
];

export const maxPhotoCount = 200;
export const maxGuestName = 40;

const kindIds = new Set<MemoryKindId>(memoryKinds.map((kind) => kind.id));

export function isMemoryKindId(value: string | undefined): value is MemoryKindId {
  return value !== undefined && kindIds.has(value as MemoryKindId);
}

export function getMemoryKind(id: MemoryKindId): MemoryKind {
  const kind = memoryKinds.find((item) => item.id === id);
  if (!kind) {
    throw new Error(`Unknown memory kind: ${id}`);
  }
  return kind;
}

export function isMediaKind(kind: MemoryKind): kind is MediaKind {
  return kind.id !== "mesaj";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

export function validateMediaFile(file: File, kind: MediaKind): string | null {
  return validateMediaMeta(
    { fileName: file.name, mimeType: file.type, byteSize: file.size },
    kind,
  );
}

export function validateMediaMeta(
  file: { fileName: string; mimeType: string; byteSize: number },
  kind: MediaKind,
): string | null {
  if (!Number.isInteger(file.byteSize) || file.byteSize <= 0) {
    return "Bu dosya boş.";
  }
  if (file.byteSize > kind.maxBytes) {
    return `Dosya ${kind.maxLabel} sınırını aşıyor. Daha küçük bir dosya seç.`;
  }
  const extension = file.fileName.slice(file.fileName.lastIndexOf(".")).toLowerCase();
  const typeOk = file.mimeType.length > 0 && kind.accept.includes(file.mimeType);
  const extensionOk = kind.extensions.includes(extension);
  if (!typeOk && !extensionOk) {
    return `Bu dosya uygun değil. ${kind.typeLabel} kullanabilirsin.`;
  }
  return null;
}

export const sampleMessages = [
  "Alkan ve Gamze, bu güzel gününüzde yanınızda olmak çok güzel. Bir ömür boyu mutluluklar.",
  "Sevginiz bize de iyi geldi. Nice mutlu yıllara.",
  "Bugün çok güzelsiniz. Yolunuz açık, eviniz bereketli olsun.",
  "Sizi böyle mutlu görmek yetti bize. Ömrünüz bir olsun.",
  "Kalbiniz hiç eksilmesin. Tebrikler, sizi seviyoruz.",
  "Bu akşamın neşesi yıllar sonra da sürsün.",
  "Birlikte çok güzelsiniz. Yeni başlangıcınız kutlu olsun.",
  "Gözlerinizdeki sevinç bugünün en güzel hali. Mutluluklar.",
  "İyi ki varsınız. Bu özel gününüzde sizi sevgiyle anıyoruz.",
  "El ele, gönül gönüle. Nice bayramlara, nice yıllara.",
] as const;

export const howItWorksSteps = [
  "QR kodu telefonunuzla okutun.",
  "Bırakmak istediğiniz anıyı seçin.",
  "Fotoğrafınızı, videonuzu veya mesajınızı gönderin.",
  "Anınız Alkan ve Gamze'nin özel albümünde saklansın.",
] as const;
