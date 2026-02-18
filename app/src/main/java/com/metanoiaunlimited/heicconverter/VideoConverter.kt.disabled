package com.metanoiaunlimited.heicconverter

import android.content.Context
import android.net.Uri
import android.os.Environment
import android.util.Log
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.ReturnCode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class VideoConverter(private val context: Context) {

    enum class VideoOutputFormat {
        MP4
    }

    data class ConversionResult(
        val success: Boolean,
        val filePath: String? = null,
        val errorMessage: String? = null
    )

    suspend fun convertVideo(
        inputUri: Uri,
        outputFormat: VideoOutputFormat,
        onProgress: (String) -> Unit
    ): ConversionResult = withContext(Dispatchers.IO) {
        try {
            val inputPath = FilePathHelper.getPath(context, inputUri) ?: return@withContext ConversionResult(
                success = false,
                errorMessage = "Could not resolve video path"
            )

            val outputDir = File(
                context.getExternalFilesDir(Environment.DIRECTORY_MOVIES),
                "MetanoiaVideos"
            )
            if (!outputDir.exists()) outputDir.mkdirs()

            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val outputFile = File(outputDir, "VIDEO_$timeStamp.mp4")

            // FFmpeg command for full re-encode MOV -> MP4 (H.264 + AAC)
            // -y: overwrite output
            // -i: input
            // -c:v libx264: video codec
            // -preset veryfast: encoding speed
            // -crf 23: quality (lower is better, 23 is standard)
            // -c:a aac: audio codec
            // -b:a 128k: audio bitrate
            val command = "-y -i \"$inputPath\" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k -movflags +faststart \"${outputFile.absolutePath}\""

            Log.d("VideoConverter", "Executing FFmpeg command: $command")

            val session = FFmpegKit.execute(command)

            if (ReturnCode.isSuccess(session.returnCode)) {
                ConversionResult(true, outputFile.absolutePath)
            } else {
                val error = session.allLogsAsString
                Log.e("VideoConverter", "FFmpeg failed: $error")
                ConversionResult(false, null, "Conversion failed: ${session.returnCode}")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            ConversionResult(false, null, e.message)
        }
    }
}
