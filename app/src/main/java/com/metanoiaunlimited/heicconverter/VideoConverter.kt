package com.metanoiaunlimited.heicconverter

import android.content.Context
import android.media.*
import android.net.Uri
import android.os.Environment
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.nio.ByteBuffer
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

            onProgress("Starting conversion... ")

            // Use Android MediaCodec for native video transcoding
            val success = transcodeVideoNative(inputPath, outputFile.absolutePath, onProgress)

            if (success) {
                ConversionResult(true, outputFile.absolutePath)
            } else {
                ConversionResult(false, null, "Conversion failed")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            ConversionResult(false, null, e.message)
        }
    }

    private fun transcodeVideoNative(
        inputPath: String,
        outputPath: String,
        onProgress: (String) -> Unit
    ): Boolean {
        var extractor: MediaExtractor? = null
        var muxer: MediaMuxer? = null

        try {
            extractor = MediaExtractor()
            extractor.setDataSource(inputPath)

            muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

            // Process video and audio tracks
            val trackCount = extractor.trackCount
            val trackIndices = mutableMapOf<Int, Int>()

            for (i in 0 until trackCount) {
                val format = extractor.getTrackFormat(i)
                val mime = format.getString(MediaFormat.KEY_MIME) ?: continue

                if (mime.startsWith("video/") || mime.startsWith("audio/")) {
                    val trackIndex = muxer.addTrack(format)
                    trackIndices[i] = trackIndex
                    extractor.selectTrack(i)
                }
            }

            muxer.start()
            onProgress("Transcoding...")

            val bufferInfo = MediaCodec.BufferInfo()
            val buffer = ByteBuffer.allocate(1024 * 1024) // 1MB buffer

            var frameCount = 0
            while (true) {
                val sampleSize = extractor.readSampleData(buffer, 0)
                if (sampleSize < 0) break

                val trackIndex = extractor.sampleTrackIndex
                val newTrackIndex = trackIndices[trackIndex] ?: -1

                if (newTrackIndex >=  0) {
                    bufferInfo.offset = 0
                    bufferInfo.size = sampleSize
                    bufferInfo.presentationTimeUs = extractor.sampleTime
                    // Map MediaExtractor flags to MediaCodec flags
                    bufferInfo.flags = if ((extractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC) != 0) {
                        MediaCodec.BUFFER_FLAG_KEY_FRAME
                    } else {
                        0
                    }

                    muxer.writeSampleData(newTrackIndex, buffer, bufferInfo)
                }

                extractor.advance()
                frameCount++

                if (frameCount % 30 == 0) {
                    onProgress("Processing frame $frameCount...")
                }
            }

            onProgress("Finalizing...")
            return true

        } catch (e: Exception) {
            Log.e("VideoConverter", "Transcoding error", e)
            return false
        } finally {
            try {
                muxer?.stop()
                muxer?.release()
                extractor?.release()
            } catch (e: Exception) {
                Log.e("VideoConverter", "Cleanup error", e)
            }
        }
    }
}
