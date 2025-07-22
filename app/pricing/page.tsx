"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Check, ArrowRight, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const plans = [
    {
      name: "Free Plan",
      description: "Basic wardrobe management for individuals",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        "Personal wardrobe management",
        "Basic outfit recommendations",
        "Weather-based suggestions",
        "Up to 50 clothing items",
        "Basic wardrobe analytics"
      ],
      cta: "Current Plan",
      color: "from-gray-500 to-gray-600",
      popular: false,
    },
    {
      name: "Premium Family",
      description: "Advanced styling for families",
      price: {
        monthly: 9.99,
        yearly: 7.99,
      },
      features: [
        "Everything in Free Plan",
        "Up to 5 family wardrobes",
        "Kids, spouse, friends profiles",
        "Age-appropriate recommendations",
        "Advanced AI styling engine",
        "Shared wardrobe access",
        "Priority customer support"
      ],
      cta: "Upgrade to Premium",
      color: "from-teal-500 to-cyan-500",
      popular: true,
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-gray-800/40 backdrop-blur-xl border-b border-gray-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group">
                <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Style Genie
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/wardrobe">
                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                      My Wardrobe
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg transition-all hover:shadow-teal-500/20">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 leading-tight">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Pricing Plans
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your styling needs. All plans include our core AI-powered outfit recommendations.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-full p-1 inline-flex">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === "monthly"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === "yearly"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Yearly <span className="text-xs text-teal-400 ml-1">Save 20%</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:shadow-2xl ${
                plan.popular ? "border-teal-500/50 shadow-lg shadow-teal-500/10" : ""
              } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full px-4 py-1 text-xs font-bold text-white shadow-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  {plan.name === "Free Plan" && <Users className="w-6 h-6 text-white" />}
                  {plan.name === "Premium Family" && <Zap className="w-6 h-6 text-white" />}
                </div>
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price[billingCycle]}</span>
                  {plan.price[billingCycle] > 0 && (
                    <span className="text-gray-400 ml-2">/ {billingCycle === "monthly" ? "month" : "month, billed yearly"}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r ${plan.color} flex-shrink-0 flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={user ? (plan.name === "Premium Family" ? "/upgrade" : "/wardrobe") : "/auth"} className="w-full">
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white shadow-lg group`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Can I switch between plans?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to premium features. When downgrading, you'll retain premium features until the end of your current billing period."
              },
              {
                question: "How many family wardrobes can I create with the Premium plan?",
                answer: "The Premium plan allows you to create up to 5 additional wardrobes for family members or different purposes. Each wardrobe gets its own personalized AI recommendations."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, we take data security very seriously. All your wardrobe data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Absolutely. You can cancel your subscription at any time from your account settings. There are no cancellation fees or hidden charges."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, you can request a full refund within 14 days of your purchase."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-600/30">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Ready to Transform Your Style?
            </h3>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have revolutionized their wardrobe with AI-powered styling.
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-2xl px-12 py-6 text-lg font-semibold"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 py-8 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Style Genie
              </span>
            </div>
            <p className="text-gray-500 text-sm">© 2025 Style Genie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
