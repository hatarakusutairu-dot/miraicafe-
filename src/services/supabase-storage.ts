// Supabase Storage Service for Image Uploads

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export interface UploadResult {
  success: boolean
  url?: string
  fileName?: string
  size?: number
  type?: string
  error?: string
}

// Upload file to Supabase Storage
export async function uploadToSupabase(
  config: SupabaseConfig,
  file: File,
  bucket: string = 'media'
): Promise<UploadResult> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${timestamp}_${random}.${ext}`
  const filePath = `uploads/${fileName}`

  try {
    // Upload to Supabase Storage
    const response = await fetch(
      `${config.url}/storage/v1/object/${bucket}/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.anonKey}`,
          'apikey': config.anonKey,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase upload error:', errorText)
      return {
        success: false,
        error: `アップロードに失敗しました: ${response.status}`
      }
    }

    // Get public URL
    const publicUrl = `${config.url}/storage/v1/object/public/${bucket}/${filePath}`

    return {
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('Supabase upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'アップロードに失敗しました'
    }
  }
}

// Delete file from Supabase Storage
export async function deleteFromSupabase(
  config: SupabaseConfig,
  filePath: string,
  bucket: string = 'media'
): Promise<boolean> {
  try {
    const response = await fetch(
      `${config.url}/storage/v1/object/${bucket}/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.anonKey}`,
          'apikey': config.anonKey
        }
      }
    )

    return response.ok
  } catch (error) {
    console.error('Supabase delete error:', error)
    return false
  }
}
