package com.metanoiaunlimited.heicconverter

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.metanoiaunlimited.heicconverter.databinding.ActivityPaywallBinding

class PaywallActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPaywallBinding
    private lateinit var billingManager: BillingManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaywallBinding.inflate(layoutInflater)
        setContentView(binding.root)

        billingManager = BillingManager(this) { isPremium, isVideoPremium ->
            if (isVideoPremium || isPremium) {
                // If purchase was successful and processed, close the paywall
                finish()
            }
        }

        binding.btnUnlockPhoto.setOnClickListener {
            billingManager.launchPurchaseFlow(this, BillingManager.PRODUCT_LIFETIME_BASIC)
        }

        binding.btnUnlockVideo.setOnClickListener {
            billingManager.launchPurchaseFlow(this, BillingManager.PRODUCT_VIDEO_UNLIMITED)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        billingManager.destroy()
    }
}
