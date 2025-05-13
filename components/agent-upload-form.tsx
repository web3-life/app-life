"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Loader2, Upload, Play, Pause, X } from "lucide-react"

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  country: z.string().min(1, {
    message: "Please select a country.",
  }),
  language: z.string().min(1, {
    message: "Please select a language.",
  }),
  personality: z.string().min(20, {
    message: "Personality description must be at least 20 characters.",
  }),
  personalityType: z.enum(["friendly", "professional", "creative", "analytical", "custom"]),
})

export default function AgentUploadForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country: "",
      language: "",
      personality: "",
      personalityType: "friendly",
    },
  })

  // Handle voice file upload
  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an audio file
      if (!file.type.startsWith("audio/")) {
        alert("Please upload an audio file (mp3, wav, etc.)")
        return
      }

      setVoiceFile(file)

      // Create URL for audio preview
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      const url = URL.createObjectURL(file)
      setAudioUrl(url)

      // Reset audio player
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
      }
    }
  }

  // Handle audio playback
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  // Handle audio playback end
  const handlePlaybackEnd = () => {
    setIsPlaying(false)
  }

  // Remove uploaded voice file
  const removeVoiceFile = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    setVoiceFile(null)
    setAudioUrl(null)
    setIsPlaying(false)
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check if voice file is uploaded
    if (!voiceFile) {
      alert("Please upload your voice file")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      console.log("Form values:", values)
      console.log("Voice file:", voiceFile)

      // Wait for 2 seconds to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page or agent profile
      router.push("/profile")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Predefined personality templates
  const personalityTemplates = {
    friendly:
      "A warm and approachable digital avatar that enjoys helping others and making connections. Always positive and supportive in conversations.",
    professional:
      "A focused and efficient digital avatar that provides clear, concise information. Maintains a formal tone and prioritizes accuracy.",
    creative:
      "An imaginative and expressive digital avatar that thinks outside the box. Enjoys artistic discussions and offers unique perspectives.",
    analytical:
      "A logical and detail-oriented digital avatar that excels at problem-solving. Provides well-reasoned analysis based on available data.",
    custom: "",
  }

  // Update personality text when template changes
  const handlePersonalityTypeChange = (value: string) => {
    if (value !== "custom") {
      form.setValue("personality", personalityTemplates[value as keyof typeof personalityTemplates])
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-white">
        {/* Basic Information */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 text-white">
          <h2 className="text-xl font-semibold mb-4 text-white">Basic Information</h2>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your agent's name" className="text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-400">This is how your digital avatar will be known to others.</FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-white border-gray-700 bg-gray-800">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                        <SelectItem value="cn">China</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-white border-gray-700 bg-gray-800">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Personality Section */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 text-white">
          <h2 className="text-xl font-semibold mb-4 text-white">Personality</h2>

          <FormField
            control={form.control}
            name="personalityType"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-white">Personality Template</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value)
                      handlePersonalityTypeChange(value)
                    }}
                    defaultValue={field.value}
                    className="grid grid-cols-2 md:grid-cols-5 gap-3"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="friendly" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer text-white">Friendly</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="professional" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer text-white">Professional</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="creative" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer text-white">Creative</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="analytical" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer text-white">Analytical</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="custom" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer text-white">Custom</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Personality Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your agent's personality, behavior, and communication style..."
                    className="min-h-[120px] text-white bg-gray-800 border-gray-700"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  Be detailed about how your digital avatar should interact with others.
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </Card>

        {/* Voice Upload Section */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 text-white">
          <h2 className="text-xl font-semibold mb-4 text-white">Voice</h2>

          <div className="space-y-4">
            <div>
              <FormLabel className="text-white">Upload Your Voice</FormLabel>
              <FormDescription className="mb-3 text-gray-400">
                Upload a clear audio recording of your voice. This will be used for your digital avatar's speech.
              </FormDescription>

              {!voiceFile ? (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <label htmlFor="voice-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-500 mb-3" />
                      <p className="text-lg font-medium text-white mb-1">Upload your voice file</p>
                      <p className="text-sm text-gray-400 mb-4">MP3, WAV or M4A up to 10MB</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-purple-500 text-purple-400 hover:bg-purple-600/20"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select Audio File
                      </Button>
                    </div>
                  </label>
                  <input
                    id="voice-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleVoiceUpload}
                  />
                </div>
              ) : (
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={`rounded-full p-2 h-10 w-10 ${
                          isPlaying
                            ? "bg-purple-600 text-white border-purple-500"
                            : "border-gray-600 text-gray-300 hover:bg-gray-800"
                        }`}
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div>
                        <p className="font-medium text-white">{voiceFile.name}</p>
                        <p className="text-xs text-gray-400">{(voiceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={removeVoiceFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <audio ref={audioRef} src={audioUrl || ""} onEnded={handlePlaybackEnd} className="hidden" />
                </div>
              )}
            </div>

            <div className="mt-4">
              <FormLabel className="text-white">Voice Recording Tips</FormLabel>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 mt-2">
                <li>Record in a quiet environment with minimal background noise</li>
                <li>Speak clearly and at your natural pace</li>
                <li>Include a variety of sentences to capture your voice patterns</li>
                <li>Aim for at least 30 seconds of audio for best results</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Create Digital Avatar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
