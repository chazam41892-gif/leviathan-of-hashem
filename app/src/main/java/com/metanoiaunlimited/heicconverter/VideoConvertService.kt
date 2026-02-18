package com.metanoiaunlimited.heicconverter

import android.app.*
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.provider.MediaStore
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import java.io.File
import java.io.FileInputStream
import java.text.SimpleDateFormat
import java.util.*

class VideoConvertService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var notificationManager: NotificationManager? = null

    companion object {
        private const val CHANNEL_ID = "video_conversion_channel"
        private const val NOTIFICATION_ID = 101
        const val ACTION_CONVERT = "com.metanoiaunlimited.heicconverter.CONVERT_VIDEO"
        const val EXTRA_VIDEO_URI = "video_uri"
        const val EXTRA_OUTPUT_FORMAT = "output_format"
    }

    override fun onCreate() {
        super.onCreate()
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_CONVERT) {
            val videoUriString = intent.getStringExtra(EXTRA_VIDEO_URI)
            val outputFormat = intent.getStringExtra(EXTRA_OUTPUT_FORMAT) ?: "mp4"

            if (videoUriString != null) {
                val videoUri = Uri.parse(videoUriString)
                startForegroundServiceWithNotification()
                processVideo(videoUri, outputFormat)
            } else {
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    private fun startForegroundServiceWithNotification() {
        val notification = createNotification("Converting video...", 0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROCESSING
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun processVideo(videoUri: Uri, outputFormat: String) {
        serviceScope.launch {
            try {
                val converter = VideoConverter(applicationContext)
                val format = VideoConverter.VideoOutputFormat.MP4

                val result = converter.convertVideo(videoUri, format) { progress ->
                    updateNotification("Converting: $progress", 50)
                }

                if (result.success && result.filePath != null) {
                    val outputFile = File(result.filePath)
                    saveToMediaStore(outputFile)
                    updateNotification("Conversion complete!", 100)
                    delay(2000)
                } else {
                    updateNotification("Conversion failed: ${result.errorMessage}", 0)
                    delay(3000)
                }
            } catch (e: Exception) {
                Log.e("VideoConvertService", "Error during conversion", e)
                updateNotification("Error: ${e.message}", 0)
                delay(3000)
            } finally {
                stopSelf()
            }
        }
    }

    private fun saveToMediaStore(file: File) {
        try {
            val values = ContentValues().apply {
                put(MediaStore.Video.Media.DISPLAY_NAME, file.name)
                put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
                put(MediaStore.Video.Media.DATE_ADDED, System.currentTimeMillis() / 1000)
                put(MediaStore.Video.Media.DATE_TAKEN, System.currentTimeMillis())
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/MetanoiaVideos")
                    put(MediaStore.Video.Media.IS_PENDING, 1)
                }
            }

            val resolver = contentResolver
            val uri = resolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values)

            uri?.let {
                resolver.openOutputStream(it)?.use { outputStream ->
                    FileInputStream(file).use { inputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.clear()
                    values.put(MediaStore.Video.Media.IS_PENDING, 0)
                    resolver.update(it, values, null, null)
                }
            }

            // Scan media file for older Android versions
            MediaScannerConnection.scanFile(
                this,
                arrayOf(file.absolutePath),
                arrayOf("video/mp4"),
                null
            )
        } catch (e: Exception) {
            Log.e("VideoConvertService", "Error saving to MediaStore", e)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Video Conversion",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows progress of video conversions"
            }
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(content: String, progress: Int): Notification {
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("HEIC Converter")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)

        if (progress > 0) {
            builder.setProgress(100, progress, false)
        }

        return builder.build()
    }

    private fun updateNotification(content: String, progress: Int) {
        val notification = createNotification(content, progress)
        notificationManager?.notify(NOTIFICATION_ID, notification)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }
}
