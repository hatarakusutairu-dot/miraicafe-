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

  // 設定の検証
  if (!config.url || !config.anonKey) {
    console.error('Supabase config invalid:', { 
      hasUrl: !!config.url, 
      hasKey: !!config.anonKey,
      urlLength: config.url?.length || 0,
      keyLength: config.anonKey?.length || 0
    })
    return {
      success: false,
      error: 'ストレージ設定が不正です'
    }
  }

  try {
    // Convert File to ArrayBuffer for Cloudflare Workers compatibility
    const arrayBuffer = await file.arrayBuffer()
    
    console.log('Supabase upload starting:', {
      url: `${config.url}/storage/v1/object/${bucket}/${filePath}`,
      fileSize: arrayBuffer.byteLength,
      fileType: file.type
    })
    
    // Upload to Supabase Storage
    const response = await fetch(
      `${config.url}/storage/v1/object/${bucket}/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.anonKey}`,
          'apikey': config.anonKey,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: arrayBuffer
      }
    )

    console.log('Supabase response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase upload error:', response.status, errorText)
      
      // より分かりやすいエラーメッセージ
      let userError = 'アップロードに失敗しました'
      if (response.status === 403 || response.status === 401) {
        userError = 'ストレージへのアクセス権限がありません。RLSポリシーを確認してください。'
      } else if (response.status === 404) {
        userError = 'ストレージバケットが見つかりません。"media"バケットが存在するか確認してください。'
      } else if (response.status === 413) {
        userError = 'ファイルサイズが大きすぎます。'
      }
      
      return {
        success: false,
        error: `${userError} (${response.status})`
      }
    }

    // Get public URL
    const publicUrl = `${config.url}/storage/v1/object/public/${bucket}/${filePath}`
    console.log('Upload successful, public URL:', publicUrl)

    return {
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('Supabase upload exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました'
    return {
      success: false,
      error: `ネットワークエラー: ${errorMessage}`
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
