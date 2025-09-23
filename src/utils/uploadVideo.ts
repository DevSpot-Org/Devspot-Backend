import { createClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

export interface UploadVideoParams {
  file: File;
  userId: string;
  bucketName: string;
  folderPath: string;
  maxSizeMB?: number; // defaults to 10
}

export interface UploadVideoResult {
  publicUrl: string;
  error?: string;
}

export async function uploadVideo({
  file,
  userId,
  bucketName,
  folderPath,
  maxSizeMB = 10,
}: UploadVideoParams): Promise<UploadVideoResult> {
  try {
    // 1. Type check
    if (!file.type.startsWith("video/")) {
      return { error: "File must be a video", publicUrl: "" };
    }

    // 2. Size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        error: `Video must be less than ${maxSizeMB} MB`,
        publicUrl: "",
      };
    }

    // 3. Build unique path
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${randomUUID()}.${fileExt}`;
    const fullPath = `${folderPath}/${fileName}`;

    // 4. Upload
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fullPath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      return {
        error: `Failed to upload video: ${uploadError.message}`,
        publicUrl: "",
      };
    }

    // 5. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fullPath);

    return { publicUrl };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
      publicUrl: "",
    };
  }
}
