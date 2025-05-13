'use client';

import React, { useState } from 'react';
import { ArrowIcon } from './icons';

type SubscribeFormProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export function SubscribeForm({ 
  title = 'Subscribe to my newsletter', 
  subtitle = 'Get notified when I publish new articles', 
  compact = false,
}: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Email is required');
      return;
    }
    
    try {
      setStatus('loading');
      
      // Prepare payload: only email_address
      const subscriptionData = { email_address: email };
      
      // Submit to API
      const response = await fetch('/api/kit/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage('Failed to subscribe. Please try again.');
        console.error('Subscription API error:', data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
      console.error('Subscription error:', error);
    }
  };
  
  const isLoading = status === 'loading';
  
  return (
    <div className={`card-base w-full ${compact ? 'py-6' : 'py-8'} px-6 ${isFocused ? 'shadow-lg shadow-purple-900/30' : ''}`}>
      <div className={`max-w-md mx-auto ${compact ? 'space-y-3' : 'space-y-4'}`}>
        <div className="text-center">
          <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-white`}>{title}</h3>
          <p className="text-neutral-300 text-sm mt-1">{subtitle}</p>
        </div>
        
        {status === 'success' ? (
          <div role="status" aria-live="polite" className="bg-purple-900/30 border border-purple-700/50 rounded-md p-3 text-center transform transition-all duration-300 animate-fade-in">
            <p className="text-purple-200">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3" aria-busy={isLoading}>
            <div className="relative group">
              <label htmlFor="subscribe-email" className="sr-only">Email address</label>
              <input id="subscribe-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="your.email@example.com"
                required
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white placeholder:text-neutral-500 
                   focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent 
                   transition-all duration-300 peer cursor-text hover:cursor-text"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 rounded-md -z-10 transition-opacity duration-300"></div>
            </div>
            
            {status === 'error' && (
              <div role="alert" aria-live="assertive" className="text-red-500 text-sm animate-fade-in">{message}</div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 
                bg-gradient-to-r from-purple-800 via-[#20132b] to-indigo-900 
                hover:bg-gradient-to-r hover:from-purple-700 hover:via-[#2d1d3e] hover:to-indigo-800
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-900 
                disabled:opacity-50 rounded-md transition-all duration-300 
                shadow-md hover:shadow-lg hover:shadow-purple-700/20
                border border-purple-700/50
                transform hover:scale-[1.02] active:scale-[0.98]
                cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Subscribing...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 group">
                  Subscribe
                  <ArrowIcon className="transform transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </button>
            
            <p className="text-xs text-center text-neutral-400">
              No spam. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
} 