"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Send,
  Sparkles,
  Eye,
  MapPin,
  AlertCircle,
  ExternalLink,
  Database,
  Palette,
  ArrowRight,
  Zap,
  Shield,
  Brain,
  Cloud,
  CheckCircle,
  Play,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useChat } from "ai/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

import { AuthForm } from "@/compone
