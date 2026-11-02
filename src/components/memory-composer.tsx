"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  formatFileSize,
  getMemoryKind,
  isMediaKind,
  isMemoryKindId,
  memoryKinds,
  validateMediaFile,
  type MediaKind,
  type MemoryKindId,
} from "@/lib/memory-kinds";

const fieldClass =
  "mt-3 w-full border-b border-charcoal/20 bg-transparent py-3 text-base text-charcoal outline-none transition-colors duration-300 placeholder:text-taupe/50 focus:border-charcoal";

export function MemoryComposer() {
  const urlKind = useSyncExternalStore(subscribeToKind, readKindFromLocation, () => null);
  const [chosenKind, setChosenKind] = useState<MemoryKindId | null | undefined>(undefined);
  const kindId = chosenKind === undefined ? urlKind : chosenKind;
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (kindId !== "fotograf" || window.location.hash !== "#fotograf-sec") {
      return;
    }
    document.getElementById("fotograf-sec")?.scrollIntoView({ block: "nearest" });
  }, [kindId]);

  function clearFile() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPreviewUrl(null);
    setFile(null);
  }

  function acceptFile(next: File) {
    if (!kindId) {
      return;
    }
    const kind = getMemoryKind(kindId);
    if (!isMediaKind(kind)) {
      return;
    }
    const message = validateMediaFile(next, kind);
    if (message) {
      clearFile();
      setError(message);
      return;
    }
    const url = URL.createObjectURL(next);
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    previewRef.current = url;
    setPreviewUrl(url);
    setFile(next);
    setError(null);
  }

  function chooseKind(next: MemoryKindId) {
    if (next !== kindId) {
      clearFile();
      setError(null);
      const nextKind = getMemoryKind(next);
      if (isMediaKind(nextKind) && note.length > 280) {
        setNote(note.slice(0, 280));
      }
      setChosenKind(next);
    }
    window.requestAnimationFrame(() => {
      document.getElementById(next === "fotograf" ? "fotograf-sec" : `ani-${next}`)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  }

  const kind = kindId ? getMemoryKind(kindId) : null;

  return (
    <div className="px-5 py-14 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">29 Kasım 2026</p>
        <h1 className="mt-5 text-balance font-serif text-[2.6rem] leading-[1.02] font-medium tracking-[-0.03em] text-charcoal sm:text-6xl">
          Bu güzel günden bir anı bırak.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-taupe md:text-lg md:leading-8">
          Fotoğrafın, videon veya birkaç güzel kelimen bizim için çok değerli.
        </p>

        <fieldset className="mt-12 md:mt-16">
          <legend className="text-[0.68rem] uppercase tracking-[0.28em] text-taupe">
            Anı türü
          </legend>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {memoryKinds.map((item) => {
              const Icon = item.icon;
              const selected = item.id === kindId;
              return (
                <div
                  key={item.id}
                  id={`ani-${item.id}`}
                  className={`scroll-mt-24 border-2 ${selected ? "border-charcoal bg-champagne/35" : "border-transparent"}`}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-expanded={selected}
                    aria-controls={selected ? `ani-panel-${item.id}` : undefined}
                    onClick={() => chooseKind(item.id)}
                    className={`flex min-h-[4.5rem] w-full items-center gap-4 border-2 px-5 py-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal ${selected ? "border-charcoal bg-charcoal text-ivory" : "border-charcoal/30 bg-champagne/55 text-charcoal"}`}
                  >
                    <Icon className="size-6 shrink-0" strokeWidth={1.5} aria-hidden />
                    <span className="font-serif text-2xl leading-none tracking-tight">{item.action}</span>
                  </button>
                  {selected && kind ? (
                    <div id={`ani-panel-${item.id}`} className="px-4 py-5 md:px-5">
                      {isMediaKind(kind) ? (
                        <MediaFields
                          kind={kind}
                          file={file}
                          previewUrl={previewUrl}
                          error={error}
                          note={note}
                          onNote={setNote}
                          onFile={acceptFile}
                          onClear={() => {
                            clearFile();
                            setError(null);
                          }}
                        />
                      ) : (
                        <label className="block">
                          <span className="text-[0.68rem] uppercase tracking-[0.28em] text-taupe">
                            Mesajın
                          </span>
                          <textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            maxLength={kind.maxMessage}
                            rows={7}
                            className={`${fieldClass} resize-none leading-7`}
                          />
                          <span className="mt-3 block text-base text-taupe">
                            En fazla {kind.maxMessage} karakter · {note.length}/{kind.maxMessage}
                          </span>
                        </label>
                      )}

                      <label className="mt-8 block">
                        <span className="text-[0.68rem] uppercase tracking-[0.28em] text-taupe">
                          Adın, istersen
                        </span>
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          maxLength={40}
                          autoComplete="name"
                          className={fieldClass}
                        />
                      </label>

                      <p className="mt-8 border-2 border-charcoal/20 bg-ivory px-5 py-4 text-base leading-7 text-charcoal">
                        {isMediaKind(kind)
                          ? "Henüz göndermiyoruz. Seçtiğin dosya şimdilik sadece bu telefonda durur."
                          : "Henüz göndermiyoruz. Mesajın şimdilik sadece bu telefonda durur."}
                      </p>
                      <Link
                        href="/"
                        className="mt-6 inline-flex min-h-11 items-center text-base text-taupe underline decoration-charcoal/30 underline-offset-4 transition-colors duration-300 hover:text-charcoal"
                      >
                        Albüme dön
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function MediaFields({
  kind,
  file,
  previewUrl,
  error,
  note,
  onNote,
  onFile,
  onClear,
}: {
  kind: MediaKind;
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  note: string;
  onNote: (value: string) => void;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      {kind.id === "ses" ? (
        <VoiceCapture kind={kind} onFile={onFile} />
      ) : kind.id === "fotograf" ? (
        <div id="fotograf-sec" className="scroll-mt-24 grid grid-cols-1 gap-3">
          <p className="text-base leading-6 text-charcoal">Kameradan çek ya da galeriden seç.</p>
          <FilePicker
            kind={kind}
            onFile={onFile}
            label="Fotoğraf çek"
            capture="environment"
            acceptAttr="image/*"
            className=""
          />
          <FilePicker kind={kind} onFile={onFile} label="Galeriden seç" className="" />
        </div>
      ) : (
        <FilePicker kind={kind} onFile={onFile} label="Video seç" className="" />
      )}

      <p className="mt-4 text-base leading-6 text-taupe">
        {kind.typeLabel} kabul edilir. Dosya en fazla {kind.maxLabel} olabilir.
        {kind.maxSeconds ? ` Ses kaydı en fazla ${kind.maxSeconds / 60} dakika.` : ""}
      </p>

      {error ? <p className="mt-4 text-sm leading-6 text-charcoal">{error}</p> : null}

      {file && previewUrl ? (
        <div className="mt-6">
          <MediaPreview kind={kind} file={file} previewUrl={previewUrl} />
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="min-w-0 truncate text-sm text-taupe">
              {file.name} · {formatFileSize(file.size)}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-[0.68rem] uppercase tracking-[0.22em] text-charcoal"
            >
              Kaldır
            </button>
          </div>
        </div>
      ) : null}

      <label className="mt-10 block">
        <span className="text-[0.68rem] uppercase tracking-[0.28em] text-taupe">
          {kind.noteLabel}
        </span>
        <textarea
          value={note}
          onChange={(event) => onNote(event.target.value)}
          maxLength={280}
          rows={4}
          className={`${fieldClass} resize-none leading-7`}
        />
        <span className="mt-3 block text-sm text-taupe">En fazla 280 karakter · {note.length}/280</span>
      </label>
    </div>
  );
}

function FilePicker({
  kind,
  onFile,
  className = "mt-6",
  label = "Dosya seç",
  capture,
  acceptAttr,
}: {
  kind: MediaKind;
  onFile: (file: File) => void;
  className?: string;
  label?: string;
  capture?: "user" | "environment";
  acceptAttr?: string;
}) {
  const inputId = useId();

  return (
    <div className={className}>
      <input
        id={inputId}
        type="file"
        accept={acceptAttr ?? kind.acceptAttr}
        capture={capture}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0];
          event.target.value = "";
          if (next) {
            onFile(next);
          }
        }}
      />
      <label
        htmlFor={inputId}
        className="flex min-h-16 w-full cursor-pointer items-center justify-center border-2 border-charcoal bg-charcoal px-5 py-4 text-center font-serif text-2xl text-ivory transition-colors duration-300 hover:bg-ivory hover:text-charcoal"
      >
        {label}
      </label>
    </div>
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
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
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
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
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
        const seconds = Math.min(
          kind.maxSeconds ?? 120,
          Math.floor((Date.now() - startedAt) / 1000),
        );
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
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex min-h-14 w-full items-center justify-center border-2 border-charcoal bg-charcoal px-5 py-3 text-center text-base font-medium text-ivory"
          >
            Kaydı bitir · {formatClock(elapsed)}
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="flex min-h-14 w-full items-center justify-center border-2 border-charcoal bg-ivory px-5 py-3 text-center text-base font-medium text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-ivory"
          >
            Kayda başla
          </button>
        )}
        <FilePicker
          kind={kind}
          className=""
          label="Ses dosyası seç"
          onFile={(next) => {
            if (recorderRef.current && recorderRef.current.state !== "inactive") {
              discardRef.current = true;
              stopRecording();
            }
            setRecording(false);
            onFile(next);
          }}
        />
      </div>
      {localError ? <p className="mt-4 text-sm leading-6 text-charcoal">{localError}</p> : null}
    </div>
  );
}

function MediaPreview({
  kind,
  file,
  previewUrl,
}: {
  kind: MediaKind;
  file: File;
  previewUrl: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <p className="text-sm leading-6 text-taupe">
        Önizleme bu tarayıcıda açılamadı. Seçilen dosya: {file.name}
      </p>
    );
  }

  if (kind.id === "fotograf") {
    return (
      // Blob previews are local and temporary; the image optimizer cannot fetch them.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
        alt="Seçilen fotoğrafın önizlemesi"
        className="max-h-[70svh] w-full bg-champagne object-contain"
        onError={() => setFailed(true)}
      />
    );
  }

  if (kind.id === "video") {
    return (
      <video
        src={previewUrl}
        controls
        playsInline
        preload="metadata"
        className="max-h-[70svh] w-full bg-charcoal"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <audio src={previewUrl} controls preload="metadata" className="w-full" onError={() => setFailed(true)} />
  );
}

function subscribeToKind() {
  return () => {};
}

function readKindFromLocation(): MemoryKindId | null {
  const value = new URLSearchParams(window.location.search).get("tur") ?? undefined;
  return isMemoryKindId(value) ? value : null;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
