"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cherry,
  ArrowLeft,
  Building2,
  User,
  Briefcase,
  Heart,
  HelpCircle,
  Globe,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  X,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Cherry Verified Badge Component
function VerifiedBadge({ size = "lg" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };
  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-5 w-5",
    xl: "h-7 w-7",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg`}
    >
      <Cherry className={`${iconSizes[size]} text-white`} strokeWidth={2.5} />
    </div>
  );
}

const businessTypes = [
  { value: "company", label: "Company / Business", icon: Building2 },
  { value: "creator", label: "Content Creator", icon: User },
  { value: "agency", label: "Agency", icon: Briefcase },
  { value: "nonprofit", label: "Non-Profit", icon: Heart },
  { value: "other", label: "Other", icon: HelpCircle },
];

const industries = [
  "Technology",
  "Food & Beverage",
  "Marketing & Advertising",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Education",
  "Entertainment",
  "Fashion & Beauty",
  "Travel & Hospitality",
  "Professional Services",
  "Manufacturing",
  "Retail",
  "Other",
];

export default function VerifyPage() {
  const { user, isLoaded } = useUser();
  const profile = useQuery(api.userProfiles.get, { userId: user?.id || "" });
  const existingRequest = useQuery(api.verification.getMyRequest);
  const submitRequest = useMutation(api.verification.submitRequest);

  // Form state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<string>("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [newSocialLink, setNewSocialLink] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const addSocialLink = () => {
    if (newSocialLink && !socialLinks.includes(newSocialLink)) {
      setSocialLinks([...socialLinks, newSocialLink]);
      setNewSocialLink("");
    }
  };

  const removeSocialLink = (link: string) => {
    setSocialLinks(socialLinks.filter((l) => l !== link));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !businessName || !businessType || !description) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Submit the verification request to Convex
      const result = await submitRequest({
        fullName,
        phone: phone || undefined,
        businessName,
        businessType: businessType as "company" | "creator" | "agency" | "nonprofit" | "other",
        industry: industry || undefined,
        website: website || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        description,
        socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      });

      // Send the email notification
      await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          phone,
          businessName,
          businessType,
          industry,
          website,
          city,
          state,
          country,
          description,
          socialLinks,
          approvalToken: result.approvalToken,
        }),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit request";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Sign in required</h1>
          <p className="text-neutral-400 mb-6">You need to be signed in to request verification.</p>
          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-rose-500 to-red-600">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Already verified
  if (profile?.isVerified) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <VerifiedBadge size="xl" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">You're Verified!</h1>
          <p className="text-neutral-400 mb-8">
            Your account has the cherry badge. You can now create and publish posts.
          </p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-rose-500 to-red-600">
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Has pending request
  if (existingRequest?.status === "pending") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Request Pending</h1>
          <p className="text-neutral-400 mb-4">
            Your verification request for <span className="text-white font-medium">{existingRequest.businessName}</span> is being reviewed.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            We'll notify you once a decision has been made.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="border-neutral-700 text-neutral-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Request was rejected
  if (existingRequest?.status === "rejected") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Request Not Approved</h1>
          <p className="text-neutral-400 mb-4">
            Your verification request was not approved.
          </p>
          {existingRequest.rejectionReason && (
            <div className="bg-neutral-900 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-neutral-500 mb-1">Reason:</p>
              <p className="text-sm text-neutral-300">{existingRequest.rejectionReason}</p>
            </div>
          )}
          <p className="text-sm text-neutral-500 mb-8">
            You can submit a new request with updated information.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="border-neutral-700 text-neutral-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Submitted successfully
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Request Submitted!</h1>
          <p className="text-neutral-400 mb-8">
            We'll review your verification request and get back to you soon. You'll receive a notification when your request is processed.
          </p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-rose-500 to-red-600">
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Show the form
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <VerifiedBadge size="lg" />
            <div>
              <h1 className="text-2xl font-semibold text-white">Get Verified</h1>
              <p className="text-neutral-400">Apply for the cherry verification badge</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-transparent rounded-2xl p-6 mb-8 border border-rose-500/20"
        >
          <h2 className="text-lg font-medium text-white mb-4">Why get verified?</h2>
          <ul className="space-y-3 text-sm text-neutral-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>Publish blog posts and updates visible to everyone</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>Display the cherry badge on your profile</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>Build trust with your audience</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>Access to premium creator features</span>
            </li>
          </ul>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-neutral-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-neutral-900 border-neutral-800 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-neutral-900 border-neutral-800 text-white pl-10"
                    type="tel"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="bg-neutral-800/50 border-neutral-800 text-neutral-400 pl-10"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">This is your account email and cannot be changed.</p>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-neutral-400" />
              Business Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Business / Creator Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business or brand name"
                  className="bg-neutral-900 border-neutral-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4 text-neutral-400" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Industry
                  </label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 max-h-60">
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind} className="text-white">
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-neutral-900 border-neutral-800 text-white pl-10"
                    type="url"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-neutral-400" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  City
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  State / Province
                </label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Country
                </label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tell us about your business <span className="text-red-400">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you do, your goals, and why you'd like to become a verified publisher on CherryCap..."
              className="bg-neutral-900 border-neutral-800 text-white min-h-[120px]"
              required
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Social Links
            </label>
            <p className="text-xs text-neutral-500 mb-3">Add links to your social media profiles for verification.</p>
            <div className="space-y-2">
              {socialLinks.map((link) => (
                <div key={link} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 text-sm text-neutral-300 truncate">
                    {link}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(link)}
                    className="text-neutral-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    value={newSocialLink}
                    onChange={(e) => setNewSocialLink(e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    className="bg-neutral-900 border-neutral-800 text-white pl-10"
                    type="url"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSocialLink();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSocialLink}
                  className="border-neutral-700 text-neutral-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 py-6 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Cherry className="h-5 w-5 mr-2" />
                  Submit Verification Request
                </>
              )}
            </Button>
            <p className="text-xs text-neutral-500 text-center mt-4">
              By submitting this request, you confirm that the information provided is accurate.
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
