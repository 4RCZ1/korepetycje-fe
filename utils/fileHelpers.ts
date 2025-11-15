/**
 * File utility functions for file operations and formatting
 */

import { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

// Type for Material Icons names
export type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

// Common file extensions for different types
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg"];
const TEXT_EXTENSIONS = [".txt", ".doc", ".docx"];
const PDF_EXTENSIONS = [".pdf"];
const VIDEO_EXTENSIONS = [".mp4", ".avi"];
const AUDIO_EXTENSIONS = [".mp3", ".wav"];

/**
 * Check if file matches type or has specific extension
 * @param type - MIME type
 * @param name - File name
 * @param typeMatch - Type string to match
 * @param extensions - Array of extensions to check
 */
function matchesFileType(
  type: string,
  name: string,
  typeMatch: string,
  extensions: string[],
): boolean {
  return (
    type.includes(typeMatch) ||
    extensions.some((ext) => name.endsWith(ext))
  );
}

/**
 * Get the appropriate Material Icon name based on file type or name
 * @param fileType - The MIME type of the file (optional)
 * @param fileName - The name of the file (optional)
 * @returns Material Icon name for the file type
 */
export function getFileIcon(
  fileType?: string,
  fileName?: string,
): MaterialIconName {
  const type = fileType?.toLowerCase() || "";
  const name = fileName?.toLowerCase() || "";

  // PDF files
  if (matchesFileType(type, name, "pdf", PDF_EXTENSIONS)) {
    return "picture-as-pdf";
  }

  // Text files
  if (matchesFileType(type, name, "text", TEXT_EXTENSIONS)) {
    return "description";
  }

  // Image files
  if (matchesFileType(type, name, "image", IMAGE_EXTENSIONS)) {
    return "image";
  }

  // Video files
  if (matchesFileType(type, name, "video", VIDEO_EXTENSIONS)) {
    return "videocam";
  }

  // Audio files
  if (matchesFileType(type, name, "audio", AUDIO_EXTENSIONS)) {
    return "audiotrack";
  }

  // Default file icon
  return "insert-drive-file";
}

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB", "256 KB")
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "Nieznany rozmiar";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file extension from filename
 * @param fileName - The name of the file
 * @returns File extension (without dot) or empty string
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Check if a file is an image based on type or name
 * @param fileType - The MIME type of the file (optional)
 * @param fileName - The name of the file (optional)
 * @returns True if the file is an image
 */
export function isImageFile(fileType?: string, fileName?: string): boolean {
  const type = fileType?.toLowerCase() || "";
  const name = fileName?.toLowerCase() || "";
  return matchesFileType(type, name, "image", IMAGE_EXTENSIONS);
}
