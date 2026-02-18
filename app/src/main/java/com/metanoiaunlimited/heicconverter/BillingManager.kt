package com.metanoiaunlimited.heicconverter

import android.app.Activity
import android.content.Context
import android.util.Log
import com.android.billingclient.api.*

class BillingManager(
    private val context: Context,
    private val onPremiumStatusChanged: (isPremium: Boolean, isVideoPremium: Boolean) -> Unit
) : PurchasesUpdatedListener {

    private var billingClient: BillingClient? = null
    private var isPremium = false
    private var isVideoPremium = false
    
    companion object {
        private const val TAG = "BillingManager"
        // Aligned with gemini_readme.json
        const val PRODUCT_LIFETIME_BASIC = "lifetime_basic_299"
        const val PRODUCT_VIDEO_UNLIMITED = "video_unlimited_1999"
        const val PRODUCT_ADFREE_SUB = "adfree_monthly_299"
        
        private const val PREF_NAME = "billing_prefs"
        private const val KEY_IS_PREMIUM = "is_premium"
        private const val KEY_IS_VIDEO_PREMIUM = "is_video_premium"
    }

    init {
        setupBillingClient()
        loadPremiumStatus()
    }

    private fun setupBillingClient() {
        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build()

        billingClient?.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryPurchases()
                }
            }

            override fun onBillingServiceDisconnected() {
                setupBillingClient()
            }
        })
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()
                billingClient?.acknowledgePurchase(acknowledgePurchaseParams) { }
            }
            
            if (purchase.products.contains(PRODUCT_VIDEO_UNLIMITED)) {
                setVideoPremiumStatus(true)
                setPremiumStatus(true)
            } else if (purchase.products.contains(PRODUCT_LIFETIME_BASIC)) {
                setPremiumStatus(true)
            } else if (purchase.products.contains(PRODUCT_ADFREE_SUB)) {
                setPremiumStatus(true)
            }
        }
    }

    fun launchPurchaseFlow(activity: Activity, productId: String) {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(if (productId == PRODUCT_ADFREE_SUB) BillingClient.ProductType.SUBS else BillingClient.ProductType.INAPP)
                .build()
        )

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient?.queryProductDetailsAsync(params) { _, queryProductDetailsResult ->
            val productDetailsList = queryProductDetailsResult.productDetailsList
            if (productDetailsList?.isNotEmpty() == true) {
                val billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(listOf(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetailsList[0])
                            .build()
                    ))
                    .build()
                billingClient?.launchBillingFlow(activity, billingFlowParams)
            }
        }
    }

    fun queryPurchases() {
        // Query In-App Products
        billingClient?.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        ) { _, purchases ->
            processPurchases(purchases)
        }

        // Query Subscriptions
        billingClient?.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        ) { _, purchases ->
            processPurchases(purchases)
        }
    }

    private fun processPurchases(purchases: List<Purchase>) {
        var hasPremium = isPremium
        var hasVideoPremium = isVideoPremium
        for (purchase in purchases) {
            if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                if (purchase.products.contains(PRODUCT_VIDEO_UNLIMITED)) {
                    hasVideoPremium = true
                    hasPremium = true
                } else if (purchase.products.contains(PRODUCT_LIFETIME_BASIC) || purchase.products.contains(PRODUCT_ADFREE_SUB)) {
                    hasPremium = true
                }
            }
        }
        setVideoPremiumStatus(hasVideoPremium)
        setPremiumStatus(hasPremium)
    }

    private fun setPremiumStatus(premium: Boolean) {
        isPremium = premium
        saveStatus(KEY_IS_PREMIUM, premium)
        onPremiumStatusChanged(isPremium, isVideoPremium)
    }

    private fun setVideoPremiumStatus(premium: Boolean) {
        isVideoPremium = premium
        saveStatus(KEY_IS_VIDEO_PREMIUM, premium)
        onPremiumStatusChanged(isPremium, isVideoPremium)
    }

    private fun saveStatus(key: String, value: Boolean) {
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            .edit().putBoolean(key, value).apply()
    }

    private fun loadPremiumStatus() {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        isPremium = prefs.getBoolean(KEY_IS_PREMIUM, false)
        isVideoPremium = prefs.getBoolean(KEY_IS_VIDEO_PREMIUM, false)
        onPremiumStatusChanged(isPremium, isVideoPremium)
    }

    fun destroy() {
        billingClient?.endConnection()
    }
}
