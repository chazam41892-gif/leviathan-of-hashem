package com.metanoiaunlimited.heicconverter

import android.content.Context
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.*

class QuotaManager(private val context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("quota_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_PHOTO_COUNT = "quota_photo_count_today"
        private const val KEY_VIDEO_COUNT = "quota_video_count_today"
        private const val KEY_LAST_RESET_DATE = "quota_last_reset_local_date"
        
        const val FREE_PHOTO_LIMIT = 5
        const val FREE_VIDEO_LIMIT = 0
        const val PREMIUM_VIDEO_LIMIT = 1
    }

    init {
        resetIfNeeded()
    }

    private fun resetIfNeeded() {
        val today = getTodayDateString()
        val lastReset = prefs.getString(KEY_LAST_RESET_DATE, "")
        if (today != lastReset) {
            prefs.edit()
                .putInt(KEY_PHOTO_COUNT, 0)
                .putInt(KEY_VIDEO_COUNT, 0)
                .putString(KEY_LAST_RESET_DATE, today)
                .apply()
        }
    }

    private fun getTodayDateString(): String {
        return SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    }

    fun canConvertPhotos(count: Int, isPremium: Boolean): Boolean {
        resetIfNeeded()
        if (isPremium) return true
        val current = prefs.getInt(KEY_PHOTO_COUNT, 0)
        return (current + count) <= FREE_PHOTO_LIMIT
    }

    fun canConvertVideo(isPremium: Boolean, isVideoPremium: Boolean): Boolean {
        resetIfNeeded()
        if (isVideoPremium) return true
        if (!isPremium) return false
        
        val current = prefs.getInt(KEY_VIDEO_COUNT, 0)
        return current < PREMIUM_VIDEO_LIMIT
    }

    fun consumePhotos(count: Int) {
        val current = prefs.getInt(KEY_PHOTO_COUNT, 0)
        prefs.edit().putInt(KEY_PHOTO_COUNT, current + count).apply()
    }

    fun consumeVideo() {
        val current = prefs.getInt(KEY_VIDEO_COUNT, 0)
        prefs.edit().putInt(KEY_VIDEO_COUNT, current + 1).apply()
    }
    
    fun getRemainingPhotos(isPremium: Boolean): Int {
        if (isPremium) return Int.MAX_VALUE
        return (FREE_PHOTO_LIMIT - prefs.getInt(KEY_PHOTO_COUNT, 0)).coerceAtLeast(0)
    }
}
