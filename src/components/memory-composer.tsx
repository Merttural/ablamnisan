"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  formatFileSize,
  getMemoryKind,
  isMediaKind,
  memoryKinds,
  validateMediaFile,
  type MediaKind,
  type MemoryKindId,
} from "@/lib/memory-kinds";
import { buildMemoryDraft, readDeliveryReceipt } from "@/lib/memory-draft";

const PHOTO_LIMIT = 12;

const fieldClass =
  "mt-3 w-full border-b border-charcoal/20 bg-transparent py-3 text-base text-charcoal outline-none transition-colors duration-300 placeholder:text-taupe/50 focus:border-charcoal";

const primaryButton =
  "flex min-h-14 w-full items-center justify-center bg-charcoal px-6 py-4 text-center font-serif text-2xl text-ivory transition-colors duration-300 hover:bg-taupe focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal disabled:cursor-not-allowed disabled:bg-taupe/40";

const choiceButton =
  "flex min-h-16 w-full cursor-pointer items-center justify-center border-2 border-charcoal bg-ivory px-5 py-4 text-center font-serif text-2xl text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal";

type Step = "karsilama" | "tur" | "icerik" | "onay";

type LocalAsset = {
  id: string;
  file: File;
  previewUrl: string;
};

const stepIndex: Record<Step, number> = {
  karsilama: 1,
  tur: 2,
  icerik: 3,
  onay: 4,
};

export function MemoryComposer() {
  const [step, setStep] = useState<Step>("karsilama");
  const [kindId, setKindId] = useState<MemoryKindId | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const assetsRef = useRef(assets);

  useEffect(() => {
    assetsRef.current = assets;
  });

  useEffect(() => {
    return () => {
      assetsRef.current.forEach((asset) => URL.revokeObjectURL(asset.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  function clearAssets() {
    setAssets((current) => {
      current.forEach((asset) => URL.revokeObjectURL(asset.previewUrl));
      return [];
    });
  }

  function removeAsset(id: string) {
    setAssets((current) => {
      const target = current.find((asset) => asset.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((asset) => asset.id !== id);
    });
    setError(null);
  }

  function addFiles(files: File[]) {
    if (!kindId) {
      return;
    }
    const kind = getMemoryKind(kindId);
    if (!isMediaKind(kind)) {
      return;
    }

    const nextAssets: LocalAsset[] = [];
    let message: string | null = null;
    const room = kind.id === "fotograf" ? PHOTO_LIMIT - assets.length : 1;

    if (room <= 0) {
      setError(`En fazla ${PHOTO_LIMIT} fotoğraf ekleyebilirsin.`);
      return;
    }

    for (const file of files.slice(0, room)) {
      const problem = validateMediaFile(file, kind);
      if (problem) {
        message = problem;
        continue;
      }
      nextAssets.push({
        id: createId(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (files.length > room && kind.id === "fotograf") {
      message = `En fazla ${PHOTO_LIMIT} fotoğraf ekleyebilirsin.`;
    }

    if (nextAssets.length === 0) {
      setError(message ?? "Bu dosya uygun değil.");
      return;
    }

    setAssets((current) => {
      if (kind.id === "fotograf") {
        return [...current, ...nextAssets];
      }
      current.forEach((asset) => URL.revokeObjectURL(asset.previewUrl));
      return nextAssets;
    });
    setError(message);
  }

  function chooseKind(next: MemoryKindId) {
    if (next !== kindId) {
      clearAssets();
      setNote("");
      setName("");
      setKindId(next);
    }
    setError(null);
    setStep("icerik");
  }

  function goToReview() {
    if (!kindId) {
      return;
    }
    if (kindId === "mesaj" && note.trim().length === 0) {
      setError("Önce bir mesaj yaz.");
      return;
    }
    if (kindId !== "mesaj" && assets.length === 0) {
      setError(kindId === "fotograf" ? "Önce bir fotoğraf ekle." : "Önce bir dosya seç.");
      return;
    }
    setError(null);
    setStep("onay");
  }

  const delivery = readDeliveryReceipt();
  if (delivery) {
    return (
      <Shell>
        <ThanksScreen />
      </Shell>
    );
  }

  const kind = kindId ? getMemoryKind(kindId) : null;

  return (
    <Shell>
      <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">
        Adım {stepIndex[step]} / 4
      </p>

      {step === "karsilama" ? (
        <Welcome headingRef={headingRef} onStart={() => setStep("tur")} />
      ) : null}

      {step === "tur" ? (
        <KindStep headingRef={headingRef} onBack={() => setStep("karsilama")} onChoose={chooseKind} />
      ) : null}

      {step === "icerik" && kind ? (
        <ContentStep
          headingRef={headingRef}
          kindId={kind.id}
          name={name}
          note={note}
          assets={assets}
          error={error}
          onName={setName}
          onNote={setNote}
          onFiles={addFiles}
          onRemove={removeAsset}
          onBack={() => setStep("tur")}
          onReview={goToReview}
        />
      ) : null}

      {step === "onay" && kind ? (
        <ReviewStep
          headingRef={headingRef}
          kindId={kind.id}
          name={name}
          note={note}
          assets={assets}
          onEdit={() => setStep("icerik")}
        />
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-clip px-5 py-14 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </div>
  );
}

function Welcome({
  headingRef,
  onStart,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onStart: () => void;
}) {
  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-balance font-serif text-[2.6rem] leading-[1.02] font-medium tracking-[-0.03em] text-charcoal outline-none sm:text-6xl"
      >
        Bu güzel günden bir anı bırak.
      </h1>
      <span className="mt-8 block h-px w-12 bg-gold" aria-hidden />
      <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-taupe md:text-lg md:leading-8">
        Fotoğrafın, videon veya birkaç güzel kelimen bizim için çok değerli.
      </p>
      <button type="button" onClick={onStart} className={`${primaryButton} mt-10 sm:max-w-xs`}>
        Anını paylaş
      </button>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center text-base text-taupe underline decoration-charcoal/30 underline-offset-4"
      >
        Albüme dön
      </Link>
    </>
  );
}

function KindStep({
  headingRef,
  onBack,
  onChoose,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onChoose: (kind: MemoryKindId) => void;
}) {
  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-balance font-serif text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-charcoal outline-none sm:text-5xl"
      >
        Nasıl bir anı bırakmak istersin?
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {memoryKinds.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChoose(item.id)}
              className="flex min-h-24 items-center gap-4 border border-charcoal/20 bg-champagne/50 px-5 py-4 text-left transition-colors duration-300 hover:border-charcoal hover:bg-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal"
            >
              <Icon className="size-5 shrink-0 text-gold" strokeWidth={1.25} aria-hidden />
              <span>
                <span className="block font-serif text-3xl leading-none text-charcoal">{item.title}</span>
                <span className="mt-2 block text-base leading-6 text-taupe">{item.summary}</span>
              </span>
            </button>
          );
        })}
      </div>
      <BackButton onClick={onBack} />
    </>
  );
}

function ContentStep({
  headingRef,
  kindId,
  name,
  note,
  assets,
  error,
  onName,
  onNote,
  onFiles,
  onRemove,
  onBack,
  onReview,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  kindId: MemoryKindId;
  name: string;
  note: string;
  assets: LocalAsset[];
  error: string | null;
  onName: (value: string) => void;
  onNote: (value: string) => void;
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onReview: () => void;
}) {
  const kind = getMemoryKind(kindId);

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-serif text-4xl leading-none font-medium tracking-[-0.03em] text-charcoal outline-none sm:text-5xl"
      >
        {kind.title}
      </h1>

      {isMediaKind(kind) ? (
        <MediaEntry kind={kind} assets={assets} onFiles={onFiles} onRemove={onRemove} />
      ) : (
        <div className="mt-8">
          <label className="block">
            <span className="text-base text-charcoal">Adın, istersen</span>
            <input
              value={name}
              onChange={(event) => onName(event.target.value)}
              maxLength={40}
              autoComplete="name"
              className={fieldClass}
            />
          </label>
          <label className="mt-8 block">
            <span className="text-base text-charcoal">Mesajın</span>
            <textarea
              value={note}
              onChange={(event) => onNote(event.target.value)}
              maxLength={kind.maxMessage}
              rows={7}
              className={`${fieldClass} resize-none leading-7`}
            />
            <span className="mt-3 block text-base text-taupe">
              En fazla {kind.maxMessage} karakter · {note.length}/{kind.maxMessage}
            </span>
          </label>
        </div>
      )}

      {error ? <p className="mt-4 text-base leading-6 text-charcoal">{error}</p> : null}

      <button type="button" onClick={onReview} className={`${primaryButton} mt-8`}>
        Kontrol et
      </button>
      <BackButton onClick={onBack} />
    </>
  );
}

function MediaEntry({
  kind,
  assets,
  onFiles,
  onRemove,
}: {
  kind: MediaKind;
  assets: LocalAsset[];
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mt-8">
      <p className="text-base leading-7 text-taupe">{mediaHelp(kind)}</p>

      {kind.id === "fotograf" ? (
        <div className="mt-6 grid grid-cols-1 gap-3">
          <FilePicker kind={kind} label="Fotoğraf çek" capture="environment" acceptAttr="image/*" onFiles={onFiles} />
          <FilePicker kind={kind} label="Galeriden seç" multiple onFiles={onFiles} />
        </div>
      ) : null}

      {kind.id === "video" ? (
        <FilePicker kind={kind} label="Video seç" className="mt-6" onFiles={onFiles} />
      ) : null}

      {kind.id === "ses" ? <VoiceCapture kind={kind} onFile={(file) => onFiles([file])} /> : null}

      {assets.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-4">
          {assets.map((asset) => (
            <li key={asset.id} className="min-w-0">
              <Preview kind={kind} asset={asset} />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-base text-taupe">
                  {asset.file.name} · {formatFileSize(asset.file.size)}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(asset.id)}
                  className="inline-flex min-h-11 shrink-0 items-center text-base text-charcoal underline decoration-charcoal/30 underline-offset-4"
                >
                  Kaldır
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ReviewStep({
  headingRef,
  kindId,
  name,
  note,
  assets,
  onEdit,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  kindId: MemoryKindId;
  name: string;
  note: string;
  assets: LocalAsset[];
  onEdit: () => void;
}) {
  const kind = getMemoryKind(kindId);
  const draft = buildMemoryDraft({
    kind: kindId,
    guestName: name,
    message: kindId === "mesaj" ? note : "",
    files: assets.map((asset) => ({ id: asset.id, file: asset.file })),
  });

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-balance font-serif text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-charcoal outline-none sm:text-5xl"
      >
        Anını bir kez daha gör.
      </h1>
      <p className="mt-6 text-base leading-7 text-taupe">
        {kind.title}
        {draft.guestName ? ` · ${draft.guestName}` : ""}
      </p>

      {kindId === "mesaj" ? (
        <blockquote className="mt-8 border-l border-gold pl-5 font-serif text-2xl leading-snug text-charcoal">
          {draft.message}
        </blockquote>
      ) : isMediaKind(kind) ? (
        <ul className="mt-8 grid grid-cols-1 gap-4">
          {assets.map((asset) => {
            const original = draft.originals.find((item) => item.localId === asset.id);
            return (
              <li key={asset.id} className="min-w-0">
                <Preview kind={kind} asset={asset} />
                <p className="mt-3 truncate text-base text-taupe">
                  {original?.fileName} · {original ? formatFileSize(original.byteSize) : ""}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="mt-8 border border-charcoal/15 bg-champagne/40 px-5 py-4 text-base leading-7 text-charcoal">
        {kindId === "mesaj"
          ? "Gönderim henüz açık değil. Mesajın albüme eklenmedi; şimdilik yalnızca bu telefonda duruyor."
          : "Gönderim henüz açık değil. Anın albüme eklenmedi; dosyalar yalnızca bu telefonda duruyor."}
      </p>
      <button type="button" disabled className={`${primaryButton} mt-6`}>
        Gönder
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="mt-3 flex min-h-14 w-full items-center justify-center border border-charcoal/30 px-6 py-4 text-center font-serif text-2xl text-charcoal"
      >
        Düzenle
      </button>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center text-base text-taupe underline decoration-charcoal/30 underline-offset-4"
      >
        Albüme dön
      </Link>
    </>
  );
}

function ThanksScreen() {
  return (
    <>
      <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">Teşekkürler</p>
      <h1 className="mt-5 text-balance font-serif text-[2.6rem] leading-[1.02] font-medium tracking-[-0.03em] text-charcoal sm:text-6xl">
        Anını bizimle paylaştığın için teşekkür ederiz.
      </h1>
      <span className="mt-8 block h-px w-12 bg-gold" aria-hidden />
      <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-taupe md:text-lg">
        Bu özel günümüzü daha da anlamlı kıldın.
      </p>
      <Link href="/" className={`${primaryButton} mt-10 sm:max-w-xs`}>
        Albüme dön
      </Link>
    </>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 inline-flex min-h-11 items-center text-base text-taupe underline decoration-charcoal/30 underline-offset-4"
    >
      Geri
    </button>
  );
}

function FilePicker({
  kind,
  onFiles,
  className = "",
  label,
  capture,
  acceptAttr,
  multiple = false,
}: {
  kind: MediaKind;
  onFiles: (files: File[]) => void;
  className?: string;
  label: string;
  capture?: "environment";
  acceptAttr?: string;
  multiple?: boolean;
}) {
  const inputId = useId();

  return (
    <div className={className}>
      <input
        id={inputId}
        type="file"
        accept={acceptAttr ?? kind.acceptAttr}
        capture={capture}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = event.target.files ? Array.from(event.target.files) : [];
          event.target.value = "";
          if (files.length > 0) {
            onFiles(files);
          }
        }}
      />
      <label htmlFor={inputId} className={choiceButton}>
        {label}
      </label>
    </div>
  );
}

function Preview({ kind, asset }: { kind: MediaKind; asset: LocalAsset }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <p className="border border-charcoal/15 bg-champagne/40 px-5 py-6 text-base leading-7 text-taupe">
        Önizleme bu telefonda açılamadı. Dosyan duruyor: {asset.file.name}
      </p>
    );
  }

  if (kind.id === "fotograf") {
    return (
      // Local object URLs are previews only. The original File is not rewritten.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.previewUrl}
        alt="Seçilen fotoğrafın önizlemesi"
        className="max-h-[70svh] w-full bg-champagne object-contain"
        onError={() => setFailed(true)}
      />
    );
  }

  if (kind.id === "video") {
    return (
      <video
        src={asset.previewUrl}
        controls
        playsInline
        preload="metadata"
        className="max-h-[70svh] w-full bg-charcoal"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <audio
      src={asset.previewUrl}
      controls
      preload="metadata"
      className="w-full"
      onError={() => setFailed(true)}
    />
  );
}

function VoiceCapture({ kind, onFile }: { kind: MediaKind; onFile: (file: File) => void }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const discardRef = useRef(false);

  useEffect(() => {
    return () => {
      releaseRecording();
    };
  }, []);

  function releaseRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  function stopRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function startRecording() {
    setLocalError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setLocalError("Bu tarayıcıda doğrudan kayıt yok. Bir ses dosyası seçebilirsin.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const shouldSave = !discardRef.current;
        discardRef.current = false;
        if (shouldSave) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const extension = blob.type.includes("mp4") ? "m4a" : "webm";
          onFile(new File([blob], `ses-kaydi.${extension}`, { type: blob.type || "audio/webm" }));
        }
        setRecording(false);
        recorderRef.current = null;
        streamRef.current = null;
      };
      recorderRef.current = recorder;
      streamRef.current = stream;
      recorder.start();
      setRecording(true);
      setElapsed(0);
      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.min(kind.maxSeconds ?? 120, Math.floor((Date.now() - startedAt) / 1000));
        setElapsed(seconds);
        if (kind.maxSeconds && seconds >= kind.maxSeconds) {
          stopRecording();
        }
      }, 250);
    } catch {
      releaseRecording();
      setRecording(false);
      setLocalError("Mikrofon açılamadı. İzin vermediysen bir ses dosyası seçebilirsin.");
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-3">
      {recording ? (
        <button type="button" onClick={stopRecording} className={primaryButton}>
          Kaydı bitir · {formatClock(elapsed)}
        </button>
      ) : (
        <button type="button" onClick={startRecording} className={choiceButton}>
          Kayda başla
        </button>
      )}
      <FilePicker
        kind={kind}
        label="Ses dosyası seç"
        onFiles={(files) => {
          const next = files[0];
          if (!next) {
            return;
          }
          if (recorderRef.current && recorderRef.current.state !== "inactive") {
            discardRef.current = true;
            stopRecording();
          }
          setRecording(false);
          onFile(next);
        }}
      />
      {localError ? <p className="text-base leading-6 text-charcoal">{localError}</p> : null}
    </div>
  );
}

function mediaHelp(kind: MediaKind): string {
  if (kind.id === "fotograf") {
    return `${kind.typeLabel} kabul edilir. Her fotoğraf en fazla ${kind.maxLabel}. Birden fazla fotoğraf seçebilirsin, en fazla ${PHOTO_LIMIT}.`;
  }
  if (kind.id === "video") {
    return `${kind.typeLabel} kabul edilir. Video en fazla ${kind.maxLabel} olabilir.`;
  }
  const minutes = (kind.maxSeconds ?? 120) / 60;
  return `${kind.typeLabel} kabul edilir. Dosya en fazla ${kind.maxLabel}. Ses kaydı en fazla ${minutes} dakika.`;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ani-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
