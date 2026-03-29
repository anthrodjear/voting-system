'use client';

import { useCallback, useEffect, useState } from 'react';
import { getElectionById } from '@/services/election';
import type { Election } from '@/types';

interface UseElectionCountdownProps {
  electionId?: string;
  targetDate?: string | Date;
  election?: Election | null;
  startDate?: string | Date;
  endDate?: string | Date;
}

/**
 * Hook for election countdown timer
 */
export function useElectionCountdown({
  electionId,
  targetDate,
  election,
  startDate,
  endDate
}: UseElectionCountdownProps = {}) {
  const [electionData, setElectionData] = useState<Election | null>(election || null);
  const [isLoading, setIsLoading] = useState(!election && !!electionId);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate target date from election or prop
  const getTargetDate = useCallback((): Date | null => {
    if (targetDate) {
      return new Date(targetDate);
    }
    
    if (electionData) {
      // Default to election start date
      return new Date(electionData.startDate);
    }
    
    return null;
  }, [targetDate, electionData]);
  
  // State for countdown values
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [percentage, setPercentage] = useState(0);
  
  // Fetch election data if ID provided
  useEffect(() => {
    if (!electionId || election) return;
    
    const fetchElection = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getElectionById(electionId);
        setElectionData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch election';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchElection();
  }, [electionId, election]);
  
  // Countdown logic
  useEffect(() => {
    const target = getTargetDate();
    if (!target) return;
    
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;
      
      if (distance <= 0) {
        setIsExpired(true);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setPercentage(100);
        return;
      }
      
      // Calculate time units
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
      setIsExpired(false);
      
      // Calculate percentage if start/end dates provided
      if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const total = end - start;
        const elapsed = now - start;
        const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
        setPercentage(percent);
      }
    };
    
    // Initial calculation
    calculateCountdown();
    
    // Update every second
    const interval = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [electionData, getTargetDate, startDate, endDate]);
  
  /**
   * Format countdown as string
   */
  const formatCountdown = useCallback((separator = ' ') => {
    const parts = [];
    
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    
    return parts.join(separator);
  }, [days, hours, minutes, seconds]);
  
  /**
   * Get countdown components as object
   */
  const getCountdownComponents = useCallback(() => ({
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    percentage
  }), [days, hours, minutes, seconds, isExpired, percentage]);
  
  /**
   * Check if election is in specific phase
   */
  const isInPhase = useCallback((
    phase: 'upcoming' | 'registration' | 'voting' | 'ended'
  ): boolean => {
    if (!electionData) return false;
    
    const now = new Date().getTime();
    const startDate = new Date(electionData.startDate).getTime();
    const endDate = new Date(electionData.endDate).getTime();
    const registrationDeadline = electionData.registrationDeadline 
      ? new Date(electionData.registrationDeadline).getTime()
      : null;
    
    switch (phase) {
      case 'upcoming':
        return now < startDate;
      case 'registration':
        return registrationDeadline 
          ? now < registrationDeadline && now >= startDate - (30 * 24 * 60 * 60 * 1000) // 30 days before
          : false;
      case 'voting':
        return now >= startDate && now <= endDate;
      case 'ended':
        return now > endDate;
      default:
        return false;
    }
  }, [electionData]);
  
  /**
   * Get status text
   */
  const getStatusText = useCallback((): string => {
    if (!electionData) return 'Unknown';
    
    if (isExpired) return 'Election has ended';
    
    if (isInPhase('upcoming')) {
      return `Starts in ${formatCountdown()}`;
    }
    
    if (isInPhase('registration')) {
      return `Registration ends in ${formatCountdown()}`;
    }
    
    if (isInPhase('voting')) {
      return `Voting ends in ${formatCountdown()}`;
    }
    
    return 'Completed';
  }, [electionData, isExpired, isInPhase, formatCountdown]);
  
  /**
   * Calculate time remaining in milliseconds
   */
  const timeRemainingMs = useCallback(() => {
    const target = getTargetDate();
    if (!target) return 0;
    
    return Math.max(0, target.getTime() - Date.now());
  }, [getTargetDate]);
  
  return {
    // State
    election: electionData,
    isLoading,
    error,
    
    // Countdown values
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    percentage,
    
    // Formatted
    formattedCountdown: formatCountdown(),
    statusText: getStatusText(),
    
    // Helpers
    getCountdownComponents,
    isInPhase,
    timeRemaining: timeRemainingMs()
  };
}

export default useElectionCountdown;
