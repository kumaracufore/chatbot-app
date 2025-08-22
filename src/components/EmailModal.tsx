'use client';

import { useState } from 'react';
import { Modal } from './ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
}

export function EmailModal({ isOpen, onClose, onSubmit, loading = false }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit(email);
      setEmail('');
    } catch (err) {
      setError('Failed to add email. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Email Address"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full"
          />
          {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Email'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
