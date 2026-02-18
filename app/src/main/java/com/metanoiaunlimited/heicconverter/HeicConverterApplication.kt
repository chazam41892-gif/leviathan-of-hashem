package com.metanoiaunlimited.heicconverter

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.google.firebase.FirebaseApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class HeicConverterApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        try {
            FirebaseApp.initializeApp(this)
        } catch (e: Exception) {
            // Handle cases where google-services.json is still missing during development
            e.printStackTrace()
        }

        // Initialize AdMob off the main thread
        CoroutineScope(Dispatchers.IO).launch {
            MobileAds.initialize(this@HeicConverterApplication) {}
        }
    }
}
