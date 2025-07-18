import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Sparkles } from "lucide-react"

export default function HelloWorldPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-yellow-500 animate-pulse" />
              <Heart className="h-6 w-6 text-red-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Hello World!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">Welcome to your new Next.js application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">
            This is your first step into the world of web development. Ready to build something amazing?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Get Started
            </Button>
            <Button variant="outline">Learn More</Button>
          </div>
          <div className="text-sm text-gray-500 pt-4 border-t">Built with ❤️ using Next.js & Tailwind CSS</div>
        </CardContent>
      </Card>
    </div>
  )
}
