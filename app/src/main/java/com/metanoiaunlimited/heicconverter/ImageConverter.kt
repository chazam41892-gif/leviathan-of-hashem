package com.metanoiaunlimited.heicconverter

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

class ImageConverter(private val context: Context) {

    enum class OutputFormat(val extension: String, val mimeType: String, val compressFormat: Bitmap.CompressFormat) {
        JPEG("jpg", "image/jpeg", Bitmap.CompressFormat.JPEG),
        PNG("png", "image/png", Bitmap.CompressFormat.PNG),
        WEBP("webp", "image/webp", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Bitmap.CompressFormat.WEBP_LOSSY
        } else {
            @Suppress("DEPRECATION")
            Bitmap.CompressFormat.WEBP
        })
    }

    data class ConversionResult(
        val success: Boolean,
        val outputPath: String? = null,
        val error: String? = null
    )

    suspend fun convertImage(
        uri: Uri,
        outputFormat: OutputFormat,
        quality: Int = 100
    ): ConversionResult = withContext(Dispatchers.IO) {
        try {
            val bitmap = loadBitmapFromUri(uri) ?: return@withContext ConversionResult(
                success = false,
                error = "Failed to load image"
            )

            val originalName = getFileName(uri) ?: "converted_image"
            val nameWithoutExtension = originalName.substringBeforeLast(".")
            val fileName = "$nameWithoutExtension.${outputFormat.extension}"

            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, outputFormat.mimeType)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/HeicConverter")
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            val contentResolver = context.contentResolver
            val imageUri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)

            if (imageUri == null) {
                return@withContext ConversionResult(success = false, error = "Failed to create MediaStore entry")
            }

            contentResolver.openOutputStream(imageUri).use { outputStream ->
                if (outputStream == null) throw IOException("Failed to open output stream")
                bitmap.compress(outputFormat.compressFormat, quality, outputStream)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                contentValues.clear()
                contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                contentResolver.update(imageUri, contentValues, null, null)
            }

            bitmap.recycle()

            ConversionResult(
                success = true,
                outputPath = "Pictures/HeicConverter/$fileName"
            )
        } catch (e: Exception) {
            e.printStackTrace()
            ConversionResult(
                success = false,
                error = e.message ?: "Unknown error occurred"
            )
        }
    }

    suspend fun convertImages(
        uris: List<Uri>,
        outputFormat: OutputFormat,
        quality: Int = 100,
        onProgress: (Int, Int) -> Unit = { _, _ -> }
    ): List<ConversionResult> = withContext(Dispatchers.IO) {
        val results = mutableListOf<ConversionResult>()
        uris.forEachIndexed { index, uri ->
            results.add(convertImage(uri, outputFormat, quality))
            onProgress(index + 1, uris.size)
        }
        results
    }

    private fun loadBitmapFromUri(uri: Uri): Bitmap? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val source = ImageDecoder.createSource(context.contentResolver, uri)
                ImageDecoder.decodeBitmap(source) { decoder, _, _ ->
                    decoder.isMutableRequired = true
                    decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
                }
            } else {
                context.contentResolver.openInputStream(uri)?.use { inputStream ->
                    BitmapFactory.decodeStream(inputStream)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun getFileName(uri: Uri): String? {
        var fileName: String? = null
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIndex = cursor.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME)
                if (nameIndex != -1) fileName = cursor.getString(nameIndex)
            }
        }
        return fileName
    }

    companion object {
        fun getQualityValue(qualityLevel: QualityLevel): Int {
            return when (qualityLevel) {
                QualityLevel.HIGH -> 100
                QualityLevel.MEDIUM -> 80
                QualityLevel.LOW -> 60
            }
        }
    }

    enum class QualityLevel { HIGH, MEDIUM, LOW }
}
