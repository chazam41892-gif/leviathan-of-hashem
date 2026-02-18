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
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.ReturnCode
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
        private const val TAG = "VideoConvertService"

        const val ACTION_START_CONVERSION = "action_start_conversion"
        const val EXTRA_INPUT_URI = "extra_input_uri"
        
        const val ACTION_CONVERSION_RESULT = "com.metanoiaunlimited.heicconverter.CONVERSION_RESULT"
        const val EXTRA_SUCCESS = "extra_success"
        const val EXTRA_FILE_PATH = "extra_file_path"
        const val EXTRA_ERROR = "extra_error"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_START_CONVERSION) {
            val inputUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra(EXTRA_INPUT_URI, Uri::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(EXTRA_INPUT_URI)
            }
            
            if (inputUri != null) {
                val notification = createNotification("Preparing video conversion...", 0)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROCESSING)
                } else {
                    startForeground(NOTIFICATION_ID, notification)
                }
                performConversion(inputUri)
            } else {
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    private fun performConversion(inputUri: Uri) {
        serviceScope.launch {
            try {
                val inputPath = FilePathHelper.getPath(this@VideoConvertService, inputUri)
                if (inputPath == null) {
                    sendResult(false, null, "Could not access video file")
                    return@launch
                }

                // Temp output in cache
                val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
                val tempOutputFile = File(cacheDir, "CONVERTED_$timeStamp.mp4")

                updateNotification("Converting to MP4...", 20)

                // High compatibility MP4 command
                val command = "-y -i \"$inputPath\" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -movflags +faststart \"${tempOutputFile.absolutePath}\""
                
                Log.d(TAG, "Executing FFmpeg: $command")
                val session = FFmpegKit.execute(command)

                if (ReturnCode.isSuccess(session.returnCode)) {
                    updateNotification("Saving to Gallery...", 90)
                    val galleryUri = saveToGallery(tempOutputFile)
                    if (galleryUri != null) {
                        sendResult(true, galleryUri.toString())
                    } else {
                        sendResult(false, null, "Failed to save video to gallery")
                    }
                } else {
                    val logs = session.allLogsAsString
                    Log.e(TAG, "FFmpeg Failed: $logs")
                    sendResult(false, null, "Conversion failed. Internal error.")
                }
                
                // Cleanup temp file
                if (tempOutputFile.exists()) tempOutputFile.delete()
                
            } catch (e: Exception) {
                Log.e(TAG, "Conversion Exception", e)
                sendResult(false, null, e.message)
            } finally {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
    }

    private fun saveToGallery(file: File): Uri? {
        val fileName = "MetanoiaVideo_${System.currentTimeMillis()}.mp4"
        val values = ContentValues().apply {
            put(MediaStore.Video.Media.DISPLAY_NAME, fileName)
            put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/MetanoiaVideos")
                put(MediaStore.Video.Media.IS_PENDING, 1)
            }
        }

        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        }

        val uri = contentResolver.insert(collection, values)
        if (uri != null) {
            try {
                contentResolver.openOutputStream(uri).use { outputStream ->
                    if (outputStream == null) return null
                    FileInputStream(file).use { inputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.clear()
                    values.put(MediaStore.Video.Media.IS_PENDING, 0)
                    contentResolver.update(uri, values, null, null)
                }
                
                // Force scan
                MediaScannerConnection.scanFile(this, arrayOf(file.absolutePath), null, null)
                
                return uri
            } catch (e: Exception) {
                Log.e(TAG, "Error saving to gallery", e)
                return null
            }
        }
        return null
    }

    private fun updateNotification(content: String, progress: Int) {
        notificationManager?.notify(NOTIFICATION_ID, createNotification(content, progress))
    }

    private fun sendResult(success: Boolean, filePath: String?, error: String? = null) {
        val intent = Intent(ACTION_CONVERSION_RESULT).apply {
            setPackage(packageName)
            putExtra(EXTRA_SUCCESS, success)
            putExtra(EXTRA_FILE_PATH, filePath)
            putExtra(EXTRA_ERROR, error)
        }
        sendBroadcast(intent)
        
        val title = if (success) "Conversion Successful" else "Conversion Failed"
        val text = if (success) "Video saved to Gallery" else error ?: "Unknown error"
        
        val finalNotification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle(title)
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
            
        notificationManager?.notify(NOTIFICATION_ID + 1, finalNotification)
    }

    private fun createNotification(content: String, progress: Int): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setContentTitle("Metanoia Video Converter")
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setProgress(100, progress, progress == 0)
            .build()
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
            notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager?.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
