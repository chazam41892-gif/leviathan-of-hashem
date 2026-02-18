package com.metanoiaunlimited.heicconverter

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.metanoiaunlimited.heicconverter.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var auth: FirebaseAuth
    private val allowedAdminEmails = listOf(
        "metanoiaunlimited418@gmail.com",
        "chazam41892@gmail.com"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        auth = FirebaseAuth.getInstance()
        
        // Ensure user is logged in
        if (auth.currentUser == null) {
            startActivity(Intent(this, AuthLandingActivity::class.java))
            finish()
            return
        }

        setupUI()
    }

    private fun setupUI() {
        // Show admin button only if user is in allowlist
        val userEmail = auth.currentUser?.email
        if (userEmail != null && userEmail in allowedAdminEmails) {
            binding.btnAdminDashboard.visibility = View.VISIBLE
            binding.btnAdminDashboard.setOnClickListener {
                startActivity(Intent(this, AdminDashboardActivity::class.java))
            }
        } else {
            binding.btnAdminDashboard.visibility = View.GONE
        }

        binding.btnSignOut.setOnClickListener {
            auth.signOut()
            startActivity(Intent(this, AuthLandingActivity::class.java))
            finish()
        }
        
        // TODO: Implement HEIC conversion logic as per project scope
    }
}
