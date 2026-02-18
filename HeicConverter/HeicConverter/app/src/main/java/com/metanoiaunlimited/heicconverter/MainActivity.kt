package com.metanoiaunlimited.heicconverter

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.MobileAds
import com.google.firebase.auth.FirebaseAuth
import com.metanoiaunlimited.heicconverter.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val auth = FirebaseAuth.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize AdMob
        MobileAds.initialize(this) {}
        val adRequest = AdRequest.Builder().build()
        binding.adView.loadAd(adRequest)
        
        setupUI()
        handleUserSession()
    }

    private fun handleUserSession() {
        val currentUser = auth.currentUser
        currentUser?.email?.let { email ->
            AuthManager.saveUserForEmailList(email)
            
            AuthManager.isPremiumUser(email) { isPremium ->
                if (isPremium || AuthManager.isMasterAccount(email)) {
                    binding.statusText.text = getString(R.string.premium_plan)
                    if (AuthManager.isMasterAccount(email)) {
                        Toast.makeText(this, getString(R.string.master_override_msg), Toast.LENGTH_LONG).show()
                    }
                } else {
                    binding.statusText.text = getString(R.string.free_plan)
                }
            }
        }
    }

    private fun setupUI() {
        binding.btnConvertImage.setOnClickListener {
            checkAccessAndStart("IMAGE")
        }
        
        binding.btnConvertVideo.setOnClickListener {
            checkAccessAndStart("VIDEO")
        }
    }
    
    private fun checkAccessAndStart(type: String) {
        val email = auth.currentUser?.email
        AuthManager.canConvert(email, type) { allowed, message ->
            if (allowed) {
                // Perform conversion
                Toast.makeText(this, "Conversion Allowed: $message", Toast.LENGTH_SHORT).show()
                // Trigger FFmpeg logic here
            } else {
                // Limit reached or not signed in
                Toast.makeText(this, message, Toast.LENGTH_LONG).show()
                // Optionally show payment/billing flow
            }
        }
    }
}
