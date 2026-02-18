package com.metanoiaunlimited.heicconverter

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.metanoiaunlimited.heicconverter.databinding.ActivityAdminDashboardBinding

class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminDashboardBinding
    private val allowedAdminEmails = listOf(
        "metanoiaunlimited418@gmail.com",
        "chazam41892@gmail.com"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Verify admin status immediately
        val userEmail = FirebaseAuth.getInstance().currentUser?.email
        if (userEmail == null || userEmail !in allowedAdminEmails) {
            Toast.makeText(this, "Unauthorized Access", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        binding = ActivityAdminDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
    }

    private fun setupUI() {
        binding.tvAdminWelcome.text = "Admin Dashboard: ${FirebaseAuth.getInstance().currentUser?.email}"
        
        // TODO: Implement analytics rollups and export features as specified in gemini_readme.json
        binding.btnExportEmails.setOnClickListener {
            Toast.makeText(this, "Exporting opted-in emails...", Toast.LENGTH_SHORT).show()
        }
    }
}
