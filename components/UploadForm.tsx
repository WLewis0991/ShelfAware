"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, ImageIcon, X, Mic, Music } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  pdfFile: z
    .instanceof(File, { message: "Please select a PDF file" })
    .refine((f) => f.size <= 50 * 1024 * 1024, "Max file size is 50 MB"),
  coverImage: z.instanceof(File).optional(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author name is required"),
  voice: z.string().min(1, "Please select a voice"),
});

type FormValues = z.infer<typeof formSchema>;

const voiceGroups = [
  {
    label: "Male Voices",
    voices: [
      { id: "dave", name: "Dave", description: "Warm and authoritative" },
      { id: "daniel", name: "Daniel", description: "British, sophisticated" },
    ],
  },
  {
    label: "Female Voices",
    voices: [
      { id: "rachel", name: "Rachel", description: "Calm and clear" },
      { id: "sarah", name: "Sarah", description: "Expressive, natural" },
    ],
  },
];

function LoadingOverlay() {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white">
        <div className="loading-shadow">
          <div className="w-12 h-12 border-4 border-[var(--accent-warm)] border-t-transparent rounded-full loading-animation" />
          <p className="loading-title">Synthesizing your book...</p>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span>Analyzing PDF content</span>
            </div>
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span>Generating voice synthesis</span>
            </div>
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span>Preparing your interview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dropzone({
  accept,
  icon: Icon,
  text,
  hint,
  hintWhenSelected,
  file,
  onFileChange,
  onRemove,
}: {
  accept: string;
  icon: typeof Upload;
  text: string;
  hint: string;
  hintWhenSelected?: string;
  file: File | undefined;
  onFileChange: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        accept={accept}
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />
      <div
        className={`upload-dropzone ${file ? "upload-dropzone-uploaded" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        {file ? (
          <div className="file-upload-shadow items-center gap-1">
            <p className="upload-dropzone-text">{file.name}</p>
            {hintWhenSelected && (
              <p className="upload-dropzone-hint">{hintWhenSelected}</p>
            )}
            <button
              type="button"
              className="upload-dropzone-remove mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="file-upload-shadow">
            <Icon className="upload-dropzone-icon" />
            <p className="upload-dropzone-text">{text}</p>
            <p className="upload-dropzone-hint">{hint}</p>
          </div>
        )}
      </div>
    </>
  );
}

const UploadForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "",
    },
  });

  const pdfFile = form.watch("pdfFile");
  const coverImage = form.watch("coverImage");

  async function onSubmit(_data: FormValues) {
    void _data;
    // Submission logic
  }

  return (
    <div className="new-book-wrapper">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel className="form-label">PDF File</FormLabel>
                <FormControl>
                  <Dropzone
                    accept=".pdf"
                    icon={Upload}
                    text="Click to upload PDF"
                    hint="PDF file (max 50 MB)"
                    hintWhenSelected={`${((pdfFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB`}
                    file={pdfFile}
                    onFileChange={(f) => onChange(f ?? undefined)}
                    onRemove={() => {
                      onChange(undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel className="form-label">Cover Image</FormLabel>
                <FormControl>
                  <Dropzone
                    accept="image/*"
                    icon={ImageIcon}
                    text="Click to upload cover image"
                    hint="Leave empty to auto-generate from PDF"
                    file={coverImage}
                    onFileChange={(f) => onChange(f ?? undefined)}
                    onRemove={() => {
                      onChange(undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <input
                    className="form-input"
                    placeholder="ex: Rich Dad Poor Dad"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <input
                    className="form-input"
                    placeholder="ex: Robert Kiyosaki"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  Choose Assistant Voice
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {voiceGroups.map((group) => (
                      <div key={group.label} className="space-y-2">
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                          {group.label}
                        </p>
                        <div className="voice-selector-options">
                          {group.voices.map((voice) => (
                            <div
                              key={voice.id}
                              className={`voice-selector-option ${field.value === voice.id ? "voice-selector-option-selected" : "voice-selector-option-default"}`}
                              onClick={() => field.onChange(voice.id)}
                              role="radio"
                              aria-checked={field.value === voice.id}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  field.onChange(voice.id);
                                }
                              }}
                            >
                              {group.label === "Male Voices" ? (
                                <Mic className="w-5 h-5 text-[var(--accent-warm)]" />
                              ) : (
                                <Music className="w-5 h-5 text-[var(--accent-warm)]" />
                              )}
                              <div className="text-center">
                                <p className="font-medium text-[var(--text-primary)]">
                                  {voice.name}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {voice.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="form-btn"
            disabled={form.formState.isSubmitting}
          >
            Begin Synthesis
          </button>
        </form>
      </Form>

      {form.formState.isSubmitting && <LoadingOverlay />}
    </div>
  );
};

export default UploadForm;
