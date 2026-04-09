'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ImageSlider } from '@/components/ui/image-slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Chrome, Apple } from 'lucide-react'

export default function ImageSliderLoginDemo() {
  const images = [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fGdpcmx8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1754051486494-cfdbf29a589c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fGdpcmx8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1504051771394-dd2e66b2e08f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fGdpcmx8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1752574112194-95ccc6109ce8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA1fHRvd0paRnNrcEdnfGVufDB8fHx8',
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <div className="w-full h-screen min-h-[700px] flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-5xl h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="hidden lg:block">
          <ImageSlider images={images} interval={4000} />
        </div>

        <div className="w-full h-full bg-card text-card-foreground flex flex-col items-center justify-center p-8 md:p-12">
          <motion.div className="w-full max-w-sm" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-2">
              Welcome Back
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
              Enter your credentials to access your account.
            </motion.p>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button variant="outline">
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline">
                <Apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </motion.div>

            <motion.form variants={itemVariants} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </motion.form>

            <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-primary hover:underline">
                Sign up
              </a>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
