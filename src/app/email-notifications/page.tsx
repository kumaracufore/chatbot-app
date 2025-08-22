'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import * as XLSX from 'xlsx';
import Header from '@/components/Header';
import { BsEnvelope, BsEnvelopeFill, BsPlus } from 'react-icons/bs';
import { Poppins } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { EmailModal } from '@/components/EmailModal';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

type Subscription = {
  _id: string;
  email: string;
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function EmailNotificationsPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/email-notifications');
      if (!response.ok) throw new Error('Failed to fetch email notifications');
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load email notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const subscription = subscriptions.find(sub => sub._id === id);
      if (!subscription) return;

      const response = await fetch('/api/email-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: subscription.email,
          isSubscribed: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update email notification status');

      setSubscriptions(
        subscriptions.map(sub =>
          sub._id === id ? { ...sub, isSubscribed: !currentStatus } : sub
        )
      );
    } catch (err) {
      setError('Failed to update subscription');
      console.error(err);
    }
  };

  const handleAddEmail = async (email: string) => {
    try {
      setIsAdding(true);
      const response = await fetch('/api/email-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isSubscribed: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add email');
      }

      const newSubscription = await response.json();
      setSubscriptions([newSubscription, ...subscriptions]);
      setIsModalOpen(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add email');
      console.error(err);
      throw err; // Re-throw to be handled by the modal
    } finally {
      setIsAdding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    // Add date range filtering logic here if needed
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(subscriptions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Email Subscriptions');
    XLSX.writeFile(wb, 'email-subscriptions.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header 
          title="Email Notifications" 
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
        />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-pulse flex justify-center mb-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <BsEnvelope className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-muted-foreground">Loading email notifications...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        title="Email Notifications" 
        onDateRangeChange={handleDateRangeChange}
        onExport={handleExport}
      />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-background rounded-lg border border-border shadow-sm">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    <BsEnvelope className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    <BsEnvelopeFill className="w-4 h-4 text-white" />
                  </div>
                </div>
                Email Notifications
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage email notification preferences and subscriptions
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <BsPlus className="mr-2 h-4 w-4" />
              Add Email
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-700/50 bg-gray-900/50 shadow-lg">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="h-12 px-6 text-left text-sm font-medium text-gray-300/90">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-gray-300/90">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-gray-300/90">
                    Subscription Date
                  </th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-gray-300/90">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {subscriptions.map((subscription) => (
                  <tr 
                    key={subscription._id} 
                    className="transition-colors hover:bg-gray-800/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-100">{subscription.email}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center">
                        <Switch
                          checked={subscription.isSubscribed}
                          onChange={() => handleToggle(subscription._id, subscription.isSubscribed)}
                          className={`${
                            subscription.isSubscribed ? 'bg-indigo-600' : 'bg-gray-600'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                        >
                          <span className="sr-only">Toggle subscription</span>
                          <span
                            className={`${
                              subscription.isSubscribed ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                          />
                        </Switch>
                        <span className={`ml-3 text-sm font-medium ${
                          subscription.isSubscribed ? 'text-indigo-400' : 'text-gray-400'
                        }`}>
                          {subscription.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                      {formatDate(subscription.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                      {formatDate(subscription.updatedAt)}
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <BsEnvelope className="w-8 h-8 text-muted-foreground/50 mb-2" />
                        <p className="text-sm">No email subscriptions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <EmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEmail}
        loading={isAdding}
      />
    </div>
  );
}
