package com.metanoiaunlimited.heicconverter

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.*

object AuthManager {
    private const val MASTER_USERNAME = "hachazal418"
    private const val FREE_IMAGE_LIMIT = 5
    private const val FREE_VIDEO_LIMIT = 1

    fun isMasterAccount(email: String?): Boolean {
        return email?.lowercase() == MASTER_USERNAME || email?.lowercase() == "$MASTER_USERNAME@gmail.com"
    }

    fun saveUserForEmailList(email: String) {
        val db = FirebaseFirestore.getInstance()
        val user = hashMapOf(
            "email" to email,
            "subscribed" to true,
            "timestamp" to System.currentTimeMillis()
        )
        db.collection("mailing_list").document(email).set(user)
    }

    fun canConvert(email: String?, type: String, callback: (Boolean, String) -> Unit) {
        if (isMasterAccount(email)) {
            callback(true, "Unlimited Access (Master)")
            return
        }

        val db = FirebaseFirestore.getInstance()
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        
        email?.let { userEmail ->
            val userRef = db.collection("users").document(userEmail)
            
            userRef.get().addOnSuccessListener { document ->
                val isPremium = document.getBoolean("isPremium") ?: false
                if (isPremium) {
                    callback(true, "Unlimited Access (Premium)")
                    return@addOnSuccessListener
                }

                // Check daily limits for free tier
                val usageKey = if (type == "IMAGE") "image_count_$today" else "video_count_$today"
                val currentCount = document.getLong(usageKey) ?: 0L
                val limit = if (type == "IMAGE") FREE_IMAGE_LIMIT else FREE_VIDEO_LIMIT

                if (currentCount < limit) {
                    // Increment count and allow
                    userRef.update(usageKey, currentCount + 1)
                    callback(true, "Free conversion ${currentCount + 1}/$limit")
                } else {
                    val price = if (type == "IMAGE") "$2.99" else "$19.99"
                    callback(false, "Daily limit reached. Upgrade for $price for unlimited conversions.")
                }
            }.addOnFailureListener {
                callback(false, "Error checking status. Please try again.")
            }
        } ?: callback(false, "Please sign in to convert files.")
    }

    fun isPremiumUser(email: String?, callback: (Boolean) -> Unit) {
        if (isMasterAccount(email)) {
            callback(true)
            return
        }
        val db = FirebaseFirestore.getInstance()
        email?.let {
            db.collection("users").document(it).get()
                .addOnSuccessListener { document ->
                    callback(document.getBoolean("isPremium") ?: false)
                }
                .addOnFailureListener { callback(false) }
        } ?: callback(false)
    }
}
