import { createClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

interface UploadImageParams {
  file: File;
  userId: string;
  bucketName: string;
  folderPath: string;
  maxSizeMB?: number;
}

interface UploadImageResult {
  publicUrl: string;
  error?: string;
}

export async function uploadImage({
  file,
  userId,
  bucketName,
  folderPath,
  maxSizeMB = 5,
}: UploadImageParams): Promise<UploadImageResult> {
  try {
    if (!file.type.startsWith("image/")) {
      return { error: "File must be an image", publicUrl: "" };
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { error: `Image must be less than ${maxSizeMB}MB`, publicUrl: "" };
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${randomUUID()}.${fileExt}`;
    const fullPath = `${folderPath}/${fileName}`;

    // Upload to Supabase Bucket Storage
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fullPath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      return {
        error: `Failed to upload image: ${uploadError.message}`,
        publicUrl: "",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fullPath);

    return { publicUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      publicUrl: "",
    };
  }
}
