package com.metanoiaunlimited.heicconverter

import android.content.Context
import android.media.*
import android.net.Uri
import android.os.Environment
import android.util.Log
import android.view.Surface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.nio.ByteBuffer
import java.text.SimpleDateFormat
import java.util.*

/**
 * VideoConverter for iOS/Mac and Android video formats
 * 
 * Supported Input Formats (iOS/Mac/Android):
 * - HEVC/H.265 (video/hevc) - Apple's primary video codec
 * - H.264/AVC (video/avc) - Universal compatibility
 * - MPEG-4 (video/mp4v-es) - Legacy format
 * - ProRes (video/prores) - Professional Apple codec (limited Android support)
 * - VP8/VP9 (video/x-vnd.on2.vp8, video/x-vnd.on2.vp9) - Open formats
 * 
 * Container Formats:
 * - MOV (Apple QuickTime)
 * - MP4 (Universal)
 * - M4V (Apple iTunes)
 * 
 * Output Format:
 * - H.264/AVC in MP4 container for maximum compatibility
 */
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

            onProgress("Starting conversion...")

            // Transcode HEVC/H.265 to H.264 for compatibility
            val success = transcodeToH264(inputPath, outputFile.absolutePath, onProgress)

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

    private fun transcodeToH264(
        inputPath: String,
        outputPath: String,
        onProgress: (String) -> Unit
    ): Boolean {
        var extractor: MediaExtractor? = null
        var decoder: MediaCodec? = null
        var encoder: MediaCodec? = null
        var muxer: MediaMuxer? = null
        var surface: Surface? = null

        try {
            extractor = MediaExtractor()
            extractor.setDataSource(inputPath)

            // Find video track
            var videoTrackIndex = -1
            var inputFormat: MediaFormat? = null
            for (i in 0 until extractor.trackCount) {
                val format = extractor.getTrackFormat(i)
                val mime = format.getString(MediaFormat.KEY_MIME) ?: continue
                if (mime.startsWith("video/")) {
                    videoTrackIndex = i
                    inputFormat = format
                    break
                }
            }

            if (videoTrackIndex == -1 || inputFormat == null) {
                Log.e("VideoConverter", "No video track found")
                return false
            }

            extractor.selectTrack(videoTrackIndex)

            // Get video properties
            val width = inputFormat.getInteger(MediaFormat.KEY_WIDTH)
            val height = inputFormat.getInteger(MediaFormat.KEY_HEIGHT)
            val inputMime = inputFormat.getString(MediaFormat.KEY_MIME) ?: "video/avc"
            
            onProgress("Input: ${inputMime} ${width}x${height}")

            // Apple/iOS formats that need transcoding:
            // - video/hevc (HEVC/H.265) - Most common Apple format
            // - video/mp4v-es (MPEG-4 Part 2) - Older Apple format
            // - video/3gpp - Legacy format
            // Already H.264 (video/avc) - just remux for faster processing
            
            if (inputMime == "video/avc") {
                onProgress("Already H.264, remuxing for MP4 compatibility...")
                return remuxOnly(inputPath, outputPath, onProgress)
            }

            // Log codec info for Apple formats
            when (inputMime) {
                "video/hevc" -> onProgress("Detected HEVC (iOS/Mac) - transcoding to H.264")
                "video/mp4v-es" -> onProgress("Detected MPEG-4 (older Apple) - transcoding to H.264")
                else -> onProgress("Detected $inputMime - transcoding to H.264")
            }

            // Create H.264 encoder
            val outputFormat = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height)
            outputFormat.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
            outputFormat.setInteger(MediaFormat.KEY_BIT_RATE, 2000000) // 2 Mbps
            outputFormat.setInteger(MediaFormat.KEY_FRAME_RATE, 30)
            outputFormat.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)

            encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            encoder.configure(outputFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            surface = encoder.createInputSurface()
            encoder.start()

            // Create decoder
            decoder = MediaCodec.createDecoderByType(inputMime)
            decoder.configure(inputFormat, surface, null, 0)
            decoder.start()

            // Create muxer
            muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            
            var muxerStarted = false
            var outputTrackIndex = -1
            var frameCount = 0
            var allInputExtracted = false
            var allInputDecoded = false
            val timeoutUs = 10000L

            onProgress("Transcoding to H.264...")

            while (true) {
                // Feed input to decoder
                if (!allInputExtracted) {
                    val inputBufferIndex = decoder.dequeueInputBuffer(timeoutUs)
                    if (inputBufferIndex >= 0) {
                        val inputBuffer = decoder.getInputBuffer(inputBufferIndex)
                        val sampleSize = extractor.readSampleData(inputBuffer!!, 0)
                        
                        if (sampleSize < 0) {
                            decoder.queueInputBuffer(inputBufferIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            allInputExtracted = true
                        } else {
                            val presentationTimeUs = extractor.sampleTime
                            decoder.queueInputBuffer(inputBufferIndex, 0, sampleSize, presentationTimeUs, 0)
                            extractor.advance()
                        }
                    }
                }

                // Get output from encoder
                val encoderBufferInfo = MediaCodec.BufferInfo()
                val encoderBufferIndex = encoder.dequeueOutputBuffer(encoderBufferInfo, timeoutUs)

                when (encoderBufferIndex) {
                    MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                        if (!muxerStarted) {
                            outputTrackIndex = muxer.addTrack(encoder.outputFormat)
                            muxer.start()
                            muxerStarted = true
                            onProgress("Muxer started")
                        }
                    }
                    MediaCodec.INFO_TRY_AGAIN_LATER -> {
                        // No output available yet
                    }
                    else -> {
                        if (encoderBufferIndex >= 0) {
                            val encodedData = encoder.getOutputBuffer(encoderBufferIndex)
                            
                            if (encodedData != null && encoderBufferInfo.size > 0 && muxerStarted) {
                                encodedData.position(encoderBufferInfo.offset)
                                encodedData.limit(encoderBufferInfo.offset + encoderBufferInfo.size)
                                muxer.writeSampleData(outputTrackIndex, encodedData, encoderBufferInfo)
                                frameCount++
                                
                                if (frameCount % 30 == 0) {
                                    onProgress("Encoded $frameCount frames")
                                }
                            }
                            
                            encoder.releaseOutputBuffer(encoderBufferIndex, false)
                            
                            if ((encoderBufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                                onProgress("Encoding complete")
                                break
                            }
                        }
                    }
                }

                // Check decoder status to pass frames to encoder
                val decoderBufferInfo = MediaCodec.BufferInfo()
                val decoderBufferIndex = decoder.dequeueOutputBuffer(decoderBufferInfo, timeoutUs)
                
                if (decoderBufferIndex >= 0) {
                    val doRender = decoderBufferInfo.size > 0
                    decoder.releaseOutputBuffer(decoderBufferIndex, doRender)
                    
                    if ((decoderBufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                        encoder.signalEndOfInputStream()
                        allInputDecoded = true
                    }
                }
            }

            onProgress("Finalizing...")
            return true

        } catch (e: Exception) {
            Log.e("VideoConverter", "Transcoding error", e)
            return false
        } finally {
            try {
                decoder?.stop()
                decoder?.release()
                encoder?.stop()
                encoder?.release()
                surface?.release()
                muxer?.stop()
                muxer?.release()
                extractor?.release()
            } catch (e: Exception) {
                Log.e("VideoConverter", "Cleanup error", e)
            }
        }
    }

    private fun remuxOnly(
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

            val bufferInfo = MediaCodec.BufferInfo()
            val buffer = ByteBuffer.allocate(1024 * 1024)

            var frameCount = 0
            while (true) {
                val sampleSize = extractor.readSampleData(buffer, 0)
                if (sampleSize < 0) break

                val trackIndex = extractor.sampleTrackIndex
                val newTrackIndex = trackIndices[trackIndex] ?: -1

                if (newTrackIndex >= 0) {
                    bufferInfo.offset = 0
                    bufferInfo.size = sampleSize
                    bufferInfo.presentationTimeUs = extractor.sampleTime
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
                    onProgress("Remuxing frame $frameCount...")
                }
            }

            return true

        } catch (e: Exception) {
            Log.e("VideoConverter", "Remux error", e)
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
